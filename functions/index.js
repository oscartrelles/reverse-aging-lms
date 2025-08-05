const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Stripe only if secret key is available
let stripe = null;
try {
  const stripeSecretKey = functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY;
  if (stripeSecretKey) {
    stripe = require('stripe')(stripeSecretKey);
  }
} catch (error) {
  console.warn('Stripe not initialized - secret key not available');
}

admin.initializeApp();

// MailerSend API configuration
const MAILERSEND_API_KEY = functions.config().mailersend?.api_key || process.env.MAILERSEND_API_KEY;
const MAILERSEND_FROM_EMAIL = functions.config().mailersend?.from_email || process.env.MAILERSEND_FROM_EMAIL || 'noreply@reverseagingacademy.com';
const MAILERSEND_FROM_NAME = functions.config().mailersend?.from_name || process.env.MAILERSEND_FROM_NAME || 'Reverse Aging Academy';

// Send email via MailerSend API
exports.sendEmail = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { templateId, to, variables } = data;

  try {
    const payload = {
      from: {
        email: MAILERSEND_FROM_EMAIL,
        name: MAILERSEND_FROM_NAME,
      },
      to: [
        {
          email: to,
          name: variables.fullName || `${variables.firstName} ${variables.lastName}`.trim(),
        },
      ],
      template_id: templateId,
      subject: getSubjectForTemplate(templateId, variables), // Add subject field
      variables: [
        {
          email: to,
          substitutions: convertVariablesToSubstitutions(variables),
        },
      ],
    };

    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('MailerSend API error:', errorData);
      
      // Handle trial account limitations
      if (errorData.message && errorData.message.includes('Trial accounts can only send emails to the administrator')) {
        console.log('Trial account limitation detected - email would be sent in production');
        return { success: true, trialMode: true };
      }
      
      throw new functions.https.HttpsError('internal', 'Failed to send email');
    }

    console.log('Email sent successfully via Cloud Function');
    return { success: true };
  } catch (error) {
    console.error('Error sending email via Cloud Function:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

// Convert variables to MailerSend substitutions format
function convertVariablesToSubstitutions(variables) {
  const substitutions = [];

  // Add all string variables
  Object.entries(variables).forEach(([key, value]) => {
    if (typeof value === 'string' && value !== undefined) {
      substitutions.push({ var: key, value });
    }
  });

  // Handle special cases
  if (variables.progressPercentage !== undefined) {
    substitutions.push({ var: 'progressPercentage', value: variables.progressPercentage.toString() });
  }

  if (variables.amount !== undefined) {
    substitutions.push({ var: 'amount', value: variables.amount.toString() });
  }

  // Handle arrays (scientific updates, achievements)
  if (variables.scientificUpdates && variables.scientificUpdates.length > 0) {
    const updatesHtml = variables.scientificUpdates
      .map(update => `<li><strong>${update.title}</strong>: ${update.summary}</li>`)
      .join('');
    substitutions.push({ var: 'scientificUpdates', value: `<ul>${updatesHtml}</ul>` });
  }

  if (variables.achievements && variables.achievements.length > 0) {
    const achievementsHtml = variables.achievements
      .map(achievement => `<li>${achievement.title}: ${achievement.description}</li>`)
      .join('');
    substitutions.push({ var: 'achievements', value: `<ul>${achievementsHtml}</ul>` });
  }

  return substitutions;
}

// Get subject line for different templates
function getSubjectForTemplate(templateId, variables) {
  switch (templateId) {
    case 'k68zxl2en23lj905': // Welcome Email
      return `Welcome to Reverse Aging Academy, ${variables.firstName || 'there'}! 🚀`;
    case 'welcome-social':
      return `Welcome to Reverse Aging Academy, ${variables.firstName || 'there'}! 🚀`;
    case 'welcome-series-1':
      return 'Your First Week: Getting Started with Reverse Aging 🎯';
    case 'welcome-series-2':
      return 'Week 2: Building Your Foundation 💪';
    case 'welcome-series-3':
      return 'Week 3: Advanced Strategies 🔬';
    case 'lesson-completed':
      return `Congratulations! You've completed: ${variables.lessonTitle || 'a lesson'} 🎉`;
    case 'course-completed':
      return `🎉 You've completed the ${variables.courseTitle || 'course'}!`;
    case 'achievement-unlocked':
      return `🏆 Achievement Unlocked: ${variables.achievementTitle || 'New Achievement'}!`;
    case 'streak-milestone':
      return `🔥 ${variables.streakDays || '7'} Day Streak! Keep it up!`;
    case 'weekly-digest':
      return '📊 Your Weekly Progress Report';
    case 'scientific-update':
      return '🔬 New Scientific Discovery in Reverse Aging';
    case 'community-highlight':
      return '👥 Community Spotlight: Your Fellow Students';
    case 'payment-confirmation':
      return `💰 Payment Confirmed - Welcome to Reverse Aging Academy!`;
    case 'payment-failed':
      return '⚠️ Payment Issue - Action Required';
    case 'subscription-renewal':
      return '🔄 Your Reverse Aging Academy subscription has been renewed';
    case 'subscription-cancelled':
      return '👋 We\'ll miss you - Subscription Cancelled';
    case 'account-update':
      return '⚙️ Your Reverse Aging Academy account has been updated';
    default:
      return 'Message from Reverse Aging Academy';
  }
}

// Test function to verify MailerSend configuration
exports.testMailerSend = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const testVariables = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
    };

    const payload = {
      from: {
        email: MAILERSEND_FROM_EMAIL,
        name: MAILERSEND_FROM_NAME,
      },
      to: [
        {
          email: 'test@example.com',
          name: 'Test User',
        },
      ],
      template_id: 'test-template',
      variables: [
        {
          email: 'test@example.com',
          substitutions: convertVariablesToSubstitutions(testVariables),
        },
      ],
    };

    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    return { 
      success: response.ok, 
      status: response.status,
      statusText: response.statusText 
    };
  } catch (error) {
    console.error('Test MailerSend error:', error);
    throw new functions.https.HttpsError('internal', 'Test failed');
  }
});

// Stripe Checkout Session creation
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  console.log('createCheckoutSession called with data:', data);
  console.log('User ID:', context.auth?.uid);
  
  // Check if user is authenticated
  if (!context.auth) {
    console.log('User not authenticated');
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if Stripe is available
  if (!stripe) {
    console.log('Stripe not configured');
    throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured. Please set up your Stripe secret key.');
  }

  const { amount, courseId, courseTitle, cohortId, currency = 'eur' } = data;
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;

  console.log('Creating Checkout Session with:', { amount, courseId, courseTitle, cohortId, currency, userId, userEmail });

  try {
    // Validate input
    if (!amount || amount <= 0) {
      console.log('Invalid amount:', amount);
      throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
    }

    if (!courseId) {
      console.log('Course ID missing');
      throw new functions.https.HttpsError('invalid-argument', 'Course ID is required');
    }

    // Create Checkout Session with Stripe
    console.log('Calling Stripe API to create Checkout Session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: courseTitle || 'The Reverse Aging Challenge',
              description: 'Complete course enrollment and access to all materials',
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000'}/payment-cancelled`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        courseId: courseId,
        cohortId: cohortId,
        firebaseUid: userId
      },
    });

    console.log('Checkout Session created successfully:', session.id);
    console.log('Checkout URL:', session.url);

    // Store checkout session reference in Firestore
    await admin.firestore().collection('checkoutSessions').doc(session.id).set({
      userId: userId,
      courseId: courseId,
      cohortId: cohortId,
      amount: amount,
      currency: currency,
      status: session.status,
      created: admin.firestore.FieldValue.serverTimestamp(),
      checkoutUrl: session.url
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      amount: amount,
      currency: currency
    };

  } catch (error) {
    console.error('Error creating Checkout Session:', error);
    
    if (error.type === 'StripeCardError') {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    } else if (error.type === 'StripeInvalidRequestError') {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid request to Stripe');
    } else {
      throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
    }
  }
});

// Confirm payment and create enrollment
exports.confirmPayment = functions.https.onCall(async (data, context) => {
  console.log('confirmPayment called with data:', data);
  console.log('User ID:', context.auth?.uid);
  
  // Check if user is authenticated
  if (!context.auth) {
    console.log('User not authenticated');
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if Stripe is available
  if (!stripe) {
    console.log('Stripe not configured');
    throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured. Please set up your Stripe secret key.');
  }

  const { paymentIntentId, tokenId } = data;
  const userId = context.auth.uid;

  console.log('Confirming payment with:', { paymentIntentId, tokenId, userId });

  try {
    // Confirm the PaymentIntent with the token using secret key
    console.log('Confirming PaymentIntent with token...');
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method_data: {
        type: 'card',
        card: {
          token: tokenId,
        },
      },
    });
    console.log('PaymentIntent confirmed:', paymentIntent.id, 'Status:', paymentIntent.status);

    if (!paymentIntent) {
      throw new functions.https.HttpsError('not-found', 'Payment Intent not found');
    }

    // Verify the payment belongs to the authenticated user
    if (paymentIntent.metadata.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Payment Intent does not belong to user');
    }

    // Check if payment was successful
    if (paymentIntent.status !== 'succeeded') {
      throw new functions.https.HttpsError('failed-precondition', `Payment was not successful. Status: ${paymentIntent.status}`);
    }

    // Get the stored payment intent data
    const paymentDoc = await admin.firestore().collection('paymentIntents').doc(paymentIntentId).get();
    
    if (!paymentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Payment record not found');
    }

    const paymentData = paymentDoc.data();
    const courseId = paymentData.courseId;
    const amount = paymentData.amount;

    // Create enrollment
    const enrollmentRef = admin.firestore().collection('enrollments').doc();
    await enrollmentRef.set({
      userId: userId,
      courseId: courseId,
      status: 'active',
      enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentId: paymentIntentId,
      amount: amount,
      currency: paymentData.currency || 'eur'
    });

    // Update payment intent status
    await admin.firestore().collection('paymentIntents').doc(paymentIntentId).update({
      status: 'confirmed',
      confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      enrollmentId: enrollmentRef.id
    });

    console.log('Payment confirmed and enrollment created:', enrollmentRef.id);

    return {
      success: true,
      enrollmentId: enrollmentRef.id,
      paymentIntentId: paymentIntentId
    };

  } catch (error) {
    console.error('Error confirming payment:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    throw new functions.https.HttpsError('internal', error.message || 'Failed to confirm payment');
  }
});

// Get payment status
exports.getPaymentStatus = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if Stripe is available
  if (!stripe) {
    throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured. Please set up your Stripe secret key.');
  }

  const { paymentIntentId } = data;
  const userId = context.auth.uid;

  try {
    // Retrieve the Payment Intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      throw new functions.https.HttpsError('not-found', 'Payment Intent not found');
    }

    // Verify the payment belongs to the authenticated user
    if (paymentIntent.metadata.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Payment Intent does not belong to user');
    }

    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      created: paymentIntent.created
    };

  } catch (error) {
    console.error('Error getting payment status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get payment status');
  }
}); 