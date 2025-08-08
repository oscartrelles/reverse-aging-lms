import { Timestamp } from 'firebase/firestore';

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isAdmin: boolean;
  isModerator?: boolean;
  isDisabled?: boolean;
  isSuspended?: boolean;
  suspensionReason?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  timezone?: string;
  // Social provider tracking
  authProvider?: 'email' | 'google' | 'facebook';
  socialProviderId?: string; // Provider's unique ID for the user
  // Extended profile fields
  firstName?: string;
  lastName?: string;
  bio?: string;
  dateOfBirth?: Timestamp;
  location?: string;
  goals?: string[];
  // Enhanced notification preferences
  notificationPreferences: {
    email: boolean;
    push: boolean;
    reminderTime?: string; // "08:00" for 8am
    weeklyDigest?: boolean;
    scientificUpdates?: boolean;
    communityUpdates?: boolean;
  };
  // Evidence tracking
  lastEvidenceCheck?: Timestamp;
  // Metadata for extensibility
  metadata?: Record<string, any>;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  maxStudents: number;
  duration: number; // weeks
  status: 'draft' | 'active' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Lesson types
export interface Lesson {
  id: string;
  courseId: string;
  weekNumber: number;
  title: string;
  description: string;
  content?: string; // Lesson content (markdown supported)
  videoUrl?: string;
  videoDuration?: number; // in seconds
  duration?: number; // in minutes
  resources: Resource[];
  isPublished: boolean;
  releaseDate?: Timestamp;
  order: number;
  // New fields for dashboard display
  whatYoullMaster?: string[]; // Array of bullet points
  keyPractice?: string; // Single key practice description
  // Additional robust fields
  theme?: string; // Lesson theme/topic
  learningObjectives?: string[]; // Array of learning objectives
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'workbook' | 'link';
  url: string;
  size?: number; // in bytes
}

// Enrollment types
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  cohortId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled'; // Changed from enrollmentStatus to status
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  enrolledAt: Timestamp;
  completedAt?: Timestamp;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  paymentId?: string;
}

// Coupon types
export interface CohortCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  validFrom: Timestamp;
  validUntil: Timestamp;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  description?: string;
  minAmount?: number; // Minimum purchase amount for coupon to apply
}

// Pricing types
export interface CohortPricing {
  basePrice: number;
  currency: string;
  specialOffer?: number; // Special offer price (if greater than 0, use instead of basePrice)
  isFree: boolean;
  tier: 'basic' | 'premium' | 'vip';
  earlyBirdDiscount?: {
    amount: number;
    type: 'percentage' | 'fixed';
    validUntil: Timestamp;
  };
}

// Cohort types
export interface Cohort {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  maxStudents: number;
  currentStudents: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  weeklyReleaseTime?: string; // "08:00" for 8am
  isActive?: boolean;
  enrollmentDeadline?: Timestamp;
  
  // Pricing and coupons
  pricing: CohortPricing;
  coupons: CohortCoupon[];
  
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Progress types
export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  watchedPercentage: number; // 0-100
  completedAt?: Timestamp;
  lastWatchedAt?: Timestamp;
}

// Question types
export interface Question {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  question: string;
  isAnswered: boolean;
  answer?: string;
  answeredAt?: Timestamp;
  createdAt: Timestamp;
  isPublic: boolean; // whether other students can see it
  // Voting functionality
  votes: number;
  votedBy: string[]; // array of user IDs who voted
  // User info for display
  userName?: string;
  userPhotoURL?: string;
  // Admin answer info
  answeredBy?: string; // admin user ID who answered
  answererName?: string; // admin name who answered
}

export interface ScientificUpdate {
  id: string;
  title: string;
  summary: string;
  keyFindings: string[];
  fullReview: string;
  implications: string;
  externalLink?: string | null;
  category: 'Mindset' | 'Nourishment' | 'Breath' | 'Cold' | 'Heat' | 'Movement' | 'Community';
  tags: string[];
  publishedDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Voting functionality (like questions)
  votes: number;
  votedBy: string[]; // array of user IDs who voted
  // Analytics
  readCount: number; // number of unique users who have read this
  shareCount: number; // number of times shared
}

export interface UserReadStatus {
  id: string;
  userId: string;
  updateId: string;
  isRead: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
}

export interface EmailPreferences {
  userId: string;
  weeklyEvidenceUpdates: boolean;
  courseProgress: boolean;
  marketing: boolean;
  updatedAt: Timestamp;
}

// Community types
export interface CommunityStats {
  id: string;
  courseId: string;
  activeStudents: number;
  totalQuestions: number;
  lastActivity: Timestamp;
  updatedAt: Timestamp;
}

// Payment types
export interface Payment {
  id: string;
  userId: string;
  enrollmentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  stripePaymentIntentId: string;
  createdAt: Timestamp;
  paidAt?: Timestamp;
}

// Discount types
export interface DiscountCode {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  maxUses: number;
  currentUses: number;
  validFrom: Timestamp;
  validUntil: Timestamp;
  isActive: boolean;
}

// Lesson Release types
export interface LessonRelease {
  id: string;
  cohortId: string;
  lessonId: string;
  courseId: string;
  weekNumber: number;
  releaseDate: Timestamp;
  isReleased: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CachedUserProgress {
  // Core metrics (updated on lesson completion)
  coursesCompleted: number;
  lessonsCompleted: number;
  totalLessons: number;
  availableLessons: number;

  // Streak data (updated daily)
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Timestamp;

  // Cohort comparison (updated weekly)
  cohortComparison?: {
    isAhead: boolean;
    isBehind: boolean;
    percentageDifference: number;
    lastCalculated: Timestamp;
  };

  // Watch time (updated on lesson progress)
  totalWatchTime: number; // in minutes

  // Achievements (updated when earned)
  achievementCount: number;
  recentAchievements: string[]; // Last 5 achievement titles

  // Metadata
  lastCalculated: Timestamp;
  version: number; // For future schema updates
}

export interface UserProfileCache {
  // Cached progress data
  progress: CachedUserProgress;
  
  // Cached enrollment status
  activeEnrollment?: {
    courseId: string;
    cohortId: string;
    enrolledAt: Timestamp;
  };
  
  // Cached lesson availability
  lessonAvailability?: {
    availableLessons: string[]; // lesson IDs
    nextLessonId?: string;
    lastUpdated: Timestamp;
  };
  
  // Cached community stats
  communityStats?: {
    totalMembers: number;
    activeToday: number;
    lastUpdated: Timestamp;
  };
} 