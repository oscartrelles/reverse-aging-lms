import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCourse } from '../contexts/CourseContext';
import { format, addDays, differenceInDays, differenceInHours } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentEnrollment, currentCohort, lessonProgress, loading } = useCourse();


  // Mock data for demonstration - replace with real data
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

  // Calculate progress and timing
  const totalLessons = 7;
  const completedLessons = lessonProgress.filter(p => p.isCompleted).length;
  const progressPercentage = (completedLessons / totalLessons) * 100;

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
                      3
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    lessons completed in a row! Keep it up!
                  </Typography>
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
        </Box>
      </Container>
    );
  }

  // State 3: Not enrolled
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Hero Section */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #4A7B63 0%, #9AB5A7 100%)', color: 'white' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Transform Your Health & Vitality
            </Typography>
            <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
              Join The Reverse Aging Challenge - 7 weeks to a healthier you
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3 }}>
              <People sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Join {communityStats.activeStudents} students already transforming their lives
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
              Start your journey today and unlock the secrets to reverse aging naturally
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
              Enroll Now - €499
            </Button>
          </CardContent>
        </Card>

        {/* Course Preview */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { md: 2 } }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  What You'll Learn
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CheckCircle />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Week 1: Foundation & Mindset"
                      secondary="Understanding the science of aging and setting your transformation foundation"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CheckCircle />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Week 2-7: Practical Implementation"
                      secondary="Step-by-step protocols for nutrition, exercise, and lifestyle optimization"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { md: 1 } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Next Cohort Starting
                </Typography>
                <Typography variant="h4" color="primary.main" sx={{ mb: 2 }}>
                  {format(addDays(new Date(), 14), 'MMM d')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Only 14 days until the next cohort begins
                </Typography>
                <Button variant="contained" fullWidth>
                  Join Waitlist
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 