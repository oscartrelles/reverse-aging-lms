import { doc, setDoc, collection, query, where, getDocs, orderBy, Timestamp, onSnapshot, limit, startAfter, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Question, LessonProgress, User } from '../types';

export interface CommunityStats {
  // Real-time metrics
  academyUsersOnline: number;
  cohortActiveUsers: number;
  questionsLastWeek: number;
  
  // Gamification metrics
  hotStreak: number; // students who completed lessons today
  communityBuzz: number; // new questions in last 24h
  cohortProgress: number; // average completion percentage
  engagementScore: 'High' | 'Medium' | 'Low';
  weeklyGoals: number; // % of cohort who completed this week's lessons
}

export interface UserActivity {
  userId: string;
  lastSeen: Timestamp;
  isOnline: boolean;
  currentLesson?: string;
}

export const communityService = {
  // Track user online status
  async updateUserStatus(userId: string, isOnline: boolean, currentLesson?: string): Promise<void> {
    try {
      const userActivityRef = doc(db, 'userActivity', userId);
      const updateData: any = {
        userId,
        lastSeen: Timestamp.now(),
        isOnline,
      };
      
      // Only add currentLesson if it's provided and not undefined
      if (currentLesson) {
        updateData.currentLesson = currentLesson;
      }
      
      await setDoc(userActivityRef, updateData, { merge: true });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  },

  // Get real-time academy users online
  async getAcademyUsersOnline(): Promise<number> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const onlineQuery = query(
        collection(db, 'userActivity'),
        where('lastSeen', '>', Timestamp.fromDate(fiveMinutesAgo)),
        where('isOnline', '==', true)
      );
      
      const snapshot = await getDocs(onlineQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting academy users online:', error);
      // Return 0 if index is still building
      return 0;
    }
  },

  // Get active users in specific cohort
  async getCohortActiveUsers(cohortId: string): Promise<number> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const cohortQuery = query(
        collection(db, 'enrollments'),
        where('cohortId', '==', cohortId),
        where('status', '==', 'active')
      );
      
      const enrollmentsSnapshot = await getDocs(cohortQuery);
      const cohortUserIds = enrollmentsSnapshot.docs.map(doc => doc.data().userId);
      
      if (cohortUserIds.length === 0) return 0;
      
      const onlineQuery = query(
        collection(db, 'userActivity'),
        where('userId', 'in', cohortUserIds.slice(0, 10)), // Firestore limit
        where('lastSeen', '>', Timestamp.fromDate(fiveMinutesAgo)),
        where('isOnline', '==', true)
      );
      
      const snapshot = await getDocs(onlineQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting cohort active users:', error);
      // Return 0 if index is still building
      return 0;
    }
  },

  // Get questions asked in the last week
  async getQuestionsLastWeek(): Promise<number> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const questionsQuery = query(
        collection(db, 'questions'),
        where('createdAt', '>', Timestamp.fromDate(oneWeekAgo))
      );
      
      const snapshot = await getDocs(questionsQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting questions last week:', error);
      return 0;
    }
  },

  // Get hot streak (students who completed lessons today)
  async getHotStreak(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const progressQuery = query(
        collection(db, 'lessonProgress'),
        where('completedAt', '>', Timestamp.fromDate(today))
      );
      
      const snapshot = await getDocs(progressQuery);
      const uniqueUsers = new Set(snapshot.docs.map(doc => doc.data().userId));
      return uniqueUsers.size;
    } catch (error) {
      console.error('Error getting hot streak:', error);
      // Return 0 if index is still building
      return 0;
    }
  },

  // Get community buzz (new questions in last 24h)
  async getCommunityBuzz(): Promise<number> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const questionsQuery = query(
        collection(db, 'questions'),
        where('createdAt', '>', Timestamp.fromDate(oneDayAgo))
      );
      
      const snapshot = await getDocs(questionsQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting community buzz:', error);
      return 0;
    }
  },

  // Get cohort progress (average completion percentage)
  async getCohortProgress(cohortId: string): Promise<number> {
    try {
      const cohortQuery = query(
        collection(db, 'enrollments'),
        where('cohortId', '==', cohortId),
        where('status', '==', 'active')
      );
      
      const enrollmentsSnapshot = await getDocs(cohortQuery);
      const cohortUserIds = enrollmentsSnapshot.docs.map(doc => doc.data().userId);
      
      if (cohortUserIds.length === 0) return 0;
      
      const progressQuery = query(
        collection(db, 'lessonProgress'),
        where('userId', 'in', cohortUserIds.slice(0, 10))
      );
      
      const snapshot = await getDocs(progressQuery);
      const completedLessons = snapshot.docs.filter(doc => doc.data().isCompleted).length;
      const totalProgress = snapshot.docs.length;
      
      return totalProgress > 0 ? (completedLessons / totalProgress) * 100 : 0;
    } catch (error) {
      console.error('Error getting cohort progress:', error);
      return 0;
    }
  },

  // Calculate engagement score
  calculateEngagementScore(questionsLastWeek: number, hotStreak: number, communityBuzz: number): 'High' | 'Medium' | 'Low' {
    const score = questionsLastWeek + hotStreak + communityBuzz;
    
    if (score >= 50) return 'High';
    if (score >= 20) return 'Medium';
    return 'Low';
  },

  // Get weekly goals completion
  async getWeeklyGoals(cohortId: string): Promise<number> {
    try {
      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
      thisWeekStart.setHours(0, 0, 0, 0);
      
      const cohortQuery = query(
        collection(db, 'enrollments'),
        where('cohortId', '==', cohortId),
        where('status', '==', 'active')
      );
      
      const enrollmentsSnapshot = await getDocs(cohortQuery);
      const cohortUserIds = enrollmentsSnapshot.docs.map(doc => doc.data().userId);
      
      if (cohortUserIds.length === 0) return 0;
      
      const progressQuery = query(
        collection(db, 'lessonProgress'),
        where('userId', 'in', cohortUserIds.slice(0, 10)),
        where('completedAt', '>', Timestamp.fromDate(thisWeekStart))
      );
      
      const snapshot = await getDocs(progressQuery);
      const usersWithCompletions = new Set(snapshot.docs.map(doc => doc.data().userId));
      
      return cohortUserIds.length > 0 ? (usersWithCompletions.size / cohortUserIds.length) * 100 : 0;
    } catch (error) {
      console.error('Error getting weekly goals:', error);
      return 0;
    }
  },

  // Get comprehensive community stats
  async getCommunityStats(cohortId?: string): Promise<CommunityStats> {
    try {
      const [
        academyUsersOnline,
        cohortActiveUsers,
        questionsLastWeek,
        hotStreak,
        communityBuzz,
        cohortProgress,
        weeklyGoals
      ] = await Promise.all([
        this.getAcademyUsersOnline(),
        cohortId ? this.getCohortActiveUsers(cohortId) : Promise.resolve(0),
        this.getQuestionsLastWeek(),
        this.getHotStreak(),
        this.getCommunityBuzz(),
        cohortId ? this.getCohortProgress(cohortId) : Promise.resolve(0),
        cohortId ? this.getWeeklyGoals(cohortId) : Promise.resolve(0)
      ]);

      const engagementScore = this.calculateEngagementScore(questionsLastWeek, hotStreak, communityBuzz);

      return {
        academyUsersOnline,
        cohortActiveUsers,
        questionsLastWeek,
        hotStreak,
        communityBuzz,
        cohortProgress,
        engagementScore,
        weeklyGoals
      };
    } catch (error) {
      console.error('Error getting community stats:', error);
      return {
        academyUsersOnline: 0,
        cohortActiveUsers: 0,
        questionsLastWeek: 0,
        hotStreak: 0,
        communityBuzz: 0,
        cohortProgress: 0,
        engagementScore: 'Low',
        weeklyGoals: 0
      };
    }
  },

  // Subscribe to real-time community stats updates
  subscribeToCommunityStats(
    cohortId: string | undefined,
    callback: (stats: CommunityStats) => void
  ): () => void {
    // For now, we'll poll every 30 seconds
    // In a real implementation, you'd use Firestore real-time listeners
    const interval = setInterval(async () => {
      const stats = await this.getCommunityStats(cohortId);
      callback(stats);
    }, 30000);

    // Initial call
    this.getCommunityStats(cohortId).then(callback);

    return () => clearInterval(interval);
  }
}; 