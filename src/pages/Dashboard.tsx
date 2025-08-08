import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  useTheme,
  CircularProgress,
  Divider,
} from '@mui/material';

import {
  Close,
  Flag,
  School,
  Spa,
  Build,
  Public,
  FitnessCenter,
  Psychology,
  Restaurant,
  Group,
  VerifiedUser,
  Schedule,
  People,
  Science,
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
import { dashboardSettingsService, DashboardSettings } from '../services/dashboardSettingsService';
import { useAnalytics } from '../hooks/useAnalytics';
import { ScientificUpdate } from '../types';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import ProgramCard from '../components/ProgramCard';
import TransformationJourney from '../components/TransformationJourney';
import TrustIndicators from '../components/TrustIndicators';
import ApproachWorks from '../components/ApproachWorks';

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
  const resolvedCurrentCohort = useMemo(() => {
    if (!currentEnrollment) return null;
    
    let cohort = cohorts.find(c => c.id === currentEnrollment.cohortId) || null;
    
    // If no cohort found but user is enrolled, create a fallback cohort
    if (!cohort && isEnrolled) {
      console.warn('⚠️ No cohort found for enrollment:', {
        enrollmentId: currentEnrollment.id,
        cohortId: currentEnrollment.cohortId,
        availableCohorts: cohorts.map(c => ({ id: c.id, name: c.name }))
      });
      
      // Create a fallback cohort for immediate use
      cohort = {
        id: currentEnrollment.cohortId,
        courseId: currentEnrollment.courseId,
        name: 'Fallback Cohort',
        startDate: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // 7 days ago
        endDate: Timestamp.fromDate(new Date(Date.now() + 7 * 7 * 24 * 60 * 60 * 1000)), // 7 weeks from now
        maxStudents: 50,
        currentStudents: 1,
        status: 'active' as const,
        weeklyReleaseTime: '08:00',
        // Add required pricing fields
        pricing: {
          basePrice: 0,
          currency: 'EUR',
          isFree: true,
          tier: 'basic' as const
        },
        coupons: []
      };
    }
    
    return cohort;
  }, [currentEnrollment, cohorts, isEnrolled]);
  
  const cohortHasStarted = useMemo(() => 
    resolvedCurrentCohort && new Date() >= resolvedCurrentCohort.startDate.toDate(), 
    [resolvedCurrentCohort]
  );
  
  const isActiveStudent = useMemo(() => 
    isEnrolled && cohortHasStarted, 
    [isEnrolled, cohortHasStarted]
  );

  const hasEnrollmentButNoCohort = useMemo(() => 
    isEnrolled && !resolvedCurrentCohort, 
    [isEnrolled, resolvedCurrentCohort]
  );
  
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

  // Dashboard Settings
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({
    showHeroVideo: true,
    heroVideoUrl: 'https://www.youtube.com/embed/tIPKZeevwy8',
    heroVideoTitle: 'Latest Live Q&A Session - The Reverse Aging Challenge'
  });



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

  // Load dashboard settings
  useEffect(() => {
    const loadDashboardSettings = async () => {
      try {
        const settings = await dashboardSettingsService.getDashboardSettings();
        setDashboardSettings(settings);
      } catch (error) {
        console.error('Error loading dashboard settings:', error);
      }
    };

    loadDashboardSettings();
  }, []);

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

  const refreshUnreadCount = useCallback(async () => {
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
  }, [currentUser?.id]);

  // Reset notification dismissed state when new unread items arrive
  useEffect(() => {
    if (unreadUpdatesCount > 0) {
      setNotificationDismissed(false);
    }
  }, [unreadUpdatesCount]);

  // Use real data from Firestore
  const activeCohort = resolvedCurrentCohort;
  const activeCourseLessons = useMemo(() => 
    currentEnrollment ? getLessonsByCourse(currentEnrollment.courseId) : [], 
    [currentEnrollment, getLessonsByCourse]
  );
  const currentWeek = activeCohort ? getCurrentWeek(activeCohort) : 0;
  
  const currentCourse = useMemo(() => 
    courses.find(course => course.id === currentEnrollment?.courseId), 
    [courses, currentEnrollment?.courseId]
  );

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








  // Calculate progress and timing
  const progressData = useMemo(() => {
  const totalLessons = activeCourseLessons.length;
  const completedLessons = lessonProgress.filter(p => p.isCompleted).length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    
    return {
      totalLessons,
      completedLessons,
      progressPercentage
    };
  }, [activeCourseLessons, lessonProgress]);





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

  // Memoize event handlers
  const handleLessonClick = useCallback((lessonId: string) => {
    if (!currentEnrollment) return;
    navigate(`/course/${currentEnrollment.courseId}/lesson/${lessonId}`);
    trackEvent.trackEvent('lesson_click', { lessonId, courseId: currentEnrollment.courseId });
  }, [currentEnrollment, navigate, trackEvent]);

  const handleEvidenceClick = useCallback(() => {
    navigate('/evidence');
    trackEvent.ctaClick('view_evidence', '/dashboard');
  }, [navigate, trackEvent]);



  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center', backgroundColor: theme.palette.background.default }}>
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
        <Box sx={{ py: 4, textAlign: 'center', backgroundColor: theme.palette.background.default }}>
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
        <Box sx={{ py: 4, backgroundColor: theme.palette.background.default }}>
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
        <Box sx={{ py: 4, textAlign: 'center', backgroundColor: theme.palette.background.default }}>
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
        <Box sx={{ py: 4, backgroundColor: theme.palette.background.default }}>
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
                      label={`${progressData.completedLessons}/${progressData.totalLessons} lessons completed`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={progressData.progressPercentage} 
                    sx={{ height: 12, borderRadius: 6, mb: 2 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {progressData.progressPercentage.toFixed(0)}% complete • {progressData.totalLessons - progressData.completedLessons} lessons remaining
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
      <Box sx={{ py: 4, backgroundColor: theme.palette.background.default }}>
        {/* YouTube Video Hero Section */}
        {dashboardSettings.showHeroVideo && (
        <Card sx={{ mb: 4, overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
              <iframe
                  src={dashboardSettings.heroVideoUrl}
                  title={dashboardSettings.heroVideoTitle}
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
        )}

        {/* Welcome & Mission Statement - Reorganized for Free Account Users */}
        <Box sx={{ mb: 6 }}>
          {/* Welcome Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
              Welcome to The Reverse Aging Academy
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: 600, mx: 'auto' }}>
              You now have access to our evolving library of healthspan science and a community of like-minded individuals
            </Typography>
          </Box>

                    {/* Latest Scientific Evidence - Moved to top */}
          <Card sx={{ mb: 6, border: '1px solid', borderColor: 'rgba(80, 235, 151, 0.3)', backgroundColor: 'rgba(80, 235, 151, 0.02)' }}>
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
                    <Card 
                      key={study.id} 
                      sx={{ 
                        p: 3, 
                    border: '1px solid', 
                    borderColor: 'grey.200',
                    backgroundColor: 'white',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                        cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.light',
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                      }}
                      onClick={() => navigate(`/evidence/${study.id}`)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/evidence?category=${encodeURIComponent(study.category)}`);
                          }}
                        sx={{ 
                          ml: 2,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          backgroundColor: '#2E7D32',
                          color: 'white',
                            cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: '#1B5E20'
                          }
                        }}
                      />
              </Box>
              
                    <Typography variant="body1" sx={{ 
                        mb: 2, 
                      lineHeight: 1.7,
                      fontSize: '0.95rem',
                      flex: 1,
                      color: '#333333'
                    }}>
                        {study.summary.length > 200 
                          ? `${study.summary.substring(0, 200)}...` 
                          : study.summary}
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        {study.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Chip 
                            key={tagIndex} 
                            label={tag} 
                            size="small" 
                            variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/evidence?tag=${encodeURIComponent(tag)}`);
                              }}
                            sx={{ 
                              fontSize: '0.7rem',
                              borderColor: '#4CAF50',
                              color: '#2E7D32',
                              fontWeight: 500,
                                cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: '#4CAF50',
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

          {/* Mission & Principles - Three Column Layout */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4, mb: 4 }}>
            {/* Mission Statement */}
            <Card sx={{ 
              p: 4, 
              border: '1px solid', 
              borderColor: 'rgba(80, 235, 151, 0.3)', 
              backgroundColor: 'rgba(80, 235, 151, 0.02)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
                <Box sx={{ 
                      width: 48, 
                      height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                mb: 3
                }}>
                <Flag sx={{ fontSize: 24, color: '#000' }} />
                </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Our Mission
                  </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, flex: 1 }}>
                Help people live longer, healthier lives by unlocking the body's natural anti-aging mechanisms through evidence-based protocols.
                  </Typography>
                </Card>

            {/* Evidence-Based Principle */}
            <Card sx={{ 
              p: 4, 
              border: '1px solid', 
              borderColor: 'rgba(80, 235, 151, 0.3)', 
              backgroundColor: 'rgba(80, 235, 151, 0.02)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                mb: 3
                    }}>
                <Science sx={{ fontSize: 24, color: '#000' }} />
                </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Evidence-Based
                    </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, flex: 1 }}>
                Every practice and protocol is backed by the latest longevity research and peer-reviewed studies.
                  </Typography>
                </Card>

            {/* Community-Driven Principle */}
            <Card sx={{ 
              p: 4, 
              border: '1px solid', 
              borderColor: 'rgba(80, 235, 151, 0.3)', 
              backgroundColor: 'rgba(80, 235, 151, 0.02)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
                <Box sx={{ 
                      width: 48, 
                      height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                mb: 3
                }}>
                <People sx={{ fontSize: 24, color: '#000' }} />
                </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Community-Driven
                  </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, flex: 1 }}>
                Learn alongside like-minded individuals who share your passion for healthspan optimization.
                  </Typography>
                </Card>
                </Box>

              </Box>

        {/* Divider between sections */}
        <Divider sx={{ my: 3, borderColor: 'rgba(80, 235, 151, 0.1)', borderWidth: 1 }} />

        {/* Program Overview Section */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1.5,
              textAlign: 'center'
            }}
          >
            The Reverse Aging Challenge
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.7, fontSize: '1.1rem', textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            The latest research shows that aging is not inevitable. Through targeted interventions in nutrition, movement, breathwork, and lifestyle optimization, 
            we can activate cellular regeneration pathways and optimize our biological age. Join students around the world already transforming their lives through our evidence-based, comprehensive 7-week program. 
            Start your journey today and unlock the secrets to reverse aging naturally through proven scientific protocols.
          </Typography>

          {/* Program Cards */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: theme.palette.text.primary, textAlign: 'center' }}>
              Choose Your Path
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              <ProgramCard
                title="The 7-Week Reverse Aging Challenge"
                description="Our flagship online course is a guided, 7-week experience that teaches you how to integrate the seven core pillars of the Academy: breath, movement, cold, heat, nourish, mindset, and community."
                features={[
                  {
                    icon: <Science />,
                    text: "<strong>Science you can use:</strong> Weekly modules break down the research in plain language."
                  },
                  {
                    icon: <Build />,
                    text: "<strong>Step‑by‑step practices:</strong> Small daily actions stack into lasting change."
                  },
                  {
                    icon: <Public />,
                    text: "<strong>Flexible & accessible:</strong> Join from anywhere, on your own schedule, with lifetime access."
                  }
                ]}
                buttonText="Enroll in Online Course"
                icon={<School />}
                iconColor="primary"
                courseId="hTLj9Lx1MAkBks0INzxS"
              />

              <ProgramCard
                title="The 7-Day Reverse Aging Reset"
                subtitle="Next retreat: October 25-31, 2024"
                description="For those ready to go all in, our 7‑day retreat in the Málaga countryside is an immersive reset."
                features={[
                  {
                    icon: <FitnessCenter />,
                    text: "<strong>Breathwork, cold, and heat exposure</strong> every day, guided by certified instructors"
                  },
                  {
                    icon: <Psychology />,
                    text: "<strong>Movement and mindset training</strong> designed to rewire how your body responds to stress"
                  },
                  {
                    icon: <Restaurant />,
                    text: "<strong>Chef‑prepared, metabolically aligned meals</strong> to fuel the transformation"
                  },
                  {
                    icon: <Group />,
                    text: "<strong>A small, supportive group</strong> creating breakthroughs that last long after you leave"
                  }
                ]}
                buttonText="Apply for In-Person Reset"
                buttonVariant="outlined"
                icon={<Spa />}
                iconColor="secondary"
                externalUrl="https://7weekreverseagingchallenge.com"
              />
            </Box>
          </Box>

          {/* Transformation Journey */}
          <TransformationJourney />
        </Box>

        {/* Why Our Approach Works */}
        <ApproachWorks />

        <Testimonials />



        <FAQ />
      </Box>
    </Container>
  );
};

export default Dashboard;

export {}; 