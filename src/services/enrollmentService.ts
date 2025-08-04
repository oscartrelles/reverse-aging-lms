import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
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
    
    const enrollment = {
      ...enrollmentData,
      enrolledAt: Timestamp.now(),
    };

    const enrollmentRef = await addDoc(collection(db, 'enrollments'), enrollment);
    console.log('Enrollment created with ID:', enrollmentRef.id);

    // Update cohort student count
    await updateCohortStudentCount(enrollmentData.cohortId, 1);

    return enrollmentRef.id;
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