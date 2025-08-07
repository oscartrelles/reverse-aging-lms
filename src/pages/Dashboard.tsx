import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  CircularProgress,
  Divider,
} from '@mui/material';

import {
  Schedule,
  People,
  ChevronLeft,
  ChevronRight,
  ExpandMore,
  Security,
  VerifiedUser,
  Support,
  Science,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCourse } from '../contexts/CourseContext';
import { useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import {
  isLessonAvailable,
  getCurrentWeek,
  getAvailableLessons,
  getUpcomingLessons,
  isLessonReleased,
  isLessonAvailableWithReleases,
} from '../utils/lessonUtils';
import VideoPlayer from '../components/VideoPlayer';
import LessonQA from '../components/LessonQA';
import CommunityPulse from '../components/CommunityPulse';
import { communityService, CommunityStats } from '../services/communityService';
import { scientificUpdateService } from '../services/scientificUpdateService';
import { useAnalytics } from '../hooks/useAnalytics';
import { ScientificUpdate } from '../types';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    courses, 
    enrollments,
    cohorts,
    currentEnrollment, 
    lessonProgress, 
    lessons, 
    getLessonsByCourse, 
    streakData,
    loading,
    loadStreakData
  } = useCourse();
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const theme = useTheme();
  
  // Dashboard states - resolve cohort first
  const isEnrolled = !!currentEnrollment;
  
  // Try to find the current cohort, with fallback logic
  let resolvedCurrentCohort: any = null;
  if (currentEnrollment) {
    resolvedCurrentCohort = cohorts.find(c => c.id === currentEnrollment.cohortId) || null;
    
    // If no cohort found but user is enrolled, create a fallback cohort
    if (!resolvedCurrentCohort && isEnrolled) {
      console.warn('⚠️ No cohort found for enrollment:', {
        enrollmentId: currentEnrollment.id,
        cohortId: currentEnrollment.cohortId,
        availableCohorts: cohorts.map(c => ({ id: c.id, name: c.name }))
      });
      
      // Create a fallback cohort for immediate use
      resolvedCurrentCohort = {
        id: currentEnrollment.cohortId,
        courseId: currentEnrollment.courseId,
        name: 'Fallback Cohort',
        startDate: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // 7 days ago
        endDate: Timestamp.fromDate(new Date(Date.now() + 7 * 7 * 24 * 60 * 60 * 1000)), // 7 weeks from now
        maxStudents: 50,
        currentStudents: 1,
        status: 'active' as const,
        weeklyReleaseTime: '08:00'
      };
    }
  }
  
  const cohortHasStarted = resolvedCurrentCohort && new Date() >= resolvedCurrentCohort.startDate.toDate();
  const isActiveStudent = isEnrolled && cohortHasStarted;

  // Additional safety check - if enrolled but no cohort found, show error state
  const hasEnrollmentButNoCohort = isEnrolled && !resolvedCurrentCohort;
  
  // Trigger profile completion for new social users
  
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [lessonAvailability, setLessonAvailability] = useState<Record<string, boolean>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  
  // Scientific Updates
  const [unreadUpdatesCount, setUnreadUpdatesCount] = useState<number>(0);
  const [loadingUnreadCount, setLoadingUnreadCount] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  // Scientific Evidence Data
  const [evidenceData, setEvidenceData] = useState({
    cellularRegeneration: 0,
    nutritionOptimization: 0,
    coldExposure: 0,
    totalStudies: 0
  });
  const [latestStudies, setLatestStudies] = useState<ScientificUpdate[]>([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  const testimonials = [
    {
      text: "Oscar has a calm confidence and genuine passion for what he teaches. His guidance was clear and supportive, making the experience accessible even for beginners. I left feeling invigorated and with tools I can use every day.",
      author: "Pablo L."
    },
    {
      text: "Since the first moment I met Oscar, I knew I had met someone special. He transmits a positive energy that makes you feel safe and confident to explore new practices. Thank you for such a transformative experience.",
      author: "Spencer F."
    },
    {
      text: "Oscar is a fantastic instructor who creates memorable and engaging experiences. His ability to explain concepts and hold space is truly special.",
      author: "Abbie G."
    },
    {
      text: "What I valued most was how Oscar helped me unlock internal blocks that were holding me back. As a result, I'm able to live out my potential more fully and confidently.",
      author: "Viyan N."
    },
    {
      text: "Oscar has a way of guiding you to celebrate your journey and recognize the abundance in your life. His approach is compassionate, non-judgmental, and deeply grounding.",
      author: "Lucy Y."
    },
    {
      text: "Working with Oscar has been transformative. He helped me gain clarity, define my vision, and most importantly, believe in myself and my capabilities.",
      author: "Adina D."
    }
  ];

  // Track user activity for community stats
  useEffect(() => {
    if (!currentUser) return;

    // Update user status when component mounts
    communityService.updateUserStatus(currentUser.id, true);

    // Update user status every 2 minutes to show as "online"
    const activityInterval = setInterval(() => {
      communityService.updateUserStatus(currentUser.id, true);
    }, 120000); // 2 minutes

    // Update user status when user leaves the page
    const handleBeforeUnload = () => {
      communityService.updateUserStatus(currentUser.id, false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(activityInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      communityService.updateUserStatus(currentUser.id, false);
    };
  }, [currentUser]);

  // Fetch community stats and unread updates (only on mount)
  useEffect(() => {
    const fetchCommunityStats = async () => {
      if (!resolvedCurrentCohort?.id) return;

      try {
        const stats = await communityService.getCommunityStats(resolvedCurrentCohort.id);
        setCommunityStats(stats);
      } catch (error) {
        console.error('Error fetching community stats:', error);
      }
    };

    const fetchUnreadCount = async () => {
      if (!currentUser?.id) return;
      
      setLoadingUnreadCount(true);
      try {
        const count = await scientificUpdateService.getUnreadCount(currentUser.id);
        setUnreadUpdatesCount(count);
      } catch (error) {
        console.error('Error fetching unread updates count:', error);
      } finally {
        setLoadingUnreadCount(false);
      }
    };

    fetchCommunityStats();
    fetchUnreadCount();
  }, [resolvedCurrentCohort?.id, currentUser?.id]);

  // Fetch evidence data independently (for all users, including unenrolled)
  useEffect(() => {
    const fetchEvidenceData = async () => {
      try {
        const updates = await scientificUpdateService.getAllUpdates();
        const latest = updates.slice(0, 3);
        setLatestStudies(latest);
        
        // Count studies by category
        const cellularRegeneration = updates.filter(u => 
          u.category === 'Movement' || u.tags.some(tag => 
            tag.toLowerCase().includes('cellular') || 
            tag.toLowerCase().includes('regeneration') ||
            tag.toLowerCase().includes('telomere')
          )
        ).length;
        
        const nutritionOptimization = updates.filter(u => 
          u.category === 'Nourishment' || u.tags.some(tag => 
            tag.toLowerCase().includes('nutrition') || 
            tag.toLowerCase().includes('diet') ||
            tag.toLowerCase().includes('supplement')
          )
        ).length;
        
        const coldExposure = updates.filter(u => 
          u.category === 'Cold' || u.tags.some(tag => 
            tag.toLowerCase().includes('cold') || 
            tag.toLowerCase().includes('exposure') ||
            tag.toLowerCase().includes('therapy')
          )
        ).length;
        
        setEvidenceData({
          cellularRegeneration,
          nutritionOptimization,
          coldExposure,
          totalStudies: updates.length
        });
      } catch (error) {
        console.error('Error fetching evidence data:', error);
      }
    };

    fetchEvidenceData();
  }, []); // Run only once on mount

  // Function to refresh unread count (can be called when returning from evidence page)
  const refreshUnreadCount = async () => {
    if (!currentUser?.id) return;
    
    setLoadingUnreadCount(true);
    try {
      const count = await scientificUpdateService.getUnreadCount(currentUser.id);
      setUnreadUpdatesCount(count);
    } catch (error) {
      console.error('Error refreshing unread updates count:', error);
    } finally {
      setLoadingUnreadCount(false);
    }
  };

  // Refresh unread count when user returns to the dashboard tab
  useEffect(() => {
    const handleFocus = () => {
      refreshUnreadCount();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUser?.id]);

  // Reset notification dismissed state when new unread items arrive
  useEffect(() => {
    if (unreadUpdatesCount > 0) {
      setNotificationDismissed(false);
    }
  }, [unreadUpdatesCount]);

  // Use real data from Firestore
  const activeCohort = resolvedCurrentCohort;
  const activeCourseLessons = currentEnrollment ? getLessonsByCourse(currentEnrollment.courseId) : [];
  const currentWeek = activeCohort ? getCurrentWeek(activeCohort) : 0;
  
  // Get the current course data
  const currentCourse = courses.find(course => course.id === currentEnrollment?.courseId);

  const availableLessons = activeCohort && currentEnrollment ? getAvailableLessons(activeCourseLessons, activeCohort, currentEnrollment) : [];
  const upcomingLessons = activeCohort && currentEnrollment ? getUpcomingLessons(activeCourseLessons, activeCohort, currentEnrollment) : [];

  // Check lesson availability using the new release system
  useEffect(() => {
    const checkLessonAvailability = async () => {
      if (!activeCohort || !activeCourseLessons.length) return;
      
      setLoadingAvailability(true);
      const availability: Record<string, boolean> = {};
      
      for (const lesson of activeCourseLessons) {
        try {
          const isReleased = await isLessonAvailableWithReleases(
            lesson.id, 
            activeCohort.id, 
            currentUser?.timezone
          );
          availability[lesson.id] = isReleased;
        } catch (error) {
          console.error(`Error checking availability for lesson ${lesson.id}:`, error);
          // Fall back to time-based logic
          availability[lesson.id] = isLessonAvailable(lesson, activeCohort, currentEnrollment || {} as any);
        }
      }
      
      setLessonAvailability(availability);
      setLoadingAvailability(false);
    };

    checkLessonAvailability();
  }, [activeCohort?.id, activeCourseLessons.length, currentEnrollment?.id]);






  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Calculate progress and timing
  const totalLessons = activeCourseLessons.length;
  const completedLessons = lessonProgress.filter(p => p.isCompleted).length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;





  // Fetch community stats for enrolled users
  useEffect(() => {
    const fetchCommunityStats = async () => {
      if (!resolvedCurrentCohort?.id || !isEnrolled) return;

      try {
        const stats = await communityService.getCommunityStats(resolvedCurrentCohort.id);
        setCommunityStats(stats);
      } catch (error) {
        console.error('Error fetching community stats:', error);
      }
    };

    fetchCommunityStats();
  }, [resolvedCurrentCohort?.id, isEnrolled]);

  // Get course and lessons data
  const courseId = currentEnrollment?.courseId;
  const course = courses.find(c => c.id === courseId);
  const courseLessons = courseId ? getLessonsByCourse(courseId) : [];

  // Find the next upcoming cohort for unenrolled users
  const nextUpcomingCohort = cohorts
    .filter(cohort => cohort.status === 'upcoming')
    .sort((a, b) => a.startDate.toDate().getTime() - b.startDate.toDate().getTime())[0];



  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading your dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  // Additional loading check - if we have an enrollment but cohorts are still loading
  if (currentEnrollment && cohorts.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading cohort information...</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Enrollment ID: {currentEnrollment.id} | Cohort ID: {currentEnrollment.cohortId}
          </Typography>
        </Box>
      </Container>
    );
  }

  // State 1: Enrolled but cohort hasn't started
  if (isEnrolled && !cohortHasStarted && resolvedCurrentCohort) {
    const daysUntilStart = differenceInDays(resolvedCurrentCohort.startDate.toDate(), new Date());
    
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Hero Section - Matching Landing Page Style */}
          <Card sx={{ 
            mb: 4, 
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 50%, ${theme.palette.background.default} 100%)`,
            color: theme.palette.text.primary,
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'rgba(80, 235, 151, 0.15)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 20% 80%, ${theme.palette.primary.main}15 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${theme.palette.primary.main}10 0%, transparent 50%)`,
              pointerEvents: 'none',
            }
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                Welcome to The Reverse Aging Challenge!
              </Typography>
              <Typography variant="h5" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                Your transformation journey begins in {daysUntilStart} days
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3 }}>
                <Schedule sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  {daysUntilStart} days until your cohort starts
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                Get ready to join {resolvedCurrentCohort.currentStudents} other students on this life-changing journey
              </Typography>

              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: '#000',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 4px 14px ${theme.palette.primary.main}40`,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${theme.palette.primary.main}60`,
                  },
                }}
              >
                Prepare for Your Journey
              </Button>
            </CardContent>
          </Card>

          {/* Community Preview - Connected to Real Data */}
          <Card sx={{ mb: 4, border: '1px solid', borderColor: 'rgba(80, 235, 151, 0.15)', backgroundColor: 'rgba(80, 235, 151, 0.02)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                Meet Your Community
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <People sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                  {resolvedCurrentCohort.currentStudents} students are preparing with you
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You'll be learning alongside a supportive community of health enthusiasts
              </Typography>
              
              {/* Community Stats */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mt: 3 }}>
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                  borderRadius: 2, 
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>
                    {resolvedCurrentCohort.currentStudents}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Total Cohort Size
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                  borderRadius: 2, 
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>
                    {daysUntilStart}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Days Until Start
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                  borderRadius: 2, 
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>
                    {communityStats?.academyUsersOnline || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Academy Online Now
                  </Typography>
                </Box>
              </Box>
              
              {/* Additional Community Info */}
              {communityStats && (
                <Box sx={{ mt: 3, p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center' }}>
                    <strong>Community Engagement:</strong> {communityStats.engagementScore} • 
                    <strong> Questions This Week:</strong> {communityStats.questionsLastWeek} • 
                    <strong> Active Streaks:</strong> {communityStats.hotStreak}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Detailed Week Cards */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
              Your 7-Week Journey
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {courseLessons.map((lesson) => (
              <Card 
                  key={lesson.id}
                sx={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: 'rgba(80, 235, 151, 0.15)',
                  '&:hover': { 
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 8px 25px rgba(80, 235, 151, 0.2)' 
                  }
                }}
                  onClick={() => setExpandedWeek(expandedWeek === lesson.weekNumber ? null : lesson.weekNumber)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        backgroundColor: 'primary.main', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}>
                        <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold' }}>
                            {lesson.weekNumber}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Week {lesson.weekNumber}: {lesson.title}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ color: 'primary.main' }}>
                        {expandedWeek === lesson.weekNumber ? '−' : '+'}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {lesson.theme || lesson.description}
                  </Typography>
                  
                    {expandedWeek === lesson.weekNumber && (
                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                          <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                              Learning Objectives:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                              {lesson.learningObjectives.map((objective: string, index: number) => (
                                <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <span style={{ color: '#50EB97' }}>•</span> {objective}
                        </Typography>
                              ))}
                      </Box>
                          </>
                        )}
                        {lesson.whatYoullMaster && lesson.whatYoullMaster.length > 0 && (
                          <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                              Key Concepts:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                              {lesson.whatYoullMaster.map((point: string, index: number) => (
                                <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <span style={{ color: '#50EB97' }}>•</span> {point}
                        </Typography>
                              ))}
                      </Box>
                          </>
                        )}
                        {lesson.keyPractice && (
                          <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                        Key Practice:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {lesson.keyPractice}
                      </Typography>
                          </>
                        )}
                    </Box>
                  )}
                </CardContent>
              </Card>
              ))}


                      </Box>
          </Box>
        </Box>
      </Container>
    );
  }

  // State 2.5: Enrolled but cohort data missing (error state)
  if (hasEnrollmentButNoCohort) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'error.main' }}>
            Cohort Data Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We're having trouble loading your cohort information. Please contact support.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enrollment ID: {currentEnrollment?.id} | Cohort ID: {currentEnrollment?.cohortId}
          </Typography>
        </Box>
      </Container>
    );
  }

  // State 2: Active student in current cohort
  if (isActiveStudent) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Progress Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome back, {currentUser?.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You're making great progress on your health transformation journey
            </Typography>
          </Box>

          {/* Scientific Updates Notifications */}
          {unreadUpdatesCount > 0 && !notificationDismissed ? (
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white', position: 'relative' }}>
              <CardContent sx={{ p: 3 }}>
                {/* Close Button */}
                <IconButton
                  onClick={() => {
                    setNotificationDismissed(true);
                    trackEvent.ctaClick('close_notification', '/dashboard');
                  }}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'white',
                    opacity: 0.8,
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <Close />
                </IconButton>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Science sx={{ fontSize: 32, opacity: 0.9 }} />
                    <Box sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      borderRadius: '50%', 
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 40,
                      minHeight: 40
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {unreadUpdatesCount}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        New Scientific Evidence Available
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Stay ahead with the latest research on healthspan and longevity
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: 'white',
                      color: 'primary.main',
                      px: 2,
                      py: 0.75,
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                    }}
                    onClick={() => {
                      setNotificationDismissed(true);
                      trackEvent.ctaClick('read_updates_button', '/dashboard');
                      navigate('/evidence');
                    }}
                  >
                    Read Updates
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ mb: 3, border: '1px solid rgba(25, 118, 210, 0.2)', backgroundColor: 'rgba(25, 118, 210, 0.02)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Science sx={{ fontSize: 24, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                        Scientific Evidence Library
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Explore the latest research on healthspan and longevity
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => navigate('/evidence')}
                  >
                    Browse Evidence
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'stretch', mb: 3 }}>
            {/* Progress Overview */}
            <Box sx={{ flex: { md: 2 } }}>
              <Card sx={{ border: '1px solid', borderColor: 'rgba(80, 235, 151, 0.15)', backgroundColor: 'rgba(80, 235, 151, 0.02)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Your Progress</Typography>
                    <Chip 
                      label={`${completedLessons}/${totalLessons} lessons completed`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={progressPercentage} 
                    sx={{ height: 12, borderRadius: 6, mb: 2 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {progressPercentage.toFixed(0)}% complete • {totalLessons - completedLessons} lessons remaining
                  </Typography>

                  {/* Cohort Progress and Weekly Goals */}
                  {communityStats && (
                    <Box sx={{ mt: 3 }}>
                      {/* Cohort Progress */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Your cohort progress
                          </Typography>
                          <Typography variant="body2" color="primary.main" fontWeight="medium">
                            {communityStats.cohortProgress >= 0 ? `${communityStats.cohortProgress.toFixed(0)}%` : 'Loading...'}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.max(0, Math.min(100, communityStats.cohortProgress || 0))} 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {communityStats.cohortProgress >= 0 ? 'overall course completion' : 'calculating cohort progress...'}
                        </Typography>
                      </Box>

                      {/* Weekly Goals */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            This week's goals
                          </Typography>
                          <Typography variant="body2" color="success.main" fontWeight="medium">
                            {communityStats.weeklyGoals >= 0 ? `${communityStats.weeklyGoals.toFixed(0)}%` : 'Loading...'}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.max(0, Math.min(100, communityStats.weeklyGoals || 0))} 
                          sx={{ height: 6, borderRadius: 3 }}
                          color="success"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {communityStats.weeklyGoals >= 0 ? 'of cohort completed this week\'s lessons' : 'calculating weekly goals...'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>




                  </Box>

            {/* Sidebar */}
            <Box sx={{ flex: { md: 1 } }}>
              {/* Community Pulse */}
              <CommunityPulse 
                cohortId={resolvedCurrentCohort?.id} 
                sx={{ 
                  border: '1px solid',
                  borderColor: 'rgba(80, 235, 151, 0.15)',
                  backgroundColor: 'rgba(80, 235, 151, 0.02)'
                }}
              />
            </Box>
          </Box>

          {/* Course Content */}
          <Box sx={{ mt: 4 }}>
            {/* Course Title */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {currentCourse?.title || 'Course Lessons'}
            </Typography>
              <Typography variant="body1" color="text.secondary">
                Complete each week's lesson to unlock the next one
              </Typography>
            </Box>
            
            {/* Lesson Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activeCourseLessons.map((lesson) => {
                const isAvailable = lessonAvailability[lesson.id] || false;
                const isCompleted = lessonProgress.find(p => p.lessonId === lesson.id)?.isCompleted;
                
                // Check if previous lessons are completed for sequential access
                const previousLessons = activeCourseLessons.filter(l => l.weekNumber < lesson.weekNumber);
                const previousCompleted = previousLessons.every(l => 
                  lessonProgress.find(p => p.lessonId === l.id)?.isCompleted
                );
                const canAccess = lesson.weekNumber === 1 || previousCompleted;
                const isSequentiallyAvailable = isAvailable && canAccess;
                
                return (
              <Card 
                  key={lesson.id}
                sx={{ 
                  cursor: isSequentiallyAvailable ? 'pointer' : 'default', 
                  transition: 'all 0.3s ease',
                  opacity: isSequentiallyAvailable ? 1 : 0.6,
                  backgroundColor: isSequentiallyAvailable ? 'background.paper' : 'rgba(255,255,255,0.05)',
                  border: '1px solid',
                  borderColor: 'rgba(80, 235, 151, 0.15)',
                  background: isSequentiallyAvailable ? 'rgba(80, 235, 151, 0.02)' : 'rgba(255,255,255,0.05)',
                  '&:hover': isSequentiallyAvailable ? { 
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 8px 25px rgba(80, 235, 151, 0.2)' 
                  } : {}
                }}
                  onClick={() => isSequentiallyAvailable && setExpandedWeek(expandedWeek === lesson.weekNumber ? null : lesson.weekNumber)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        backgroundColor: isCompleted ? 'success.main' : isAvailable ? 'primary.main' : 'rgba(255,255,255,0.2)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <Typography variant="body2" sx={{ color: isCompleted ? '#fff' : isAvailable ? '#000' : 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                            {lesson.weekNumber}
                        </Typography>
                        {isCompleted && (
                      <Box sx={{ 
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            width: 12,
                            height: 12,
                        borderRadius: '50%', 
                            backgroundColor: 'success.main',
                            border: '2px solid white',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}>
                            <Typography variant="caption" sx={{ fontSize: 8, color: 'white', fontWeight: 'bold' }}>
                              ✓
                        </Typography>
                      </Box>
                        )}
                    </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: isAvailable ? 'text.primary' : 'rgba(255,255,255,0.5)' }}>
                          Week {lesson.weekNumber}: {lesson.title}
                    </Typography>
                                                <Typography variant="caption" sx={{ color: isSequentiallyAvailable ? 'primary.main' : 'rgba(255,255,255,0.4)' }}>
                          {isCompleted ? '🎉 Completed' : isSequentiallyAvailable ? '✅ Available' : !isAvailable ? '🔒 Locked' : '⏳ Complete previous lessons first'}
                  </Typography>
                        {!isAvailable && resolvedCurrentCohort && (() => {
                          const releaseDate = new Date(resolvedCurrentCohort.startDate.toDate());
                          releaseDate.setDate(releaseDate.getDate() + (lesson.weekNumber - 1) * 7);
                          releaseDate.setHours(8, 0, 0, 0);
                          return (
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mt: 0.5 }}>
                              📅 Releases {releaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at 8:00 AM
                      </Typography>
                          );
                        })()}
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ color: isAvailable ? 'primary.main' : 'rgba(255,255,255,0.3)' }}>
                        {expandedWeek === lesson.weekNumber ? '−' : '+'}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {lesson.theme || lesson.description}
                  </Typography>
                  
                    {expandedWeek === lesson.weekNumber && (
                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                          <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                              Learning Objectives:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                              {lesson.learningObjectives.map((objective: string, index: number) => (
                                <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <span style={{ color: '#50EB97' }}>•</span> {objective}
                        </Typography>
                              ))}
                      </Box>
                          </>
                        )}
                        {lesson.whatYoullMaster && lesson.whatYoullMaster.length > 0 && (
                          <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                              Key Concepts:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                              {lesson.whatYoullMaster.map((point: string, index: number) => (
                                <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <span style={{ color: '#50EB97' }}>•</span> {point}
                        </Typography>
                              ))}
                      </Box>
                          </>
                        )}
                        {lesson.keyPractice && (
                          <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                        Key Practice:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {lesson.keyPractice}
                      </Typography>
                          </>
                        )}
                        
                        {/* Video Player */}
                        {lesson.videoUrl && isSequentiallyAvailable && (
                          <>
                            <Divider sx={{ my: 2 }} />
                            <VideoPlayer
                              videoUrl={lesson.videoUrl}
                              lessonId={lesson.id}
                              courseId={currentEnrollment?.courseId || ''}
                              videoDuration={lesson.videoDuration}
                              onComplete={() => {
                                // Refresh streak data when lesson is completed
                                loadStreakData();
                              }}
                            />
                          </>
                        )}
                        
                        {/* Sequential Restriction Message */}
                        {lesson.videoUrl && !isSequentiallyAvailable && isAvailable && (
                      <Box sx={{ 
                            p: 3, 
                            backgroundColor: 'warning.light', 
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'warning.main',
                            textAlign: 'center'
                          }}>
                            <Typography variant="h6" sx={{ color: 'warning.dark', mb: 1 }}>
                              🔒 Complete Previous Lessons First
                        </Typography>
                            <Typography variant="body2" sx={{ color: 'warning.dark' }}>
                              You need to complete Week {lesson.weekNumber - 1} before accessing this lesson.
                      </Typography>
                    </Box>
                        )}

                        {/* Q&A Section */}
                        {isAvailable && (
                          <LessonQA
                            lessonId={lesson.id}
                            courseId={currentEnrollment?.courseId || ''}
                            lessonTitle={`Week ${lesson.weekNumber}: ${lesson.title}`}
                            isLessonCompleted={isCompleted}
                          />
                        )}
                    </Box>
                  )}
                </CardContent>
              </Card>
              );
              })}
            </Box>
          </Box>
        </Box>
      </Container>
    );
  }

  // State 3: Not enrolled
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* YouTube Video Hero Section */}
        <Card sx={{ mb: 4, overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
              <iframe
                src="https://www.youtube.com/embed/tIPKZeevwy8"
                title="Latest Live Q&A Session - The Reverse Aging Challenge"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </CardContent>
        </Card>

        {/* Mission Statement - Two Column Layout */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, mb: 6, alignItems: 'flex-start' }}>
          {/* Mission Text - 70% */}
          <Box sx={{ flex: { lg: '0 0 70%' } }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 700, mb: 3 }}>
              Our Mission: Reverse Aging Through Science
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
              We're on a mission to help people live longer, healthier lives by unlocking the body's natural anti-aging mechanisms through evidence-based protocols.
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.7, fontSize: '1.1rem' }}>
              The latest research shows that aging is not inevitable. Through targeted interventions in nutrition, movement, breathwork, and lifestyle optimization, 
              we can activate cellular regeneration pathways and optimize our biological age. Our comprehensive approach combines cutting-edge science with 
              practical, sustainable practices that fit into your daily life.
            </Typography>
          </Box>

          {/* Mission Badges - 30% */}
          <Box sx={{ flex: { lg: '0 0 30%' }, display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
            {/* Evidence-Based Badge */}
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                backgroundColor: 'primary.main', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Science sx={{ fontSize: 24, color: '#000' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                Evidence-Based
            </Typography>
              <Typography variant="body2" color="text.secondary">
                Backed by latest longevity research
              </Typography>
            </Box>
            
            {/* Community-Driven Badge */}
            <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                width: 48, 
                height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <People sx={{ fontSize: 24, color: '#000' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                Community-Driven
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learn alongside like-minded individuals
                  </Typography>
                </Box>
          </Box>
        </Box>

        {/* Latest Scientific Evidence - Panel with 3 Latest Studies */}
        <Card sx={{ mb: 6, border: '1px solid', borderColor: 'primary.light', backgroundColor: 'rgba(80, 235, 151, 0.02)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Science sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                  Latest Scientific Evidence
                  </Typography>
                <Typography variant="body1" color="text.secondary">
                  Stay ahead with cutting-edge research on healthspan and longevity
                  </Typography>
              </Box>
            </Box>
            
            {loadingEvidence ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} color="primary" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading latest research...
                  </Typography>
                </Box>
            ) : latestStudies.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                {latestStudies.map((study, index) => (
                  <Card key={study.id} sx={{ 
                    p: 4, 
                    border: '1px solid', 
                    borderColor: 'grey.200',
                    backgroundColor: 'white',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      borderColor: 'primary.light',
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700, 
                        color: '#1a1a1a', 
                        flex: 1,
                        fontSize: '1.1rem',
                        lineHeight: 1.4
                      }}>
                        {study.title}
                      </Typography>
                      <Chip 
                        label={study.category} 
                        size="small" 
                        variant="filled"
                        sx={{ 
                          ml: 2,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          backgroundColor: '#2E7D32',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#1B5E20'
                          }
                        }}
                      />
              </Box>
              
                    <Typography variant="body1" sx={{ 
                      mb: 3, 
                      lineHeight: 1.7,
                      fontSize: '0.95rem',
                      flex: 1,
                      color: '#333333'
                    }}>
                      {study.summary.length > 250 
                        ? `${study.summary.substring(0, 250)}...` 
                        : study.summary}
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {study.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Chip 
                            key={tagIndex} 
                            label={tag} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              fontSize: '0.7rem',
                              borderColor: '#4CAF50',
                              color: '#2E7D32',
                              fontWeight: 500,
                              '&:hover': {
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                borderColor: '#4CAF50'
                              }
                            }}
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" sx={{ 
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: '#666666'
                      }}>
                        Published {study.publishedDate.toDate().toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No studies available at the moment.
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/evidence')}
                sx={{ fontWeight: 600 }}
              >
                Explore All Scientific Evidence
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Divider between sections */}
        <Divider sx={{ my: 6, borderColor: 'primary.light', borderWidth: 2 }} />

        {/* Program Overview Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 700, mb: 3 }}>
            The Reverse Aging Challenge
          </Typography>
          
                      <Typography variant="h6" sx={{ mb: 3, color: '#ffffff', fontWeight: 600, fontSize: '1.2rem' }}>
              Transform Your Health & Vitality in Just 7 Weeks
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, color: '#e0e0e0', lineHeight: 1.7, fontSize: '1.1rem' }}>
              Join 47 students around the world already transforming their lives through our evidence-based, comprehensive 7-week program. 
              Start your journey today and unlock the secrets to reverse aging naturally through proven scientific protocols.
            </Typography>

            {/* Program Journey */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 4, color: 'primary.main' }}>
                Your Complete Transformation Journey
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                <Card sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', backgroundColor: 'white', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                      width: 48, 
                      height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                      flexShrink: 0
                }}>
                      <Typography variant="h6" sx={{ color: '#000', fontWeight: 'bold' }}>
                        1
                  </Typography>
                </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      Foundation & Mindset
                  </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#333333', lineHeight: 1.6, mb: 2 }}>
                    Build your transformation foundation with proven mindset techniques, goal setting strategies, and understanding the science behind reverse aging.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Mindset', 'Goal Setting', 'Science'].map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.7rem', borderColor: '#4CAF50', color: '#2E7D32' }} />
                    ))}
                  </Box>
                </Card>

                <Card sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', backgroundColor: 'white', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Typography variant="h6" sx={{ color: '#000', fontWeight: 'bold' }}>
                        2
                  </Typography>
                </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      Health Mastery
                    </Typography>
              </Box>
                  <Typography variant="body1" sx={{ color: '#333333', lineHeight: 1.6, mb: 2 }}>
                    Dive deep into nutrition optimization, movement patterns, breathwork techniques, and cold exposure protocols.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Nutrition', 'Movement', 'Breathwork'].map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.7rem', borderColor: '#4CAF50', color: '#2E7D32' }} />
                    ))}
                  </Box>
                </Card>

                <Card sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', backgroundColor: 'white', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                      width: 48, 
                      height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                      flexShrink: 0
                }}>
                                              <Typography variant="h6" sx={{ color: '#000', fontWeight: 'bold' }}>
                          ∞
                  </Typography>
                </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      Lifestyle Integration
                  </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#333333', lineHeight: 1.6, mb: 2 }}>
                    Develop a comprehensive daily routine and integrate these practices seamlessly into your lifestyle for lasting transformation.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Daily Routine', 'Habits', 'Integration'].map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.7rem', borderColor: '#4CAF50', color: '#2E7D32' }} />
                    ))}
                  </Box>
                </Card>
                </Box>
              </Box>
            </Box>

        {/* Why Our Approach Works & Next Cohort - Two Columns */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, mb: 6, alignItems: 'stretch' }}>
          {/* Why Our Approach Works */}
          <Box sx={{ flex: { lg: '0 0 60%' }, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 4, color: 'primary.main' }}>
              Why Our Approach Works
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, flex: 1 }}>
              <Card sx={{ 
                p: 4, 
                background: 'linear-gradient(135deg, rgba(80, 235, 151, 0.05) 0%, rgba(172, 255, 34, 0.02) 100%)',
                border: '1px solid rgba(80, 235, 151, 0.2)',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                  }}>
                    <Science sx={{ fontSize: 24, color: '#ffffff' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Evidence-Based Science
                </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#e0e0e0', lineHeight: 1.7, fontSize: '1rem' }}>
                  All protocols are backed by the latest research in longevity, cellular biology, and anti-aging science.
                </Typography>
              </Card>
              
              <Card sx={{ 
                p: 4, 
                background: 'linear-gradient(135deg, rgba(80, 235, 151, 0.05) 0%, rgba(172, 255, 34, 0.02) 100%)',
                border: '1px solid rgba(80, 235, 151, 0.2)',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                  }}>
                    <People sx={{ fontSize: 24, color: '#ffffff' }} />
              </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Community Support
                </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#e0e0e0', lineHeight: 1.7, fontSize: '1rem' }}>
                  Join a community of like-minded individuals on the same transformation journey.
                </Typography>
              </Card>
              
              <Card sx={{ 
                p: 4, 
                background: 'linear-gradient(135deg, rgba(80, 235, 151, 0.05) 0%, rgba(172, 255, 34, 0.02) 100%)',
                border: '1px solid rgba(80, 235, 151, 0.2)',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                  }}>
                    <Schedule sx={{ fontSize: 24, color: '#ffffff' }} />
              </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Sustainable Integration
                </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#e0e0e0', lineHeight: 1.7, fontSize: '1rem' }}>
                  Designed to fit seamlessly into your daily life with sustainable habits that become part of your lifestyle.
                </Typography>
              </Card>
              
              <Card sx={{ 
                p: 4, 
                background: 'linear-gradient(135deg, rgba(80, 235, 151, 0.05) 0%, rgba(172, 255, 34, 0.02) 100%)',
                border: '1px solid rgba(80, 235, 151, 0.2)',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                  }}>
                    <VerifiedUser sx={{ fontSize: 24, color: '#ffffff' }} />
              </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Proven Results
                </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#e0e0e0', lineHeight: 1.7, fontSize: '1rem' }}>
                  Join hundreds of students who have already transformed their health and vitality.
                </Typography>
              </Card>
            </Box>
          </Box>

          {/* Next Cohort */}
          <Box sx={{ flex: { lg: '0 0 40%' }, display: 'flex', flexDirection: 'column' }}>
            <Card sx={{ border: '1px solid', borderColor: 'primary.light', backgroundColor: 'rgba(80, 235, 151, 0.02)', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
                  Next Cohort Starting
                </Typography>
                {nextUpcomingCohort && (
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    {nextUpcomingCohort.name}
                  </Typography>
                )}
                <Typography variant="h4" color="primary.main" sx={{ mb: 1, fontWeight: 700 }}>
                  {nextUpcomingCohort ? 
                    nextUpcomingCohort.startDate.toDate().toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    }) : 
                    'Coming Soon'
                  }
                </Typography>
                {nextUpcomingCohort && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {nextUpcomingCohort.maxStudents - nextUpcomingCohort.currentStudents} spots available
                  </Typography>
                )}
                  
                {/* Pricing */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ opacity: 0.7, mb: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                      Regular Price: €499
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '2px solid', borderColor: '#4CAF50', textAlign: 'center' }}>
                    <Typography variant="h6" color="#ffffff" sx={{ fontWeight: 700, mb: 1 }}>
                      🎉 Special Launch Offer
                    </Typography>
                    <Typography variant="h3" color="#ffffff" sx={{ fontWeight: 700, mb: 1 }}>
                      €299
                    </Typography>
                    <Typography variant="body2" color="#e0e0e0" sx={{ fontWeight: 600 }}>
                      {nextUpcomingCohort?.enrollmentDeadline ? 
                        `Enroll before ${nextUpcomingCohort.enrollmentDeadline.toDate().toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}` : 
                        'Limited time offer'
                      }
                    </Typography>
                  </Box>
                </Box>

                <Button 
                  variant="contained" 
                  fullWidth
                  size="large"
                  onClick={() => {
                    if (nextUpcomingCohort) {
                      // Navigate to payment with cohort info
                      const course = courses.find(c => c.id === nextUpcomingCohort.courseId);
                      if (course) {
                        navigate(`/payment/${course.id}?cohortId=${nextUpcomingCohort.id}`);
                      } else {
                        navigate('/payment/reverse-aging-challenge');
                      }
                    } else {
                      // Fallback to general payment page
                      const course = courses.find(c => c.title === 'The Reverse Aging Challenge');
                      if (course) {
                        navigate(`/payment/${course.id}`);
                      } else {
                        navigate('/payment/reverse-aging-challenge');
                      }
                    }
                  }}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    py: 2,
                    mb: 3,
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    }
                  }}
                >
                  Join the Challenge
                </Button>

                {/* Trust Badges */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Security sx={{ fontSize: 16, color: '#4CAF50' }} />
                      <Typography variant="caption" color="#e0e0e0">
                    Secure
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <VerifiedUser sx={{ fontSize: 16, color: '#4CAF50' }} />
                      <Typography variant="caption" color="#e0e0e0">
                    Verified
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Support sx={{ fontSize: 16, color: '#4CAF50' }} />
                      <Typography variant="caption" color="#e0e0e0">
                    Support
                  </Typography>
                </Box>
              </Box>
                  <Typography variant="body2" color="#4CAF50" sx={{ fontWeight: 600 }}>
                ✓ 30-Day Money-Back Guarantee
              </Typography>
            </Box>

                {/* In-Person CTA */}
                <Box sx={{ textAlign: 'center', mt: 'auto' }}>
                  <Typography variant="body1" sx={{ mb: 2, color: '#e0e0e0', fontStyle: 'italic' }}>
                Can't wait until November?
              </Typography>
              <Button
                variant="outlined"
                size="medium"
                href="https://7weekreverseagingchallenge.com/#apply"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                      borderColor: '#2E7D32',
                      color: '#2E7D32',
                  fontWeight: 600,
                  '&:hover': {
                        borderColor: '#1B5E20',
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                  }
                }}
              >
                    Apply for In-Person Cohort in Spain
              </Button>
            </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Testimonials Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 4, color: 'primary.main' }}>
            What Our Students Say
          </Typography>
          
          <Card sx={{ 
            maxWidth: 800, 
            mx: 'auto', 
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(80, 235, 151, 0.05) 0%, rgba(172, 255, 34, 0.02) 100%)',
            border: '1px solid rgba(80, 235, 151, 0.2)'
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
              <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600, mb: 3, fontStyle: 'italic' }}>
                  "{testimonials[currentTestimonial].text}"
                </Typography>
              <Typography variant="body1" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                  — {testimonials[currentTestimonial].author}
                </Typography>

              {/* Navigation Dots */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
                {testimonials.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: index === currentTestimonial ? 'primary.main' : 'grey.300',
                      cursor: 'pointer'
                    }}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>



        {/* FAQ Section */}
        <Box sx={{ py: 6 }}>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 4, color: 'primary.main', fontWeight: 600 }}>
            Frequently Asked Questions
          </Typography>
          
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  What if I'm not satisfied with the program?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  We offer a 30-day money-back guarantee. If you're not completely satisfied with the program within the first 30 days, we'll refund your full investment, no questions asked.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Do I need any special equipment or experience?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  No special equipment is required! The program is designed for all fitness levels and can be adapted to your current lifestyle. We'll guide you through everything step-by-step.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  How much time do I need to commit each day?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  Most daily practices take 15-30 minutes. The program is designed to fit into busy schedules, and you can start with as little as 10 minutes per day and gradually increase.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  What if I have more questions?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  Join our next Live Q&A session on August 12th where you can ask Oscar directly! You'll also have access to our community forum and support team throughout the program.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Can I access the materials after the program ends?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  Yes! You get lifetime access to all program materials, updates, and community support. You can revisit the content anytime and continue your transformation journey.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;

export {}; 