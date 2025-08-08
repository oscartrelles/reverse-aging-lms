# Course Features Backlog & Implementation Approach

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
1. **Analytics** - Usage tracking and insights
2. **Version Control** - Resource update management
3. **Advanced Access Control** - Granular permissions

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

## File Locations
- **Main Implementation**: `src/pages/CoursePage.tsx`
- **Video Player**: `src/components/VideoPlayer.tsx`
- **Admin Interface**: `src/pages/admin/` (new components)
- **Services**: `src/services/courseManagementService.ts` (extend)
- **Types**: `src/types/index.ts` (extend interfaces)
- **Documentation**: `docs/COURSE_FEATURES_BACKLOG.md` (this file)
