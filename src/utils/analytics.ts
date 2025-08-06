// Analytics utility for SPA page tracking

// Track page view for SPA navigation
export const trackPageView = (path: string, title?: string) => {
  // Check if Google Analytics is available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID || '', {
      page_path: path,
      page_title: title || document.title
    });
  }
  
  // Also track with Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: title || document.title,
      page_location: window.location.href,
      page_path: path
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Track user engagement
export const trackEngagement = (action: string, category: string, label?: string, value?: number) => {
  trackEvent('engagement', {
    event_category: category,
    event_label: label,
    value: value,
    action: action
  });
};

// Track course interactions
export const trackCourseInteraction = (action: string, courseId?: string, lessonId?: string) => {
  trackEvent('course_interaction', {
    event_category: 'course',
    event_label: action,
    course_id: courseId,
    lesson_id: lessonId
  });
};

// Track enrollment events
export const trackEnrollment = (action: string, courseId?: string, cohortId?: string) => {
  trackEvent('enrollment', {
    event_category: 'enrollment',
    event_label: action,
    course_id: courseId,
    cohort_id: cohortId
  });
};

// Initialize analytics for SPA
export const initializeSPAAnalytics = () => {
  // Track initial page load
  trackPageView(window.location.pathname);
  
  // Set up history listener for SPA navigation
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  
  window.history.pushState = function(...args) {
    originalPushState.apply(window.history, args);
    trackPageView(window.location.pathname);
  };
  
  window.history.replaceState = function(...args) {
    originalReplaceState.apply(window.history, args);
    trackPageView(window.location.pathname);
  };
  
  // Listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    trackPageView(window.location.pathname);
  });
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
} 