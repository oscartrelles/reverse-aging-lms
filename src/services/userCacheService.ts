import { doc, getDoc, setDoc, updateDoc, Timestamp, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CachedUserProgress, UserProfileCache } from '../types';

export interface CacheUpdateOptions {
  forceRefresh?: boolean;
  updateProgress?: boolean;
  updateEnrollment?: boolean;
  updateLessonAvailability?: boolean;
  updateCommunityStats?: boolean;
}

class UserCacheService {
  private cache: Map<string, UserProfileCache> = new Map();
  private updatePromises: Map<string, Promise<void>> = new Map();

  // Get cached data with fallback to calculation
  async getCachedProgress(userId: string, options: CacheUpdateOptions = {}): Promise<CachedUserProgress> {
    const cacheKey = `progress_${userId}`;
    
    // Check if we have a recent cache
    const cached = this.cache.get(cacheKey);
    const now = new Date();
    const cacheAge = cached?.progress.lastCalculated?.toDate() 
      ? now.getTime() - cached.progress.lastCalculated.toDate().getTime() 
      : Infinity;
    
    // Use cache if it's less than 1 hour old and not forcing refresh
    if (cached && cacheAge < 60 * 60 * 1000 && !options.forceRefresh) {
      return cached.progress;
    }

    // Check if there's already an update in progress
    if (this.updatePromises.has(cacheKey)) {
      await this.updatePromises.get(cacheKey);
      return this.cache.get(cacheKey)?.progress!;
    }

    // Calculate and cache new data
    const updatePromise = this.calculateAndCacheProgress(userId);
    this.updatePromises.set(cacheKey, updatePromise);
    
    try {
      await updatePromise;
      return this.cache.get(cacheKey)?.progress!;
    } finally {
      this.updatePromises.delete(cacheKey);
    }
  }

  // Calculate progress and store in cache
  private async calculateAndCacheProgress(userId: string): Promise<void> {
    try {
      // Get user's enrollments
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      const enrollmentDocs = await getDocs(enrollmentsQuery);
      const activeEnrollment = enrollmentDocs.docs[0];

      // Get all cohorts for context
      const cohortsQuery = query(collection(db, 'cohorts'));
      const cohortDocs = await getDocs(cohortsQuery);

      // Get user's lesson progress
      const progressQuery = query(
        collection(db, 'lessonProgress'),
        where('userId', '==', userId)
      );
      const progressDocs = await getDocs(progressQuery);

      // Get all lessons for context
      const lessonsQuery = query(collection(db, 'lessons'));
      const lessonsDocs = await getDocs(lessonsQuery);

      // Calculate metrics
      const completedLessons = progressDocs.docs.filter(doc => doc.data().isCompleted);
      const completedCourses = enrollmentDocs.docs.filter(doc => doc.data().status === 'completed');
      
      let totalLessons = 0;
      let availableLessons = 0;
      let cohortComparison: CachedUserProgress['cohortComparison'] = undefined;
      
      if (activeEnrollment) {
        const enrollmentDoc = activeEnrollment;
        const courseId = enrollmentDoc.data().courseId;
        const cohortId = enrollmentDoc.data().cohortId;
        
        // Get course lessons
        const lessonsQuery = query(
          collection(db, 'lessons'),
          where('courseId', '==', courseId),
          orderBy('order')
        );
        const courseLessons = await getDocs(lessonsQuery);
        totalLessons = courseLessons.docs.length;
        
        const cohortDoc = cohortDocs.docs.find(doc => doc.id === cohortId);
        if (cohortDoc) {
          const cohortData = cohortDoc.data();
          const cohortStartDate = cohortData.startDate.toDate();
          const now = new Date();
          
          const weeksSinceStart = Math.floor((now.getTime() - cohortStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          availableLessons = Math.max(0, Math.min(weeksSinceStart + 1, totalLessons));
          
          // Calculate cohort comparison
          if (availableLessons > 0) {
            const userCompletionRate = (completedLessons.length / availableLessons) * 100;
            const cohortAverageRate = 60; // Baseline
            const percentageDifference = userCompletionRate - cohortAverageRate;
            
            cohortComparison = {
              isAhead: percentageDifference > 10,
              isBehind: percentageDifference < -10,
              percentageDifference: Math.abs(percentageDifference),
              lastCalculated: Timestamp.now(),
            };
          }
        }
      }

      // Calculate streak
      const lastCompleted = completedLessons
        .map(doc => doc.data().completedAt?.toDate())
        .filter(date => date)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      
      const currentStreak = lastCompleted ? 
        Math.floor((Date.now() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      // Calculate watch time
      const totalWatchTime = progressDocs.docs.reduce((total, doc) => {
        const data = doc.data();
        return total + (data.watchedPercentage || 0);
      }, 0);

      // Get recent achievements
      const achievementsQuery = query(
        collection(db, 'userAchievements'),
        where('userId', '==', userId)
      );
      const achievementsDocs = await getDocs(achievementsQuery);
      const recentAchievements = achievementsDocs.docs
        .map(doc => doc.data().title)
        .slice(-5); // Last 5 achievements

      const cachedProgress: CachedUserProgress = {
        coursesCompleted: completedCourses.length,
        lessonsCompleted: completedLessons.length,
        totalLessons,
        availableLessons,
        currentStreak: Math.min(currentStreak, 30),
        longestStreak: Math.min(currentStreak, 30), // TODO: Track actual longest streak
        lastActivityDate: lastCompleted ? Timestamp.fromDate(lastCompleted) : Timestamp.now(),
        cohortComparison,
        totalWatchTime: Math.round(totalWatchTime / 60),
        achievementCount: achievementsDocs.docs.length,
        recentAchievements,
        lastCalculated: Timestamp.now(),
        version: 1,
      };

      // Store in memory cache
      const cacheKey = `progress_${userId}`;
      const existingCache = this.cache.get(cacheKey);
      this.cache.set(cacheKey, {
        progress: cachedProgress,
        activeEnrollment: existingCache?.activeEnrollment,
        lessonAvailability: existingCache?.lessonAvailability,
        communityStats: existingCache?.communityStats,
      });

      // Store in Firestore for persistence
      await this.persistCacheToFirestore(userId, cachedProgress);
    } catch (error) {
      console.error('Error calculating progress cache:', error);
      throw error;
    }
  }

  // Persist cache to Firestore
  private async persistCacheToFirestore(userId: string, progress: CachedUserProgress): Promise<void> {
    try {
      // Filter out undefined values to prevent Firestore errors
      const cleanProgress = Object.fromEntries(
        Object.entries(progress).filter(([_, value]) => value !== undefined)
      ) as CachedUserProgress;
      
      const userProfileRef = doc(db, 'userProfiles', userId);
      await updateDoc(userProfileRef, {
        cachedProgress: cleanProgress,
        lastCacheUpdate: Timestamp.now(),
      });
    } catch (error) {
      console.warn('⚠️ Could not persist cache to Firestore:', error);
      // Don't throw - cache is still available in memory
    }
  }

  // Invalidate cache when data changes
  async invalidateCache(userId: string, reason: string): Promise<void> {
    this.cache.delete(`progress_${userId}`);
  }

  // Update specific parts of the cache
  async updateProgressOnLessonComplete(userId: string, lessonId: string): Promise<void> {
    await this.invalidateCache(userId, 'lesson completed');
  }

  async updateProgressOnEnrollmentChange(userId: string): Promise<void> {
    await this.invalidateCache(userId, 'enrollment changed');
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Clear all cache (useful for testing)
  clearCache(): void {
    this.cache.clear();
    this.updatePromises.clear();
  }
}

export const userCacheService = new UserCacheService(); 