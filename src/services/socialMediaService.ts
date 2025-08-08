import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, increment, collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useAnalytics } from '../hooks/useAnalytics';
import { trackEvent } from './analyticsService';

export interface SocialShare {
  id: string;
  platform: string;
  url: string;
  title: string;
  userId?: string;
  timestamp: Timestamp;
  userAgent: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface SocialMetrics {
  totalShares: number;
  sharesByPlatform: Record<string, number>;
  sharesByPage: Record<string, number>;
  recentShares: SocialShare[];
  topSharedContent: Array<{
    url: string;
    title: string;
    shareCount: number;
  }>;
}

export class SocialMediaService {
  private static instance: SocialMediaService;
  
  private constructor() {}
  
  static getInstance(): SocialMediaService {
    if (!SocialMediaService.instance) {
      SocialMediaService.instance = new SocialMediaService();
    }
    return SocialMediaService.instance;
  }

  // Track a social share
  async trackShare(shareData: Omit<SocialShare, 'id' | 'timestamp'>): Promise<void> {
    try {
      const share: SocialShare = {
        ...shareData,
        id: `${shareData.platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Timestamp.now(),
      };

      // Save to Firestore
      await setDoc(doc(db, 'socialShares', share.id), share);

      // Update aggregate metrics
      await this.updateAggregateMetrics(share);

      console.log(`Social share tracked: ${share.platform} - ${share.url}`);
    } catch (error) {
      console.error('Error tracking social share:', error);
    }
  }

  // Update aggregate metrics
  private async updateAggregateMetrics(share: SocialShare): Promise<void> {
    try {
      const metricsRef = doc(db, 'socialMetrics', 'overall');
      
      // Get current metrics
      const metricsDoc = await getDoc(metricsRef);
      const currentMetrics = metricsDoc.exists() ? metricsDoc.data() : {
        totalShares: 0,
        sharesByPlatform: {},
        sharesByPage: {},
        lastUpdated: Timestamp.now(),
      };

      // Update metrics
      const updatedMetrics = {
        totalShares: currentMetrics.totalShares + 1,
        sharesByPlatform: {
          ...currentMetrics.sharesByPlatform,
          [share.platform]: (currentMetrics.sharesByPlatform[share.platform] || 0) + 1,
        },
        sharesByPage: {
          ...currentMetrics.sharesByPage,
          [share.url]: (currentMetrics.sharesByPage[share.url] || 0) + 1,
        },
        lastUpdated: Timestamp.now(),
      };

      await setDoc(metricsRef, updatedMetrics);
    } catch (error) {
      console.error('Error updating aggregate metrics:', error);
    }
  }

  // Get social metrics
  async getSocialMetrics(): Promise<SocialMetrics> {
    try {
      // Get overall metrics
      const metricsDoc = await getDoc(doc(db, 'socialMetrics', 'overall'));
      const overallMetrics = metricsDoc.exists() ? metricsDoc.data() : {
        totalShares: 0,
        sharesByPlatform: {},
        sharesByPage: {},
      };

      // Get recent shares
      const recentSharesQuery = query(
        collection(db, 'socialShares'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const recentSharesSnapshot = await getDocs(recentSharesQuery);
      const recentShares = recentSharesSnapshot.docs.map(doc => doc.data() as SocialShare);

      // Get top shared content
      const topSharedContent = Object.entries(overallMetrics.sharesByPage || {})
        .map(([url, count]) => ({
          url,
          title: this.extractTitleFromUrl(url),
          shareCount: count as number,
        }))
        .sort((a, b) => b.shareCount - a.shareCount)
        .slice(0, 5);

      return {
        totalShares: overallMetrics.totalShares || 0,
        sharesByPlatform: overallMetrics.sharesByPlatform || {},
        sharesByPage: overallMetrics.sharesByPage || {},
        recentShares,
        topSharedContent,
      };
    } catch (error) {
      console.error('Error getting social metrics:', error);
      return {
        totalShares: 0,
        sharesByPlatform: {},
        sharesByPage: {},
        recentShares: [],
        topSharedContent: [],
      };
    }
  }

  // Extract title from URL
  private extractTitleFromUrl(url: string): string {
    try {
      const path = new URL(url).pathname;
      const segments = path.split('/').filter(Boolean);
      
      if (segments.length === 0) return 'Home';
      if (segments[0] === 'evidence') return 'Scientific Evidence';
      if (segments[0] === 'course') return 'Course Details';
      if (segments[0] === 'programs') return 'Programs';
      if (segments[0] === 'about') return 'About Us';
      
      return segments[segments.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch {
      return 'Unknown Page';
    }
  }

  // Get shares by platform
  async getSharesByPlatform(platform: string): Promise<SocialShare[]> {
    try {
      const sharesQuery = query(
        collection(db, 'socialShares'),
        where('platform', '==', platform),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const sharesSnapshot = await getDocs(sharesQuery);
      return sharesSnapshot.docs.map(doc => doc.data() as SocialShare);
    } catch (error) {
      console.error(`Error getting shares for platform ${platform}:`, error);
      return [];
    }
  }

  // Get shares by page
  async getSharesByPage(url: string): Promise<SocialShare[]> {
    try {
      const sharesQuery = query(
        collection(db, 'socialShares'),
        where('url', '==', url),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const sharesSnapshot = await getDocs(sharesQuery);
      return sharesSnapshot.docs.map(doc => doc.data() as SocialShare);
    } catch (error) {
      console.error(`Error getting shares for page ${url}:`, error);
      return [];
    }
  }

  // Track social media click (when someone clicks a shared link)
  async trackSocialClick(platform: string, url: string, referrer?: string): Promise<void> {
    try {
      const clickData = {
        platform,
        url,
        referrer,
        timestamp: Timestamp.now(),
        userAgent: navigator.userAgent,
      };

      await setDoc(doc(db, 'socialClicks', `${platform}_${Date.now()}`), clickData);
      console.log(`Social click tracked: ${platform} - ${url}`);
    } catch (error) {
      console.error('Error tracking social click:', error);
    }
  }

  // Generate social sharing analytics report
  async generateAnalyticsReport(): Promise<{
    totalShares: number;
    topPlatforms: Array<{ platform: string; shares: number }>;
    topPages: Array<{ url: string; title: string; shares: number }>;
    recentActivity: SocialShare[];
  }> {
    const metrics = await this.getSocialMetrics();
    
    const topPlatforms = Object.entries(metrics.sharesByPlatform)
      .map(([platform, shares]) => ({ platform, shares }))
      .sort((a, b) => b.shares - a.shares)
      .slice(0, 5);

    const topPages = metrics.topSharedContent.slice(0, 10).map(item => ({
      url: item.url,
      title: item.title,
      shares: item.shareCount,
    }));

    return {
      totalShares: metrics.totalShares,
      topPlatforms,
      topPages,
      recentActivity: metrics.recentShares,
    };
  }
}

// Export singleton instance
export const socialMediaService = SocialMediaService.getInstance();

// React hook for social media tracking
export const useSocialMediaTracking = () => {

  const trackShare = async (platform: string, url: string, title: string) => {
    try {
      // Track in analytics
      trackEvent('social_share', {
        platform,
        url,
        title,
        page: window.location.pathname,
      });

      // Track in Firestore
      await socialMediaService.trackShare({
        platform,
        url,
        title,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      });
    } catch (error) {
      console.error('Error tracking social share:', error);
    }
  };

  const trackClick = async (platform: string, url: string) => {
    try {
      // Track in analytics
      trackEvent('social_click', {
        platform,
        url,
        page: window.location.pathname,
      });

      // Track in Firestore
      await socialMediaService.trackSocialClick(platform, url, document.referrer);
    } catch (error) {
      console.error('Error tracking social click:', error);
    }
  };

  return {
    trackShare,
    trackClick,
    getSocialMetrics: socialMediaService.getSocialMetrics.bind(socialMediaService),
    generateAnalyticsReport: socialMediaService.generateAnalyticsReport.bind(socialMediaService),
  };
};
