import { mailerSendService, EmailVariables } from './mailerSendService';
import { EMAIL_TEMPLATES, EMAIL_PRIORITY, EMAIL_SCHEDULING } from '../constants/emailTemplates';
import { User, Course, Lesson, Enrollment } from '../types';

class EmailIntegrationService {
  // Welcome Series Emails
  async sendWelcomeEmail(user: User, isSocialSignIn: boolean = false): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const templateId = isSocialSignIn ? EMAIL_TEMPLATES.WELCOME_SOCIAL : EMAIL_TEMPLATES.WELCOME_EMAIL;
    
    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      courseUrl: '/dashboard',
      loginUrl: '/dashboard',
      supportEmail: 'support@reverseagingacademy.com',
    };

    await mailerSendService.sendTransactional(templateId, user.email, variables);
  }

  async scheduleWelcomeSeries(user: User): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const baseVariables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      courseUrl: '/dashboard',
      loginUrl: '/dashboard',
      supportEmail: 'support@reverseagingacademy.com',
    };

    // Schedule onboarding emails
    const onboardingEmails = [
      { template: EMAIL_TEMPLATES.ONBOARDING_NAVIGATION, hours: EMAIL_SCHEDULING.WELCOME_SERIES.ONBOARDING_NAVIGATION },
      { template: EMAIL_TEMPLATES.ONBOARDING_FIRST_LESSON, hours: EMAIL_SCHEDULING.WELCOME_SERIES.ONBOARDING_FIRST_LESSON },
      { template: EMAIL_TEMPLATES.ONBOARDING_COMMUNITY, hours: EMAIL_SCHEDULING.WELCOME_SERIES.ONBOARDING_COMMUNITY },
      { template: EMAIL_TEMPLATES.ONBOARDING_SUCCESS_TIPS, hours: EMAIL_SCHEDULING.WELCOME_SERIES.ONBOARDING_SUCCESS_TIPS },
    ];

    for (const email of onboardingEmails) {
      const scheduledFor = new Date();
      scheduledFor.setHours(scheduledFor.getHours() + email.hours);

      await mailerSendService.queueEmail({
        templateId: email.template,
        to: user.email,
        variables: baseVariables,
        scheduledFor,
        priority: EMAIL_PRIORITY.NORMAL,
      });
    }
  }

  // Payment & Enrollment Emails
  async sendPaymentConfirmation(user: User, course: Course, amount: number, currency: string = 'EUR'): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      amount,
      currency,
      paymentDate: new Date().toLocaleDateString(),
      courseTitle: course.title,
      enrollmentUrl: `/course/${course.id}`,
      supportEmail: 'support@reverseagingacademy.com',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.PAYMENT_CONFIRMATION, user.email, variables);
  }

  async sendEnrollmentConfirmation(user: User, course: Course, enrollment: Enrollment): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      courseTitle: course.title,
      courseUrl: `/course/${course.id}`,
      loginUrl: '/dashboard',
      supportEmail: 'support@reverseagingacademy.com',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.ENROLLMENT_CONFIRMATION, user.email, variables);
  }

  async sendPaymentFailed(user: User, course: Course, errorMessage: string): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      courseTitle: course.title,
      courseUrl: `/course/${course.id}`,
      supportEmail: 'support@reverseagingacademy.com',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.PAYMENT_FAILED, user.email, variables);
  }

  // Course Progress Emails
  async sendCourseStartReminder(user: User, course: Course, cohortStartDate: Date): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      courseTitle: course.title,
      courseUrl: `/course/${course.id}`,
      loginUrl: '/dashboard',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.COURSE_START_REMINDER, user.email, variables);
  }

  async sendLessonReleaseNotification(user: User, course: Course, lesson: Lesson): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      courseTitle: course.title,
      lessonTitle: lesson.title,
      courseUrl: `/course/${course.id}`,
      lessonUrl: `/lesson/${lesson.id}`,
      loginUrl: '/dashboard',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.LESSON_RELEASE, user.email, variables);
  }

  async sendCourseCompletion(user: User, course: Course): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      courseTitle: course.title,
      courseUrl: `/course/${course.id}`,
      loginUrl: '/dashboard',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.COURSE_COMPLETION, user.email, variables);
  }

  // Achievement & Motivation Emails
  async sendStreakMilestone(user: User, streakDays: number): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      loginUrl: '/dashboard',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.STREAK_MILESTONE, user.email, variables);
  }

  async sendAchievementUnlocked(user: User, achievement: { title: string; description: string; icon?: string }): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      achievementTitle: achievement.title,
      achievementDescription: achievement.description,
      achievementIcon: achievement.icon,
      loginUrl: '/dashboard',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.ACHIEVEMENT_UNLOCKED, user.email, variables);
  }

  // Community & Support Emails
  async sendQuestionAnswered(user: User, question: { title: string; answer: string }): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      loginUrl: '/dashboard',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.QUESTION_ANSWERED, user.email, variables);
  }

  // Scientific Update Emails
  async sendScientificUpdateDigest(user: User, updates: Array<{ title: string; summary: string; category: string }>): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      scientificUpdates: updates,
      loginUrl: '/dashboard',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.SCIENTIFIC_UPDATE_DIGEST, user.email, variables);
  }

  // Account Security Emails
  async sendPasswordReset(user: User, resetUrl: string): Promise<void> {
    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      loginUrl: resetUrl,
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.PASSWORD_RESET, user.email, variables);
  }

  async sendEmailVerification(user: User, verificationUrl: string): Promise<void> {
    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      loginUrl: verificationUrl,
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.EMAIL_VERIFICATION, user.email, variables);
  }

  // Re-engagement Emails
  async sendInactiveUserReengagement(user: User, daysInactive: number): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      loginUrl: '/dashboard',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.INACTIVE_USER_REENGAGEMENT, user.email, variables);
  }

  // Weekly Progress Report
  async sendWeeklyProgressReport(user: User, progressData: {
    lessonsCompleted: number;
    totalLessons: number;
    progressPercentage: number;
    currentStreak: number;
    achievements: Array<{ title: string; description: string }>;
  }): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      progressPercentage: progressData.progressPercentage,
      achievements: progressData.achievements,
      loginUrl: '/dashboard',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.WEEKLY_PROGRESS_REPORT, user.email, variables);
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    return await mailerSendService.testConnection();
  }

  // Get queue status
  getQueueStatus() {
    return mailerSendService.getQueueStatus();
  }
}

// Export singleton instance
export const emailIntegrationService = new EmailIntegrationService(); 