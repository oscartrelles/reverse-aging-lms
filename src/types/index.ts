import { Timestamp } from 'firebase/firestore';

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt: Timestamp;
  isAdmin: boolean;
  timezone?: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    reminderTime?: string; // "08:00" for 8am
  };
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
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
  videoUrl?: string;
  videoDuration?: number; // in seconds
  resources: Resource[];
  isPublished: boolean;
  releaseDate?: Timestamp;
  order: number;
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
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  enrolledAt: Timestamp;
  completedAt?: Timestamp;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// Cohort types
export interface Cohort {
  id: string;
  courseId: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  maxStudents: number;
  currentStudents: number;
  status: 'upcoming' | 'active' | 'completed';
  weeklyReleaseTime: string; // "08:00" for 8am
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