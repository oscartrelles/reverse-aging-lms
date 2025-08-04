import { collection, query, where, getDocs, orderBy, Timestamp, onSnapshot, limit, addDoc, updateDoc, doc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { analyticsEvents } from './analyticsService';

export interface RealTimeMetrics {
  activeUsers: number;
  currentSessions: number;
  recentEvents: RealTimeEvent[];
  topPages: PageMetrics[];
  conversionFunnel: ConversionStep[];
  revenueMetrics: RevenueMetrics;
  lastUpdated: Timestamp;
}

export interface RealTimeEvent {
  id: string;
  eventType: string;
  userId: string;
  timestamp: Timestamp;
  data: Record<string, any>;
  pageUrl?: string;
  userType?: string;
}

export interface PageMetrics {
  pageUrl: string;
  pageTitle: string;
  activeUsers: number;
  pageViews: number;
  avgTimeOnPage: number;
}

export interface ConversionStep {
  step: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface RevenueMetrics {
  todayRevenue: number;
  todayConversions: number;
  avgOrderValue: number;
  topPerformingProducts: Array<{
    productId: string;
    productName: string;
    revenue: number;
    conversions: number;
  }>;
}

export interface UserSession {
  userId: string;
  sessionId: string;
  startTime: Timestamp;
  lastActivity: Timestamp;
  pageViews: number;
  events: RealTimeEvent[];
  isActive: boolean;
}

export const realTimeAnalyticsService = {
  // Get real-time metrics
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    try {
      const now = Timestamp.now();
      const fiveMinutesAgo = new Timestamp(now.seconds - 300, now.nanoseconds);
      
      // Get active users (users with activity in last 5 minutes)
      const activeUsersQuery = query(
        collection(db, 'userSessions'),
        where('lastActivity', '>=', fiveMinutesAgo),
        where('isActive', '==', true)
      );
      
      const activeUsersSnapshot = await getDocs(activeUsersQuery);
      const activeUsers = activeUsersSnapshot.size;
      
      // Get recent events (last 10 minutes)
      const recentEventsQuery = query(
        collection(db, 'analyticsEvents'),
        where('timestamp', '>=', new Timestamp(now.seconds - 600, now.nanoseconds)),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const recentEventsSnapshot = await getDocs(recentEventsQuery);
      const recentEvents = recentEventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as RealTimeEvent[];
      
      // Calculate page metrics
      const pageMetrics = this.calculatePageMetrics(recentEvents);
      
      // Calculate conversion funnel
      const conversionFunnel = this.calculateConversionFunnel(recentEvents);
      
      // Calculate revenue metrics
      const revenueMetrics = await this.calculateRevenueMetrics();
      
      return {
        activeUsers,
        currentSessions: activeUsers, // Simplified for now
        recentEvents,
        topPages: pageMetrics,
        conversionFunnel,
        revenueMetrics,
        lastUpdated: now,
      };
    } catch (error) {
      console.error('❌ Error getting real-time metrics:', error);
      
      // Return fallback data if permissions are denied or indexes are missing
      if (error instanceof Error && (error.message.includes('permission') || error.message.includes('index'))) {
        console.log('⚠️ Using fallback data due to permissions or missing indexes');
        return {
          activeUsers: 0,
          currentSessions: 0,
          recentEvents: [],
          topPages: [],
          conversionFunnel: [
            { step: 'Landing Page', users: 0, conversionRate: 0, dropoffRate: 0 },
            { step: 'Sign Up', users: 0, conversionRate: 0, dropoffRate: 0 },
            { step: 'Course Purchase', users: 0, conversionRate: 0, dropoffRate: 0 },
            { step: 'Lesson Completion', users: 0, conversionRate: 0, dropoffRate: 0 },
          ],
          revenueMetrics: {
            todayRevenue: 0,
            todayConversions: 0,
            avgOrderValue: 0,
            topPerformingProducts: [],
          },
          lastUpdated: Timestamp.now(),
        };
      }
      
      throw error;
    }
  },

  // Subscribe to real-time updates
  subscribeToRealTimeUpdates(callback: (metrics: RealTimeMetrics) => void): () => void {
    const now = Timestamp.now();
    const fiveMinutesAgo = new Timestamp(now.seconds - 300, now.nanoseconds);
    
    // Subscribe to active user sessions
    const activeUsersQuery = query(
      collection(db, 'userSessions'),
      where('lastActivity', '>=', fiveMinutesAgo),
      where('isActive', '==', true)
    );
    
    const unsubscribe = onSnapshot(activeUsersQuery, async (snapshot) => {
      try {
        const metrics = await this.getRealTimeMetrics();
        callback(metrics);
      } catch (error) {
        console.error('❌ Error in real-time subscription:', error);
      }
    });
    
    return unsubscribe;
  },

  // Track user session
  async trackUserSession(userId: string, sessionId: string, pageUrl: string): Promise<void> {
    try {
      const sessionData = {
        userId,
        sessionId,
        startTime: Timestamp.now(),
        lastActivity: Timestamp.now(),
        pageViews: 1,
        events: [],
        isActive: true,
        currentPage: pageUrl,
      };
      
      // Check if session already exists
      const existingSessionQuery = query(
        collection(db, 'userSessions'),
        where('userId', '==', userId),
        where('sessionId', '==', sessionId)
      );
      
      const existingSnapshot = await getDocs(existingSessionQuery);
      
      if (existingSnapshot.empty) {
        // Create new session
        await addDoc(collection(db, 'userSessions'), sessionData);
      } else {
        // Update existing session
        const sessionDoc = existingSnapshot.docs[0];
        await updateDoc(doc(db, 'userSessions', sessionDoc.id), {
          lastActivity: Timestamp.now(),
          pageViews: increment(1),
          currentPage: pageUrl,
        });
      }
      
      // Track session event in analytics
      analyticsEvents.trackEvent('session_page_view', {
        user_id: userId,
        session_id: sessionId,
        page_url: pageUrl,
        timestamp: Timestamp.now(),
      });
      
    } catch (error) {
      console.error('❌ Error tracking user session:', error);
      throw error;
    }
  },

  // Track real-time event
  async trackRealTimeEvent(event: Omit<RealTimeEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const eventData = {
        ...event,
        timestamp: Timestamp.now(),
      };
      
      // Store event in real-time collection
      await addDoc(collection(db, 'analyticsEvents'), eventData);
      
      // Update user session if exists
      if (event.userId) {
        const userSessionQuery = query(
          collection(db, 'userSessions'),
          where('userId', '==', event.userId),
          where('isActive', '==', true)
        );
        
        const sessionSnapshot = await getDocs(userSessionQuery);
        if (!sessionSnapshot.empty) {
          const sessionDoc = sessionSnapshot.docs[0];
          await updateDoc(doc(db, 'userSessions', sessionDoc.id), {
            lastActivity: Timestamp.now(),
            events: arrayUnion(eventData),
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error tracking real-time event:', error);
      throw error;
    }
  },

  // Calculate page metrics from recent events
  calculatePageMetrics(events: RealTimeEvent[]): PageMetrics[] {
    const pageMap = new Map<string, {
      pageUrl: string;
      pageTitle: string;
      activeUsers: Set<string>;
      pageViews: number;
      totalTime: number;
    }>();
    
    events.forEach(event => {
      if (event.pageUrl) {
        const existing = pageMap.get(event.pageUrl) || {
          pageUrl: event.pageUrl,
          pageTitle: event.data.page_title || 'Unknown',
          activeUsers: new Set<string>(),
          pageViews: 0,
          totalTime: 0,
        };
        
        existing.activeUsers.add(event.userId);
        existing.pageViews++;
        
        if (event.data.time_spent_seconds) {
          existing.totalTime += event.data.time_spent_seconds;
        }
        
        pageMap.set(event.pageUrl, existing);
      }
    });
    
    return Array.from(pageMap.values())
      .map(page => ({
        pageUrl: page.pageUrl,
        pageTitle: page.pageTitle,
        activeUsers: page.activeUsers.size,
        pageViews: page.pageViews,
        avgTimeOnPage: page.pageViews > 0 ? page.totalTime / page.pageViews : 0,
      }))
      .sort((a, b) => b.activeUsers - a.activeUsers)
      .slice(0, 10);
  },

  // Calculate conversion funnel from recent events
  calculateConversionFunnel(events: RealTimeEvent[]): ConversionStep[] {
    const funnelSteps = [
      { step: 'Landing Page View', eventType: 'page_view' },
      { step: 'Sign Up Attempt', eventType: 'sign_up_attempt' },
      { step: 'Sign Up Success', eventType: 'sign_up_success' },
      { step: 'Course Enrollment', eventType: 'course_enroll' },
      { step: 'Payment Initiated', eventType: 'payment_initiated' },
      { step: 'Payment Completed', eventType: 'payment_completed' },
    ];
    
    const stepCounts = new Map<string, number>();
    const uniqueUsers = new Set<string>();
    
    events.forEach(event => {
      uniqueUsers.add(event.userId);
      
      const step = funnelSteps.find(s => s.eventType === event.eventType);
      if (step) {
        stepCounts.set(step.step, (stepCounts.get(step.step) || 0) + 1);
      }
    });
    
    const totalUsers = uniqueUsers.size;
    let previousStepCount = totalUsers;
    
    return funnelSteps.map(step => {
      const currentStepCount = stepCounts.get(step.step) || 0;
      const conversionRate = previousStepCount > 0 ? (currentStepCount / previousStepCount) * 100 : 0;
      const dropoffRate = previousStepCount > 0 ? ((previousStepCount - currentStepCount) / previousStepCount) * 100 : 0;
      
      previousStepCount = currentStepCount;
      
      return {
        step: step.step,
        users: currentStepCount,
        conversionRate: Math.round(conversionRate * 100) / 100,
        dropoffRate: Math.round(dropoffRate * 100) / 100,
      };
    });
  },

  // Calculate revenue metrics
  async calculateRevenueMetrics(): Promise<RevenueMetrics> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = Timestamp.fromDate(today);
      
      // Get today's payment events
      const paymentEventsQuery = query(
        collection(db, 'analyticsEvents'),
        where('eventType', '==', 'payment_completed'),
        where('timestamp', '>=', todayStart)
      );
      
      const paymentSnapshot = await getDocs(paymentEventsQuery);
      const paymentEvents = paymentSnapshot.docs.map(doc => doc.data());
      
      const todayRevenue = paymentEvents.reduce((sum, event) => sum + (event.conversion_value || 0), 0);
      const todayConversions = paymentEvents.length;
      const avgOrderValue = todayConversions > 0 ? todayRevenue / todayConversions : 0;
      
      // Calculate top performing products
      const productRevenue = new Map<string, { revenue: number; conversions: number; name: string }>();
      
      paymentEvents.forEach(event => {
        const productId = event.course_id || 'unknown';
        const existing = productRevenue.get(productId) || { revenue: 0, conversions: 0, name: event.course_name || 'Unknown' };
        
        existing.revenue += event.conversion_value || 0;
        existing.conversions += 1;
        
        productRevenue.set(productId, existing);
      });
      
      const topPerformingProducts = Array.from(productRevenue.entries())
        .map(([productId, data]) => ({
          productId,
          productName: data.name,
          revenue: data.revenue,
          conversions: data.conversions,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      return {
        todayRevenue,
        todayConversions,
        avgOrderValue,
        topPerformingProducts,
      };
    } catch (error) {
      console.error('❌ Error calculating revenue metrics:', error);
      return {
        todayRevenue: 0,
        todayConversions: 0,
        avgOrderValue: 0,
        topPerformingProducts: [],
      };
    }
  },

  // Get user session data
  async getUserSession(userId: string, sessionId: string): Promise<UserSession | null> {
    try {
      const sessionQuery = query(
        collection(db, 'userSessions'),
        where('userId', '==', userId),
        where('sessionId', '==', sessionId)
      );
      
      const snapshot = await getDocs(sessionQuery);
      if (snapshot.empty) {
        return null;
      }
      
      const data = snapshot.docs[0].data();
      return {
        id: snapshot.docs[0].id,
        userId: data.userId,
        sessionId: data.sessionId,
        startTime: data.startTime,
        lastActivity: data.lastActivity,
        pageViews: data.pageViews,
        events: data.events || [],
        isActive: data.isActive,
      } as UserSession;
    } catch (error) {
      console.error('❌ Error getting user session:', error);
      return null;
    }
  },

  // End user session
  async endUserSession(userId: string, sessionId: string): Promise<void> {
    try {
      const sessionQuery = query(
        collection(db, 'userSessions'),
        where('userId', '==', userId),
        where('sessionId', '==', sessionId)
      );
      
      const snapshot = await getDocs(sessionQuery);
      if (!snapshot.empty) {
        await updateDoc(doc(db, 'userSessions', snapshot.docs[0].id), {
          isActive: false,
          endTime: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('❌ Error ending user session:', error);
      throw error;
    }
  },
}; 