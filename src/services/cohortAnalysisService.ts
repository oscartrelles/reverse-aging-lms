import { collection, query, where, getDocs, orderBy, Timestamp, addDoc, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { analyticsEvents } from './analyticsService';

export interface CohortData {
  id: string;
  name: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  totalUsers: number;
  activeUsers: number;
  retentionRates: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };
  engagementMetrics: {
    avgLessonsCompleted: number;
    avgTimeSpent: number;
    completionRate: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserCohort {
  userId: string;
  cohortId: string;
  joinedAt: Timestamp;
  lastActivity: Timestamp;
  isActive: boolean;
  metrics: {
    lessonsCompleted: number;
    totalTimeSpent: number;
    questionsAsked: number;
    scientificUpdatesRead: number;
  };
}

export interface CohortAnalysisResult {
  cohortId: string;
  cohortName: string;
  period: string;
  totalUsers: number;
  activeUsers: number;
  retentionRate: number;
  engagementScore: number;
  topPerformingUsers: string[];
  recommendations: string[];
}

export const cohortAnalysisService = {
  // Create a new cohort
  async createCohort(name: string, startDate: Date, endDate?: Date): Promise<string> {
    try {
      const cohortRef = await addDoc(collection(db, 'cohorts'), {
        name,
        startDate: Timestamp.fromDate(startDate),
        endDate: endDate ? Timestamp.fromDate(endDate) : null,
        totalUsers: 0,
        activeUsers: 0,
        retentionRates: {
          day1: 0,
          day7: 0,
          day30: 0,
          day90: 0,
        },
        engagementMetrics: {
          avgLessonsCompleted: 0,
          avgTimeSpent: 0,
          completionRate: 0,
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log(`✅ Created cohort: ${name}`);
      return cohortRef.id;
    } catch (error) {
      console.error('❌ Error creating cohort:', error);
      throw error;
    }
  },

  // Add user to cohort
  async addUserToCohort(userId: string, cohortId: string): Promise<void> {
    try {
      await addDoc(collection(db, 'userCohorts'), {
        userId,
        cohortId,
        joinedAt: Timestamp.now(),
        lastActivity: Timestamp.now(),
        isActive: true,
        metrics: {
          lessonsCompleted: 0,
          totalTimeSpent: 0,
          questionsAsked: 0,
          scientificUpdatesRead: 0,
        },
      });
      
      // Update cohort total users count
      const cohortRef = doc(db, 'cohorts', cohortId);
      await updateDoc(cohortRef, {
        totalUsers: increment(1),
        updatedAt: Timestamp.now(),
      });
      
      console.log(`✅ Added user ${userId} to cohort ${cohortId}`);
    } catch (error) {
      console.error('❌ Error adding user to cohort:', error);
      throw error;
    }
  },

  // Update user activity in cohort
  async updateUserActivity(userId: string, cohortId: string, activity: Partial<UserCohort['metrics']>): Promise<void> {
    try {
      const userCohortQuery = query(
        collection(db, 'userCohorts'),
        where('userId', '==', userId),
        where('cohortId', '==', cohortId)
      );
      
      const snapshot = await getDocs(userCohortQuery);
      if (!snapshot.empty) {
        const userCohortDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'userCohorts', userCohortDoc.id), {
          lastActivity: Timestamp.now(),
          isActive: true,
          metrics: {
            ...userCohortDoc.data().metrics,
            ...activity,
          },
        });
      }
    } catch (error) {
      console.error('❌ Error updating user activity:', error);
      throw error;
    }
  },

  // Calculate cohort retention rates
  async calculateRetentionRates(cohortId: string): Promise<CohortData['retentionRates']> {
    try {
      const userCohortsQuery = query(
        collection(db, 'userCohorts'),
        where('cohortId', '==', cohortId)
      );
      
      const snapshot = await getDocs(userCohortsQuery);
      const userCohorts = snapshot.docs.map(doc => doc.data() as UserCohort);
      
      const now = new Date();
      const retentionRates = {
        day1: 0,
        day7: 0,
        day30: 0,
        day90: 0,
      };
      
      userCohorts.forEach(userCohort => {
        const joinedAt = userCohort.joinedAt.toDate();
        const lastActivity = userCohort.lastActivity.toDate();
        
        const daysSinceJoin = Math.floor((now.getTime() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));
        const daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceJoin >= 1 && daysSinceLastActivity <= 1) retentionRates.day1++;
        if (daysSinceJoin >= 7 && daysSinceLastActivity <= 7) retentionRates.day7++;
        if (daysSinceJoin >= 30 && daysSinceLastActivity <= 30) retentionRates.day30++;
        if (daysSinceJoin >= 90 && daysSinceLastActivity <= 90) retentionRates.day90++;
      });
      
      // Convert to percentages
      const totalUsers = userCohorts.length;
      if (totalUsers > 0) {
        retentionRates.day1 = Math.round((retentionRates.day1 / totalUsers) * 100);
        retentionRates.day7 = Math.round((retentionRates.day7 / totalUsers) * 100);
        retentionRates.day30 = Math.round((retentionRates.day30 / totalUsers) * 100);
        retentionRates.day90 = Math.round((retentionRates.day90 / totalUsers) * 100);
      }
      
      return retentionRates;
    } catch (error) {
      console.error('❌ Error calculating retention rates:', error);
      throw error;
    }
  },

  // Get cohort analysis results
  async getCohortAnalysis(cohortId: string, period: string = '30d'): Promise<CohortAnalysisResult> {
    try {
      const cohortDoc = await getDoc(doc(db, 'cohorts', cohortId));
      if (!cohortDoc.exists()) {
        throw new Error('Cohort not found');
      }
      
      const cohortData = cohortDoc.data() as CohortData;
      const retentionRates = await this.calculateRetentionRates(cohortId);
      
      // Get top performing users
      const userCohortsQuery = query(
        collection(db, 'userCohorts'),
        where('cohortId', '==', cohortId),
        orderBy('metrics.lessonsCompleted', 'desc')
      );
      
      const snapshot = await getDocs(userCohortsQuery);
      const topPerformingUsers = snapshot.docs.slice(0, 5).map(doc => doc.data().userId);
      
      // Calculate engagement score with fallback values
      const avgLessonsCompleted = cohortData?.engagementMetrics?.avgLessonsCompleted || 0;
      const completionRate = cohortData?.engagementMetrics?.completionRate || 0;
      
      const engagementScore = Math.round(
        (avgLessonsCompleted * 0.4) +
        (completionRate * 0.4) +
        (retentionRates.day30 * 0.2)
      );
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(cohortData, retentionRates, engagementScore);
      
      return {
        cohortId,
        cohortName: cohortData?.name || 'Unknown Cohort',
        period,
        totalUsers: cohortData?.totalUsers || 0,
        activeUsers: cohortData?.activeUsers || 0,
        retentionRate: retentionRates.day30,
        engagementScore,
        topPerformingUsers,
        recommendations,
      };
    } catch (error) {
      console.error('❌ Error getting cohort analysis:', error);
      
      // Return fallback data if permissions are denied or data structure issues
      if (error instanceof Error && (error.message.includes('permission') || error.message.includes('Cannot read properties'))) {
        console.log('⚠️ Using fallback cohort data due to permissions or data structure issues');
        return {
          cohortId: 'demo-cohort',
          cohortName: 'Demo Cohort',
          period: '30d',
          totalUsers: 0,
          activeUsers: 0,
          retentionRate: 0,
          engagementScore: 0,
          topPerformingUsers: [],
          recommendations: ['Demo data - no real cohort data available'],
        };
      }
      
      throw error;
    }
  },

  // Generate recommendations based on cohort data
  generateRecommendations(
    cohortData: CohortData, 
    retentionRates: CohortData['retentionRates'], 
    engagementScore: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (retentionRates.day7 < 50) {
      recommendations.push('Low 7-day retention: Consider improving onboarding experience');
    }
    
    if (retentionRates.day30 < 30) {
      recommendations.push('Low 30-day retention: Focus on content engagement and community building');
    }
    
    if ((cohortData?.engagementMetrics?.avgLessonsCompleted || 0) < 3) {
      recommendations.push('Low lesson completion: Review lesson difficulty and content quality');
    }
    
    if (engagementScore < 60) {
      recommendations.push('Low overall engagement: Implement gamification and progress tracking');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Cohort performing well! Consider scaling successful strategies');
    }
    
    return recommendations;
  },

  // Track cohort-specific events
  async trackCohortEvent(userId: string, eventType: string, eventData: any): Promise<void> {
    try {
      // Find user's cohort
      const userCohortQuery = query(
        collection(db, 'userCohorts'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(userCohortQuery);
      if (!snapshot.empty) {
        const userCohort = snapshot.docs[0].data() as UserCohort;
        
        // Update metrics based on event type
        let metricsUpdate = {};
        
        switch (eventType) {
          case 'lesson_complete':
            metricsUpdate = {
              'metrics.lessonsCompleted': increment(1),
            };
            break;
          case 'question_asked':
            metricsUpdate = {
              'metrics.questionsAsked': increment(1),
            };
            break;
          case 'scientific_update_read':
            metricsUpdate = {
              'metrics.scientificUpdatesRead': increment(1),
            };
            break;
        }
        
        if (Object.keys(metricsUpdate).length > 0) {
          await updateDoc(doc(db, 'userCohorts', snapshot.docs[0].id), {
            ...metricsUpdate,
            lastActivity: Timestamp.now(),
          });
        }
        
        // Track event in analytics
        analyticsEvents.trackEvent('cohort_event', {
          cohort_id: userCohort.cohortId,
          event_type: eventType,
          user_id: userId,
          ...eventData,
        });
      }
    } catch (error) {
      console.error('❌ Error tracking cohort event:', error);
      throw error;
    }
  },
}; 