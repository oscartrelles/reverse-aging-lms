import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, runTransaction, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Enrollment } from '../types';

// Centralized enrollment data interface - this is the single source of truth
export interface EnrollmentData {
  id?: string; // Document ID from Firestore
  userId: string;
  courseId: string;
  cohortId: string;
  paymentId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  enrolledAt: Timestamp;
  completedAt?: Timestamp;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// Enrollment creation options
export interface CreateEnrollmentOptions {
  userId: string;
  courseId: string;
  cohortId: string;
  paymentId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// Enrollment update options
export interface UpdateEnrollmentOptions {
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  cohortId?: string;
  completedAt?: Timestamp;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// Centralized enrollment service
export const enrollmentService = {
  /**
   * Create a new enrollment with proper validation and error handling
   */
  async createEnrollment(options: CreateEnrollmentOptions): Promise<string> {
    try {
      console.log('Creating enrollment:', options);
      
      // Validate required fields
      if (!options.userId || !options.courseId || !options.cohortId) {
        throw new Error('Missing required fields: userId, courseId, cohortId');
      }

      // Set default status if not provided
      const status = options.status || 'active';
      
      // Create a unique document ID based on payment ID or user/course combination
      const uniqueId = options.paymentId 
        ? `payment_${options.paymentId}`
        : `enrollment_${options.userId}_${options.courseId}_${Date.now()}`;
      
    const enrollmentRef = doc(db, 'enrollments', uniqueId);
    
    // Use a transaction to ensure atomic check and creation
    const result = await runTransaction(db, async (transaction) => {
        // Check if enrollment with this payment ID already exists
      const existingDoc = await transaction.get(enrollmentRef);
      if (existingDoc.exists()) {
          console.log('Enrollment with this ID already exists, skipping creation');
        return { id: existingDoc.id, created: false };
      }
      
      // Check for active enrollment for this user/course combination
      const activeEnrollmentQuery = query(
        collection(db, 'enrollments'),
          where('userId', '==', options.userId),
          where('courseId', '==', options.courseId),
          where('status', '==', 'active')
      );
      
      const activeSnapshot = await getDocs(activeEnrollmentQuery);
      if (!activeSnapshot.empty) {
        console.log('User already has an active enrollment for this course, skipping creation');
        return { id: activeSnapshot.docs[0].id, created: false };
      }
      
        // Create enrollment data with consistent structure
        const enrollmentData: EnrollmentData = {
          userId: options.userId,
          courseId: options.courseId,
          cohortId: options.cohortId,
          paymentId: options.paymentId,
          paymentStatus: options.paymentStatus,
          status: status,
        enrolledAt: Timestamp.now(),
          stripeCustomerId: options.stripeCustomerId,
          stripeSubscriptionId: options.stripeSubscriptionId,
      };

        transaction.set(enrollmentRef, enrollmentData);
      
        // Update cohort student count if status is active
        if (status === 'active') {
          const cohortRef = doc(db, 'cohorts', options.cohortId);
          const cohortDoc = await transaction.get(cohortRef);
      if (cohortDoc.exists()) {
        const currentCount = cohortDoc.data().currentStudents || 0;
        const newCount = Math.max(0, currentCount + 1);
        transaction.update(cohortRef, { currentStudents: newCount });
        console.log('Cohort student count updated:', newCount);
          }
      }
      
      return { id: enrollmentRef.id, created: true };
    });
    
    if (result.created) {
        console.log('✅ Enrollment created with ID:', result.id);
    } else {
        console.log('ℹ️ Enrollment already existed, returning ID:', result.id);
    }

    return result.id;
  } catch (error) {
      console.error('❌ Error creating enrollment:', error);
    throw error;
  }
  },

  /**
   * Update an existing enrollment
   */
  async updateEnrollment(enrollmentId: string, updates: UpdateEnrollmentOptions): Promise<void> {
    try {
      console.log('Updating enrollment:', enrollmentId, updates);
      
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
      const enrollmentDoc = await getDoc(enrollmentRef);
      
      if (!enrollmentDoc.exists()) {
        throw new Error(`Enrollment not found: ${enrollmentId}`);
      }

      const currentData = enrollmentDoc.data() as EnrollmentData;
      const updateData: Partial<EnrollmentData> = {};

      // Only update provided fields
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.paymentStatus !== undefined) updateData.paymentStatus = updates.paymentStatus;
      if (updates.completedAt !== undefined) updateData.completedAt = updates.completedAt;
      if (updates.stripeCustomerId !== undefined) updateData.stripeCustomerId = updates.stripeCustomerId;
      if (updates.stripeSubscriptionId !== undefined) updateData.stripeSubscriptionId = updates.stripeSubscriptionId;

      await updateDoc(enrollmentRef, updateData);
      console.log('✅ Enrollment updated successfully');
    } catch (error) {
      console.error('❌ Error updating enrollment:', error);
      throw error;
    }
  },

  /**
   * Get enrollment by ID
   */
  async getEnrollment(enrollmentId: string): Promise<EnrollmentData | null> {
    try {
      const enrollmentRef = doc(db, 'enrollments', enrollmentId);
      const enrollmentDoc = await getDoc(enrollmentRef);
      
      if (enrollmentDoc.exists()) {
        return enrollmentDoc.data() as EnrollmentData;
      }
      
      return null;
  } catch (error) {
      console.error('❌ Error getting enrollment:', error);
    throw error;
  }
  },

  /**
   * Get all enrollments for a user
   */
  async getUserEnrollments(userId: string): Promise<EnrollmentData[]> {
  try {
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.map(doc => ({
      id: doc.id,
        ...doc.data()
      })) as unknown as EnrollmentData[];
  } catch (error) {
      console.error('❌ Error getting user enrollments:', error);
    throw error;
  }
  },

  /**
   * Get active enrollment for a user and course
   */
  async getActiveEnrollment(userId: string, courseId: string): Promise<EnrollmentData | null> {
    try {
      const activeEnrollmentQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('courseId', '==', courseId),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(activeEnrollmentQuery);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
      return {
          id: doc.id,
          ...doc.data()
        } as unknown as EnrollmentData;
    }
    
    return null;
  } catch (error) {
      console.error('❌ Error getting active enrollment:', error);
      throw error;
    }
  },

  /**
   * Check if user is enrolled in a course
   */
  async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    try {
      const enrollment = await this.getActiveEnrollment(userId, courseId);
      return enrollment !== null;
    } catch (error) {
      console.error('❌ Error checking enrollment status:', error);
      throw error;
    }
  },

  /**
   * Get all enrollments (admin function)
   */
  async getAllEnrollments(): Promise<EnrollmentData[]> {
    try {
      const snapshot = await getDocs(collection(db, 'enrollments'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as EnrollmentData[];
    } catch (error) {
      console.error('❌ Error getting all enrollments:', error);
    throw error;
  }
  },

  /**
   * Cancel an enrollment
   */
  async cancelEnrollment(enrollmentId: string): Promise<void> {
    try {
      await this.updateEnrollment(enrollmentId, { 
        status: 'cancelled',
        completedAt: Timestamp.now()
      });
      console.log('✅ Enrollment cancelled successfully');
    } catch (error) {
      console.error('❌ Error cancelling enrollment:', error);
      throw error;
    }
  },

  /**
   * Complete an enrollment
   */
  async completeEnrollment(enrollmentId: string): Promise<void> {
    try {
      await this.updateEnrollment(enrollmentId, { 
        status: 'completed',
        completedAt: Timestamp.now()
      });
      console.log('✅ Enrollment completed successfully');
    } catch (error) {
      console.error('❌ Error completing enrollment:', error);
      throw error;
    }
  },

  /**
   * Reactivate a cancelled enrollment
   */
  async reactivateEnrollment(enrollmentId: string): Promise<void> {
    try {
      await this.updateEnrollment(enrollmentId, { 
        status: 'active',
        completedAt: undefined
      });
      console.log('✅ Enrollment reactivated successfully');
    } catch (error) {
      console.error('❌ Error reactivating enrollment:', error);
      throw error;
    }
  },

  /**
   * Update payment status for an enrollment
   */
  async updatePaymentStatus(enrollmentId: string, paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'): Promise<void> {
    try {
      await this.updateEnrollment(enrollmentId, { paymentStatus });
      console.log('✅ Payment status updated successfully');
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      throw error;
    }
  },

  /**
   * Get enrollments by status
   */
  async getEnrollmentsByStatus(status: 'pending' | 'active' | 'completed' | 'cancelled'): Promise<EnrollmentData[]> {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('status', '==', status)
      );
      
      const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as EnrollmentData[];
    } catch (error) {
      console.error('❌ Error getting enrollments by status:', error);
      throw error;
    }
  },

  /**
   * Get enrollments by cohort
   */
  async getEnrollmentsByCohort(cohortId: string): Promise<EnrollmentData[]> {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('cohortId', '==', cohortId)
      );
      
      const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as EnrollmentData[];
  } catch (error) {
      console.error('❌ Error getting enrollments by cohort:', error);
    throw error;
  }
  },

  /**
   * Get enrollments by course
   */
  async getEnrollmentsByCourse(courseId: string): Promise<EnrollmentData[]> {
  try {
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
        where('courseId', '==', courseId)
    );
    
    const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as EnrollmentData[];
  } catch (error) {
      console.error('❌ Error getting enrollments by course:', error);
      throw error;
    }
  },

  /**
   * Set up real-time listener for user enrollments
   */
  subscribeToUserEnrollments(userId: string, callback: (enrollments: EnrollmentData[]) => void): () => void {
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId)
    );
    
    const unsubscribe = onSnapshot(enrollmentsQuery, (snapshot) => {
      const enrollments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as EnrollmentData[];
      
      callback(enrollments);
    });
    
    return unsubscribe;
  },

  /**
   * Set up real-time listener for all enrollments (admin)
   */
  subscribeToAllEnrollments(callback: (enrollments: EnrollmentData[]) => void): () => void {
    const unsubscribe = onSnapshot(collection(db, 'enrollments'), (snapshot) => {
      const enrollments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as EnrollmentData[];
      
      callback(enrollments);
    });
    
    return unsubscribe;
  }
};

// Legacy functions for backward compatibility (deprecated)
export const createEnrollment = enrollmentService.createEnrollment;
export const updateEnrollmentStatus = enrollmentService.updateEnrollment;
export const getEnrollment = enrollmentService.getEnrollment;
export const getUserEnrollments = enrollmentService.getUserEnrollments;
export const getActiveEnrollment = enrollmentService.getActiveEnrollment;
export const isUserEnrolled = enrollmentService.isUserEnrolled;
export const getAllEnrollments = enrollmentService.getAllEnrollments; 