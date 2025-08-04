import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Analytics,
  PlayArrow,
  CheckCircle,
  QuestionAnswer,
  Science,
  Payment,
  Person,
} from '@mui/icons-material';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useAuth } from '../../contexts/AuthContext';
import { useCourse } from '../../contexts/CourseContext';

interface AnalyticsEvent {
  id: string;
  event: string;
  timestamp: Date;
  parameters: Record<string, any>;
}

export const AnalyticsDashboard: React.FC = () => {
  const { trackEvent } = useAnalytics();
  const { currentUser } = useAuth();
  const { currentEnrollment, currentCohort } = useCourse();
  
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  // Track events in local state for demo purposes
  const trackLocalEvent = (eventName: string, parameters: Record<string, any>) => {
    const newEvent: AnalyticsEvent = {
      id: Date.now().toString(),
      event: eventName,
      timestamp: new Date(),
      parameters,
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 9)]); // Keep last 10 events
  };

  // Test authentication events
  const testAuthEvents = () => {
    trackEvent.signUpAttempt('email');
    trackLocalEvent('sign_up_attempt', { method: 'email' });
    
    setTimeout(() => {
      trackEvent.signUpSuccess('email');
      trackLocalEvent('sign_up_success', { method: 'email' });
    }, 1000);
  };

  // Test course events
  const testCourseEvents = () => {
    trackEvent.courseEnroll('test-course', 'Test Course', 99.99);
    trackLocalEvent('course_enroll', { 
      course_id: 'test-course', 
      course_name: 'Test Course', 
      value: 99.99 
    });
    
    setTimeout(() => {
      trackEvent.lessonStart('test-lesson', 'Test Lesson', 'test-course', 1);
      trackLocalEvent('lesson_start', { 
        lesson_id: 'test-lesson', 
        lesson_title: 'Test Lesson', 
        course_id: 'test-course', 
        week_number: 1 
      });
    }, 1000);
  };

  // Test engagement events
  const testEngagementEvents = () => {
    trackEvent.ctaClick('test_button', '/test-page');
    trackLocalEvent('cta_click', { cta_type: 'test_button', page_location: '/test-page' });
    
    trackEvent.resourceDownload('pdf', 'Test Resource', 'test-course');
    trackLocalEvent('resource_download', { 
      resource_type: 'pdf', 
      resource_title: 'Test Resource', 
      course_id: 'test-course' 
    });
  };

  // Test community events
  const testCommunityEvents = () => {
    trackEvent.questionAsked('test-question', 'test-course');
    trackLocalEvent('question_asked', { question_id: 'test-question', course_id: 'test-course' });
    
    trackEvent.scientificUpdateRead('test-update', 'Test Scientific Update');
    trackLocalEvent('scientific_update_read', { 
      update_id: 'test-update', 
      update_title: 'Test Scientific Update' 
    });
  };

  // Test payment events
  const testPaymentEvents = () => {
    trackEvent.paymentInitiated('test-course', 99.99, 'USD');
    trackLocalEvent('payment_initiated', { 
      course_id: 'test-course', 
      value: 99.99, 
      currency: 'USD' 
    });
    
    setTimeout(() => {
      trackEvent.paymentCompleted('test-course', 99.99, 'USD');
      trackLocalEvent('payment_completed', { 
        course_id: 'test-course', 
        value: 99.99, 
        currency: 'USD' 
      });
    }, 1000);
  };

  // Test all events
  const testAllEvents = () => {
    setIsTracking(true);
    
    // Test all event types
    testAuthEvents();
    
    setTimeout(() => testCourseEvents(), 2000);
    setTimeout(() => testEngagementEvents(), 4000);
    setTimeout(() => testCommunityEvents(), 6000);
    setTimeout(() => testPaymentEvents(), 8000);
    setTimeout(() => setIsTracking(false), 10000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Analytics />
        Analytics Dashboard
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This dashboard shows real-time analytics events and allows testing of various tracking functions.
        Events are tracked both locally (for display) and sent to Google Analytics.
      </Alert>

      {/* User Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Current User</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                User ID: {currentUser?.id || 'Not logged in'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                User Type: {currentUser?.isAdmin ? 'Admin' : 'Student'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Course: {currentEnrollment?.courseId || 'Not enrolled'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cohort: {currentCohort?.name || 'No cohort'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Test Analytics Events</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Person />}
              onClick={testAuthEvents}
              fullWidth
              disabled={isTracking}
            >
              Test Auth
            </Button>
            <Button
              variant="outlined"
              startIcon={<PlayArrow />}
              onClick={testCourseEvents}
              fullWidth
              disabled={isTracking}
            >
              Test Course
            </Button>
            <Button
              variant="outlined"
              startIcon={<QuestionAnswer />}
              onClick={testCommunityEvents}
              fullWidth
              disabled={isTracking}
            >
              Test Community
            </Button>
            <Button
              variant="outlined"
              startIcon={<Payment />}
              onClick={testPaymentEvents}
              fullWidth
              disabled={isTracking}
            >
              Test Payment
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={isTracking ? <CircularProgress size={20} /> : <Analytics />}
              onClick={testAllEvents}
              fullWidth
              disabled={isTracking}
            >
              {isTracking ? 'Testing All Events...' : 'Test All Events'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Recent Analytics Events</Typography>
          {events.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No events tracked yet. Click the test buttons above to see events.
            </Typography>
          ) : (
            <Box>
              {events.map((event) => (
                <Box key={event.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {event.event}
                    </Typography>
                    <Chip 
                      label={event.timestamp.toLocaleTimeString()} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    {JSON.stringify(event.parameters, null, 2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}; 