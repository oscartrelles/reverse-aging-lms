import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

// Custom hook for tracking page views in React components
export const usePageTracking = (pageTitle?: string) => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when component mounts or location changes
    trackPageView(location.pathname, pageTitle);
  }, [location.pathname, pageTitle]);
};

// Hook for tracking specific page types
export const useCoursePageTracking = (courseId?: string) => {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = courseId ? `Course: ${courseId}` : 'Course';
    trackPageView(location.pathname, pageTitle);
  }, [location.pathname, courseId]);
};

export const useLessonPageTracking = (courseId?: string, lessonId?: string) => {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = lessonId ? `Lesson: ${lessonId}` : 'Lesson';
    trackPageView(location.pathname, pageTitle);
  }, [location.pathname, courseId, lessonId]);
}; 