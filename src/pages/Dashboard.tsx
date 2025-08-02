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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import {
  PlayCircle,
  CheckCircle,
  Schedule,
  People,
  TrendingUp,
  EmojiEvents,
  AccessTime,
  School,
  ChevronLeft,
  ChevronRight,
  ExpandMore,
  Security,
  VerifiedUser,
  Support,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCourse } from '../contexts/CourseContext';
import { useNavigate } from 'react-router-dom';
import { format, addDays, differenceInDays, differenceInHours } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import {
  isLessonAvailable,
  getCurrentWeek,
  getCountdownToNextLesson,
  getAvailableLessons,
  getUpcomingLessons,
  getCohortStatus,
  isLessonReleased,
} from '../utils/lessonUtils';
import VideoPlayer from '../components/VideoPlayer';
import LessonQA from '../components/LessonQA';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    courses, 
    currentEnrollment, 
    currentCohort, 
    lessonProgress, 
    lessons, 
    getLessonsByCourse, 
    streakData,
    loading,
    loadStreakData
  } = useCourse();
  const navigate = useNavigate();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [lessonAvailability, setLessonAvailability] = useState<Record<string, boolean>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Use real data from Firestore
  const activeCohort = currentCohort;
  const activeCourseLessons = currentEnrollment ? getLessonsByCourse(currentEnrollment.courseId) : [];
  const currentWeek = activeCohort ? getCurrentWeek(activeCohort) : 0;
  

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
          const isReleased = await isLessonReleased(lesson.id, activeCohort.id);
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


  // Community stats - replace with real data later
  const [communityStats] = useState({
    activeStudents: 47,
    totalQuestions: 23,
    lastActivity: Timestamp.now(),
  });

  const [recentQuestions] = useState([
    {
      id: '1',
      question: 'How long should I practice the breathing exercise?',
      studentName: 'Student A',
      timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
    },
    {
      id: '2',
      question: 'Can I do the morning routine in the evening?',
      studentName: 'Student B',
      timestamp: Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)), // 4 hours ago
    },
  ]);

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

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

  // Countdown timer logic
  useEffect(() => {
    // Set deadline to September 30, 2025 at 11:59:59 PM
    const deadline = new Date(2025, 8, 30, 23, 59, 59).getTime(); // Month is 0-indexed, so 8 = September

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = deadline - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Update immediately
    updateTimer();
    
    // Then update every second
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate progress and timing
  const totalLessons = activeCourseLessons.length;
  const completedLessons = lessonProgress.filter(p => p.isCompleted).length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const getNextLessonRelease = () => {
    if (!currentCohort) return null;
    const now = new Date();
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + (6 - now.getDay() + 7) % 7);
    nextSaturday.setHours(8, 0, 0, 0);
    return nextSaturday;
  };

  const nextLessonRelease = getNextLessonRelease();
  const daysUntilNextLesson = nextLessonRelease 
    ? differenceInDays(nextLessonRelease, new Date())
    : 0;
  const hoursUntilNextLesson = nextLessonRelease 
    ? differenceInHours(nextLessonRelease, new Date())
    : 0;

  // Dashboard states
  const isEnrolled = currentEnrollment && currentEnrollment.status === 'active';
  const cohortHasStarted = currentCohort && new Date() >= currentCohort.startDate.toDate();
  const isActiveStudent = isEnrolled && cohortHasStarted;

  // Get course and lessons data
  const courseId = currentEnrollment?.courseId;
  const course = courses.find(c => c.id === courseId);
  const courseLessons = courseId ? getLessonsByCourse(courseId) : [];



  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6">Loading your dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  // State 1: Enrolled but cohort hasn't started
  if (isEnrolled && !cohortHasStarted && currentCohort) {
    const daysUntilStart = differenceInDays(currentCohort.startDate.toDate(), new Date());
    
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Hero Section */}
          <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #4A7B63 0%, #9AB5A7 100%)', color: 'white' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                Welcome to The Reverse Aging Challenge!
              </Typography>
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                Your transformation journey begins in {daysUntilStart} days
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3 }}>
                <Schedule sx={{ fontSize: 40 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {daysUntilStart} days until your cohort starts
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
                Get ready to join {currentCohort.currentStudents} other students on this life-changing journey
              </Typography>

              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                Prepare for Your Journey
              </Button>
            </CardContent>
          </Card>

          {/* Community Preview */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Meet Your Community
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <People sx={{ color: 'primary.main' }} />
                <Typography variant="h6">
                  {communityStats.activeStudents} students are preparing with you
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                You'll be learning alongside a supportive community of health enthusiasts
              </Typography>
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

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Progress Overview */}
            <Box sx={{ flex: { md: 2 } }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
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
                  
                  <Typography variant="body2" color="text.secondary">
                    {progressPercentage.toFixed(0)}% complete • {totalLessons - completedLessons} lessons remaining
                  </Typography>
                </CardContent>
              </Card>

              {/* Next Lesson Countdown */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <AccessTime sx={{ color: 'primary.main' }} />
                    <Typography variant="h6">Next Lesson Release</Typography>
                  </Box>
                  
                  {nextLessonRelease && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                        {daysUntilNextLesson}d {hoursUntilNextLesson % 24}h
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        until your next lesson unlocks at 8:00 AM
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Community Activity
                  </Typography>
                  <List>
                    {recentQuestions.map((question, index) => (
                      <React.Fragment key={question.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <School />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={question.question}
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {question.studentName} • {format(question.timestamp.toDate(), 'MMM d, h:mm a')}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < recentQuestions.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                    View All Questions
                  </Button>
                </CardContent>
              </Card>
            </Box>

            {/* Sidebar */}
            <Box sx={{ flex: { md: 1 } }}>
              {/* Community Stats */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Community Pulse
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <People sx={{ color: 'primary.main' }} />
                    <Typography variant="h4" color="primary.main">
                      {communityStats.activeStudents}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    students learning with you right now
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <TrendingUp sx={{ color: 'secondary.main', fontSize: 20 }} />
                    <Typography variant="body2">
                      {communityStats.totalQuestions} questions asked this week
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Streak Tracking */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Streak
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <EmojiEvents sx={{ color: 'secondary.main', fontSize: 40 }} />
                    <Typography variant="h4" color="secondary.main">
                      {streakData?.currentStreak || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {streakData?.currentStreak 
                      ? `lessons completed in a row! Keep it up!`
                      : `Start your learning streak today!`
                    }
                  </Typography>
                  {streakData && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Longest streak: {streakData.longestStreak} • Total completed: {streakData.totalCompleted}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PlayCircle />}
                    sx={{ mb: 2 }}
                  >
                    Continue Learning
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<School />}
                  >
                    Ask a Question
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Detailed Week Cards */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
              Your {activeCourseLessons.length}-Week Journey
            </Typography>
            
            {/* Current Week Status */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'primary.main', borderRadius: 2, color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                🎯 Week {currentWeek} of {activeCourseLessons.length}
                        </Typography>
              <Typography variant="body2">
                {loadingAvailability ? (
                  'Loading lesson availability...'
                ) : (
                  `${Object.values(lessonAvailability).filter(Boolean).length} lessons available • ${Object.values(lessonAvailability).filter(v => !v).length} lessons coming up`
                )}
                    </Typography>
                  </Box>
                  
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
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                              Lesson Video:
                            </Typography>
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

        {/* Course Preview & Enrollment */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { md: 2 } }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 700, mb: 3 }}>
              The Reverse Aging Challenge Program
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
              Transform Your Health & Vitality in Just 7 Weeks
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.7, fontSize: '1.1rem' }}>
              Join {communityStats.activeStudents} students around the world already transforming their lives through our evidence-based, comprehensive 7-week program. 
              Start your journey today and unlock the secrets to reverse aging naturally through proven scientific protocols.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
              Your Complete Transformation Journey
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  backgroundColor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.5
                }}>
                  <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    1
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                    Week 1: Foundation & Mindset Mastery
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
                    Build your transformation foundation with proven mindset techniques, goal setting strategies, and understanding the science behind reverse aging. Learn how to create sustainable habits that will last a lifetime and overcome mental barriers that hold you back.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    • Science of aging and cellular regeneration • Mindset transformation techniques • Sustainable habit formation • Goal setting and accountability systems
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  backgroundColor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.5
                }}>
                  <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    2
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                    Weeks 2-7: Master Your Health & Activate Anti-Aging
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
                    Dive deep into nutrition optimization, movement patterns, advanced breathwork techniques, and cold exposure protocols. Discover how these practices work together to activate your body's natural anti-aging mechanisms, boost cellular regeneration, and optimize your biological age.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    • Advanced nutrition protocols • Movement and exercise optimization • Breathwork and cold exposure • Cellular regeneration techniques • Biological age optimization
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  backgroundColor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.5
                }}>
                  <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    3
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                    Daily Practices & Lifestyle Integration
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
                    Develop a comprehensive daily routine including meditation, journaling, movement, and breathwork. Learn how to integrate these practices seamlessly into your lifestyle for lasting transformation and optimal health outcomes that continue beyond the program.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    • Daily meditation and mindfulness practices • Journaling and reflection techniques • Movement and exercise routines • Breathwork and stress management • Lifestyle integration strategies
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
              What Makes This Program Different
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  🧬 Evidence-Based Science
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  All protocols are backed by the latest research in longevity, cellular biology, and anti-aging science.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  👥 Community Support
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Join a community of like-minded individuals on the same transformation journey with expert guidance.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  🎯 Personalized Approach
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Adapt protocols to your unique lifestyle and health goals for maximum effectiveness.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  ⏰ Lifetime Access
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Access all materials, updates, and community support for life to maintain your transformation.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: { md: 1 } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Next Cohort Starting
                </Typography>
                <Typography variant="h4" color="primary.main" sx={{ mb: 2, fontWeight: 700 }}>
                  November 2025
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Join our next cohort and transform your health with expert guidance and community support
                </Typography>
                  
                  {/* Regular Price */}
                  <Box sx={{ opacity: 0.7, mb: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                      Regular Price: €499
                    </Typography>
                  </Box>
                {/* Pricing Section */}
                <Box sx={{ mb: 3 }}>
                  {/* Special Offer */}
                  <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.5)', borderRadius: 2, border: '2px solid', borderColor: 'success.main' }}>
                    <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, mb: 1 }}>
                      🎉 Special Launch Offer
                    </Typography>
                    <Typography variant="h3" color="text.primary" sx={{ fontWeight: 700, mb: 1 }}>
                      €299
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                      Enroll before September 30th
                    </Typography>
                  </Box>
                </Box>

                {/* Countdown Timer */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    ⏰ Special offer ends in:
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Box sx={{ textAlign: 'center', minWidth: 40 }}>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                        {timeLeft.days}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Days
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      :
                    </Typography>
                    <Box sx={{ textAlign: 'center', minWidth: 40 }}>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                        {timeLeft.hours.toString().padStart(2, '0')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hours
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      :
                    </Typography>
                    <Box sx={{ textAlign: 'center', minWidth: 40 }}>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                        {timeLeft.minutes.toString().padStart(2, '0')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Min
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      :
                    </Typography>
                    <Box sx={{ textAlign: 'center', minWidth: 40 }}>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                        {timeLeft.seconds.toString().padStart(2, '0')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sec
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Button 
                  variant="contained" 
                  fullWidth
                  size="large"
                  onClick={() => {
                    console.log('Dashboard: Available courses:', courses);
                    const course = courses.find(c => c.title === 'The Reverse Aging Challenge');
                    console.log('Dashboard: Found course:', course);
                    if (course) {
                      console.log('Dashboard: Navigating to payment with course ID:', course.id);
                      navigate(`/payment/${course.id}`);
                    } else {
                      console.error('Dashboard: Course not found, using fallback');
                      // Fallback to hardcoded ID if course not found
                      navigate('/payment/reverse-aging-challenge');
                    }
                  }}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: '#000',
                    fontWeight: 700,
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    }
                  }}
                >
                  Join the Challenge - €299
                </Button>
              </CardContent>
            </Card>

            {/* Trust Badges & Guarantee - Outside the Card */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Security sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Secure
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <VerifiedUser sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Verified
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Support sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Support
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                ✓ 30-Day Money-Back Guarantee
              </Typography>
            </Box>

            {/* In-Person Cohort CTA */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                Can't wait until November?
              </Typography>
              <Button
                variant="outlined"
                size="medium"
                href="https://7weekreverseagingchallenge.com/#apply"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'primary.light',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  }
                }}
              >
                Apply to join our in-person cohort in Spain in October!
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Testimonials Section */}
        <Box sx={{ py: 6, mt: 6 }}>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 4, color: 'primary.main', fontWeight: 600 }}>
            What Our Students Say
          </Typography>
          
          <Card sx={{ 
            maxWidth: 800, 
            mx: 'auto', 
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(80, 235, 151, 0.1) 0%, rgba(172, 255, 34, 0.05) 100%)',
            border: '1px solid rgba(80, 235, 151, 0.2)'
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
              {/* Navigation Buttons */}
              <IconButton
                onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                  zIndex: 2,
                }}
              >
                <ChevronLeft />
              </IconButton>
              
              <IconButton
                onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                  zIndex: 2,
                }}
              >
                <ChevronRight />
              </IconButton>

              {/* Testimonial Content */}
              <Box sx={{ px: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3, 
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    color: 'text.primary',
                    minHeight: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  "{testimonials[currentTestimonial].text}"
                </Typography>
                
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'primary.main',
                    mb: 2
                  }}
                >
                  — {testimonials[currentTestimonial].author}
                </Typography>
              </Box>

              {/* Dots Indicator */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
                {testimonials.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: index === currentTestimonial ? 'primary.main' : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: index === currentTestimonial ? 'primary.main' : 'rgba(255,255,255,0.5)',
                      }
                    }}
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