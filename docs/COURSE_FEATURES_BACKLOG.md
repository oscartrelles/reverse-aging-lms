# Course Features Backlog & Implementation Approach

## Recently Completed Features ✅

### Cohort-Based Pricing System (December 2024)
- **Status**: ✅ Completed
- **Description**: Migrated from course-level pricing to flexible cohort-based pricing
- **Features Implemented**:
  - Individual cohort pricing with base price, special offers, and early bird discounts
  - Comprehensive coupon system with usage limits, expiration dates, and minimum amounts
  - Dynamic pricing display showing all applicable discounts
  - Cohort selection during enrollment with price updates
  - Admin interface for managing cohort pricing and coupons
  - Data migration from course pricing to cohort pricing

### Enhanced Social Media & SEO (December 2024)
- **Status**: ✅ Completed
- **Description**: Comprehensive SEO and social media sharing improvements
- **Features Implemented**:
  - Dynamic meta tags for social media sharing (Open Graph, Twitter Cards)
  - Structured data (JSON-LD) for search engines
  - Social sharing component with platform-specific optimization
  - Dynamic sitemap generation
  - Social media analytics tracking
  - Firebase Cloud Functions for dynamic content serving

### Scientific Evidence Management (December 2024)
- **Status**: ✅ Completed
- **Description**: Enhanced scientific evidence features for community engagement
- **Features Implemented**:
  - Voting system with upvote/downvote functionality
  - Real-time vote updates without page refresh
  - Vote toggle (ability to un-upvote)
  - Publication date display on evidence cards
  - Social sharing for individual evidence items

## Current Implementation

### Course Structure
- **Location**: `src/pages/CoursePage.tsx` (public preview)
- **Data Source**: `courseManagementService.getCourse()` and `courseManagementService.getCourseLessons()`
- **Current Features**: 
  - Course overview and description
  - Available cohorts with enrollment
  - Lesson preview cards with icons and descriptions
  - Workbook integration information
  - Testimonials

### Lesson Structure
- **Location**: `src/types/index.ts` (Lesson interface)
- **Current Fields**: 
  - Basic lesson info (title, description, weekNumber, videoDuration)
  - Single video URL
  - Release date and publication status
  - Resources (basic structure)

## Backlog Features

### 1. Multiple Videos Per Lesson
- **Priority**: High
- **Description**: Support for multiple video uploads per lesson (e.g., Q&A session recordings, supplementary content)
- **Use Cases**:
  - Q&A session recordings from previous cohorts
  - Supplementary explanations or demonstrations
  - Alternative explanations for complex topics
  - Bonus content or deep dives
- **Technical Requirements**:
  - Extend Lesson interface to support multiple videos
  - Video management UI for admins
  - Video player with playlist functionality
  - Progress tracking per video
- **Implementation Approach**:
  ```typescript
  // Enhanced Lesson interface
  interface Lesson {
    // ... existing fields
    videos: {
      id: string;
      title: string;
      description?: string;
      url: string;
      duration: number;
      type: 'main' | 'qa' | 'supplementary' | 'bonus';
      order: number;
    }[];
  }
  ```

### 2. Course/Cohort Resource Management
- **Priority**: High
- **Description**: Ability to upload and manage workbooks, syllabi, and other course materials
- **Use Cases**:
  - Course workbook downloads
  - Detailed syllabus with learning objectives
  - Supplementary reading materials
  - Exercise sheets and worksheets
  - Cohort-specific materials
- **Technical Requirements**:
  - File upload system for admins
  - File storage and management
  - Access control (enrolled vs public)
  - Version control for updated materials
  - Download tracking
- **Implementation Approach**:
  ```typescript
  // New Resource interface
  interface CourseResource {
    id: string;
    courseId: string;
    cohortId?: string; // Optional - cohort-specific
    title: string;
    description: string;
    type: 'workbook' | 'syllabus' | 'reading' | 'exercise' | 'other';
    fileUrl: string;
    fileName: string;
    fileSize: number;
    version: string;
    isPublic: boolean; // Available to non-enrolled users
    uploadDate: Date;
    lastUpdated: Date;
  }
  ```

### 3. Enhanced Lesson Progress Tracking
- **Priority**: Medium
- **Description**: Track progress through multiple videos and resources per lesson
- **Features**:
  - Individual video completion tracking
  - Resource download tracking
  - Time spent on each video
  - Quiz completion (if added)
- **Implementation**:
  ```typescript
  interface LessonProgress {
    // ... existing fields
    videoProgress: {
      videoId: string;
      watchedPercentage: number;
      timeSpent: number;
      completed: boolean;
      lastWatched: Date;
    }[];
    resourcesDownloaded: string[]; // Resource IDs
  }
  ```

### 4. Interactive Video Player
- **Priority**: Medium
- **Description**: Enhanced video player with playlist and progress features
- **Features**:
  - Playlist navigation between videos
  - Progress indicators for each video
  - Auto-play next video option
  - Video quality selection
  - Playback speed controls
- **Location**: `src/components/VideoPlayer.tsx` (enhance existing)

### 5. Resource Download Center
- **Priority**: Medium
- **Description**: Centralized location for all course materials
- **Features**:
  - Organized by lesson/week
  - Search and filter capabilities
  - Bulk download options
  - Progress indicators for downloaded items
- **Location**: New component or enhance Dashboard

### 6. Admin Resource Management
- **Priority**: High
- **Description**: Admin interface for managing course resources
- **Features**:
  - File upload interface
  - Resource organization and categorization
  - Version management
  - Access control settings
  - Usage analytics
- **Location**: `src/pages/admin/` (new component)

### 7. Group Discounts & Bulk Enrollment
- **Priority**: Medium
- **Description**: Support for group discounts and bulk enrollment capabilities
- **Use Cases**:
  - Corporate training packages
  - Family/friend group enrollments
  - Educational institution partnerships
  - Team enrollments for organizations
  - Affiliate/referral programs
- **Technical Requirements**:
  - Group discount tiers based on quantity
  - Bulk enrollment processing
  - Group payment coordination
  - Group admin/manager role
  - Group progress tracking and reporting
- **Features**:
  - **Group Discount Tiers**: Automatic discounts based on enrollment quantity
  - **Group Payment Options**: 
    - Single payment coordinator
    - Split payment among group members
    - Corporate billing integration
  - **Group Management**:
    - Group admin can invite/manage members
    - Shared group resources and communications
    - Group progress dashboards
  - **Bulk Enrollment UI**:
    - CSV import for member details
    - Individual invitation system
    - Group enrollment confirmation workflow
- **Implementation Approach**:
  ```typescript
  // New Group-related interfaces
  interface GroupDiscount {
    id: string;
    cohortId: string;
    minGroupSize: number;
    maxGroupSize?: number;
    discountType: 'percentage' | 'fixed' | 'tier';
    discountValue: number;
    description: string;
    isActive: boolean;
    validFrom: Date;
    validUntil?: Date;
  }

  interface GroupEnrollment {
    id: string;
    cohortId: string;
    groupAdminId: string;
    groupName: string;
    members: {
      userId?: string; // If user exists
      email: string;
      name: string;
      status: 'pending' | 'enrolled' | 'declined';
      inviteDate: Date;
      enrollDate?: Date;
    }[];
    totalMembers: number;
    appliedDiscount?: GroupDiscount;
    paymentStatus: 'pending' | 'partial' | 'completed';
    createdDate: Date;
  }

  interface GroupPayment {
    id: string;
    groupEnrollmentId: string;
    paymentMethod: 'single' | 'split' | 'corporate';
    totalAmount: number;
    paidAmount: number;
    paymentCoordinator?: string; // User ID
    individualPayments?: {
      userId: string;
      amount: number;
      status: 'pending' | 'paid';
    }[];
  }
  ```
- **Payment Integration**:
  - Extend Stripe integration for group payments
  - Support for payment coordination workflows
  - Group invoicing and receipt management

## Implementation Priority

### Phase 1: Core Infrastructure
1. **Multiple Videos Per Lesson** - Extend data model and basic UI
2. **Resource Management** - File upload and storage system
3. **Admin Interface** - Basic resource management UI

### Phase 2: Enhanced User Experience
1. **Interactive Video Player** - Playlist and progress features
2. **Resource Download Center** - Organized access to materials
3. **Progress Tracking** - Enhanced tracking for multiple videos

### Phase 3: Advanced Features
1. **Group Discounts & Bulk Enrollment** - Corporate and team enrollment features
2. **Analytics** - Usage tracking and insights
3. **Version Control** - Resource update management
4. **Advanced Access Control** - Granular permissions

## Technical Considerations

### File Storage
- **Current**: Firebase Storage for images
- **Proposed**: Extend to support course materials
- **Considerations**: File size limits, bandwidth costs, CDN

### Database Schema Changes
- **Lesson Collection**: Add videos array
- **New Collection**: course_resources
- **Progress Collection**: Extend for video-level tracking

### Performance
- **Video Loading**: Lazy loading for multiple videos
- **File Downloads**: Progress indicators and resume capability
- **Caching**: Client-side caching for frequently accessed resources

### Security
- **Access Control**: Ensure only enrolled users can access premium content
- **File Validation**: Virus scanning and file type restrictions
- **Download Limits**: Prevent abuse of file downloads
- **Group Validation**: Prevent abuse of group discount system
- **Payment Verification**: Secure group payment coordination and verification

### Group Discounts Considerations
- **Fraud Prevention**: Validate group member authenticity
- **Payment Coordination**: Handle complex multi-party payment scenarios
- **Group Size Limits**: Prevent system abuse with extremely large groups
- **Invitation Management**: Secure invitation system with expiration
- **Corporate Integration**: API endpoints for enterprise systems
- **Data Privacy**: Handle group member data responsibly
- **Refund Policies**: Complex refund scenarios for group enrollments

## File Locations
- **Main Implementation**: `src/pages/CoursePage.tsx`
- **Video Player**: `src/components/VideoPlayer.tsx`
- **Admin Interface**: `src/pages/admin/` (new components)
- **Group Enrollment**: `src/components/payment/GroupEnrollment.tsx` (new)
- **Group Management**: `src/pages/admin/AdminGroupManagement.tsx` (new)
- **Services**: `src/services/courseManagementService.ts` (extend)
- **Group Services**: `src/services/groupEnrollmentService.ts` (new)
- **Payment Services**: `src/services/paymentService.ts` (extend for group payments)
- **Types**: `src/types/index.ts` (extend interfaces)
- **Documentation**: `docs/COURSE_FEATURES_BACKLOG.md` (this file)
