# Deployment Guide

This guide covers deployment procedures for the Reverse Aging Challenge LMS, especially for the major v2.0.0 update with cohort-based pricing.

## 🚀 Quick Deployment Checklist

### Pre-Deployment Verification

- [ ] **Environment Variables**: All required environment variables are set
- [ ] **Firebase Functions**: Cloud Functions built and ready for deployment
- [ ] **Database Migrations**: Cohort pricing migration completed (if upgrading from v1.x)
- [ ] **Tests**: All critical functionality tested on staging
- [ ] **Build**: Production build completes without errors

### Environment Variables Required

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

# YouTube API
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key

# Google Analytics
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# MailerSend
REACT_APP_MAILERSEND_API_KEY=your_mailersend_api_key
```

## 📋 Deployment Steps

### 1. Build the Application

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build completed successfully
ls -la build/
```

### 2. Deploy Firebase Functions

```bash
# Navigate to functions directory
cd functions

# Install function dependencies
npm install

# Build TypeScript functions
npm run build

# Deploy functions
firebase deploy --only functions

# Return to root
cd ..
```

### 3. Deploy to Firebase Hosting

```bash
# Deploy hosting
firebase deploy --only hosting

# Or deploy everything at once
firebase deploy
```

### 4. Verify Deployment

- [ ] **Homepage loads** correctly
- [ ] **Authentication** works (login/signup)
- [ ] **Course page** displays cohorts with pricing
- [ ] **Payment flow** works with cohort selection
- [ ] **Admin dashboard** accessible and functional
- [ ] **Social media sharing** generates correct meta tags

## 🔄 Migration from v1.x to v2.0.0

### Database Schema Changes

The migration from course-level to cohort-level pricing requires updating existing data:

1. **Cohort Pricing Structure**:
   ```typescript
   interface CohortPricing {
     basePrice: number;
     currency: string;
     specialOffer?: number;
     isFree: boolean;
     tier: 'basic' | 'premium' | 'vip';
     earlyBirdDiscount?: {
       amount: number;
       type: 'percentage' | 'fixed';
       validUntil: Timestamp;
     };
   }
   ```

2. **Coupon System**:
   ```typescript
   interface CohortCoupon {
     code: string;
     type: 'percentage' | 'fixed';
     value: number;
     validFrom: Timestamp;
     validUntil: Timestamp;
     maxUses: number;
     currentUses: number;
     isActive: boolean;
     description?: string;
     minAmount?: number;
   }
   ```

### Migration Steps (if needed)

**Note**: The migration has already been completed for this deployment.

1. **Backup existing data** before migration
2. **Run migration script** to transfer course pricing to cohorts
3. **Verify data integrity** after migration
4. **Update admin users** on new cohort management interface

## 🔧 Staging Environment

### Firebase Hosting Targets

- **Production**: `https://7weekreverseagingchallenge.com`
- **Staging**: `https://the-reverse-aging-challenge.web.app`

### Deploy to Staging

```bash
# Deploy to staging target
firebase deploy --only hosting:staging

# Or deploy functions to staging
firebase deploy --only functions --project staging
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**:
   - Check TypeScript compilation errors
   - Verify all dependencies are installed
   - Ensure environment variables are set

2. **Function Deployment Issues**:
   - Verify Node.js version compatibility
   - Check Firebase Functions billing is enabled
   - Ensure TypeScript compilation succeeds

3. **Hosting Issues**:
   - Verify `firebase.json` configuration
   - Check hosting rewrite rules for dynamic meta tags
   - Ensure build directory is correct

### Rollback Procedure

If issues arise after deployment:

```bash
# Rollback hosting
firebase hosting:channel:deploy rollback

# Rollback functions (deploy previous version)
firebase deploy --only functions

# Check deployment history
firebase projects:list
```

## 📊 Post-Deployment Monitoring

### Key Metrics to Monitor

- [ ] **Page Load Times**: Verify performance hasn't degraded
- [ ] **Authentication Success Rate**: Monitor login/signup flows
- [ ] **Payment Conversion**: Track cohort selection and payments
- [ ] **Error Rates**: Monitor for JavaScript errors
- [ ] **Social Media Shares**: Verify meta tags are working

### Monitoring Tools

- **Firebase Analytics**: User engagement and page views
- **Google Analytics**: Detailed user behavior
- **Stripe Dashboard**: Payment processing metrics
- **Firebase Console**: Error monitoring and performance

## 🔒 Security Verification

### Post-Deployment Security Checks

- [ ] **Firestore Rules**: Verify security rules are active
- [ ] **Authentication**: Test all sign-in methods
- [ ] **Admin Access**: Verify admin-only routes are protected
- [ ] **Payment Security**: Confirm Stripe integration is secure
- [ ] **Environment Variables**: Sensitive data not exposed

## 📞 Support & Emergency Contacts

### Critical Issues

For immediate deployment issues:
- Monitor Firebase Console for errors
- Check Stripe Dashboard for payment issues
- Review Google Analytics for traffic drops

### Rollback Criteria

Rollback deployment if:
- Critical functionality is broken
- Payment processing fails
- Security vulnerabilities discovered
- Site performance significantly degraded

---

**Last Updated**: December 2024
**Version**: 2.0.0
**Deployment Environment**: Production Ready
