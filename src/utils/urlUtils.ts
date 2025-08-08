import { ENVIRONMENT } from '../config/environment';

// URL utilities for SEO optimization
export class URLUtils {
  // Generate SEO-friendly slug from text
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }

  // Get canonical URL for a page
  static getCanonicalUrl(path: string): string {
    const baseUrl = ENVIRONMENT.currentHostingUrl;
    return `${baseUrl}${path}`;
  }

  // Get absolute URL for social sharing
  static getAbsoluteUrl(path: string): string {
    const baseUrl = ENVIRONMENT.currentHostingUrl;
    return `${baseUrl}${path}`;
  }

  // Generate course URL with SEO-friendly structure
  static getCourseUrl(courseId: string, courseTitle?: string): string {
    const slug = courseTitle ? URLUtils.generateSlug(courseTitle) : courseId;
    return `/course/${slug}`;
  }

  // Generate evidence article URL with SEO-friendly structure
  static getEvidenceUrl(articleId: string, articleTitle?: string): string {
    const slug = articleTitle ? URLUtils.generateSlug(articleTitle) : articleId;
    return `/evidence/${slug}`;
  }

  // Generate lesson URL with SEO-friendly structure
  static getLessonUrl(courseId: string, lessonId: string, lessonTitle?: string): string {
    const courseSlug = URLUtils.generateSlug(courseId);
    const lessonSlug = lessonTitle ? URLUtils.generateSlug(lessonTitle) : lessonId;
    return `/course/${courseSlug}/lesson/${lessonSlug}`;
  }

  // Get breadcrumb URLs for navigation
  static getBreadcrumbUrls(currentPath: string): Array<{ name: string; url: string }> {
    const segments = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', url: '/' }];
    
    let currentUrl = '';
    segments.forEach((segment, index) => {
      currentUrl += `/${segment}`;
      
      // Generate readable names for segments
      let name = segment;
      if (segment === 'course') name = 'Programs';
      else if (segment === 'evidence') name = 'Scientific Evidence';
      else if (segment === 'lesson') name = 'Lesson';
      else if (segment === 'about') name = 'About';
      else if (segment === 'programs') name = 'Programs';
      else if (segment === 'privacy') name = 'Privacy Policy';
      else if (segment === 'terms') name = 'Terms of Service';
      else {
        // Convert slug to readable name
        name = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      
      breadcrumbs.push({ name, url: currentUrl });
    });
    
    return breadcrumbs;
  }

  // Check if URL is canonical (no trailing slash, proper format)
  static isCanonicalUrl(url: string): boolean {
    // Remove trailing slash except for root
    if (url !== '/' && url.endsWith('/')) {
      return false;
    }
    
    // Check for proper format
    const validFormats = [
      /^\/$/, // Root
      /^\/[a-z-]+$/, // Simple pages like /about, /programs
      /^\/course\/[a-z0-9-]+$/, // Course pages
      /^\/course\/[a-z0-9-]+\/lesson\/[a-z0-9-]+$/, // Lesson pages
      /^\/evidence\/[a-z0-9-]+$/, // Evidence pages
    ];
    
    return validFormats.some(format => format.test(url));
  }

  // Get redirect URL if current URL is not canonical
  static getCanonicalRedirectUrl(url: string): string | null {
    if (URLUtils.isCanonicalUrl(url)) {
      return null;
    }
    
    // Remove trailing slash
    if (url !== '/' && url.endsWith('/')) {
      return url.slice(0, -1);
    }
    
    return null;
  }

  // Generate sitemap URL for a specific content type
  static getSitemapUrl(contentType?: string): string {
    const baseUrl = ENVIRONMENT.currentHostingUrl;
    if (contentType) {
      return `${baseUrl}/sitemap-${contentType}.xml`;
    }
    return `${baseUrl}/sitemap.xml`;
  }

  // Get robots.txt URL
  static getRobotsUrl(): string {
    const baseUrl = ENVIRONMENT.currentHostingUrl;
    return `${baseUrl}/robots.txt`;
  }

  // Generate UTM parameters for tracking
  static generateUTMParams(source: string, medium: string, campaign?: string): string {
    const params = new URLSearchParams({
      utm_source: source,
      utm_medium: medium,
    });
    
    if (campaign) {
      params.append('utm_campaign', campaign);
    }
    
    return params.toString();
  }

  // Add UTM parameters to URL
  static addUTMParams(url: string, source: string, medium: string, campaign?: string): string {
    const separator = url.includes('?') ? '&' : '?';
    const utmParams = URLUtils.generateUTMParams(source, medium, campaign);
    return `${url}${separator}${utmParams}`;
  }

  // Clean URL for analytics (remove UTM parameters)
  static cleanUrlForAnalytics(url: string): string {
    try {
      const urlObj = new URL(url, ENVIRONMENT.currentHostingUrl);
      const params = urlObj.searchParams;
      
      // Remove UTM parameters
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        params.delete(param);
      });
      
      return urlObj.pathname + urlObj.search;
    } catch {
      return url;
    }
  }
}

// React hook for URL management
export const useURLUtils = () => {
  return {
    generateSlug: URLUtils.generateSlug,
    getCanonicalUrl: URLUtils.getCanonicalUrl,
    getAbsoluteUrl: URLUtils.getAbsoluteUrl,
    getCourseUrl: URLUtils.getCourseUrl,
    getEvidenceUrl: URLUtils.getEvidenceUrl,
    getLessonUrl: URLUtils.getLessonUrl,
    getBreadcrumbUrls: URLUtils.getBreadcrumbUrls,
    isCanonicalUrl: URLUtils.isCanonicalUrl,
    getCanonicalRedirectUrl: URLUtils.getCanonicalRedirectUrl,
    addUTMParams: URLUtils.addUTMParams,
    cleanUrlForAnalytics: URLUtils.cleanUrlForAnalytics,
  };
};
