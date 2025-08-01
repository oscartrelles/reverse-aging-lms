import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Payment Intent creation
export const createPaymentIntent = async (amount: number, courseId: string, userId: string) => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        courseId,
        userId,
        currency: 'eur',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Payment confirmation
export const confirmPayment = async (paymentIntentId: string) => {
  try {
    const response = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to confirm payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

// Payment status check
export const getPaymentStatus = async (paymentIntentId: string) => {
  try {
    const response = await fetch(`/api/payment-status/${paymentIntentId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get payment status');
    }

    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};

// For now, we'll use a simplified approach without backend
// This will be replaced with real backend integration
export const createPaymentIntentClient = async (amount: number, courseId: string, userId: string) => {
  // Simulate payment intent creation for now
  // In production, this would call your backend
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      const clientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;
      resolve(clientSecret);
    }, 1000);
  });
}; 