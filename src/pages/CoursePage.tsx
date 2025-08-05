import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';

import {
  PlayCircle,
  CheckCircle,
  Lock,
  Schedule,
  Description,
  VideoLibrary,
  Download,
  School,
} from '@mui/icons-material';

import { useCourse } from '../contexts/CourseContext';
import { format, isAfter } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

interface Lesson {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  videoUrl?: string;
  videoDuration?: number;
  resources: Array<{
    id: string;
    title: string;
    type: 'pdf' | 'workbook' | 'link';
    url: string;
  }>;
  isPublished: boolean;
  releaseDate?: Date;
  order: number;
}

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentEnrollment, currentCohort, lessonProgress, getCourse } = useCourse();

  // Mock course data - replace with real data from Firestore
  const course = getCourse(courseId || '');
  
  // Mock lessons data - replace with real data
  const [lessons] = useState<Lesson[]>([
    {
      id: 'week1',
      weekNumber: 1,
      title: 'Foundation & Mindset',
      description: 'Understanding the science of aging and setting your transformation foundation',
      videoUrl: 'https://www.youtube.com/watch?v=example1',
      videoDuration: 3600, // 60 minutes
      resources: [
        { id: 'r1', title: 'Week 1 Workbook', type: 'workbook', url: '#' },
        { id: 'r2', title: 'Scientific Studies PDF', type: 'pdf', url: '#' },
      ],
      isPublished: true,
      releaseDate: new Date('2024-01-15'),
      order: 1,
    },
    {
      id: 'week2',
      weekNumber: 2,
      title: 'Nutrition Fundamentals',
      description: 'The role of nutrition in reversing aging and optimizing cellular function',
      videoUrl: 'https://www.youtube.com/watch?v=example2',
      videoDuration: 3300, // 55 minutes
      resources: [
        { id: 'r3', title: 'Week 2 Workbook', type: 'workbook', url: '#' },
        { id: 'r4', title: 'Nutrition Guide PDF', type: 'pdf', url: '#' },
      ],
      isPublished: true,
      releaseDate: new Date('2024-01-22'),
      order: 2,
    },
    {
      id: 'week3',
      weekNumber: 3,
      title: 'Exercise & Movement',
      description: 'Movement protocols for longevity and vitality',
      videoUrl: 'https://www.youtube.com/watch?v=example3',
      videoDuration: 3000, // 50 minutes
      resources: [
        { id: 'r5', title: 'Week 3 Workbook', type: 'workbook', url: '#' },
        { id: 'r6', title: 'Exercise Guide PDF', type: 'pdf', url: '#' },
      ],
      isPublished: true,
      releaseDate: new Date('2024-01-29'),
      order: 3,
    },
    {
      id: 'week4',
      weekNumber: 4,
      title: 'Sleep & Recovery',
      description: 'Optimizing sleep for cellular repair and regeneration',
      videoUrl: 'https://www.youtube.com/watch?v=example4',
      videoDuration: 2700, // 45 minutes
      resources: [
        { id: 'r7', title: 'Week 4 Workbook', type: 'workbook', url: '#' },
        { id: 'r8', title: 'Sleep Guide PDF', type: 'pdf', url: '#' },
      ],
      isPublished: true,
      releaseDate: new Date('2024-02-05'),
      order: 4,
    },
    {
      id: 'week5',
      weekNumber: 5,
      title: 'Stress Management',
      description: 'Techniques for managing stress and optimizing hormone balance',
      videoUrl: 'https://www.youtube.com/watch?v=example5',
      videoDuration: 3000, // 50 minutes
      resources: [
        { id: 'r9', title: 'Week 5 Workbook', type: 'workbook', url: '#' },
        { id: 'r10', title: 'Stress Management PDF', type: 'pdf', url: '#' },
      ],
      isPublished: true,
      releaseDate: new Date('2024-02-12'),
      order: 5,
    },
    {
      id: 'week6',
      weekNumber: 6,
      title: 'Advanced Protocols',
      description: 'Advanced techniques for maximum anti-aging benefits',
      videoUrl: 'https://www.youtube.com/watch?v=example6',
      videoDuration: 3600, // 60 minutes
      resources: [
        { id: 'r11', title: 'Week 6 Workbook', type: 'workbook', url: '#' },
        { id: 'r12', title: 'Advanced Protocols PDF', type: 'pdf', url: '#' },
      ],
      isPublished: false,
      releaseDate: new Date('2024-02-19'),
      order: 6,
    },
    {
      id: 'week7',
      weekNumber: 7,
      title: 'Integration & Maintenance',
      description: 'Putting it all together and maintaining your results long-term',
      videoUrl: 'https://www.youtube.com/watch?v=example7',
      videoDuration: 3300, // 55 minutes
      resources: [
        { id: 'r13', title: 'Week 7 Workbook', type: 'workbook', url: '#' },
        { id: 'r14', title: 'Maintenance Guide PDF', type: 'pdf', url: '#' },
      ],
      isPublished: false,
      releaseDate: new Date('2024-02-26'),
      order: 7,
    },
  ]);

  // Calculate overall progress
  const totalLessons = lessons.length;
  const completedLessons = lessonProgress.filter(p => p.isCompleted).length;
  const progressPercentage = (completedLessons / totalLessons) * 100;

  // Check if user is enrolled and cohort has started
  const isEnrolled = currentEnrollment && currentEnrollment.status === 'active';
  const cohortHasStarted = currentCohort && new Date() >= currentCohort.startDate.toDate();
  const canAccessContent = isEnrolled && cohortHasStarted;

  // Determine which lessons are accessible
  const getLessonAccess = (lesson: Lesson) => {
    if (!canAccessContent) return 'locked';
    if (!lesson.isPublished) return 'locked';
    if (lesson.releaseDate && isAfter(new Date(), lesson.releaseDate)) return 'locked';
    return 'available';
  };

  // Get lesson progress
  const getLessonProgress = (lessonId: string) => {
    return lessonProgress.find(p => p.lessonId === lessonId);
  };

  // Format video duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleLessonClick = (lesson: Lesson) => {
    const access = getLessonAccess(lesson);
    if (access === 'available') {
      navigate(`/course/${courseId}/lesson/${lesson.id}`);
    }
  };

  if (!course) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4">Course not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Course Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {course.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {course.description}
          </Typography>

          {isEnrolled && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Your Progress</Typography>
                <Chip 
                  label={`${completedLessons}/${totalLessons} weeks completed`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {progressPercentage.toFixed(0)}% complete
              </Typography>
            </Box>
          )}

          {!isEnrolled && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                You need to enroll in this course to access the content.
              </Alert>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/payment/${courseId}`)}
                sx={{ mr: 2 }}
              >
                Enroll Now - €{course.price}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/dashboard')}
              >
                Join Waitlist
              </Button>
            </Box>
          )}
        </Box>

        {/* Lessons Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {lessons.map((lesson) => {
            const access = getLessonAccess(lesson);
            const progress = getLessonProgress(lesson.id);
            const isCompleted = progress?.isCompleted || false;
            const isLocked = access === 'locked';

            return (
              <Card 
                key={lesson.id}
                sx={{ 
                  height: '100%',
                  cursor: isLocked ? 'default' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: isLocked ? 'none' : 'translateY(-2px)',
                    boxShadow: isLocked ? 'default' : '0 4px 20px rgba(0,0,0,0.15)',
                  },
                  opacity: isLocked ? 0.7 : 1,
                }}
                onClick={() => handleLessonClick(lesson)}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Lesson Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Week {lesson.weekNumber}: {lesson.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {lesson.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isCompleted ? (
                        <CheckCircle sx={{ color: 'success.main', fontSize: 24 }} />
                      ) : isLocked ? (
                        <Lock sx={{ color: 'text.disabled', fontSize: 24 }} />
                      ) : (
                        <PlayCircle sx={{ color: 'primary.main', fontSize: 24 }} />
                      )}
                    </Box>
                  </Box>

                  {/* Lesson Details */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <VideoLibrary sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {lesson.videoDuration ? formatDuration(lesson.videoDuration) : 'Video lesson'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Description sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {lesson.resources.length} resources
                      </Typography>
                    </Box>
                  </Box>

                  {/* Access Status */}
                  {isLocked && (
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={lesson.isPublished ? 'Available soon' : 'Coming soon'}
                        color="default"
                        size="small"
                        icon={<Schedule />}
                      />
                      {lesson.releaseDate && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {format(lesson.releaseDate, 'MMM d, yyyy')}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Progress Bar */}
                  {!isLocked && progress && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(progress.watchedPercentage)}%
        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress.watchedPercentage} 
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  )}

                  {/* Action Button */}
                  <Button
                    variant={isCompleted ? "outlined" : "contained"}
                    fullWidth
                    disabled={isLocked}
                    startIcon={
                      isCompleted ? <CheckCircle /> : 
                      isLocked ? <Lock /> : <PlayCircle />
                    }
                  >
                    {isCompleted ? 'Completed' : 
                     isLocked ? 'Locked' : 'Start Lesson'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Course Resources */}
        {isEnrolled && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom>
              Course Resources
        </Typography>
            <Card>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Download />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Complete Course Workbook"
                      secondary="Download the full workbook to use throughout the course"
                    />
                    <Button variant="outlined" size="small">
                      Download
                    </Button>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <School />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Q&A Sessions"
                      secondary="Access recorded Q&A sessions from previous cohorts"
                    />
                    <Button variant="outlined" size="small">
                      View All
                    </Button>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default CoursePage; 