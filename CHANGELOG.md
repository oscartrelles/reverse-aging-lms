# Changelog

All notable changes to the Reverse Aging Challenge LMS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-20

### 🚀 Major Features Added

#### Cohort-Based Pricing System
- **Migrated from course-level to cohort-level pricing** for maximum flexibility
- **Individual cohort pricing** with base price, special offers, and early bird discounts
- **Comprehensive coupon system** with:
  - Usage limits and current usage tracking
  - Expiration dates with time validation
  - Minimum purchase amounts
  - Percentage and fixed-amount discounts
- **Dynamic pricing display** showing all applicable discounts with clear breakdown
- **Cohort selection during enrollment** with real-time price updates
- **Admin interface** for managing cohort pricing and coupons

#### Enhanced SEO & Social Media
- **Dynamic meta tags** for social media sharing (Open Graph, Twitter Cards, LinkedIn)
- **Structured data (JSON-LD)** for search engines (Organization, Course, Article schemas)
- **Social sharing component** with platform-specific optimization
- **Dynamic sitemap generation** for improved search engine crawling
- **Firebase Cloud Functions** for serving dynamic content to social media crawlers
- **Social media analytics** tracking for shares and clicks

#### Scientific Evidence Enhancements
- **Voting system** with upvote/downvote functionality
- **Real-time vote updates** without page refresh
- **Vote toggle capability** (ability to un-upvote)
- **Publication date display** on evidence cards
- **Social sharing** for individual evidence items

### 🔧 Technical Improvements

#### Payment System
- **Enhanced payment form** with cohort-aware pricing
- **URL parameter support** for cohort pre-selection from course page
- **Improved pricing breakdown** with clear discount explanations
- **Stripe integration** updated for cohort-based transactions

#### Admin Interface
- **Cohort Editor** with comprehensive pricing and coupon management
- **Course Editor** simplified (pricing moved to cohorts)
- **Migration panel** for cohort pricing transition (now removed)
- **Enhanced course management** with cohort-aware displays

#### Authentication & Security
- **Redirect-based authentication** (no popups) for better UX
- **Enhanced security** with proper Firebase Auth configuration
- **Environment-aware** configuration for staging and production

### 🐛 Bug Fixes
- **Fixed cohort selection** persistence from course page to payment page
- **Resolved timestamp handling** for Firestore data serialization
- **Fixed pricing calculations** with proper discount stacking
- **Improved error handling** for payment and authentication flows

### 🗑️ Removed
- **Course-level pricing fields** (price, specialOffer, isFree) from Course interface
- **Migration scripts and panels** after successful cohort pricing migration
- **Legacy pricing references** throughout the codebase

### 📚 Documentation
- **Updated README.md** with new features and architecture
- **Enhanced course features backlog** with completed items
- **Improved project structure** documentation
- **Added environment variables** for new integrations

### 🔄 Data Migration
- **Completed migration** from course pricing to cohort pricing
- **Preserved existing enrollments** and user data
- **Updated database schemas** for new cohort structure

## [1.x.x] - Previous Versions

### Core LMS Features
- User authentication with multiple providers
- Course and lesson management
- Video learning with YouTube integration
- Progress tracking and analytics
- Admin dashboard and user management
- Payment processing with Stripe
- Email integration with MailerSend

---

## Migration Notes

### From v1.x to v2.0.0

**Breaking Changes:**
- Course pricing is now managed at the cohort level
- Payment flows require cohort selection
- Admin interfaces updated for cohort management

**Data Migration:**
- Existing course pricing automatically migrated to cohort pricing
- No action required for existing enrollments
- Admin users should review cohort pricing settings

**New Environment Variables:**
```env
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_MAILERSEND_API_KEY=your_mailersend_api_key
```

## Deployment History

- **Production**: 2024-12-20 - v2.0.0 deployment
- **Staging**: 2024-12-19 - v2.0.0 testing and validation
- **Development**: 2024-12-15 to 2024-12-19 - Feature development and testing
