import { mailerSendService, EmailVariables } from './mailerSendService';
import { EMAIL_TEMPLATES, EMAIL_PRIORITY, EMAIL_SCHEDULING, EMAIL_CONFIG } from '../constants/emailTemplates';
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
      courseUrl: `${EMAIL_CONFIG.BASE_URL}/dashboard`,
      loginUrl: EMAIL_CONFIG.BASE_URL,
      supportEmail: EMAIL_CONFIG.SUPPORT_EMAIL,
      year: new Date().getFullYear().toString(),
      top10PracticesPdfUrl: EMAIL_CONFIG.TOP_10_PRACTICES_PDF_URL,
    };

    await mailerSendService.sendTransactional(templateId, user.email, variables);
  }

  async scheduleFreeUserSeries(user: User): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const baseVariables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      loginUrl: EMAIL_CONFIG.BASE_URL,
      supportEmail: EMAIL_CONFIG.SUPPORT_EMAIL,
      year: new Date().getFullYear().toString(),
    };

    // Schedule free user emails
    const freeUserEmails = [
      { template: EMAIL_TEMPLATES.SCIENTIFIC_UPDATE_DIGEST, hours: EMAIL_SCHEDULING.FREE_USER_SERIES.SCIENTIFIC_UPDATE_DIGEST },
      { template: EMAIL_TEMPLATES.COURSE_ENROLLMENT_INVITATION, hours: EMAIL_SCHEDULING.FREE_USER_SERIES.COURSE_ENROLLMENT_INVITATION },
      { template: EMAIL_TEMPLATES.FREE_USER_REENGAGEMENT, hours: EMAIL_SCHEDULING.FREE_USER_SERIES.FREE_USER_REENGAGEMENT },
    ];

    for (const email of freeUserEmails) {
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

  async scheduleStudentSeries(user: User, course: Course): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    const baseVariables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      courseTitle: course.title,
      courseUrl: `/course/${course.id}`,
      loginUrl: EMAIL_CONFIG.BASE_URL,
      supportEmail: EMAIL_CONFIG.SUPPORT_EMAIL,
      year: new Date().getFullYear().toString(),
    };

    // Schedule student onboarding emails
    const studentEmails = [
      { template: EMAIL_TEMPLATES.COURSE_START_REMINDER, hours: EMAIL_SCHEDULING.STUDENT_SERIES.COURSE_START_REMINDER },
      { template: EMAIL_TEMPLATES.ONBOARDING_NAVIGATION, hours: EMAIL_SCHEDULING.STUDENT_SERIES.ONBOARDING_NAVIGATION },
      { template: EMAIL_TEMPLATES.ONBOARDING_FIRST_LESSON, hours: EMAIL_SCHEDULING.STUDENT_SERIES.ONBOARDING_FIRST_LESSON },
      { template: EMAIL_TEMPLATES.ONBOARDING_COMMUNITY, hours: EMAIL_SCHEDULING.STUDENT_SERIES.ONBOARDING_COMMUNITY },
      { template: EMAIL_TEMPLATES.ONBOARDING_SUCCESS_TIPS, hours: EMAIL_SCHEDULING.STUDENT_SERIES.ONBOARDING_SUCCESS_TIPS },
    ];

    for (const email of studentEmails) {
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
  async sendPaymentConfirmation(user: User, course: Course, amount: number, currency: string = 'EUR', cohort?: any): Promise<void> {
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
      // Add cohort information if available
      cohortName: cohort?.name || 'Default Cohort',
      cohortStartDate: cohort?.startDate?.toDate()?.toLocaleDateString() || 'TBD',
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.PAYMENT_CONFIRMATION, user.email, variables);
  }

  async sendEnrollmentConfirmation(user: User, course: Course, enrollment: Enrollment): Promise<void> {
    if (!user.notificationPreferences?.email) return;

    // Format dates for display
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    // Calculate estimated dates based on enrollment
    const enrollmentDate = new Date(enrollment.enrolledAt.toDate());
    const estimatedStartDate = new Date(enrollmentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from enrollment
    const estimatedFirstLesson = new Date(enrollmentDate.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from enrollment

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      courseTitle: course.title,
      courseUrl: `/course/${course.id}`,
      loginUrl: EMAIL_CONFIG.BASE_URL,
      supportEmail: EMAIL_CONFIG.SUPPORT_EMAIL,
      year: new Date().getFullYear().toString(),
      // Cohort information (estimated based on enrollment date)
      cohortName: `${course.title} Cohort`,
      cohortStartDate: formatDate(estimatedStartDate),
      firstLessonDate: formatDate(estimatedFirstLesson),
      totalLessons: (course.duration || 7) * 3, // Estimate 3 lessons per week
      courseDuration: `${course.duration || 7} weeks`,
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.ENROLLMENT_CONFIRMATION, user.email, variables);
    
    // Schedule student series emails
    await this.scheduleStudentSeries(user, course);
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
      loginUrl: EMAIL_CONFIG.BASE_URL,
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
      loginUrl: EMAIL_CONFIG.BASE_URL,
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
      loginUrl: EMAIL_CONFIG.BASE_URL,
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
      loginUrl: EMAIL_CONFIG.BASE_URL,
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
      loginUrl: EMAIL_CONFIG.BASE_URL,
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
      loginUrl: EMAIL_CONFIG.BASE_URL,
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.QUESTION_ANSWERED, user.email, variables);
  }

  // Scientific Update Emails
  async sendScientificUpdateDigest(user: User, updates: Array<{ title: string; summary: string; category: string }>): Promise<void> {
    if (!user.notificationPreferences?.email || !user.notificationPreferences?.scientificUpdates) return;

    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      scientificUpdates: updates,
      loginUrl: EMAIL_CONFIG.BASE_URL,
      supportEmail: EMAIL_CONFIG.SUPPORT_EMAIL,
      year: new Date().getFullYear().toString(),
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.SCIENTIFIC_UPDATE_DIGEST, user.email, variables);
  }

  // Schedule weekly scientific update digest for all eligible users
  async scheduleWeeklyScientificDigest(): Promise<void> {
    try {
      // Import Firestore functions
      const { collection, getDocs, query, orderBy, limit, where } = await import('firebase/firestore');
      const { db } = await import('../firebaseConfig');

      // Fetch recent scientific updates
      const scientificUpdatesRef = collection(db, 'scientificUpdates');
      const q = query(
        scientificUpdatesRef,
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const updates = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          title: data.title || 'Untitled Study',
          summary: data.summary || data.fullReview?.substring(0, 200) + '...' || 'No summary available',
          category: data.category || 'General'
        };
      });

      if (updates.length === 0) {
        console.log('No scientific updates found for weekly digest');
        return;
      }

      // Convert updates to HTML format
      const scientificUpdatesHtml = updates.map(update => 
        `<li><strong>${update.title}</strong> (${update.category})<br>${update.summary}</li>`
      ).join('');

      // Fetch all users who have opted in to scientific updates
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        where('notificationPreferences.email', '==', true),
        where('notificationPreferences.scientificUpdates', '==', true)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      let sentCount = 0;
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        const variables: EmailVariables = {
          firstName: userData.firstName || userData.name?.split(' ')[0] || '',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
          email: userData.email,
          fullName: userData.name,
          scientificUpdates: scientificUpdatesHtml,
          loginUrl: EMAIL_CONFIG.BASE_URL,
          supportEmail: EMAIL_CONFIG.SUPPORT_EMAIL,
          year: new Date().getFullYear().toString(),
        };

        try {
          await mailerSendService.sendTransactional(
            EMAIL_TEMPLATES.SCIENTIFIC_UPDATE_DIGEST,
            userData.email,
            variables
          );
          sentCount++;
        } catch (error) {
          console.error(`Failed to send digest to ${userData.email}:`, error);
        }
      }

      console.log(`Weekly scientific digest sent to ${sentCount} users`);
    } catch (error) {
      console.error('Error scheduling weekly scientific digest:', error);
    }
  }

  // Account Security Emails
  async sendPasswordReset(user: User, resetUrl: string): Promise<void> {
    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      loginUrl: EMAIL_CONFIG.BASE_URL,
    };

    await mailerSendService.sendTransactional(EMAIL_TEMPLATES.PASSWORD_RESET, user.email, variables);
  }

  async sendEmailVerification(user: User, verificationUrl: string): Promise<void> {
    const variables: EmailVariables = {
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      fullName: user.name,
      loginUrl: EMAIL_CONFIG.BASE_URL,
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
      loginUrl: EMAIL_CONFIG.BASE_URL,
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
      loginUrl: EMAIL_CONFIG.BASE_URL,
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