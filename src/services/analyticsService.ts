// Analytics Service for Google Analytics 4
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// GA4 Event Types
export interface GA4Event {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// User Properties
export interface UserProperties {
  user_id?: string;
  user_type?: 'student' | 'admin';
  course_enrolled?: string;
  enrollment_status?: 'pending' | 'active' | 'completed';
  signup_source?: 'email' | 'google' | 'facebook';
  cohort_id?: string;
}

// Initialize GA4
export const initializeGA4 = (measurementId: string) => {
  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (page_title: string, page_location?: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
      page_title,
      page_location: page_location || window.location.href,
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, parameters);
  }
};

// Set user properties
export const setUserProperties = (properties: UserProperties) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
      custom_map: {
        'user_id': 'user_id',
        'user_type': 'user_type',
        'course_enrolled': 'course_enrolled',
        'enrollment_status': 'enrollment_status',
        'signup_source': 'signup_source',
        'cohort_id': 'cohort_id',
      },
      ...properties,
    });
  }
};

// Track user identification
export const setUserId = (userId: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
      user_id: userId,
    });
  }
};

// Predefined event tracking functions
export const analyticsEvents = {
  // Generic event tracking
  trackEvent: (eventName: string, parameters?: Record<string, any>) => {
    trackEvent(eventName, parameters);
  },

  // Authentication events
  signUpAttempt: (method: 'email' | 'google' | 'facebook') => {
    trackEvent('sign_up_attempt', {
      method,
      event_category: 'authentication',
    });
  },

  signUpSuccess: (method: 'email' | 'google' | 'facebook') => {
    trackEvent('sign_up_success', {
      method,
      event_category: 'authentication',
    });
  },

  signInAttempt: (method: 'email' | 'google' | 'facebook') => {
    trackEvent('sign_in_attempt', {
      method,
      event_category: 'authentication',
    });
  },

  signInSuccess: (method: 'email' | 'google' | 'facebook') => {
    trackEvent('sign_in_success', {
      method,
      event_category: 'authentication',
    });
  },

  // Course events
  courseEnroll: async (courseId: string, courseName: string, price?: number) => {
    await trackEvent('course_enroll', {
      course_id: courseId,
      course_name: courseName,
      value: price,
      event_category: 'course',
    });
  },

  lessonStart: async (lessonId: string, lessonTitle: string, courseId: string, weekNumber: number) => {
    await trackEvent('lesson_start', {
      lesson_id: lessonId,
      lesson_title: lessonTitle,
      course_id: courseId,
      week_number: weekNumber,
      event_category: 'course',
    });
  },

  lessonComplete: async (lessonId: string, lessonTitle: string, courseId: string, weekNumber: number) => {
    await trackEvent('lesson_complete', {
      lesson_id: lessonId,
      lesson_title: lessonTitle,
      course_id: courseId,
      week_number: weekNumber,
      event_category: 'course',
    });
  },

  courseComplete: async (courseId: string, courseName: string) => {
    await trackEvent('course_complete', {
      course_id: courseId,
      course_name: courseName,
      event_category: 'course',
    });
  },

  // Engagement events
  ctaClick: async (ctaType: string, pageLocation: string) => {
    await trackEvent('cta_click', {
      cta_type: ctaType,
      page_location: pageLocation,
      event_category: 'engagement',
    });
  },

  resourceDownload: async (resourceType: string, resourceTitle: string, courseId: string) => {
    await trackEvent('resource_download', {
      resource_type: resourceType,
      resource_title: resourceTitle,
      course_id: courseId,
      event_category: 'engagement',
    });
  },

  // Community events
  questionAsked: async (questionId: string, courseId: string) => {
    await trackEvent('question_asked', {
      question_id: questionId,
      course_id: courseId,
      event_category: 'community',
    });
  },

  scientificUpdateRead: async (updateId: string, updateTitle: string) => {
    await trackEvent('scientific_update_read', {
      update_id: updateId,
      update_title: updateTitle,
      event_category: 'community',
    });
  },

  // Payment events
  paymentInitiated: async (courseId: string, amount: number, currency: string) => {
    await trackEvent('payment_initiated', {
      course_id: courseId,
      value: amount,
      currency,
      event_category: 'payment',
    });
  },

  paymentCompleted: (courseId: string, amount: number, currency: string) => {
    trackEvent('payment_completed', {
      course_id: courseId,
      value: amount,
      currency,
      event_category: 'payment',
    });
  },
};

// Scroll depth tracking
export const trackScrollDepth = (depth: number) => {
  trackEvent('scroll_depth', {
    depth_percentage: depth,
    event_category: 'engagement',
  });
};

// Time on page tracking
export const trackTimeOnPage = (timeSpent: number, pageTitle: string) => {
  trackEvent('time_on_page', {
    time_spent_seconds: timeSpent,
    page_title: pageTitle,
    event_category: 'engagement',
  });
}; 