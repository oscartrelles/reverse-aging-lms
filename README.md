# The Reverse Aging Challenge LMS

A modern Learning Management System (LMS) built for "The Reverse Aging Challenge" - a 7-week online course focused on health and wellness transformation.

## 🚀 Features

### For Students
- **User Authentication** - Email, Google, and Facebook sign-in
- **Course Dashboard** - Progress tracking and lesson management
- **Video Learning** - YouTube integration with progress tracking
- **Resource Access** - PDF downloads and course materials
- **Community Features** - Q&A system and student interactions
- **Mobile Responsive** - Optimized for all devices
- **Progress Psychology** - Gamification and engagement features

### For Administrators
- **Course Management** - Create and manage lessons
- **Student Management** - Track enrollments and progress
- **Content Upload** - Manage videos and resources
- **Analytics** - Student engagement and completion metrics

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI)
- **Authentication**: Firebase Auth
- **Database**: Firestore (NoSQL)
- **Hosting**: Firebase Hosting
- **Payments**: Stripe
- **Video**: YouTube API
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
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   └── layout/         # Layout components (Header, Footer)
├── contexts/           # React contexts (Auth, Course)
├── pages/              # Page components
│   └── admin/          # Admin pages
├── types/              # TypeScript type definitions
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

### Weekly Cadence
- **Automatic lesson releases** at 8am local time
- **Progress tracking** with visual indicators
- **Streak tracking** for engagement
- **Countdown timers** for next lesson

### Community Features
- **Q&A system** for student questions
- **Community stats** showing active students
- **Discussion boards** for peer learning
- **Social proof** elements

### Content Management
- **Video lessons** with YouTube integration
- **PDF resources** for download
- **Workbook access** at course level
- **Additional content** (Q&A recordings, etc.)

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

**Built with ❤️ for transforming lives through education**
