import { Lesson, Cohort, Enrollment } from '../types';
import { Timestamp } from 'firebase/firestore';
import { 
  detectUserTimezone, 
  isLessonAvailableForStudent, 
  getTimeUntilRelease,
  formatReleaseTime 
} from './timezoneUtils';

// Get user's timezone (default to UTC if not set)
export const getUserTimezone = (timezone?: string): string => {
  return timezone || detectUserTimezone();
};

// Check if a lesson is available for a user based on their cohort
export const isLessonAvailable = (
  lesson: Lesson,
  cohort: Cohort,
  userEnrollment: Enrollment
): boolean => {
  if (!cohort || !userEnrollment) return false;
  
  const now = new Date();
  
  // Calculate weeks since cohort start
  const weeksSinceStart = Math.floor(
    (now.getTime() - cohort.startDate.toDate().getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  
  // Lesson is available if it's within the weeks since start
  return lesson.weekNumber <= weeksSinceStart;
};

// Check if a lesson is available using lessonReleases (primary method)
export const isLessonAvailableWithReleases = async (
  lessonId: string,
  cohortId: string,
  userTimezone?: string
): Promise<boolean> => {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('../firebaseConfig');
    
    // Check lesson release document
    const releaseQuery = query(
      collection(db, 'lessonReleases'),
      where('lessonId', '==', lessonId),
      where('cohortId', '==', cohortId)
    );
    
    const releaseSnapshot = await getDocs(releaseQuery);
    
    if (releaseSnapshot.empty) {
      // No release schedule found, fall back to time-based logic
      return true;
    }
    
    const releaseDoc = releaseSnapshot.docs[0];
    const releaseData = releaseDoc.data();
    
    // Use new timezone-aware logic if user timezone is provided
    if (userTimezone) {
      return isLessonAvailableForStudent({
        releaseDate: releaseData.releaseDate,
        isReleased: releaseData.isReleased
      }, userTimezone);
    }
    
    // Fallback to original logic for backward compatibility
    if (releaseData.isReleased) {
      return true;
    }
    
    const now = new Date();
    const releaseDate = releaseData.releaseDate.toDate();
    
    return now >= releaseDate;
  } catch (error) {
    console.error('Error checking lesson release:', error);
    // Fall back to time-based logic on error
    return true;
  }
};

// Check if a lesson is available based on lesson release schedule
export const isLessonReleased = async (
  lessonId: string,
  cohortId: string
): Promise<boolean> => {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('../firebaseConfig');
    
    // Check lesson release document
    const releaseQuery = query(
      collection(db, 'lessonReleases'),
      where('lessonId', '==', lessonId),
      where('cohortId', '==', cohortId)
    );
    
    const releaseSnapshot = await getDocs(releaseQuery);
    
    if (releaseSnapshot.empty) {
      // No release schedule found, fall back to time-based logic
      return true;
    }
    
    const releaseDoc = releaseSnapshot.docs[0];
    const releaseData = releaseDoc.data();
    
    // Check if lesson is manually released or if release date has passed
    if (releaseData.isReleased) {
      return true;
    }
    
    const now = new Date();
    const releaseDate = releaseData.releaseDate.toDate();
    
    return now >= releaseDate;
  } catch (error) {
    console.error('Error checking lesson release:', error);
    // Fall back to time-based logic on error
    return true;
  }
};

// Get the next lesson release time for a user
export const getNextLessonReleaseTime = (
  cohort: Cohort,
  currentWeek: number,
  userTimezone?: string
): Date => {
  const nextWeekStart = new Date(cohort.startDate.toDate());
  nextWeekStart.setDate(nextWeekStart.getDate() + (currentWeek * 7));
  
  // Set to 8am local time (default) or use cohort's specified time
  const releaseTime = cohort.weeklyReleaseTime || '08:00';
  const [hours, minutes] = releaseTime.split(':').map(Number);
  nextWeekStart.setHours(hours, minutes, 0, 0);
  
  return nextWeekStart;
};

// Get lesson release information with timezone support
export const getLessonReleaseInfo = async (
  lessonId: string,
  cohortId: string,
  userTimezone?: string
): Promise<{
  isAvailable: boolean;
  timeUntilRelease: string;
  formattedReleaseTime: string;
  releaseDate: Date | null;
}> => {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('../firebaseConfig');
    
    const releaseQuery = query(
      collection(db, 'lessonReleases'),
      where('lessonId', '==', lessonId),
      where('cohortId', '==', cohortId)
    );
    
    const releaseSnapshot = await getDocs(releaseQuery);
    
    if (releaseSnapshot.empty) {
      return {
        isAvailable: true,
        timeUntilRelease: 'Available now',
        formattedReleaseTime: 'Available now',
        releaseDate: null
      };
    }
    
    const releaseDoc = releaseSnapshot.docs[0];
    const releaseData = releaseDoc.data();
    
    if (userTimezone) {
      const typedReleaseData = {
        releaseDate: releaseData.releaseDate,
        isReleased: releaseData.isReleased
      };
      
      return {
        isAvailable: isLessonAvailableForStudent(typedReleaseData, userTimezone),
        timeUntilRelease: getTimeUntilRelease(typedReleaseData, userTimezone),
        formattedReleaseTime: formatReleaseTime(typedReleaseData, userTimezone),
        releaseDate: releaseData.releaseDate.toDate()
      };
    }
    
    // Fallback for users without timezone
    const isAvailable = releaseData.isReleased || new Date() >= releaseData.releaseDate.toDate();
    
    return {
      isAvailable,
      timeUntilRelease: isAvailable ? 'Available now' : 'Coming soon',
      formattedReleaseTime: isAvailable ? 'Available now' : 'Coming soon',
      releaseDate: releaseData.releaseDate.toDate()
    };
  } catch (error) {
    console.error('Error getting lesson release info:', error);
    return {
      isAvailable: true,
      timeUntilRelease: 'Available now',
      formattedReleaseTime: 'Available now',
      releaseDate: null
    };
  }
};

// Get countdown to next lesson
export const getCountdownToNextLesson = (
  cohort: Cohort,
  currentWeek: number
): { days: number; hours: number; minutes: number } => {
  const nextRelease = getNextLessonReleaseTime(cohort, currentWeek);
  const now = new Date();
  const diff = nextRelease.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes };
};

// Get current week number for a cohort
export const getCurrentWeek = (cohort: Cohort): number => {
  const now = new Date();
  const weeksSinceStart = Math.floor(
    (now.getTime() - cohort.startDate.toDate().getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  
  return Math.max(0, weeksSinceStart);
};

// Filter lessons based on availability
export const getAvailableLessons = (
  lessons: Lesson[],
  cohort: Cohort,
  userEnrollment: Enrollment
): Lesson[] => {
  return lessons.filter(lesson => 
    isLessonAvailable(lesson, cohort, userEnrollment)
  );
};

// Get upcoming lessons (not yet available)
export const getUpcomingLessons = (
  lessons: Lesson[],
  cohort: Cohort,
  userEnrollment: Enrollment
): Lesson[] => {
  return lessons.filter(lesson => 
    !isLessonAvailable(lesson, cohort, userEnrollment)
  );
};

// Check if cohort has started
export const hasCohortStarted = (cohort: Cohort): boolean => {
  const now = new Date();
  return now >= cohort.startDate.toDate();
};

// Check if cohort has ended
export const hasCohortEnded = (cohort: Cohort): boolean => {
  const now = new Date();
  return now >= cohort.endDate.toDate();
};

// Get cohort status
export const getCohortStatus = (cohort: Cohort): 'upcoming' | 'active' | 'completed' => {
  if (hasCohortEnded(cohort)) return 'completed';
  if (hasCohortStarted(cohort)) return 'active';
  return 'upcoming';
};

// Update cohort status in Firestore
export const updateCohortStatus = async (cohort: Cohort) => {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../firebaseConfig');
    
    const newStatus = getCohortStatus(cohort);
    if (newStatus !== cohort.status) {
      const cohortRef = doc(db, 'cohorts', cohort.id);
      await updateDoc(cohortRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });
      console.log(`Cohort ${cohort.name} status updated to: ${newStatus}`);
    }
  } catch (error) {
    console.error('Error updating cohort status:', error);
  }
}; 