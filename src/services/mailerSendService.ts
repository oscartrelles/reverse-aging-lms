import { MailerSend, EmailParams, Sender, Recipient, Attachment } from 'mailersend';

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
  
  // Platform data
  loginUrl?: string;
  supportEmail?: string;
  
  // Dynamic content
  weeklyHighlights?: string;
  scientificUpdates?: ScientificUpdate[];
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
  private mailerSend: MailerSend;
  private config: MailerSendConfig;
  private sender: Sender;
  private emailQueue: EmailQueueItem[] = [];

  constructor() {
    this.config = {
      apiKey: process.env.REACT_APP_MAILERSEND_API_KEY || '',
      domain: process.env.REACT_APP_MAILERSEND_DOMAIN || '',
      fromEmail: process.env.REACT_APP_MAILERSEND_FROM_EMAIL || 'noreply@yourdomain.com',
      fromName: process.env.REACT_APP_MAILERSEND_FROM_NAME || 'Reverse Aging Academy',
    };

    this.mailerSend = new MailerSend({
      apiKey: this.config.apiKey,
    });

    this.sender = new Sender(this.config.fromEmail, this.config.fromName);
  }

  // Send transactional email
  async sendTransactional(templateId: string, to: string, variables: EmailVariables): Promise<boolean> {
    try {
      const recipients = [new Recipient(to, variables.fullName || `${variables.firstName} ${variables.lastName}`.trim())];

      const emailParams = new EmailParams()
        .setFrom(this.sender)
        .setTo(recipients)
        .setTemplateId(templateId)
        .setPersonalization([
          {
            email: to,
            data: this.convertVariablesToSubstitutions(variables),
          },
        ]);

      const response = await this.mailerSend.email.send(emailParams);
      
      console.log('Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Send bulk emails (for digests)
  async sendBulk(templateId: string, recipients: Array<{email: string, variables: EmailVariables}>): Promise<boolean> {
    try {
      const emailParams = new EmailParams()
        .setFrom(this.sender)
        .setTo(recipients.map(r => new Recipient(r.email, r.variables.fullName || `${r.variables.firstName} ${r.variables.lastName}`.trim())))
        .setTemplateId(templateId)
        .setPersonalization(
          recipients.map(recipient => ({
            email: recipient.email,
            data: this.convertVariablesToSubstitutions(recipient.variables),
          }))
        );

      const response = await this.mailerSend.email.send(emailParams);
      
      console.log('Bulk email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Error sending bulk email:', error);
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

  // Convert variables to MailerSend substitutions format
  private convertVariablesToSubstitutions(variables: EmailVariables): Array<{var: string, value: string}> {
    const substitutions: Array<{var: string, value: string}> = [];

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

  // Test email sending
  async testConnection(): Promise<boolean> {
    try {
      // Send a test email to verify configuration
      const testVariables: EmailVariables = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
      };

      // This is a test - in production you'd use a real template ID
      const result = await this.sendTransactional('test-template', 'test@example.com', testVariables);
      return result;
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