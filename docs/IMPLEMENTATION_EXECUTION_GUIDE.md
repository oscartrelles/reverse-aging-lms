# 🚀 Implementation Execution Guide

## Quick Reference

This guide provides step-by-step instructions for executing the domain migration and information architecture restructuring plan. Use this as your checklist during implementation.

---

## 📋 Pre-Implementation Checklist

### **Domain & Infrastructure**
- [ ] `reverseaging.academy` domain acquired
- [ ] DNS records configured
- [ ] SSL certificates ready
- [ ] Staging environment set up (`staging.reverseaging.academy`)
- [ ] Backup of current production environment

### **Development Environment**
- [ ] Local development environment working
- [ ] All tests passing
- [ ] Dependencies up to date
- [ ] Git branch created for migration (`feature/domain-migration`)

---

## 🔧 Phase 1: Technical Configuration

### **Step 1.1: Firebase Configuration**

**File to edit:** `src/firebaseConfig.ts`

**Changes needed:**
```typescript
// Update environment detection
const hostname = window.location.hostname;
const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
const isProduction = hostname === 'reverseaging.academy';
const isStaging = hostname === 'staging.reverseaging.academy';
const isLegacyProduction = hostname === 'academy.7weekreverseagingchallenge.com' || 
                          hostname === 'reverse-aging-academy.web.app';

// Update authDomain configuration
authDomain: isDevelopment 
  ? 'the-reverse-aging-challenge.web.app'
  : isProduction 
    ? 'reverseaging.academy'
    : isStaging
      ? 'staging.reverseaging.academy'
      : 'the-reverse-aging-challenge.web.app'
```

**Validation:**
- [ ] Local development still works
- [ ] Console shows correct environment detection
- [ ] No console errors

### **Step 1.2: Analytics Configuration**

**File to edit:** `src/services/analyticsService.ts`

**Changes needed:**
```typescript
// Update production domain detection
const isProduction = window.location.hostname === 'reverseaging.academy' || 
                    window.location.hostname === 'academy.7weekreverseagingchallenge.com' || 
                    window.location.hostname === 'reverse-aging-academy.web.app';
```

**Validation:**
- [ ] Analytics tracking works on new domain
- [ ] Legacy domains still track during transition

### **Step 1.3: Environment Variables**

**Files to update:** `.env`, `.env.local`, `.env.production`

**Add new variables:**
```env
REACT_APP_NEW_DOMAIN=reverseaging.academy
REACT_APP_LEGACY_DOMAINS=academy.7weekreverseagingchallenge.com,reverse-aging-academy.web.app
```

---

## 🏗️ Phase 2: Route Restructuring

### **Step 2.1: Create Student Hub Component**

**New file:** `src/pages/StudentHub.tsx`

**Component structure:**
```typescript
import React from 'react';
import { Container, Box, Typography, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useCourse } from '../contexts/CourseContext';

// Import sub-components
import ProgressOverview from '../components/student/ProgressOverview';
import CohortStatus from '../components/student/CohortStatus';
import QuickActions from '../components/student/QuickActions';
import CommunityFeed from '../components/student/CommunityFeed';

const StudentHub: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentEnrollment, lessonProgress } = useCourse();

  // Component implementation
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Welcome header */}
        <Typography variant="h4" gutterBottom>
          Welcome back, {currentUser?.name}!
        </Typography>
        
        {/* Main content grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <ProgressOverview />
            <CohortStatus />
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickActions />
            <CommunityFeed />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default StudentHub;
```

**Validation:**
- [ ] Component renders without errors
- [ ] Shows appropriate content for enrolled users
- [ ] Responsive design works on mobile

### **Step 2.2: Update App.tsx Routes**

**File to edit:** `src/App.tsx`

**Add new route:**
```typescript
// Import new component
import StudentHub from './pages/StudentHub';

// Add route in the Routes section
<Route path="/student" element={
  <PrivateRoute>
    <StudentHub />
  </PrivateRoute>
} />
```

**Update existing routes:**
```typescript
// Update lesson route to include course context
<Route path="/course/:courseId/lesson/:lessonId" element={
  <PrivateRoute>
    <LessonPage />
  </PrivateRoute>
} />
```

**Validation:**
- [ ] New `/student` route works
- [ ] Existing routes still function
- [ ] Navigation between routes works

### **Step 2.3: Create Student Components**

**New directory:** `src/components/student/`

**Components to create:**

1. **ProgressOverview.tsx**
```typescript
import React from 'react';
import { Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { useCourse } from '../../contexts/CourseContext';

const ProgressOverview: React.FC = () => {
  const { lessonProgress, courses } = useCourse();
  
  // Calculate progress percentage
  // Render progress card
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Progress
        </Typography>
        <LinearProgress variant="determinate" value={progressPercentage} />
        {/* Additional progress details */}
      </CardContent>
    </Card>
  );
};

export default ProgressOverview;
```

2. **CohortStatus.tsx**
3. **QuickActions.tsx**
4. **CommunityFeed.tsx**

**Validation:**
- [ ] All components render correctly
- [ ] Data displays appropriately
- [ ] Interactive elements work

---

## 🎨 Phase 3: Content Migration

### **Step 3.1: Update Landing Page**

**File to edit:** `src/pages/LandingPage.tsx`

**Content to move from Dashboard:**
- Hero video section
- Mission statement
- Program overview cards
- Evidence preview
- Testimonials
- FAQ section

**Structure to implement:**
```typescript
const LandingPage: React.FC = () => {
  return (
    <Box>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Programs Overview */}
      <ProgramsOverview />
      
      {/* Evidence Preview */}
      <EvidencePreview />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* FAQ */}
      <FAQ />
    </Box>
  );
};
```

**Validation:**
- [ ] All content displays correctly
- [ ] Call-to-action buttons work
- [ ] Mobile responsive design
- [ ] Loading performance acceptable

### **Step 3.2: Update Dashboard for Students Only**

**File to edit:** `src/pages/Dashboard.tsx`

**Changes needed:**
1. Remove marketing content
2. Add redirect logic for unenrolled users
3. Focus on student-specific features

```typescript
const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentEnrollment } = useCourse();
  
  // Redirect unenrolled users to landing
  if (!currentEnrollment) {
    return <Navigate to="/" replace />;
  }
  
  // Redirect enrolled users to new student hub
  return <Navigate to="/student" replace />;
};
```

**Validation:**
- [ ] Unenrolled users redirect to landing
- [ ] Enrolled users redirect to student hub
- [ ] No broken links or errors

### **Step 3.3: Enhance Evidence Page**

**File to edit:** `src/pages/EvidencePage.tsx`

**Enhancements for public access:**
1. Featured studies section
2. Category navigation
3. Search functionality
4. Newsletter signup CTA

**Validation:**
- [ ] Public access works without authentication
- [ ] Enhanced features function correctly
- [ ] Performance remains good

---

## 🧭 Phase 4: Navigation Updates

### **Step 4.1: Update Header Component**

**File to edit:** `src/components/layout/Header.tsx`

**Role-based navigation implementation:**
```typescript
const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentEnrollment } = useCourse();
  
  // Determine navigation items based on user role
  const getNavigationItems = () => {
    if (!currentUser) {
      return [
        { label: 'Programs', path: '/programs' },
        { label: 'Evidence', path: '/evidence' },
        { label: 'About', path: '/about' }
      ];
    }
    
    if (currentEnrollment) {
      return [
        { label: 'My Progress', path: '/student' },
        { label: 'Evidence', path: '/evidence' },
        { label: 'Community', path: '/student/community' }
      ];
    }
    
    // Default for authenticated but not enrolled
    return [
      { label: 'Programs', path: '/programs' },
      { label: 'Evidence', path: '/evidence' }
    ];
  };
  
  // Render navigation based on user type
};
```

**Validation:**
- [ ] Different navigation for each user type
- [ ] Active states work correctly
- [ ] Mobile navigation functions properly

### **Step 4.2: Create Breadcrumb Component**

**New file:** `src/components/navigation/Breadcrumbs.tsx`

**Implementation:**
```typescript
import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  
  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = (pathname: string) => {
    // Implementation logic
  };
  
  return (
    <MuiBreadcrumbs>
      {/* Render breadcrumb items */}
    </MuiBreadcrumbs>
  );
};
```

**Add to relevant pages:**
- Course pages
- Lesson pages
- Admin pages
- Student hub

**Validation:**
- [ ] Breadcrumbs show correct path
- [ ] Links navigate properly
- [ ] Styling matches design system

---

## 🔍 Phase 5: SEO & Meta Updates

### **Step 5.1: Update SEO Hook**

**File to edit:** `src/hooks/useSEO.ts`

**Domain updates:**
```typescript
const useSEO = (seoData: SEOData) => {
  const canonicalUrl = `https://reverseaging.academy${seoData.canonicalPath}`;
  
  // Update meta tags
  useEffect(() => {
    // Update canonical URL
    // Update Open Graph URLs
    // Update Twitter card URLs
  }, [seoData]);
};
```

**Validation:**
- [ ] Canonical URLs use new domain
- [ ] Social sharing uses correct URLs
- [ ] Meta tags render properly

### **Step 5.2: Update Structured Data**

**File to edit:** `src/services/seoService.ts`

**Organization schema updates:**
```typescript
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Reverse Aging Academy",
  "url": "https://reverseaging.academy",
  "sameAs": [
    "https://instagram.com/reverseagingacademy",
    "https://youtube.com/@reverseagingacademy"
  ]
};
```

**Validation:**
- [ ] Structured data validates in testing tools
- [ ] Organization information is correct
- [ ] Course schema includes new domain

---

## 📧 Phase 6: Communication Updates

### **Step 6.1: Update Email Templates**

**File to edit:** `src/constants/emailTemplates.ts`

**Domain references to update:**
- Welcome email links
- Password reset URLs
- Course enrollment confirmations
- Footer links

**Validation:**
- [ ] All email links point to new domain
- [ ] Email delivery works correctly
- [ ] Styling remains consistent

### **Step 6.2: Update External References**

**Files to check:**
- Social media profile links
- Google Analytics property
- Firebase Auth providers
- Third-party service callbacks

**Validation:**
- [ ] Social auth works with new domain
- [ ] Analytics tracking functions
- [ ] External integrations work

---

## 🚀 Phase 7: Deployment & Migration

### **Step 7.1: Staging Deployment**

**Steps:**
1. Deploy to staging.reverseaging.academy
2. Run full test suite
3. Manual testing of all user flows
4. Performance testing
5. SEO validation

**Validation checklist:**
- [ ] All pages load correctly
- [ ] User authentication works
- [ ] Payment flow functions
- [ ] Admin features work
- [ ] Mobile experience is good
- [ ] Performance meets targets

### **Step 7.2: Production Deployment**

**Pre-deployment:**
- [ ] Backup current production database
- [ ] Prepare rollback plan
- [ ] Set up monitoring alerts
- [ ] Prepare user communication

**Deployment steps:**
1. Deploy new code to reverseaging.academy
2. Set up 301 redirects from legacy domains
3. Update DNS if needed
4. Monitor error rates and traffic
5. Send user notification emails

**Post-deployment checklist:**
- [ ] All user flows work on production
- [ ] Legacy redirects function
- [ ] Analytics tracking works
- [ ] No increase in error rates
- [ ] User feedback is positive

### **Step 7.3: Legacy Domain Management**

**301 Redirects to implement:**
```
academy.7weekreverseagingchallenge.com/* → reverseaging.academy/*
reverse-aging-academy.web.app/* → reverseaging.academy/*
```

**Monitor for:**
- [ ] Traffic successfully redirecting
- [ ] SEO rankings maintained
- [ ] No broken external links
- [ ] User confusion minimized

---

## 📊 Phase 8: Monitoring & Optimization

### **Metrics to Monitor**

**Technical Metrics:**
- [ ] Page load times < 3 seconds
- [ ] Error rates < 1%
- [ ] Uptime > 99.9%
- [ ] Core Web Vitals pass

**User Experience Metrics:**
- [ ] Navigation efficiency improved
- [ ] Task completion rates
- [ ] User satisfaction scores
- [ ] Mobile usability scores

**Business Metrics:**
- [ ] Conversion rates maintained/improved
- [ ] Course completion rates
- [ ] Community engagement
- [ ] Customer support tickets

### **Optimization Tasks**

**Week 1:**
- [ ] Fix any critical issues
- [ ] Optimize slow-loading pages
- [ ] Address user feedback
- [ ] Monitor SEO rankings

**Week 2:**
- [ ] A/B test landing page variations
- [ ] Optimize conversion funnels
- [ ] Improve mobile experience
- [ ] Enhance search functionality

**Month 1:**
- [ ] Analyze user behavior data
- [ ] Implement feature improvements
- [ ] Optimize for search engines
- [ ] Plan next iteration

---

## 🚨 Rollback Plan

### **Rollback Triggers**
- [ ] Error rate > 5%
- [ ] Page load times > 10 seconds
- [ ] User complaints > normal baseline
- [ ] Critical functionality broken

### **Rollback Process**
1. **Immediate**: Redirect new domain traffic to legacy domain
2. **Database**: Restore from pre-migration backup if needed
3. **Code**: Deploy previous version
4. **Communication**: Notify users of temporary issue
5. **Analysis**: Identify and fix issues before re-attempting

### **Rollback Checklist**
- [ ] Traffic successfully redirected
- [ ] All functionality restored
- [ ] Users notified appropriately
- [ ] Issue analysis completed
- [ ] Fix plan developed

---

## ✅ Final Validation Checklist

### **Pre-Launch**
- [ ] All phases completed successfully
- [ ] Staging testing passed
- [ ] Performance benchmarks met
- [ ] SEO validation completed
- [ ] User testing feedback incorporated

### **Launch Day**
- [ ] Deployment completed without errors
- [ ] All redirects working
- [ ] Monitoring systems active
- [ ] Team standing by for issues
- [ ] Communication sent to users

### **Post-Launch (Week 1)**
- [ ] No critical issues reported
- [ ] Traffic patterns normal
- [ ] User feedback positive
- [ ] SEO rankings stable
- [ ] Performance targets met

### **Success Criteria Met**
- [ ] All user flows working perfectly
- [ ] Performance improved or maintained
- [ ] User satisfaction improved
- [ ] Business metrics stable/improved
- [ ] Technical architecture cleaner

---

This execution guide provides a comprehensive roadmap for implementing the domain migration and information architecture improvements. Follow each phase sequentially, validate thoroughly at each step, and maintain the rollback capability throughout the process.
