# The Reverse Aging Challenge LMS

A modern Learning Management System (LMS) built for "The Reverse Aging Challenge" - a 7-week online course focused on health and wellness transformation.

## 🚀 Features

### For Students
- **User Authentication** - Email, Google, and Facebook sign-in with redirect flows
- **Course Dashboard** - Progress tracking and lesson management
- **Video Learning** - YouTube integration with progress tracking
- **Resource Access** - PDF downloads and course materials
- **Community Features** - Q&A system, scientific evidence voting, and student interactions
- **Mobile Responsive** - Optimized for all devices
- **Progress Psychology** - Gamification and engagement features
- **Cohort-Based Learning** - Join specific cohorts with tailored pricing and schedules
- **Flexible Payments** - Support for installments, coupons, and early bird discounts
- **Social Sharing** - Enhanced sharing capabilities for evidence and content

### For Administrators
- **Course Management** - Create and manage lessons with cohort organization
- **Cohort Management** - Flexible pricing, coupons, and early bird discounts per cohort
- **Student Management** - Track enrollments and progress across cohorts
- **Content Upload** - Manage videos and resources
- **Analytics** - Student engagement, completion metrics, and business analytics
- **Scientific Evidence** - Manage and curate scientific updates and research
- **Email Integration** - Automated email campaigns with MailerSend
- **Advanced Permissions** - Role-based access control (admin, moderator, full)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI)
- **Authentication**: Firebase Auth
- **Database**: Firestore (NoSQL)
- **Cloud Functions**: Firebase Functions (TypeScript)
- **Hosting**: Firebase Hosting
- **Payments**: Stripe with cohort-based pricing
- **Email**: MailerSend integration
- **Video**: YouTube API
- **Analytics**: Google Analytics 4
- **SEO**: Dynamic meta tags and structured data
- **Styling**: Emotion (CSS-in-JS)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reverse-aging-lms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456

   # Stripe Configuration
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

   # YouTube API
   REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key

   # Google Analytics
   REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX

   # MailerSend
   REACT_APP_MAILERSEND_API_KEY=your_mailersend_api_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── analytics/      # Analytics and reporting components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Header, Footer)
│   └── payment/        # Payment and checkout components
├── contexts/           # React contexts (Auth, Course, Modal)
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   └── admin/          # Admin pages
├── services/           # Business logic and API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Application constants
├── config/             # Configuration files
├── firebaseConfig.ts   # Firebase configuration
└── App.tsx            # Main application component
```

## 🔧 Firebase Setup

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/)
2. **Enable Authentication** with Email/Password, Google, and Facebook providers
3. **Create Firestore database** in production mode
4. **Set up Firebase Hosting** for deployment
5. **Configure security rules** for Firestore

## 💳 Stripe Integration

1. **Create a Stripe account** at [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Get your publishable key** from the dashboard
3. **Set up webhook endpoints** for payment events
4. **Configure payment methods** (cards, installments)
5. **Set up cohort-based pricing** with flexible discount systems

## 🎥 YouTube Integration

1. **Create a YouTube API key** at [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable YouTube Data API v3**
3. **Upload videos as unlisted** to your YouTube channel
4. **Configure video tracking** for progress monitoring

## 🚀 Deployment

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Environment Variables
Make sure to set up environment variables in your hosting platform:
- Firebase Hosting: Use Firebase Functions for server-side environment variables
- Vercel: Set in the Vercel dashboard
- Netlify: Set in the Netlify dashboard

## 📱 Mobile Optimization

The LMS is fully responsive and optimized for mobile devices:
- **Touch-friendly** interface
- **Mobile video player** with gesture controls
- **Offline capability** for downloaded content
- **Push notifications** for lesson releases

## 🔒 Security Features

- **Authentication** with multiple providers
- **Route protection** for private content
- **Admin-only routes** for course management
- **Content access control** based on enrollment status
- **Secure payment processing** with Stripe

## 🎯 Course Features

### Cohort-Based Learning
- **Flexible cohort scheduling** with custom start/end dates
- **Cohort-specific pricing** with early bird discounts and special offers
- **Coupon system** with usage limits and expiration dates
- **Dynamic pricing display** showing all applicable discounts
- **Cohort selection** during enrollment process

### Weekly Cadence
- **Automatic lesson releases** at 8am local time
- **Progress tracking** with visual indicators
- **Streak tracking** for engagement
- **Countdown timers** for next lesson

### Community Features
- **Q&A system** for student questions
- **Scientific evidence voting** with upvote/downvote functionality
- **Community stats** showing active students
- **Social sharing** with platform-specific optimization
- **Social proof** elements

### Content Management
- **Video lessons** with YouTube integration
- **PDF resources** for download
- **Workbook access** at course level
- **Scientific updates** with evidence-based content
- **Additional content** (Q&A recordings, etc.)

### SEO & Social Media
- **Dynamic meta tags** for social media sharing
- **Structured data** (JSON-LD) for search engines
- **Open Graph** and Twitter Card optimization
- **Dynamic sitemap** generation
- **Social media analytics** tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for "The Reverse Aging Challenge" course.

## 🆘 Support

For support and questions:
- Email: [your-email@domain.com]
- Course website: [https://7weekreverseagingchallenge.com]

---

## 🚧 NEXT SESSION: Domain Migration & Information Architecture Restructuring

### 📋 **Quick Start for Next Implementation Session**

**Objective**: Migrate to `reverseaging.academy` domain and implement comprehensive information architecture improvements.

**Status**: ✅ **Analysis Complete** - Ready for implementation

### 📁 **Documentation Available**

Three comprehensive documents have been created in the `docs/` folder:

1. **`docs/DOMAIN_MIGRATION_PLAN.md`** - Complete migration strategy and technical requirements
2. **`docs/INFORMATION_ARCHITECTURE_ANALYSIS.md`** - Detailed IA analysis and improvement recommendations  
3. **`docs/IMPLEMENTATION_EXECUTION_GUIDE.md`** - Step-by-step execution checklist with code examples

### 🎯 **Key Changes Planned**

#### **Domain Strategy**
- **New Primary Domain**: `reverseaging.academy` (perfect brand alignment)
- **Route Restructuring**: `/student` hub for enrolled users (eliminates `/academy` naming conflict)
- **SEO Benefits**: Exact-match domain + `.academy` TLD authority

#### **Information Architecture Improvements**
- **Landing Page**: Pure marketing hub (move Dashboard marketing content here)
- **Student Hub**: Dedicated learning dashboard at `/student` (enrolled users only)
- **Evidence Library**: Enhanced public access with featured content
- **Role-Based Navigation**: Different UX for public, students, and admins

#### **User Experience Enhancements**
- Clean separation of marketing vs. learning content
- Optimized user journeys with fewer clicks to key content
- Mobile-first responsive design improvements
- Enhanced search and discovery features

### 🚀 **Phase 1 - Start Here**

#### **Prerequisites Checklist**
- [ ] Acquire `reverseaging.academy` domain
- [ ] Set up staging environment (`staging.reverseaging.academy`)
- [ ] Review all three documentation files in `docs/` folder
- [ ] Create feature branch: `git checkout -b feature/domain-migration`

#### **First Implementation Steps**
1. **Read** `docs/IMPLEMENTATION_EXECUTION_GUIDE.md` (start here!)
2. **Begin with Phase 1**: Firebase configuration updates
3. **Follow the step-by-step checklist** in the execution guide
4. **Validate each phase** before proceeding to the next

#### **Key Files to Modify First**
- `src/firebaseConfig.ts` - Environment detection and auth domain
- `src/App.tsx` - New route structure with `/student` hub  
- `src/pages/StudentHub.tsx` - New component to create
- `src/components/layout/Header.tsx` - Role-based navigation

### 📊 **Success Metrics**
- 40% reduction in clicks to reach key content
- 60% improvement in time-to-lesson for students
- Improved mobile navigation satisfaction
- Better course completion rates
- Enhanced evidence library engagement

### ⚠️ **Important Notes**
- **Rollback plan available** in case of issues
- **Gradual migration strategy** to minimize risk
- **User communication plan** included
- **SEO preservation** with proper 301 redirects

### 🔗 **Quick Links**
- **Execution Guide**: `docs/IMPLEMENTATION_EXECUTION_GUIDE.md`
- **Migration Plan**: `docs/DOMAIN_MIGRATION_PLAN.md`  
- **IA Analysis**: `docs/INFORMATION_ARCHITECTURE_ANALYSIS.md`

**Ready to transform the user experience and establish `reverseaging.academy` as the definitive authority! 🚀**

---

**Built with ❤️ for transforming lives through education**
