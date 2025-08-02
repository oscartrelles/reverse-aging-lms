import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LessonProgress } from '../types';

export interface VideoProgress {
  currentTime: number;
  duration: number;
  percentage: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  lastCompletedDate?: Date;
}

export const lessonProgressService = {
  // Update lesson progress
  async updateLessonProgress(
    userId: string,
    lessonId: string,
    courseId: string,
    progress: Partial<LessonProgress>
  ): Promise<void> {
    try {
      const progressRef = doc(db, 'lessonProgress', `${userId}_${lessonId}`);
      const progressData = {
        userId,
        lessonId,
        courseId,
        ...progress,
        updatedAt: Timestamp.now(),
      };

      await setDoc(progressRef, progressData, { merge: true });
      console.log(`✅ Updated progress for lesson ${lessonId}`);
    } catch (error) {
      console.error('❌ Error updating lesson progress:', error);
      throw error;
    }
  },

  // Mark lesson as completed
  async completeLesson(
    userId: string,
    lessonId: string,
    courseId: string,
    watchedPercentage: number = 100
  ): Promise<void> {
    try {
      await this.updateLessonProgress(userId, lessonId, courseId, {
        isCompleted: true,
        watchedPercentage,
        completedAt: Timestamp.now(),
        lastWatchedAt: Timestamp.now(),
      });
      console.log(`✅ Marked lesson ${lessonId} as completed`);
    } catch (error) {
      console.error('❌ Error completing lesson:', error);
      throw error;
    }
  },

  // Update video progress (for tracking during playback)
  async updateVideoProgress(
    userId: string,
    lessonId: string,
    courseId: string,
    videoProgress: VideoProgress
  ): Promise<void> {
    try {
      const isCompleted = videoProgress.percentage >= 90; // Mark as completed if 90%+ watched
      
      const progressData: any = {
        watchedPercentage: videoProgress.percentage,
        lastWatchedAt: Timestamp.now(),
        isCompleted,
      };

      // Only add completedAt if the lesson is actually completed
      if (isCompleted) {
        progressData.completedAt = Timestamp.now();
      }
      
      await this.updateLessonProgress(userId, lessonId, courseId, progressData);
    } catch (error) {
      console.error('❌ Error updating video progress:', error);
      throw error;
    }
  },

  // Get user's streak data
  async getUserStreak(userId: string, courseId: string): Promise<StreakData> {
    try {
      const progressQuery = query(
        collection(db, 'lessonProgress'),
        where('userId', '==', userId),
        where('courseId', '==', courseId),
        where('isCompleted', '==', true)
      );
      
      const snapshot = await getDocs(progressQuery);
      const completedLessons = snapshot.docs.map(doc => ({
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate(),
      }));

      // Sort by completion date
      completedLessons.sort((a, b) => 
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
      );

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastCompletedDate: Date | undefined;

      if (completedLessons.length > 0) {
        lastCompletedDate = completedLessons[completedLessons.length - 1].completedAt;
        
        // Calculate streaks
        for (let i = 0; i < completedLessons.length; i++) {
          const currentDate = completedLessons[i].completedAt;
          
          if (i === 0) {
            tempStreak = 1;
          } else {
            const prevDate = completedLessons[i - 1].completedAt;
            const daysDiff = Math.floor(
              (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (daysDiff <= 7) { // Within a week
              tempStreak++;
            } else {
              tempStreak = 1;
            }
          }
          
          longestStreak = Math.max(longestStreak, tempStreak);
        }
        
        // Calculate current streak (consecutive days from the last completion)
        const today = new Date();
        const lastCompletion = lastCompletedDate;
        if (lastCompletion) {
          const daysSinceLastCompletion = Math.floor(
            (today.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSinceLastCompletion <= 7) {
            currentStreak = tempStreak;
          }
        }
      }

      return {
        currentStreak,
        longestStreak,
        totalCompleted: completedLessons.length,
        lastCompletedDate,
      };
    } catch (error: any) {
      console.error('❌ Error getting user streak:', error);
      
      // If it's an index error, return default values
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        console.log('⚠️ Index not ready yet, returning default streak data');
        return {
          currentStreak: 0,
          longestStreak: 0,
          totalCompleted: 0,
        };
      }
      
      throw error;
    }
  },

  // Get lesson progress for a specific lesson
  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
    try {
      const progressRef = doc(db, 'lessonProgress', `${userId}_${lessonId}`);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        return progressDoc.data() as LessonProgress;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting lesson progress:', error);
      throw error;
    }
  },

  // Get all progress for a user in a course
  async getUserCourseProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
    try {
      const progressQuery = query(
        collection(db, 'lessonProgress'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      
      const snapshot = await getDocs(progressQuery);
      return snapshot.docs.map(doc => doc.data() as LessonProgress);
    } catch (error) {
      console.error('❌ Error getting user course progress:', error);
      throw error;
    }
  },
}; 