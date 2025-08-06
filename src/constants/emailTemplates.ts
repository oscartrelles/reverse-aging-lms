// Email configuration constants
export const EMAIL_CONFIG = {
  BASE_URL: 'https://academy.7weekreverseagingchallenge.com',
  SUPPORT_EMAIL: 'support@reverseagingacademy.com',
} as const;

// Email template IDs for MailerSend
// These will be created in the MailerSend dashboard
export const EMAIL_TEMPLATES = {
  // Free Users (Account Only)
  WELCOME_EMAIL: 'k68zxl2en23lj905', // ✅ COMPLETE
  WELCOME_SOCIAL: 'welcome-social', // ⏳ PENDING
  SCIENTIFIC_UPDATE_DIGEST: '0r83ql3jzq0gzw1j', // ✅ READY FOR TESTING
  FREE_USER_REENGAGEMENT: 'free-user-reengagement', // ⏳ PENDING
  COURSE_ENROLLMENT_INVITATION: 'course-enrollment-invitation', // ⏳ PENDING

  // Students (Enrolled Users)
  ENROLLMENT_CONFIRMATION: 'k68zxl2exq5lj905', // ✅ Ready for Testing
  PAYMENT_CONFIRMATION: 'payment-confirmation', // ⏳ PENDING
  COURSE_START_REMINDER: 'course-start-reminder', // ⏳ PENDING
  ONBOARDING_NAVIGATION: 'onboarding-navigation', // ⏳ PENDING
  ONBOARDING_FIRST_LESSON: 'onboarding-first-lesson', // ⏳ PENDING
  ONBOARDING_COMMUNITY: 'onboarding-community', // ⏳ PENDING
  ONBOARDING_SUCCESS_TIPS: 'onboarding-success-tips', // ⏳ PENDING
  LESSON_RELEASE: 'lesson-release', // ⏳ PENDING
  WEEKLY_PROGRESS_REPORT: 'weekly-progress-report', // ⏳ PENDING
  COURSE_COMPLETION: 'course-completion', // ⏳ PENDING
  ACHIEVEMENT_UNLOCKED: 'achievement-unlocked', // ⏳ PENDING
  STREAK_MILESTONE: 'streak-milestone', // ⏳ PENDING
  STUDENT_REENGAGEMENT: 'student-reengagement', // ⏳ PENDING

  // System Emails (All Users)
  PASSWORD_RESET: 'password-reset', // ⏳ PENDING
  EMAIL_VERIFICATION: 'email-verification', // ⏳ PENDING
  PAYMENT_FAILED: 'payment-failed', // ⏳ PENDING
  REFUND_CONFIRMATION: 'refund-confirmation', // ⏳ PENDING

  // Legacy/Deprecated (to be removed)
  BEHIND_SCHEDULE_REMINDER: 'behind-schedule-reminder',
  QUESTION_ANSWERED: 'question-answered',
  COMMUNITY_HIGHLIGHTS: 'community-highlights',
  NEW_SCIENTIFIC_UPDATE: 'new-scientific-update',
  COURSE_UPDATE: 'course-update',
  SEASONAL_CHALLENGE: 'seasonal-challenge',
  INACTIVE_USER_REENGAGEMENT: 'inactive-user-reengagement',
  COURSE_COMPLETION_FOLLOWUP: 'course-completion-followup',
  REFERRAL_PROGRAM: 'referral-program',
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
  // Free Users (Account Only)
  FREE_USER_SERIES: {
    WELCOME_EMAIL: 0, // Immediate
    SCIENTIFIC_UPDATE_DIGEST: 168, // 1 week later (weekly)
    COURSE_ENROLLMENT_INVITATION: 336, // 2 weeks later
    FREE_USER_REENGAGEMENT: 504, // 3 weeks later
  },

  // Students (Enrolled Users)
  STUDENT_SERIES: {
    ENROLLMENT_CONFIRMATION: 0, // Immediate
    COURSE_START_REMINDER: 24, // 1 day later
    ONBOARDING_NAVIGATION: 48, // 2 days later
    ONBOARDING_FIRST_LESSON: 72, // 3 days later
    ONBOARDING_COMMUNITY: 168, // 1 week later
    ONBOARDING_SUCCESS_TIPS: 336, // 2 weeks later
    WEEKLY_PROGRESS_REPORT: 168, // Weekly (1 week after enrollment)
  },

  // Re-engagement timing (in days after last activity)
  REENGAGEMENT: {
    FREE_USER_7_DAYS: 7,
    FREE_USER_14_DAYS: 14,
    FREE_USER_30_DAYS: 30,
    STUDENT_7_DAYS: 7,
    STUDENT_14_DAYS: 14,
    STUDENT_30_DAYS: 30,
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