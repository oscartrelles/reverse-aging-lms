"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentStatus = exports.confirmPayment = exports.createCheckoutSession = exports.testMailerSend = exports.sendEmail = exports.dynamicMetaTags = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Stripe only if secret key is available
let stripe = null;
try {
    const stripeSecretKey = ((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.secret_key) || process.env.STRIPE_SECRET_KEY;
    if (stripeSecretKey) {
        const Stripe = require('stripe');
        stripe = new Stripe(stripeSecretKey);
    }
}
catch (error) {
    console.warn('Stripe not initialized - secret key not available');
}
admin.initializeApp();
// Import the dynamic meta tags function
var socialMetaTags_1 = require("./socialMetaTags");
Object.defineProperty(exports, "dynamicMetaTags", { enumerable: true, get: function () { return socialMetaTags_1.dynamicMetaTags; } });
// MailerSend API configuration
const MAILERSEND_API_KEY = ((_b = functions.config().mailersend) === null || _b === void 0 ? void 0 : _b.api_key) || process.env.MAILERSEND_API_KEY;
const MAILERSEND_FROM_EMAIL = ((_c = functions.config().mailersend) === null || _c === void 0 ? void 0 : _c.from_email) || process.env.MAILERSEND_FROM_EMAIL || 'noreply@reverseagingacademy.com';
const MAILERSEND_FROM_NAME = ((_d = functions.config().mailersend) === null || _d === void 0 ? void 0 : _d.from_name) || process.env.MAILERSEND_FROM_NAME || 'Reverse Aging Academy';
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
            subject: getSubjectForTemplate(templateId, variables),
            personalization: [
                {
                    email: to,
                    data: variables,
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
    }
    catch (error) {
        console.error('Error sending email via Cloud Function:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send email');
    }
});
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
            personalization: [
                {
                    email: 'test@example.com',
                    data: testVariables,
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
    }
    catch (error) {
        console.error('Test MailerSend error:', error);
        throw new functions.https.HttpsError('internal', 'Test failed');
    }
});
// Stripe Checkout Session creation
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    var _a;
    console.log('createCheckoutSession called with data:', data);
    console.log('User ID:', (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid);
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
        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: currency,
                    product_data: {
                        name: courseTitle || 'The Reverse Aging Challenge',
                        description: 'Complete course enrollment and access to all materials',
                    },
                    unit_amount: amount, // Amount in cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.REACT_APP_FRONTEND_URL || 'https://academy.7weekreverseagingchallenge.com'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.REACT_APP_FRONTEND_URL || 'https://academy.7weekreverseagingchallenge.com'}/payment-cancelled`,
            customer_email: userEmail,
            metadata: {
                userId: userId,
                courseId: courseId,
                cohortId: cohortId,
                firebaseUid: userId
            },
        });

        console.log('Checkout Session created successfully:', session.id);
        // Don't log sensitive URLs in production
        if (process.env.NODE_ENV !== 'production') {
            console.log('Checkout URL:', session.url);
            console.log('Success URL:', `${process.env.REACT_APP_FRONTEND_URL || 'https://academy.7weekreverseagingchallenge.com'}/payment-success?session_id={CHECKOUT_SESSION_ID}`);
        }
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
    }
    catch (error) {
        console.error('Error creating Checkout Session:', error);
        if (error.type === 'StripeCardError') {
            throw new functions.https.HttpsError('invalid-argument', error.message);
        }
        else if (error.type === 'StripeInvalidRequestError') {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid request to Stripe');
        }
        else {
            throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
        }
    }
});
// Confirm payment and create enrollment
exports.confirmPayment = functions.https.onCall(async (data, context) => {
    var _a;
    console.log('confirmPayment called with data:', data);
    console.log('User ID:', (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid);
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
    }
    catch (error) {
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
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            created: paymentIntent.created
        };
    }
    catch (error) {
        console.error('Error getting payment status:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get payment status');
    }
});
//# sourceMappingURL=index.js.map