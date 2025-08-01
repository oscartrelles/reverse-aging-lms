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
  TextField,
} from '@mui/material';
import {
  PlayCircle,
  CheckCircle,
  Lock,
  Download,
  Send,
  ExpandMore,
  ExpandLess,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
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

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentEnrollment, currentCohort, lessonProgress, getCourse } = useCourse();
  // Mock lesson data - replace with real data from Firestore
  const [lesson] = useState<Lesson>({
    id: lessonId || 'week1',
    weekNumber: 1,
    title: 'Foundation & Mindset',
    description: 'Understanding the science of aging and setting your transformation foundation. This lesson will introduce you to the core concepts and scientific principles behind the reverse aging approach.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with actual video URL
    videoDuration: 3600, // 60 minutes
    resources: [
      { id: 'r1', title: 'Week 1 Workbook', type: 'workbook', url: '#' },
      { id: 'r2', title: 'Scientific Studies PDF', type: 'pdf', url: '#' },
      { id: 'r3', title: 'Additional Reading', type: 'link', url: '#' },
    ],
    isPublished: true,
    releaseDate: new Date('2024-01-15'),
    order: 1,
  });


  const [isCompleted, setIsCompleted] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showQa, setShowQa] = useState(false);
  const [question, setQuestion] = useState('');
  const [recentQuestions, setRecentQuestions] = useState([
    {
      id: '1',
      question: 'How long should I practice the breathing exercise?',
      studentName: 'Student A',
      timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
      answer: 'Start with 5-10 minutes daily and gradually increase to 20-30 minutes.',
    },
    {
      id: '2',
      question: 'Can I do the morning routine in the evening?',
      studentName: 'Student B',
      timestamp: Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)),
      answer: 'Yes, but morning is optimal for circadian rhythm alignment.',
    },
  ]);

  const course = getCourse(courseId || '');
  const progress = lessonProgress.find(p => p.lessonId === lesson.id);

  // Check access
  const isEnrolled = currentEnrollment && currentEnrollment.status === 'active';
  const cohortHasStarted = currentCohort && new Date() >= currentCohort.startDate.toDate();
  const canAccessContent = isEnrolled && cohortHasStarted;

  const getLessonAccess = () => {
    if (!canAccessContent) return 'locked';
    if (!lesson.isPublished) return 'locked';
    if (lesson.releaseDate && isAfter(new Date(), lesson.releaseDate)) return 'locked';
    return 'available';
  };

  const access = getLessonAccess();
  const isLocked = access === 'locked';

  // Format video duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Handle video progress (for future YouTube API integration)
  // const handleVideoProgress = (progress: number) => {
  //   // Mark as complete if watched 90% or more
  //   if (progress >= 90 && !isCompleted) {
  //     setIsCompleted(true);
  //     // TODO: Update progress in Firestore
  //   }
  // };

  // Handle manual completion
  const handleMarkComplete = () => {
    setIsCompleted(true);
    // TODO: Update progress in Firestore
  };

  // Handle question submission
  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      // TODO: Save question to Firestore
      setRecentQuestions(prev => [{
        id: Date.now().toString(),
        question: question.trim(),
        studentName: currentUser?.name || 'Anonymous',
        timestamp: Timestamp.now(),
        answer: '',
      }, ...prev]);
      setQuestion('');
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

  if (isLocked) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Lock sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Lesson Not Available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This lesson is not yet available. Please check back later.
          </Typography>
          <Button variant="contained" onClick={() => navigate(`/course/${courseId}`)}>
            Back to Course
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Lesson Header */}
        <Box sx={{ mb: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(`/course/${courseId}`)}
            sx={{ mb: 2 }}
          >
            ← Back to Course
          </Button>
          
          <Typography variant="h3" component="h1" gutterBottom>
            Week {lesson.weekNumber}: {lesson.title}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {lesson.description}
          </Typography>

          {/* Progress Indicator */}
          {progress && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Your Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progress.watchedPercentage)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress.watchedPercentage} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          {/* Main Content */}
          <Box sx={{ flex: { lg: 2 } }}>
            {/* Video Player */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ position: 'relative', width: '100%', height: 0, paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${lesson.videoUrl?.split('v=')[1]}?enablejsapi=1`}
                    title={lesson.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 0,
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>
                
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AccessTime sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {lesson.videoDuration ? formatDuration(lesson.videoDuration) : 'Video lesson'}
                      </Typography>
                    </Box>
                    {isCompleted && (
                      <Chip 
                        label="Completed" 
                        color="success" 
                        icon={<CheckCircle />}
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Button
                    variant={isCompleted ? "outlined" : "contained"}
                    fullWidth
                    onClick={handleMarkComplete}
                    startIcon={isCompleted ? <CheckCircle /> : <PlayCircle />}
                  >
                    {isCompleted ? 'Marked as Complete' : 'Mark as Complete'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Lesson Content */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Key Takeaways
                </Typography>
                <Typography variant="body1" paragraph>
                  In this lesson, you'll learn about the fundamental principles of reverse aging and how to apply them to your daily life. We'll cover the science behind cellular regeneration and practical steps you can take to optimize your health and vitality.
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    What You'll Learn:
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}>
                          <CheckCircle sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Understanding the aging process"
                        secondary="Learn what causes aging at the cellular level"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}>
                          <CheckCircle sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Setting your transformation foundation"
                        secondary="Create a solid base for your health journey"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}>
                          <CheckCircle sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Practical implementation strategies"
                        secondary="Step-by-step approaches you can start today"
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box sx={{ flex: { lg: 1 } }}>
            {/* Resources */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    mb: 2 
                  }}
                  onClick={() => setShowResources(!showResources)}
                >
                  <Typography variant="h6">
                    Resources
                  </Typography>
                  {showResources ? <ExpandLess /> : <ExpandMore />}
                </Box>
                
                {showResources && (
                  <List>
                    {lesson.resources.map((resource) => (
                      <ListItem key={resource.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Download />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={resource.title}
                          secondary={resource.type.toUpperCase()}
                        />
                        <Button variant="outlined" size="small">
                          Download
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Q&A Section */}
            <Card>
              <CardContent>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    mb: 2 
                  }}
                  onClick={() => setShowQa(!showQa)}
                >
                  <Typography variant="h6">
                    Q&A
                  </Typography>
                  {showQa ? <ExpandLess /> : <ExpandMore />}
                </Box>
                
                {showQa && (
                  <Box>
                    <form onSubmit={handleSubmitQuestion}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Ask a question about this lesson..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        startIcon={<Send />}
                        disabled={!question.trim()}
                      >
                        Submit Question
                      </Button>
                    </form>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Recent Questions
                    </Typography>
                    
                    <List sx={{ p: 0 }}>
                      {recentQuestions.map((q) => (
                        <ListItem key={q.id} sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Box sx={{ width: '100%', mb: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {q.question}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {q.studentName} • {format(q.timestamp.toDate(), 'MMM d, h:mm a')}
                            </Typography>
                          </Box>
                          {q.answer && (
                            <Box sx={{ width: '100%', bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                              <Typography variant="body2" color="primary.main" fontWeight="medium">
                                Answer:
        </Typography>
                              <Typography variant="body2">
                                {q.answer}
        </Typography>
                            </Box>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LessonPage; 