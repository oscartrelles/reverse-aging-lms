import { addDoc, collection, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { createEnrollment } from './enrollmentService';
import { emailIntegrationService } from './emailIntegrationService';
import { User, Course } from '../types';

export interface PaymentRecord {
  id?: string;
  userId: string;
  courseId: string;
  cohortId: string;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  paymentMethod?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  receiptUrl?: string;
}

// Record payment in Firestore
export const recordPayment = async (
  paymentData: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>,
  user?: User,
  course?: Course
) => {
  try {
    console.log('Recording payment:', paymentData);
    
    const payment = {
      ...paymentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const paymentRef = await addDoc(collection(db, 'payments'), payment);
    console.log('Payment recorded with ID:', paymentRef.id);

    // If payment is successful, create enrollment
    if (paymentData.paymentStatus === 'paid') {
      await createEnrollment({
        userId: paymentData.userId,
        courseId: paymentData.courseId,
        cohortId: paymentData.cohortId,
        paymentId: paymentRef.id,
        paymentStatus: 'paid',
        enrollmentStatus: 'active',
        stripeCustomerId: paymentData.stripeCustomerId,
      });

      // Send payment confirmation email if user and course data are provided
      if (user && course) {
        try {
          await emailIntegrationService.sendPaymentConfirmation(
            user, 
            course, 
            paymentData.amount, 
            paymentData.currency || 'EUR'
          );
        } catch (emailError) {
          console.warn('Failed to send payment confirmation email:', emailError);
          // Don't fail the payment if email fails
        }
      }
    }

    return paymentRef.id;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
};

// Update payment status
export const updatePaymentStatus = async (paymentId: string, status: PaymentRecord['paymentStatus']) => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, {
      paymentStatus: status,
      updatedAt: Timestamp.now(),
    });
    
    console.log('Payment status updated:', status);
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Get payment by ID
export const getPayment = async (paymentId: string) => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentDoc = await getDoc(paymentRef);
    
    if (paymentDoc.exists()) {
      return {
        id: paymentDoc.id,
        ...paymentDoc.data(),
      } as PaymentRecord;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting payment:', error);
    throw error;
  }
};

// Process successful payment
export const processSuccessfulPayment = async (
  userId: string,
  courseId: string,
  cohortId: string,
  amount: number,
  stripePaymentIntentId: string,
  stripeCustomerId?: string
) => {
  try {
    console.log('Processing successful payment:', {
      userId,
      courseId,
      cohortId,
      amount,
      stripePaymentIntentId,
    });

    // Record the payment
    const paymentId = await recordPayment({
      userId,
      courseId,
      cohortId,
      amount,
      currency: 'eur',
      paymentStatus: 'paid',
      stripePaymentIntentId,
      stripeCustomerId,
    });

    console.log('Payment processed successfully:', paymentId);
    return paymentId;
  } catch (error) {
    console.error('Error processing successful payment:', error);
    throw error;
  }
};

// Process failed payment
export const processFailedPayment = async (
  userId: string,
  courseId: string,
  cohortId: string,
  amount: number,
  stripePaymentIntentId: string,
  errorMessage: string
) => {
  try {
    console.log('Processing failed payment:', {
      userId,
      courseId,
      cohortId,
      amount,
      stripePaymentIntentId,
      errorMessage,
    });

    // Record the failed payment
    const paymentId = await recordPayment({
      userId,
      courseId,
      cohortId,
      amount,
      currency: 'eur',
      paymentStatus: 'failed',
      stripePaymentIntentId,
    });

    console.log('Failed payment recorded:', paymentId);
    return paymentId;
  } catch (error) {
    console.error('Error processing failed payment:', error);
    throw error;
  }
};

// Generate receipt URL (placeholder for now)
export const generateReceiptUrl = async (paymentId: string) => {
  // In production, this would generate a proper receipt
  // For now, return a placeholder
  return `https://yourdomain.com/receipt/${paymentId}`;
}; 