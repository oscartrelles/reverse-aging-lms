import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { googleAnalyticsEmbedService } from './googleAnalyticsEmbedService';

export interface BusinessMetrics {
  // Traffic & Engagement
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  
  // Conversion Funnel
  visitorsToLanding: number;
  landingToPrograms: number;
  programsToCheckout: number;
  checkoutToEnrollment: number;
  
  // Revenue Metrics
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  
  // Course Performance
  courseViews: number;
  courseEnrollments: number;
  courseCompletionRate: number;
  
  // User Engagement
  activeUsers: number;
  returningUsers: number;
  sessionDuration: number;
  
  // Cohort Analysis
  cohortRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
  
  lastUpdated: Date;
}

export interface FunnelStep {
  name: string;
  count: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface BusinessFunnel {
  steps: FunnelStep[];
  totalConversionRate: number;
  totalRevenue: number;
}

class BusinessAnalyticsService {
  
  // Get comprehensive business metrics
  async getBusinessMetrics(dateRange: { startDate: Date; endDate: Date }): Promise<BusinessMetrics | null> {
    try {
      // Get Google Analytics data
      let gaData;
      try {
        gaData = await googleAnalyticsEmbedService.getRealTimeData();
      } catch (error) {
        console.warn('Google Analytics data unavailable, returning null');
        return null;
      }
      
      // If no GA data, return null
      if (!gaData) {
        return null;
      }

      // Get business data from Firestore
      const [
        enrollments,
        checkoutSessions,
        courseViews,
        userSessions
      ] = await Promise.all([
        this.getEnrollments(dateRange),
        this.getCheckoutSessions(dateRange),
        this.getCourseViews(dateRange),
        this.getUserSessions(dateRange)
      ]);

      // Calculate funnel metrics
      const funnel = this.calculateFunnel(gaData, checkoutSessions, enrollments);
      
      // Calculate revenue metrics
      const revenueMetrics = this.calculateRevenueMetrics(checkoutSessions, enrollments);
      
      // Calculate engagement metrics
      const engagementMetrics = this.calculateEngagementMetrics(gaData, userSessions);
      
      return {
        // Traffic & Engagement
        totalVisitors: gaData.activeUsers,
        uniqueVisitors: gaData.sessions,
        pageViews: gaData.pageViews,
        bounceRate: this.calculateBounceRate(gaData),
        
        // Conversion Funnel
        visitorsToLanding: funnel.steps[0]?.count || 0,
        landingToPrograms: funnel.steps[1]?.count || 0,
        programsToCheckout: funnel.steps[2]?.count || 0,
        checkoutToEnrollment: funnel.steps[3]?.count || 0,
        
        // Revenue Metrics
        totalRevenue: revenueMetrics.totalRevenue,
        averageOrderValue: revenueMetrics.averageOrderValue,
        conversionRate: revenueMetrics.conversionRate,
        
        // Course Performance
        courseViews: courseViews.length,
        courseEnrollments: enrollments.length,
        courseCompletionRate: this.calculateCompletionRate(enrollments),
        
        // User Engagement
        activeUsers: gaData.activeUsers,
        returningUsers: engagementMetrics.returningUsers,
        sessionDuration: engagementMetrics.sessionDuration,
        
        // Cohort Analysis
        cohortRetention: await this.calculateCohortRetention(dateRange),
        
        lastUpdated: new Date()
      };
        } catch (error) {
      console.error('Error getting business metrics:', error);
      // Return null when there's an error
      return null;
    }
  }

  // Get enrollment data
  private async getEnrollments(dateRange: { startDate: Date; endDate: Date }) {
    try {
      const enrollmentsRef = collection(db, 'enrollments');
      const q = query(
        enrollmentsRef,
        where('enrolledAt', '>=', Timestamp.fromDate(dateRange.startDate)),
        where('enrolledAt', '<=', Timestamp.fromDate(dateRange.endDate))
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('No enrollments collection found, returning empty array');
      return [];
    }
  }

  // Get checkout sessions
  private async getCheckoutSessions(dateRange: { startDate: Date; endDate: Date }) {
    try {
      const sessionsRef = collection(db, 'checkoutSessions');
      const q = query(
        sessionsRef,
        where('created', '>=', Timestamp.fromDate(dateRange.startDate)),
        where('created', '<=', Timestamp.fromDate(dateRange.endDate))
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('No checkout sessions collection found, returning empty array');
      return [];
    }
  }

  // Get course views
  private async getCourseViews(dateRange: { startDate: Date; endDate: Date }) {
    try {
      const viewsRef = collection(db, 'analyticsEvents');
      const q = query(
        viewsRef,
        where('eventType', '==', 'course_view'),
        where('timestamp', '>=', Timestamp.fromDate(dateRange.startDate)),
        where('timestamp', '<=', Timestamp.fromDate(dateRange.endDate))
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('No course views collection found, returning empty array');
      return [];
    }
  }

  // Get user sessions
  private async getUserSessions(dateRange: { startDate: Date; endDate: Date }) {
    try {
      const sessionsRef = collection(db, 'userSessions');
      const q = query(
        sessionsRef,
        where('startTime', '>=', Timestamp.fromDate(dateRange.startDate)),
        where('startTime', '<=', Timestamp.fromDate(dateRange.endDate))
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('No user sessions collection found, returning empty array');
      return [];
    }
  }

  // Calculate conversion funnel
  private calculateFunnel(gaData: any, checkoutSessions: any[], enrollments: any[]): BusinessFunnel {
    const steps: FunnelStep[] = [];
    
    // Helper function to safely calculate percentages
    const safePercentage = (numerator: number, denominator: number): number => {
      return denominator > 0 ? (numerator / denominator) * 100 : 0;
    };
    
    // Step 1: Visitors to Landing Page
    const visitorsToLanding = gaData.activeUsers || 0;
    
    steps.push({
      name: 'Landing Page Visitors',
      count: visitorsToLanding,
      conversionRate: 100,
      dropoffRate: 0
    });
    
    // Step 2: Landing to Programs Page
    const landingToPrograms = Math.floor(visitorsToLanding * 0.4); // Estimate 40% click through
    
    steps.push({
      name: 'Programs Page Views',
      count: landingToPrograms,
      conversionRate: safePercentage(landingToPrograms, visitorsToLanding),
      dropoffRate: safePercentage(visitorsToLanding - landingToPrograms, visitorsToLanding)
    });
    
    // Step 3: Programs to Checkout
    const programsToCheckout = checkoutSessions.length;
    
    steps.push({
      name: 'Checkout Sessions',
      count: programsToCheckout,
      conversionRate: safePercentage(programsToCheckout, landingToPrograms),
      dropoffRate: safePercentage(landingToPrograms - programsToCheckout, landingToPrograms)
    });
    
    // Step 4: Checkout to Enrollment
    const checkoutToEnrollment = enrollments.length;
    
    steps.push({
      name: 'Successful Enrollments',
      count: checkoutToEnrollment,
      conversionRate: safePercentage(checkoutToEnrollment, programsToCheckout),
      dropoffRate: safePercentage(programsToCheckout - checkoutToEnrollment, programsToCheckout)
    });
    
    const totalConversionRate = safePercentage(checkoutToEnrollment, visitorsToLanding);
    const totalRevenue = enrollments.reduce((sum, enrollment) => sum + (enrollment.amount || 0), 0);
    
    return {
      steps,
      totalConversionRate,
      totalRevenue
    };
  }

  // Calculate revenue metrics
  private calculateRevenueMetrics(checkoutSessions: any[], enrollments: any[]) {
    const totalRevenue = enrollments.reduce((sum, enrollment) => sum + (enrollment.amount || 0), 0);
    const averageOrderValue = enrollments.length > 0 ? totalRevenue / enrollments.length : 0;
    const conversionRate = checkoutSessions.length > 0 ? (enrollments.length / checkoutSessions.length) * 100 : 0;
    
    return {
      totalRevenue,
      averageOrderValue,
      conversionRate
    };
  }

  // Calculate engagement metrics
  private calculateEngagementMetrics(gaData: any, userSessions: any[]) {
    const returningUsers = Math.floor((gaData.sessions || 0) * 0.3); // Estimate 30% returning
    const sessionDuration = userSessions.length > 0 
      ? userSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / userSessions.length 
      : 0;
    
    return {
      returningUsers,
      sessionDuration
    };
  }

  // Calculate bounce rate
  private calculateBounceRate(gaData: any): number {
    // Estimate bounce rate based on sessions vs page views
    return (gaData.sessions || 0) > 0 ? (((gaData.sessions || 0) - (gaData.pageViews || 0)) / (gaData.sessions || 0)) * 100 : 0;
  }

  // Calculate completion rate
  private calculateCompletionRate(enrollments: any[]): number {
    const completed = enrollments.filter(e => e.status === 'completed').length;
    return enrollments.length > 0 ? (completed / enrollments.length) * 100 : 0;
  }

  // Calculate cohort retention
  private async calculateCohortRetention(dateRange: { startDate: Date; endDate: Date }) {
    // This would require more complex cohort analysis
    // For now, return estimated values
    return {
      day1: 85, // 85% return on day 1
      day7: 45,  // 45% return on day 7
      day30: 25  // 25% return on day 30
    };
  }

  // Get funnel data for visualization
  async getFunnelData(dateRange: { startDate: Date; endDate: Date }): Promise<BusinessFunnel | null> {
    try {
      const metrics = await this.getBusinessMetrics(dateRange);
      
      // If no metrics (no GA data), return empty funnel
      if (!metrics) {
        return {
          steps: [],
          totalConversionRate: 0,
          totalRevenue: 0
        };
      }
    
    const steps: FunnelStep[] = [
      {
        name: 'Landing Page Visitors',
        count: metrics.visitorsToLanding,
        conversionRate: 100,
        dropoffRate: 0
      },
      {
        name: 'Programs Page Views',
        count: metrics.landingToPrograms,
        conversionRate: (metrics.landingToPrograms / metrics.visitorsToLanding) * 100,
        dropoffRate: ((metrics.visitorsToLanding - metrics.landingToPrograms) / metrics.visitorsToLanding) * 100
      },
      {
        name: 'Checkout Sessions',
        count: metrics.programsToCheckout,
        conversionRate: (metrics.programsToCheckout / metrics.landingToPrograms) * 100,
        dropoffRate: ((metrics.landingToPrograms - metrics.programsToCheckout) / metrics.landingToPrograms) * 100
      },
      {
        name: 'Successful Enrollments',
        count: metrics.checkoutToEnrollment,
        conversionRate: (metrics.checkoutToEnrollment / metrics.programsToCheckout) * 100,
        dropoffRate: ((metrics.programsToCheckout - metrics.checkoutToEnrollment) / metrics.programsToCheckout) * 100
      }
    ];
    
    return {
      steps,
      totalConversionRate: (metrics.checkoutToEnrollment / metrics.visitorsToLanding) * 100,
      totalRevenue: metrics.totalRevenue
    };
    } catch (error) {
      console.error('Error getting funnel data:', error);
      // Return null when there's an error
      return null;
    }
  }
}

export const businessAnalyticsService = new BusinessAnalyticsService(); 