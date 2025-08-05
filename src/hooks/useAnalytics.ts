import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCourse } from '../contexts/CourseContext';
import { 
  trackPageView, 
  setUserId, 
  setUserProperties, 
  analyticsEvents,
  trackScrollDepth,
  trackTimeOnPage 
} from '../services/analyticsService';

export const useAnalytics = () => {
  const location = useLocation();
  const { currentUser, firebaseUser } = useAuth();
  const { currentEnrollment, currentCohort } = useCourse();

  // Track page views on route changes
  useEffect(() => {
    if (process.env.REACT_APP_GA_MEASUREMENT_ID) {
      trackPageView(document.title, window.location.href);
    }
  }, [location]);

  // Set user properties when user data changes
  useEffect(() => {
    if (currentUser && process.env.REACT_APP_GA_MEASUREMENT_ID) {
      // Set user ID
      setUserId(currentUser.id);

      // Set user properties
      setUserProperties({
        user_id: currentUser.id,
        user_type: currentUser.isAdmin ? 'admin' : 'student',
        signup_source: currentUser.authProvider || 'email',
        course_enrolled: currentEnrollment?.courseId,
        enrollment_status: currentEnrollment?.status === 'cancelled' ? 'completed' : currentEnrollment?.status,
        cohort_id: currentCohort?.id,
      });
    }
  }, [currentUser, currentEnrollment, currentCohort]);

  // Scroll depth tracking
  const trackScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    // Track at 25%, 50%, 75%, and 100%
    if ([25, 50, 75, 100].includes(scrollPercent)) {
      trackScrollDepth(scrollPercent);
    }
  }, []);

  // Time on page tracking
  useEffect(() => {
    let startTime = Date.now();
    let intervalId: NodeJS.Timeout;

    const trackTime = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackTimeOnPage(timeSpent, document.title);
    };

    // Track time every 30 seconds
    intervalId = setInterval(trackTime, 30000);

    // Track time when leaving page
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackTimeOnPage(timeSpent, document.title);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', trackScroll);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', trackScroll);
    };
  }, [trackScroll]);

  return {
    trackEvent: analyticsEvents,
    trackPageView,
    setUserId,
    setUserProperties,
  };
}; 