// Email template IDs for MailerSend
// These will be created in the MailerSend dashboard
export const EMAIL_TEMPLATES = {
  // Welcome Series
  WELCOME_EMAIL: 'welcome-email',
  WELCOME_SOCIAL: 'welcome-social',
  ONBOARDING_NAVIGATION: 'onboarding-navigation',
  ONBOARDING_FIRST_LESSON: 'onboarding-first-lesson',
  ONBOARDING_COMMUNITY: 'onboarding-community',
  ONBOARDING_SUCCESS_TIPS: 'onboarding-success-tips',

  // Payment & Enrollment
  PAYMENT_CONFIRMATION: 'payment-confirmation',
  ENROLLMENT_CONFIRMATION: 'enrollment-confirmation',
  PAYMENT_FAILED: 'payment-failed',
  REFUND_CONFIRMATION: 'refund-confirmation',

  // Course Progress
  COURSE_START_REMINDER: 'course-start-reminder',
  LESSON_RELEASE: 'lesson-release',
  COURSE_COMPLETION: 'course-completion',
  WEEKLY_PROGRESS_REPORT: 'weekly-progress-report',

  // Achievements & Motivation
  STREAK_MILESTONE: 'streak-milestone',
  ACHIEVEMENT_UNLOCKED: 'achievement-unlocked',
  BEHIND_SCHEDULE_REMINDER: 'behind-schedule-reminder',

  // Community & Support
  QUESTION_ANSWERED: 'question-answered',
  COMMUNITY_HIGHLIGHTS: 'community-highlights',
  SCIENTIFIC_UPDATE_DIGEST: 'scientific-update-digest',

  // Content & Updates
  NEW_SCIENTIFIC_UPDATE: 'new-scientific-update',
  COURSE_UPDATE: 'course-update',
  SEASONAL_CHALLENGE: 'seasonal-challenge',

  // Re-engagement
  INACTIVE_USER_REENGAGEMENT: 'inactive-user-reengagement',
  COURSE_COMPLETION_FOLLOWUP: 'course-completion-followup',
  REFERRAL_PROGRAM: 'referral-program',

  // Account Security
  PASSWORD_RESET: 'password-reset',
  EMAIL_VERIFICATION: 'email-verification',
  ACCOUNT_SECURITY_ALERT: 'account-security-alert',
} as const;

// Template variable definitions
export const TEMPLATE_VARIABLES = {
  // Common variables used across multiple templates
  COMMON: [
    'firstName',
    'lastName',
    'email',
    'fullName',
    'loginUrl',
    'supportEmail',
  ],

  // Welcome series variables
  WELCOME: [
    'firstName',
    'lastName',
    'email',
    'fullName',
    'courseUrl',
    'loginUrl',
    'supportEmail',
  ],

  // Payment variables
  PAYMENT: [
    'firstName',
    'lastName',
    'email',
    'fullName',
    'amount',
    'currency',
    'paymentDate',
    'courseTitle',
    'enrollmentUrl',
    'supportEmail',
  ],

  // Course progress variables
  COURSE_PROGRESS: [
    'firstName',
    'lastName',
    'email',
    'fullName',
    'courseTitle',
    'lessonTitle',
    'progressPercentage',
    'courseUrl',
    'lessonUrl',
    'loginUrl',
  ],

  // Achievement variables
  ACHIEVEMENT: [
    'firstName',
    'lastName',
    'email',
    'fullName',
    'achievementTitle',
    'achievementDescription',
    'achievementIcon',
    'loginUrl',
  ],

  // Scientific update variables
  SCIENTIFIC_UPDATE: [
    'firstName',
    'lastName',
    'email',
    'fullName',
    'scientificUpdates',
    'loginUrl',
  ],

  // Community variables
  COMMUNITY: [
    'firstName',
    'lastName',
    'email',
    'fullName',
    'weeklyHighlights',
    'communityUrl',
    'loginUrl',
  ],
} as const;

// Email scheduling constants
export const EMAIL_SCHEDULING = {
  // Welcome series timing (in hours after signup)
  WELCOME_SERIES: {
    WELCOME_EMAIL: 0, // Immediate
    ONBOARDING_NAVIGATION: 24, // 1 day later
    ONBOARDING_FIRST_LESSON: 72, // 3 days later
    ONBOARDING_COMMUNITY: 168, // 1 week later
    ONBOARDING_SUCCESS_TIPS: 336, // 2 weeks later
  },

  // Re-engagement timing (in days after last activity)
  REENGAGEMENT: {
    INACTIVE_7_DAYS: 7,
    INACTIVE_14_DAYS: 14,
    INACTIVE_30_DAYS: 30,
  },

  // Weekly digest timing
  WEEKLY_DIGEST: {
    DEFAULT_DAY: 'monday', // Day of week
    DEFAULT_TIME: '08:00', // Time of day
  },
} as const;

// Email priority levels
export const EMAIL_PRIORITY = {
  HIGH: 'high', // Security alerts, payment confirmations
  NORMAL: 'normal', // Most transactional emails
  LOW: 'low', // Marketing, digests
} as const;

// Email categories for user preferences
export const EMAIL_CATEGORIES = {
  WELCOME_EMAILS: 'welcomeEmails',
  PAYMENT_EMAILS: 'paymentEmails',
  PROGRESS_EMAILS: 'progressEmails',
  LESSON_RELEASE_EMAILS: 'lessonReleaseEmails',
  SCIENTIFIC_UPDATE_EMAILS: 'scientificUpdateEmails',
  COMMUNITY_EMAILS: 'communityEmails',
  MARKETING_EMAILS: 'marketingEmails',
} as const; 