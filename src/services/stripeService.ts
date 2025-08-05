import { loadStripe, Stripe } from '@stripe/stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Initialize Firebase Functions
const functions = getFunctions(getApp());

// Checkout Session creation using Firebase Functions
export const createCheckoutSession = async (amount: number, courseId: string, courseTitle: string, cohortId: string) => {
  try {
    const createCheckoutSessionFunction = httpsCallable(functions, 'createCheckoutSession');
    
    const result = await createCheckoutSessionFunction({
      amount: amount,
      courseId: courseId,
      courseTitle: courseTitle,
      cohortId: cohortId,
      currency: 'eur',
    });

    const data = result.data as any;
    return data.checkoutUrl;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
};

// Payment confirmation using Firebase Functions
export const confirmPayment = async (paymentIntentId: string, tokenId: string) => {
  try {
    const confirmPaymentFunction = httpsCallable(functions, 'confirmPayment');
    
    const result = await confirmPaymentFunction({
      paymentIntentId: paymentIntentId,
      tokenId: tokenId,
    });

    return result.data;
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    throw new Error(error.message || 'Failed to confirm payment');
  }
};

// Payment status check using Firebase Functions
export const getPaymentStatus = async (paymentIntentId: string) => {
  try {
    const getPaymentStatusFunction = httpsCallable(functions, 'getPaymentStatus');
    
    const result = await getPaymentStatusFunction({
      paymentIntentId: paymentIntentId,
    });

    const data = result.data as any;
    return data.status;
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    throw new Error(error.message || 'Failed to get payment status');
  }
};

// Legacy function for backward compatibility - now uses real Firebase Functions
export const createPaymentIntentClient = async (amount: number, courseId: string, userId: string) => {
  return await createCheckoutSession(amount, courseId, 'The Reverse Aging Challenge', 'default-cohort-id');
}; 