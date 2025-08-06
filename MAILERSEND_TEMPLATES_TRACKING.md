# MailerSend Email Templates Tracking

## 📧 Template Status Overview

### **Free Users (Account Only)**
| Template Name | Template ID (Code) | MailerSend ID | Status | Priority |
|---------------|-------------------|---------------|---------|----------|
| Welcome Email | `welcome-email` | **k68zxl2en23lj905** | ✅ Complete | 🔴 High |
| Welcome Social | `welcome-social` | **k68zxl2en23lj905** | ✅ Complete | 🔴 High |
| Scientific Update Digest | `scientific-update-digest` | **0r83ql3jzq0gzw1j** | ✅ Ready for Testing | 🟡 Medium |
| Free User Re-engagement | `free-user-reengagement` | **PENDING** | ⏳ Not Started | 🟢 Low |
| Course Enrollment Invitation | `course-enrollment-invitation` | **PENDING** | ⏳ Not Started | 🟡 Medium |

### **Students (Enrolled Users)**
| Template Name | Template ID (Code) | MailerSend ID | Status | Priority |
|---------------|-------------------|---------------|---------|----------|
| Enrollment Confirmation | `enrollment-confirmation` | **k68zxl2exq5lj905** | ✅ Ready for Testing | 🔴 High |
| Payment Confirmation | `payment-confirmation` | **PENDING** | ⏳ Not Started | 🔴 High |
| Course Start Reminder | `course-start-reminder` | **PENDING** | ⏳ Not Started | 🔴 High |
| Onboarding Navigation | `onboarding-navigation` | **PENDING** | ⏳ Not Started | 🟡 Medium |
| Onboarding First Lesson | `onboarding-first-lesson` | **PENDING** | ⏳ Not Started | 🟡 Medium |
| Onboarding Community | `onboarding-community` | **PENDING** | ⏳ Not Started | 🟡 Medium |
| Onboarding Success Tips | `onboarding-success-tips` | **PENDING** | ⏳ Not Started | 🟡 Medium |
| Lesson Release | `lesson-release` | **PENDING** | ⏳ Not Started | 🟡 Medium |
| Weekly Progress Report | `weekly-progress-report` | **PENDING** | ⏳ Not Started | 🟢 Low |
| Course Completion | `course-completion` | **PENDING** | ⏳ Not Started | 🟡 Medium |
| Achievement Unlocked | `achievement-unlocked` | **PENDING** | ⏳ Not Started | 🟢 Low |
| Streak Milestone | `streak-milestone` | **PENDING** | ⏳ Not Started | 🟢 Low |
| Student Re-engagement | `student-reengagement` | **PENDING** | ⏳ Not Started | 🟢 Low |

### **System Emails (All Users)**
| Template Name | Template ID (Code) | MailerSend ID | Status | Priority |
|---------------|-------------------|---------------|---------|----------|
| Password Reset | `password-reset` | **PENDING** | ⏳ Not Started | 🔴 High |
| Email Verification | `email-verification` | **PENDING** | ⏳ Not Started | 🔴 High |
| Payment Failed | `payment-failed` | **PENDING** | ⏳ Not Started | 🔴 High |

## 🎯 Priority Levels

- 🔴 **High Priority**: Core user journey emails (welcome, payment, security)
- 🟡 **Medium Priority**: Onboarding and engagement emails
- 🟢 **Low Priority**: Marketing and re-engagement emails

## 🎨 **Email Template Styles Reference**

All email templates use the following CSS styles for consistent branding:

```css
body {
    font-family: "Space Grotesk", "Inter", "Roboto", "Helvetica", "Arial", sans-serif;
    line-height: 1.75;
    color: rgba(255,255,255,0.95);
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #1C1F26;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
.container {
    background-color: #2A2D35;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
}
.welcome-text {
    font-size: 24px;
    font-weight: 700;
    color: rgba(255,255,255,0.95);
    margin-bottom: 20px;
    letter-spacing: 0.02em;
}
.intro-text {
    font-size: 16px;
    color: rgba(255,255,255,0.7);
    margin-bottom: 30px;
    line-height: 1.75;
    letter-spacing: 0.01em;
}
.features {
    background: linear-gradient(135deg, rgba(80, 235, 151, 0.15), rgba(172, 255, 34, 0.15));
    border: 1px solid rgba(80, 235, 151, 0.3);
    border-radius: 8px;
    padding: 25px;
    margin-bottom: 30px;
    position: relative;
    overflow: hidden;
}
.features h3 {
    color: rgba(255,255,255,0.95);
    margin-bottom: 15px;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.01em;
    position: relative;
    z-index: 1;
}
.feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
    position: relative;
    z-index: 1;
}
.feature-list li {
    padding: 8px 0;
    color: rgba(255,255,255,0.95);
    position: relative;
    padding-left: 25px;
}
.feature-list li:before {
    content: "•";
    color: #50EB97;
    font-weight: bold;
    position: absolute;
    left: 0;
}
.cta-section {
    text-align: center;
    margin-bottom: 30px;
}
.cta-button {
    display: inline-block;
    background-color: #50EB97;
    color: #000000;
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1.2rem;
    transition: all 0.25s ease;
    box-shadow: 0 4px 12px rgba(80, 235, 151, 0.3);
    letter-spacing: 0.02em;
    text-transform: none;
}
.next-steps {
    background: linear-gradient(135deg, rgba(80, 235, 151, 0.1), rgba(172, 255, 34, 0.1));
    border-left: 4px solid #50EB97;
    padding: 20px;
    margin-bottom: 30px;
    border-radius: 0 8px 8px 0;
}
.next-steps h3 {
    color: rgba(255,255,255,0.95);
    margin-bottom: 15px;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.01em;
}
.next-steps ul {
    margin: 0;
    padding-left: 20px;
    color: rgba(255,255,255,0.7);
}
.support-section {
    text-align: center;
    padding: 20px;
    background-color: rgba(255,255,255,0.05);
    border-radius: 8px;
    margin-bottom: 30px;
    border: 1px solid rgba(255,255,255,0.1);
}
.support-section h3 {
    color: rgba(255,255,255,0.95);
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.01em;
}
.support-section p {
    color: rgba(255,255,255,0.7);
    margin: 0;
}
.support-section a {
    color: #50EB97;
    text-decoration: none;
    font-weight: 600;
}
```

**Key Color Values:**
- Primary Green: `#50EB97`
- Secondary Green: `#ACFF22`
- Background Dark: `#1C1F26`
- Container Dark: `#2A2D35`
- Text White: `rgba(255,255,255,0.95)`
- Text Light: `rgba(255,255,255,0.7)`

## 🔧 **Email Configuration**

All email templates use centralized configuration from `src/constants/emailTemplates.ts`:

```typescript
export const EMAIL_CONFIG = {
  BASE_URL: 'https://academy.7weekreverseagingchallenge.com',
  SUPPORT_EMAIL: 'support@reverseagingacademy.com',
} as const;
```

**Benefits:**
- Single source of truth for URLs and contact info
- Easy to update domain or support email across all templates
- Consistent configuration across all email services

## 📋 Template Details

### **Free Users (Account Only)**

#### 1. Welcome Email
- **Code ID**: `welcome-email`
- **MailerSend ID**: `k68zxl2en23lj905`
- **Subject**: `Welcome to Reverse Aging Academy, {{firstName}}! 🚀`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `loginUrl`, `supportEmail`, `year`
- **Status**: ✅ **COMPLETE**
- **Purpose**: Welcome new free users to access scientific updates
- **Features**: 
  - Self-contained SVG social icons
  - Dynamic year in footer
  - Direct link to scientific evidence page
  - Professional dark theme design

#### 2. Welcome Social
- **Code ID**: `welcome-social`
- **Subject**: `Welcome to Reverse Aging Academy, {{firstName}}! 🚀`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `loginUrl`, `supportEmail`, `year`
- **Status**: ✅ **COMPLETE** (Uses same template as Welcome Email)
- **Purpose**: Welcome new users who signed up via social login
- **Note**: Uses identical template as Welcome Email for consistency

#### 3. Scientific Update Digest
- **Code ID**: `scientific-update-digest`
- **MailerSend ID**: `0r83ql3jzq0gzw1j`
- **Subject**: `Latest Scientific Updates for {{firstName}} 🔬`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `scientificUpdates`, `loginUrl`, `year`
- **Status**: ✅ **READY FOR TESTING**
- **Purpose**: Weekly digest of new scientific updates for free users
- **Features**: 
  - Pulls real data from Firestore scientificUpdates collection
  - Displays up to 5 most recent published updates
  - Formatted as HTML list with title and summary using `.feature-list` styling
  - White text color for optimal readability against dark background
  - Weekly scheduling capability for Saturday morning delivery
  - Respects user opt-out preferences (`notificationPreferences.scientificUpdates`)

#### 4. Course Enrollment Invitation
- **Code ID**: `course-enrollment-invitation`
- **Subject**: `Ready to Transform Your Health, {{firstName}}? 🎯`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `courseTitle`, `courseUrl`, `loginUrl`, `currentYear`
- **Status**: ⏳ Not Started
- **Purpose**: Invite free users to enroll in courses

### **Students (Enrolled Users)**

#### 5. Enrollment Confirmation
- **Code ID**: `enrollment-confirmation`
- **MailerSend ID**: `k68zxl2exq5lj905`
- **Subject**: `Welcome to {{courseTitle}}, {{firstName}}! 🎉`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `courseTitle`, `courseUrl`, `loginUrl`, `supportEmail`, `year`, `cohortName`, `cohortStartDate`, `firstLessonDate`, `totalLessons`, `courseDuration`
- **Status**: ✅ **READY FOR TESTING**
- **Purpose**: Confirm course enrollment and welcome to the course

### 2. Welcome Social
- **Code ID**: `welcome-social`
- **Subject**: `Welcome to Reverse Aging Academy, {{firstName}}! 🚀`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `loginUrl`, `supportEmail`
- **Status**: ⏳ Not Started

### 3. Payment Confirmation
- **Code ID**: `payment-confirmation`
- **Subject**: `Payment Confirmed - Welcome to {{courseTitle}}! 💳`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `amount`, `currency`, `paymentDate`, `courseTitle`, `enrollmentUrl`, `supportEmail`
- **Status**: ⏳ Not Started

### 4. Course Completion
- **Code ID**: `course-completion`
- **Subject**: `🎉 Congratulations! You've Completed {{courseTitle}}`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `courseTitle`, `courseUrl`, `loginUrl`
- **Status**: ⏳ Not Started

### 5. Onboarding Navigation
- **Code ID**: `onboarding-navigation`
- **Subject**: `Navigate Your Way to Success, {{firstName}}! 🧭`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `courseUrl`, `loginUrl`, `supportEmail`
- **Status**: ⏳ Not Started

### 6. Onboarding First Lesson
- **Code ID**: `onboarding-first-lesson`
- **Subject**: `Ready for Your First Lesson, {{firstName}}? 📚`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `courseUrl`, `loginUrl`
- **Status**: ⏳ Not Started

### 7. Onboarding Community
- **Code ID**: `onboarding-community`
- **Subject**: `Join Our Community, {{firstName}}! 🤝`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `loginUrl`
- **Status**: ⏳ Not Started

### 8. Onboarding Success Tips
- **Code ID**: `onboarding-success-tips`
- **Subject**: `Success Tips for {{firstName}}! 💡`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `loginUrl`
- **Status**: ⏳ Not Started

### 9. Weekly Progress Report
- **Code ID**: `weekly-progress-report`
- **Subject**: `Your Weekly Progress Report, {{firstName}} 📊`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `progressPercentage`, `achievements`, `loginUrl`
- **Status**: ⏳ Not Started

### 10. Scientific Update Digest
- **Code ID**: `scientific-update-digest`
- **Subject**: `Latest Scientific Updates for {{firstName}} 🔬`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `scientificUpdates`, `loginUrl`
- **Status**: ⏳ Not Started

### 11. Lesson Release
- **Code ID**: `lesson-release`
- **Subject**: `New Lesson Available: {{lessonTitle}} 📖`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `courseTitle`, `lessonTitle`, `courseUrl`, `lessonUrl`, `loginUrl`
- **Status**: ⏳ Not Started

### 12. Achievement Unlocked
- **Code ID**: `achievement-unlocked`
- **Subject**: `Achievement Unlocked: {{achievementTitle}}! 🏆`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `achievementTitle`, `achievementDescription`, `achievementIcon`, `loginUrl`
- **Status**: ⏳ Not Started

### 13. Streak Milestone
- **Code ID**: `streak-milestone`
- **Subject**: `{{firstName}}, You're on Fire! 🔥`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `loginUrl`
- **Status**: ⏳ Not Started

### 14. Payment Failed
- **Code ID**: `payment-failed`
- **Subject**: `Payment Issue - Let's Get You Started, {{firstName}}`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `courseTitle`, `courseUrl`, `supportEmail`
- **Status**: ⏳ Not Started

### 15. Password Reset
- **Code ID**: `password-reset`
- **Subject**: `Reset Your Password - Reverse Aging Academy`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `loginUrl`
- **Status**: ⏳ Not Started

### 16. Email Verification
- **Code ID**: `email-verification`
- **Subject**: `Verify Your Email - Reverse Aging Academy`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `loginUrl`
- **Status**: ⏳ Not Started

### 17. Inactive User Re-engagement
- **Code ID**: `inactive-user-reengagement`
- **Subject**: `We Miss You, {{firstName}}! Come Back to Your Health Journey`
- **Variables**: `firstName`, `lastName`, `email`, `fullName`, `loginUrl`
- **Status**: ⏳ Not Started

## 🔄 Next Steps

1. **✅ COMPLETED**: Welcome Email template created
2. **🔄 IN PROGRESS**: Need MailerSend ID for Welcome Email
3. **⏳ PENDING**: Update code with actual template IDs
4. **⏳ PENDING**: Create remaining high-priority templates
5. **⏳ PENDING**: Test email functionality
6. **⏳ PENDING**: Create medium and low priority templates

## 📝 Notes

- MailerSend generates template IDs automatically
- We need to update the `emailTemplates.ts` constants file with actual IDs
- Test each template with sample data before marking as complete
- Monitor email delivery and engagement rates after deployment 