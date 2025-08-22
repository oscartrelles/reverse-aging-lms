import { getFunctions, httpsCallable } from 'firebase/functions';

// Configuration interface
export interface MailerSendConfig {
  apiKey: string;
  domain: string;
  fromEmail: string;
  fromName: string;
}

// Email template interface
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  variables: string[];
}

// Email variables interface
export interface EmailVariables {
  // User data
  firstName?: string;
  lastName?: string;
  email: string;
  fullName?: string;
  
  // Course data
  courseTitle?: string;
  lessonTitle?: string;
  progressPercentage?: number;
  courseUrl?: string;
  lessonUrl?: string;
  enrollmentUrl?: string;
  
  // Cohort data
  cohortName?: string;
  cohortStartDate?: string;
  firstLessonDate?: string;
  totalLessons?: number;
  courseDuration?: string;
  
  // Platform data
  loginUrl?: string;
  supportEmail?: string;
  year?: string;
  top10PracticesPdfUrl?: string;
  
  // Dynamic content
  weeklyHighlights?: string;
  scientificUpdates?: ScientificUpdate[] | string;
  achievements?: Achievement[];
  
  // Payment data
  amount?: number;
  currency?: string;
  paymentDate?: string;
  
  // Achievement data
  achievementTitle?: string;
  achievementDescription?: string;
  achievementIcon?: string;
}

// Types for dynamic content
export interface ScientificUpdate {
  title: string;
  summary: string;
  category: string;
}

export interface Achievement {
  title: string;
  description: string;
  icon?: string;
}

// Email queue item for later sending
export interface EmailQueueItem {
  templateId: string;
  to: string;
  variables: EmailVariables;
  scheduledFor?: Date;
  priority: 'high' | 'normal' | 'low';
}

class MailerSendService {
  private config: MailerSendConfig;
  private emailQueue: EmailQueueItem[] = [];
  private functions = getFunctions();
  private sendEmailFunction = httpsCallable(this.functions, 'sendEmail');
  private testMailerSendFunction = httpsCallable(this.functions, 'testMailerSend');

  constructor() {
    this.config = {
      apiKey: process.env.REACT_APP_MAILERSEND_API_KEY || '',
      domain: process.env.REACT_APP_MAILERSEND_DOMAIN || '',
      fromEmail: process.env.REACT_APP_MAILERSEND_FROM_EMAIL || 'noreply@yourdomain.com',
      fromName: process.env.REACT_APP_MAILERSEND_FROM_NAME || 'Reverse Aging Academy',
    };
  }

  // Send transactional email using Cloud Function
  async sendTransactional(templateId: string, to: string, variables: EmailVariables): Promise<boolean> {
    try {
      const result = await this.sendEmailFunction({
        templateId,
        to,
        variables,
      });

      const data = result.data as any;
      
      if (data.trialMode) {
        console.log('Email would be sent in production (trial mode detected)');
        return true;
      }

      console.log('Email sent successfully via Cloud Function');
      return true;
    } catch (error) {
      console.error('Error sending email via Cloud Function:', error);
      return false;
    }
  }

  // Send bulk emails (for digests) - using Cloud Function
  async sendBulk(templateId: string, recipients: Array<{email: string, variables: EmailVariables}>): Promise<boolean> {
    try {
      // For bulk emails, we'll send them individually via Cloud Function
      const promises = recipients.map(recipient => 
        this.sendEmailFunction({
          templateId,
          to: recipient.email,
          variables: recipient.variables,
        })
      );

      await Promise.all(promises);
      console.log('Bulk email sent successfully via Cloud Function');
      return true;
    } catch (error) {
      console.error('Error sending bulk email via Cloud Function:', error);
      return false;
    }
  }

  // Queue email for later sending
  async queueEmail(emailData: EmailQueueItem): Promise<void> {
    this.emailQueue.push(emailData);
    
    // In a production environment, you'd store this in a database
    // For now, we'll store in localStorage as a simple solution
    this.saveQueueToStorage();
  }

  // Process queued emails
  async processQueuedEmails(): Promise<void> {
    const now = new Date();
    const emailsToSend = this.emailQueue.filter(
      item => !item.scheduledFor || item.scheduledFor <= now
    );

    for (const emailData of emailsToSend) {
      await this.sendTransactional(emailData.templateId, emailData.to, emailData.variables);
    }

    // Remove sent emails from queue
    this.emailQueue = this.emailQueue.filter(
      item => item.scheduledFor && item.scheduledFor > now
    );
    
    this.saveQueueToStorage();
  }

  // Save queue to localStorage (simple persistence)
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem('emailQueue', JSON.stringify(this.emailQueue));
    } catch (error) {
      console.warn('Could not save email queue to localStorage:', error);
    }
  }

  // Load queue from localStorage
  private loadQueueFromStorage(): void {
    try {
      const savedQueue = localStorage.getItem('emailQueue');
      if (savedQueue) {
        this.emailQueue = JSON.parse(savedQueue);
      }
    } catch (error) {
      console.warn('Could not load email queue from localStorage:', error);
      this.emailQueue = [];
    }
  }

  // Initialize the service
  async initialize(): Promise<void> {
    this.loadQueueFromStorage();
    
    // Process any queued emails on initialization
    await this.processQueuedEmails();
  }

  // Get queue status
  getQueueStatus(): { total: number; pending: number; scheduled: number } {
    const now = new Date();
    const pending = this.emailQueue.filter(item => !item.scheduledFor || item.scheduledFor <= now).length;
    const scheduled = this.emailQueue.filter(item => item.scheduledFor && item.scheduledFor > now).length;
    
    return {
      total: this.emailQueue.length,
      pending,
      scheduled,
    };
  }

  // Test email sending via Cloud Function
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.testMailerSendFunction({});
      console.log('MailerSend connection test result:', result);
      return true;
    } catch (error) {
      console.error('MailerSend connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mailerSendService = new MailerSendService();

// Initialize service when module loads
mailerSendService.initialize().catch(console.error); 