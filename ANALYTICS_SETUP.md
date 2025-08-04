# Analytics Setup Guide

## Overview
This document outlines the Google Analytics 4 (GA4) implementation for the Reverse Aging LMS platform.

## Phase 1 Implementation Complete ✅

### What's Been Implemented

#### 1. Core Analytics Service (`src/services/analyticsService.ts`)
- **GA4 Initialization**: Automatic script loading and configuration
- **Event Tracking**: Comprehensive event tracking functions
- **User Properties**: Custom user property mapping
- **Page Views**: Automatic page view tracking
- **Scroll Depth**: Tracks scroll progress (25%, 50%, 75%, 100%)
- **Time on Page**: Tracks user engagement time

#### 2. React Hook (`src/hooks/useAnalytics.ts`)
- **Automatic Tracking**: Page views, user properties, scroll depth
- **User Identification**: Links user data to analytics
- **Real-time Updates**: Updates user properties when data changes

#### 3. Analytics Wrapper (`src/components/analytics/AnalyticsWrapper.tsx`)
- **App-wide Integration**: Wraps the entire application
- **Automatic Initialization**: Starts tracking on app load

#### 4. Authentication Tracking
- **Sign-up Events**: Tracks email, Google, and Facebook sign-ups
- **Sign-in Events**: Tracks all authentication methods
- **User Properties**: Sets user type, signup source, enrollment status

## Phase 2 Implementation Complete ✅

### Enhanced Event Tracking Added

#### 1. Course Progress Tracking
- **Lesson Completion**: Tracks when users complete lessons
- **Course Completion**: Automatically detects and tracks full course completion
- **Video Engagement**: Tracks video completion in VideoPlayer component
- **Progress Updates**: Monitors lesson progress changes

#### 2. Community Engagement Tracking
- **Question Asking**: Tracks when users ask questions in lessons
- **Scientific Update Reads**: Tracks when users read scientific updates
- **Community Interactions**: Monitors user engagement with community features

#### 3. Payment & Conversion Tracking
- **Payment Initiation**: Tracks when payment process starts
- **Payment Completion**: Tracks successful payments
- **Course Enrollment**: Tracks successful course enrollments
- **Revenue Attribution**: Links payments to specific courses

#### 4. Landing Page Conversion Tracking
- **CTA Clicks**: Tracks all call-to-action button clicks
- **Sign-up Funnel**: Monitors conversion from landing page to sign-up
- **User Journey**: Tracks user flow through the platform

#### 5. Enhanced Analytics Dashboard
- **Real-time Testing**: Interactive dashboard for testing analytics events
- **Event Monitoring**: Visual display of tracked events
- **User Context**: Shows current user and enrollment information
- **Comprehensive Testing**: Test all event types with one click

## Phase 3 Implementation Complete ✅

### Advanced Analytics Features Added

#### 1. Cohort Analysis System (`src/services/cohortAnalysisService.ts`)
- **Cohort Creation**: Create and manage user cohorts
- **Retention Tracking**: Calculate 1, 7, 30, and 90-day retention rates
- **Engagement Metrics**: Track lessons completed, questions asked, scientific updates read
- **User Activity Monitoring**: Real-time user activity tracking within cohorts
- **Recommendations Engine**: AI-powered insights and recommendations
- **Statistical Analysis**: Advanced cohort performance analysis

#### 2. A/B Testing Framework (`src/services/abTestingService.ts`)
- **Experiment Management**: Create and manage A/B tests
- **Variant Assignment**: Intelligent traffic splitting and user assignment
- **Statistical Significance**: Calculate confidence intervals and statistical significance
- **Conversion Tracking**: Track experiment-specific conversion events
- **Results Analysis**: Comprehensive experiment results with insights
- **Winner Detection**: Automatic winner identification with confidence levels

#### 3. Real-Time Analytics (`src/services/realTimeAnalyticsService.ts`)
- **Live Metrics**: Real-time active users, sessions, and events
- **Session Tracking**: Complete user session monitoring
- **Conversion Funnel**: Real-time conversion funnel analysis
- **Revenue Tracking**: Live revenue and conversion metrics
- **Page Performance**: Real-time page view and engagement metrics
- **Event Streaming**: Live event tracking and analysis

#### 4. Advanced Analytics Dashboard (`src/components/analytics/AdvancedAnalyticsDashboard.tsx`)
- **Multi-Tab Interface**: Real-time metrics, cohort analysis, and A/B testing
- **Interactive Charts**: Visual representation of analytics data
- **Real-Time Updates**: Live data updates with WebSocket-like functionality
- **Comprehensive Metrics**: Revenue, conversion, engagement, and retention metrics
- **Actionable Insights**: AI-generated recommendations and insights
- **Export Capabilities**: Data export and reporting features

### Advanced Features Implemented

#### Cohort Analysis Capabilities
- **User Segmentation**: Group users by signup date, behavior, or demographics
- **Retention Analysis**: Track user retention over time periods
- **Engagement Scoring**: Calculate user engagement scores
- **Predictive Analytics**: Identify at-risk users and high-value segments
- **Automated Insights**: Generate actionable recommendations

#### A/B Testing Features
- **Multi-Variant Testing**: Support for A/B/C and multivariate tests
- **Traffic Splitting**: Intelligent traffic allocation algorithms
- **Statistical Rigor**: Proper statistical significance testing
- **Conversion Optimization**: Focus on revenue and conversion metrics
- **Experiment Lifecycle**: Complete experiment management workflow

#### Real-Time Monitoring
- **Live User Activity**: Real-time user behavior tracking
- **Performance Monitoring**: Track system performance and user experience
- **Alert System**: Automated alerts for significant changes
- **Data Visualization**: Real-time charts and graphs
- **Mobile Optimization**: Responsive design for mobile monitoring

### Environment Setup

Add your GA4 Measurement ID to your `.env` file:

```env
# Google Analytics 4
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Tracked Events

#### Authentication Events
- `sign_up_attempt` - When user attempts to sign up
- `sign_up_success` - When user successfully signs up
- `sign_in_attempt` - When user attempts to sign in
- `sign_in_success` - When user successfully signs in

#### Course Events
- `course_enroll` - When user enrolls in a course
- `lesson_start` - When user starts a lesson
- `lesson_complete` - When user completes a lesson
- `course_complete` - When user completes a course

#### Engagement Events
- `cta_click` - When user clicks call-to-action buttons
- `resource_download` - When user downloads course resources
- `scroll_depth` - User scroll progress through pages
- `time_on_page` - Time spent on each page

#### Community Events
- `question_asked` - When user asks a question
- `scientific_update_read` - When user reads scientific updates

#### Payment Events
- `payment_initiated` - When payment process starts
- `payment_completed` - When payment is successful

### User Properties Tracked

- `user_id` - Unique user identifier
- `user_type` - 'student' or 'admin'
- `signup_source` - 'email', 'google', or 'facebook'
- `course_enrolled` - Current course ID
- `enrollment_status` - 'pending', 'active', or 'completed'
- `cohort_id` - Current cohort ID

### Testing

Use the `AnalyticsTest` component to verify tracking is working:

```tsx
import { AnalyticsTest } from './components/analytics/AnalyticsTest';

// Add to any page for testing
<AnalyticsTest />
```

### Google Analytics Setup

1. **Create GA4 Property**:
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new GA4 property
   - Get your Measurement ID (format: G-XXXXXXXXXX)

2. **Configure Goals**:
   - Set up conversion goals for:
     - Course enrollments
     - Course completions
     - User registrations
     - Payment completions

3. **Create Custom Reports**:
   - User engagement by course
   - Conversion funnel analysis
   - Revenue tracking
   - Community engagement metrics

### Next Steps (Phase 4 - Future Enhancements)

1. **Predictive Analytics**:
   - Machine learning models for user behavior prediction
   - Churn prediction and prevention
   - Lifetime value forecasting
   - Personalized content recommendations

2. **Advanced Attribution**:
   - Multi-touch attribution modeling
   - Cross-device tracking
   - Marketing channel optimization
   - ROI analysis by channel

3. **Automated Optimization**:
   - AI-powered A/B test suggestions
   - Automated experiment creation
   - Dynamic content optimization
   - Personalized user experiences

4. **Enterprise Features**:
   - Advanced data export and APIs
   - Custom dashboard creation
   - Team collaboration tools
   - Advanced security and compliance

### Troubleshooting

#### Analytics Not Working
1. Check that `REACT_APP_GA_MEASUREMENT_ID` is set in `.env`
2. Verify GA4 property is properly configured
3. Check browser console for errors
4. Use browser dev tools to verify gtag calls

#### Events Not Appearing
1. Check GA4 Real-time reports
2. Verify event parameters are correct
3. Check for ad blockers or privacy extensions
4. Ensure proper user consent is given

#### Performance Issues
1. Analytics script loads asynchronously
2. Events are batched for performance
3. User properties update only when needed
4. Scroll tracking is throttled

### Privacy & Compliance

- **GDPR Compliance**: User consent required for tracking
- **Data Retention**: Configure appropriate data retention periods
- **User Opt-out**: Provide mechanism for users to opt out
- **Data Anonymization**: Consider anonymizing sensitive data

### Support

For analytics questions or issues:
1. Check Google Analytics documentation
2. Review browser console for errors
3. Test with AnalyticsTest component
4. Verify environment variables are set correctly 