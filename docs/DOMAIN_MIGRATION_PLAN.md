# 🌐 Domain Migration & Information Architecture Plan

## Executive Summary

**Migration Goal**: Transition from current domain structure to `reverseaging.academy` while implementing a comprehensive information architecture restructure that separates marketing, learning, and administrative functions.

**Key Benefits**:
- Perfect brand-domain alignment
- Clearer user journeys and reduced cognitive load
- Better SEO positioning with exact-match domain
- Elimination of `/academy` route naming conflict
- Enhanced user experience with role-based navigation

---

## 🎯 Current State Analysis

### **Current Domain Configuration**
```
Production: academy.7weekreverseagingchallenge.com
Legacy: reverse-aging-academy.web.app
Staging: the-reverse-aging-challenge.web.app
Development: localhost
```

### **Current Route Problems**
- `/dashboard` serves 3 different user types (marketing + student + admin content)
- Navigation inconsistency between authenticated/unauthenticated users
- Cognitive overload with mixed content types
- Poor discoverability of key features
- Mobile navigation complexity

### **Current Information Hierarchy Issues**
- Course content mixed with marketing materials
- Evidence library buried in authenticated sections
- Admin features scattered across routes
- No clear progression from marketing to learning

---

## 🏗️ Target Architecture

### **New Domain Structure**
```
Primary: reverseaging.academy
Staging: staging.reverseaging.academy (recommended)
Development: localhost (unchanged)
```

### **Proposed Route Architecture**

#### **🌐 Public Routes (Marketing/Discovery)**
```
reverseaging.academy/               → Landing Page (Pure Marketing)
reverseaging.academy/programs       → Course Offerings & Pricing
reverseaging.academy/evidence       → Public Evidence Library
reverseaging.academy/about          → About Us & Mission
reverseaging.academy/terms          → Terms of Service
reverseaging.academy/privacy        → Privacy Policy
reverseaging.academy/contact        → Contact Form
```

#### **🎓 Student Routes (Authenticated Learning)**
```
reverseaging.academy/student                → Student Hub (Main Dashboard)
reverseaging.academy/student/progress       → Progress Tracking
reverseaging.academy/student/community      → Community Features
reverseaging.academy/student/resources      → Downloads & Materials
reverseaging.academy/course/[id]            → Course Marketing Pages
reverseaging.academy/course/[id]/overview   → Course Content Overview
reverseaging.academy/course/[id]/lesson/[lessonId] → Individual Lessons
reverseaging.academy/profile                → User Profile Management
reverseaging.academy/payment/[courseId]     → Payment Flow
reverseaging.academy/payment-success        → Payment Success
reverseaging.academy/payment-cancelled      → Payment Cancelled
```

#### **🛡️ Admin Routes (Administration)**
```
reverseaging.academy/admin                  → Admin Dashboard
reverseaging.academy/admin/users            → User Management
reverseaging.academy/admin/students         → Student Analytics
reverseaging.academy/admin/courses          → Course Management
reverseaging.academy/admin/qa               → Q&A Management
reverseaging.academy/admin/evidence         → Scientific Updates Admin
reverseaging.academy/admin/analytics        → Analytics Dashboard
```

---

## 📋 Implementation Phases

### **Phase 1: Domain Setup & Configuration**

#### **1.1 Domain Acquisition & DNS**
- [ ] Acquire `reverseaging.academy` domain
- [ ] Set up DNS records pointing to Firebase hosting
- [ ] Configure SSL certificates
- [ ] Set up staging subdomain (`staging.reverseaging.academy`)

#### **1.2 Firebase Configuration Updates**
**File**: `src/firebaseConfig.ts`
```typescript
// Current environment detection needs updating:
const hostname = window.location.hostname;
const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
const isProduction = hostname === 'reverseaging.academy';
const isStaging = hostname === 'staging.reverseaging.academy';
const isLegacyProduction = hostname === 'academy.7weekreverseagingchallenge.com' || 
                          hostname === 'reverse-aging-academy.web.app';

// Update authDomain configuration:
authDomain: isDevelopment 
  ? 'the-reverse-aging-challenge.web.app'
  : isProduction 
    ? 'reverseaging.academy'
    : isStaging
      ? 'staging.reverseaging.academy'
      : 'the-reverse-aging-challenge.web.app'
```

#### **1.3 Analytics Configuration**
**File**: `src/services/analyticsService.ts`
```typescript
// Update production domain detection:
const isProduction = window.location.hostname === 'reverseaging.academy';

// Add new measurement ID for new domain if needed
```

#### **1.4 Environment Variables Update**
```env
# Update .env files with new domain configurations
REACT_APP_DOMAIN=reverseaging.academy
REACT_APP_API_URL=https://reverseaging.academy
```

### **Phase 2: Route Restructuring**

#### **2.1 Create New Route Structure**
**File**: `src/App.tsx`

**Add new routes:**
```typescript
// New student hub route
<Route path="/student" element={
  <PrivateRoute>
    <StudentHub />
  </PrivateRoute>
} />

// Enhanced course routes
<Route path="/course/:courseId/overview" element={
  <PrivateRoute>
    <CourseOverview />
  </PrivateRoute>
} />

// Update lesson route to include course context
<Route path="/course/:courseId/lesson/:lessonId" element={
  <PrivateRoute>
    <LessonPage />
  </PrivateRoute>
} />
```

#### **2.2 Navigation Component Updates**
**File**: `src/components/layout/Header.tsx`

**Role-based navigation patterns:**
```typescript
// Unauthenticated navigation
const publicNavItems = [
  { label: 'Programs', path: '/programs' },
  { label: 'Evidence', path: '/evidence' },
  { label: 'About', path: '/about' }
];

// Student navigation
const studentNavItems = [
  { label: 'My Progress', path: '/student' },
  { label: 'Evidence', path: '/evidence' },
  { label: 'Community', path: '/student/community' }
];

// Admin navigation
const adminNavItems = [
  { label: 'Students', path: '/admin/students' },
  { label: 'Courses', path: '/admin/courses' },
  { label: 'Evidence', path: '/admin/evidence' },
  { label: 'Analytics', path: '/admin/analytics' }
];
```

### **Phase 3: Content Restructuring**

#### **3.1 Landing Page Enhancement**
**File**: `src/pages/LandingPage.tsx`

**Move from current Dashboard:**
- Hero video section
- Mission statement and principles
- Program overview cards
- Evidence preview section
- Testimonials
- FAQ section
- Clear call-to-action flow

#### **3.2 Create Student Hub**
**New File**: `src/pages/StudentHub.tsx`

**Student-focused content:**
- Personal progress overview
- Current cohort status
- Quick access to next lesson
- Community activity feed
- Achievement tracking
- Resource library access

#### **3.3 Enhanced Evidence Page**
**File**: `src/pages/EvidencePage.tsx`

**Public-focused enhancements:**
- Featured studies hero section
- Category-based navigation
- Search and filtering capabilities
- Social sharing features
- Newsletter signup for updates

### **Phase 4: Component Restructuring**

#### **4.1 Create New Components**
```
src/components/student/
├── ProgressOverview.tsx
├── CohortStatus.tsx
├── QuickActions.tsx
├── CommunityFeed.tsx
└── AchievementBadges.tsx

src/components/navigation/
├── PublicNavigation.tsx
├── StudentNavigation.tsx
├── AdminNavigation.tsx
└── Breadcrumbs.tsx

src/components/landing/
├── HeroSection.tsx
├── ProgramsOverview.tsx
├── EvidencePreview.tsx
└── CallToAction.tsx
```

#### **4.2 Navigation Enhancement**
**Breadcrumb Implementation:**
```typescript
// Example breadcrumb paths:
Home > Programs > Course Name
Home > Student > Course > Lesson
Home > Evidence > Category > Study
Home > Admin > Section > Detail
```

### **Phase 5: SEO & Meta Updates**

#### **5.1 Meta Tags Update**
**File**: `src/hooks/useSEO.ts`
```typescript
// Update default domain references
const canonicalUrl = `https://reverseaging.academy${canonicalPath}`;

// Update social media URLs
og:url: https://reverseaging.academy
twitter:domain: reverseaging.academy
```

#### **5.2 Structured Data Updates**
**File**: `src/services/seoService.ts`
```typescript
// Update organization schema
"@type": "EducationalOrganization",
"name": "Reverse Aging Academy",
"url": "https://reverseaging.academy",
"sameAs": [
  "https://instagram.com/reverseagingacademy",
  "https://youtube.com/@reverseagingacademy"
]
```

### **Phase 6: Email & Communication Updates**

#### **6.1 Email Templates**
**Files**: `src/constants/emailTemplates.ts`
- Update all email templates with new domain
- Update footer links and signatures
- Update password reset and verification links

#### **6.2 Notification Updates**
- Update push notification configurations
- Update social media links
- Update external API callbacks

---

## 🔄 Migration Strategy

### **Gradual Migration Approach**

#### **Step 1: Parallel Setup**
1. Set up `reverseaging.academy` alongside existing domains
2. Deploy identical content to new domain
3. Test all functionality on new domain
4. Verify analytics and tracking

#### **Step 2: Route Updates**
1. Implement new route structure
2. Add navigation improvements
3. Create new student hub
4. Test user flows

#### **Step 3: Content Migration**
1. Move marketing content from Dashboard to Landing
2. Enhance Evidence page for public access
3. Update all internal links
4. Implement breadcrumb navigation

#### **Step 4: Legacy Redirects**
1. Set up 301 redirects from old domains
2. Update external references
3. Notify users of domain change
4. Monitor traffic and fix broken links

### **Rollback Plan**
- Keep existing domains active during transition
- Maintain feature flags for new vs old navigation
- Monitor error rates and user feedback
- Quick revert capability if issues arise

---

## 📊 Success Metrics

### **Technical Metrics**
- [ ] All routes resolve correctly on new domain
- [ ] SSL certificates properly configured
- [ ] Analytics tracking functional
- [ ] Email delivery working
- [ ] Social auth working with new domain

### **User Experience Metrics**
- [ ] Reduced clicks to reach key content (target: 40% reduction)
- [ ] Faster time-to-lesson for students (target: 60% improvement)
- [ ] Improved mobile navigation satisfaction
- [ ] Higher course completion rates
- [ ] Better evidence library engagement

### **SEO & Traffic Metrics**
- [ ] Search rankings maintained or improved
- [ ] Social sharing engagement increases
- [ ] Direct traffic to new domain grows
- [ ] Legacy domain traffic properly redirected

---

## 🚨 Risk Mitigation

### **Potential Issues**
1. **SEO Ranking Loss**: Implement proper 301 redirects and maintain content structure
2. **User Confusion**: Clear communication and gradual migration
3. **Technical Issues**: Thorough testing and rollback plan
4. **Social Auth Problems**: Test extensively with new domain

### **Mitigation Strategies**
1. **Comprehensive Testing**: Test all user flows on staging domain
2. **Phased Rollout**: Gradual migration with monitoring
3. **Clear Communication**: Email campaigns and in-app notifications
4. **Monitoring**: Real-time analytics and error tracking

---

## 📋 Implementation Checklist

### **Pre-Migration**
- [ ] Domain acquisition and DNS setup
- [ ] Staging environment configuration
- [ ] Code updates and testing
- [ ] Analytics configuration
- [ ] Email template updates

### **Migration Day**
- [ ] Deploy updated code to new domain
- [ ] Set up 301 redirects
- [ ] Update external references
- [ ] Monitor traffic and errors
- [ ] Send user notification emails

### **Post-Migration**
- [ ] Monitor SEO rankings
- [ ] Track user engagement metrics
- [ ] Fix any broken links
- [ ] Gather user feedback
- [ ] Optimize based on analytics

---

## 📁 Files Requiring Updates

### **Configuration Files**
- `src/firebaseConfig.ts` - Domain detection and auth configuration
- `src/App.tsx` - Route structure updates
- `package.json` - Domain references in scripts
- `public/index.html` - Meta tags and canonical URLs

### **Component Files**
- `src/components/layout/Header.tsx` - Navigation updates
- `src/components/layout/Footer.tsx` - Links and branding
- `src/pages/Dashboard.tsx` - Content restructuring
- `src/pages/LandingPage.tsx` - Enhanced marketing content

### **Service Files**
- `src/services/analyticsService.ts` - Domain detection
- `src/services/seoService.ts` - Meta tags and structured data
- `src/hooks/useSEO.ts` - Canonical URL generation
- `src/constants/emailTemplates.ts` - Email content updates

### **New Files to Create**
- `src/pages/StudentHub.tsx` - New student dashboard
- `src/components/navigation/Breadcrumbs.tsx` - Navigation enhancement
- `src/components/student/` - Student-specific components
- `docs/MIGRATION_EXECUTION_LOG.md` - Track migration progress

---

This comprehensive plan provides a clear roadmap for the domain migration and information architecture restructuring. Each phase builds upon the previous one, ensuring a smooth transition while significantly improving the user experience and technical architecture.
