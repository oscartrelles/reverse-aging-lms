import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, runTransaction } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Timestamp } from 'firebase/firestore';

export interface EnrollmentData {
  userId: string;
  courseId: string;
  cohortId: string;
  paymentId: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  enrollmentStatus: 'pending' | 'active' | 'completed' | 'cancelled';
  enrolledAt: Timestamp;
  completedAt?: Timestamp;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// Create new enrollment
export const createEnrollment = async (enrollmentData: Omit<EnrollmentData, 'enrolledAt'>) => {
  try {
    console.log('Creating enrollment:', enrollmentData);
    
    // Create a unique document ID based on payment ID to prevent duplicates
    const uniqueId = `payment_${enrollmentData.paymentId}`;
    const enrollmentRef = doc(db, 'enrollments', uniqueId);
    
    // Use a transaction to ensure atomic check and creation
    const result = await runTransaction(db, async (transaction) => {
      // First, do ALL reads
      const existingDoc = await transaction.get(enrollmentRef);
      const cohortRef = doc(db, 'cohorts', enrollmentData.cohortId);
      const cohortDoc = await transaction.get(cohortRef);
      
      // Check if enrollment with this payment ID already exists
      if (existingDoc.exists()) {
        console.log('Enrollment with this payment ID already exists, skipping creation');
        return { id: existingDoc.id, created: false };
      }
      
      // Check for active enrollment for this user/course combination
      const activeEnrollmentQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', enrollmentData.userId),
        where('courseId', '==', enrollmentData.courseId),
        where('enrollmentStatus', '==', 'active')
      );
      
      const activeSnapshot = await getDocs(activeEnrollmentQuery);
      if (!activeSnapshot.empty) {
        console.log('User already has an active enrollment for this course, skipping creation');
        return { id: activeSnapshot.docs[0].id, created: false };
      }
      
      // Now do ALL writes
      const enrollment = {
        ...enrollmentData,
        enrolledAt: Timestamp.now(),
      };

      transaction.set(enrollmentRef, enrollment);
      
      // Update cohort student count
      if (cohortDoc.exists()) {
        const currentCount = cohortDoc.data().currentStudents || 0;
        const newCount = Math.max(0, currentCount + 1);
        transaction.update(cohortRef, { currentStudents: newCount });
        console.log('Cohort student count updated:', newCount);
      }
      
      return { id: enrollmentRef.id, created: true };
    });
    
    if (result.created) {
      console.log('Enrollment created with ID:', result.id);
    } else {
      console.log('Enrollment already existed, returning ID:', result.id);
    }

    return result.id;
  } catch (error) {
    console.error('Error creating enrollment:', error);
    throw error;
  }
};

// Update enrollment status
export const updateEnrollmentStatus = async (
  enrollmentId: string, 
  status: EnrollmentData['enrollmentStatus'],
  paymentStatus?: EnrollmentData['paymentStatus']
) => {
  try {
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    const updateData: any = { enrollmentStatus: status };
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (status === 'completed') {
      updateData.completedAt = Timestamp.now();
    }

    await updateDoc(enrollmentRef, updateData);
    console.log('Enrollment status updated:', status);
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    throw error;
  }
};

// Get user enrollments
export const getUserEnrollments = async (userId: string) => {
  try {
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(enrollmentsQuery);
    const enrollments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return enrollments;
  } catch (error) {
    console.error('Error getting user enrollments:', error);
    throw error;
  }
};

// Get enrollment by ID
export const getEnrollment = async (enrollmentId: string) => {
  try {
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    const enrollmentDoc = await getDoc(enrollmentRef);
    
    if (enrollmentDoc.exists()) {
      return {
        id: enrollmentDoc.id,
        ...enrollmentDoc.data(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting enrollment:', error);
    throw error;
  }
};

// Update cohort student count
export const updateCohortStudentCount = async (cohortId: string, increment: number) => {
  try {
    const cohortRef = doc(db, 'cohorts', cohortId);
    const cohortDoc = await getDoc(cohortRef);
    
    if (cohortDoc.exists()) {
      const currentCount = cohortDoc.data().currentStudents || 0;
      const newCount = Math.max(0, currentCount + increment);
      
      await updateDoc(cohortRef, {
        currentStudents: newCount,
      });
      
      console.log('Cohort student count updated:', newCount);
    }
  } catch (error) {
    console.error('Error updating cohort student count:', error);
    throw error;
  }
};

// Check if user is enrolled in course
export const isUserEnrolled = async (userId: string, courseId: string) => {
  try {
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      where('enrollmentStatus', '==', 'active')
    );
    
    const snapshot = await getDocs(enrollmentsQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    return false;
  }
};

// Get active enrollment for user and course
export const getActiveEnrollment = async (userId: string, courseId: string) => {
  try {
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      where('enrollmentStatus', '==', 'active')
    );
    
    const snapshot = await getDocs(enrollmentsQuery);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting active enrollment:', error);
    return null;
  }
};

// Get all enrollments (admin only)
export const getAllEnrollments = async () => {
  try {
    const enrollmentsSnapshot = await getDocs(collection(db, 'enrollments'));
    const enrollments = enrollmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return enrollments;
  } catch (error) {
    console.error('Error getting all enrollments:', error);
    throw error;
  }
}; 