const functions = require('firebase-functions');
const admin = require('firebase-admin');

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