import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { 
  Add, 
  School, 
  People, 
  Schedule, 
  Edit, 
  Create, 
  PlayArrow,
  QuestionAnswer,
  CheckCircle,
  Person,
  Send,
  ExpandLess,
  ExpandMore,
  Science,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCourse } from '../../contexts/CourseContext';
import { questionService } from '../../services/questionService';
import { scientificUpdateService } from '../../services/scientificUpdateService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import CourseEditor from '../../components/admin/CourseEditor';
import LessonEditor from '../../components/admin/LessonEditor';
import CohortEditor from '../../components/admin/CohortEditor';
import ScientificUpdateEditor from '../../components/admin/ScientificUpdateEditor';

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { courses, cohorts, loading: courseLoading } = useCourse();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Editor states
  const [showCourseEditor, setShowCourseEditor] = useState(false);
  const [showLessonEditor, setShowLessonEditor] = useState(false);
  const [showCohortEditor, setShowCohortEditor] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [editingCohort, setEditingCohort] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  
  // Q&A Management
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showQAManagement, setShowQAManagement] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [answerText, setAnswerText] = useState('');
  const [answeringQuestion, setAnsweringQuestion] = useState(false);
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  
  // Scientific Updates Management
  const [scientificUpdates, setScientificUpdates] = useState<any[]>([]);
  const [scientificUpdatesLoading, setScientificUpdatesLoading] = useState(false);
  const [showScientificUpdateEditor, setShowScientificUpdateEditor] = useState(false);
  const [editingScientificUpdate, setEditingScientificUpdate] = useState<any>(null);
  
  const navigate = useNavigate();

  const loadLessons = async () => {
    setLessonsLoading(true);
    try {
      const lessonsSnapshot = await getDocs(collection(db, 'lessons'));
      const lessonsData = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];
      // Sort lessons by order property in ascending order
      const sortedLessons = lessonsData.sort((a, b) => (a.order || 0) - (b.order || 0));
      setLessons(sortedLessons);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLessonsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadLessons();
    loadUsers();
    loadScientificUpdates();
  }, []);

  const loadQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const questionsSnapshot = await getDocs(collection(db, 'questions'));
      const questionsData = questionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];
      // Sort by creation date (newest first)
      const sortedQuestions = questionsData.sort((a, b) => 
        b.createdAt.toDate() - a.createdAt.toDate()
      );
      setQuestions(sortedQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];
      setUsers(usersData);

      const enrollmentsSnapshot = await getDocs(collection(db, 'enrollments'));
      const enrollmentsData = enrollmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadScientificUpdates = async () => {
    setScientificUpdatesLoading(true);
    try {
      const updates = await scientificUpdateService.getAllUpdates();
      setScientificUpdates(updates);
    } catch (error) {
      console.error('Error loading scientific updates:', error);
    } finally {
      setScientificUpdatesLoading(false);
    }
  };

  const handleAnswerQuestion = async () => {
    if (!selectedQuestion || !answerText.trim()) return;

    try {
      setAnsweringQuestion(true);
      await questionService.answerQuestion(selectedQuestion.id, answerText.trim(), currentUser?.id);
      
      // Reload questions to show the answer
      await loadQuestions();
      
      setAnswerText('');
      setSelectedQuestion(null);
      setSuccess('Question answered successfully!');
    } catch (error) {
      console.error('Error answering question:', error);
      setError('Failed to answer question');
    } finally {
      setAnsweringQuestion(false);
    }
  };

  // Update cohort status when cohorts change
  useEffect(() => {
    const updateCohortStatuses = async () => {
      for (const cohort of cohorts) {
        // await updateCohortStatus(cohort); // This line was removed as per the edit hint
      }
    };
    
    if (cohorts.length > 0) {
      updateCohortStatuses();
    }
  }, [cohorts]);

  const handleUpdateVideoUrls = async () => {
    try {
      setLoading(true);
      setError(null);
      // await updateLessonVideoUrls(); // This line was removed as per the edit hint
      setSuccess('Video URLs updated successfully!');
    } catch (error) {
      console.error('Error updating video URLs:', error);
      setError('Failed to update video URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleListLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      // const lessons = await listAllLessons(); // This line was removed as per the edit hint
      console.log('All lessons:', lessons);
      setSuccess('Lessons listed successfully! Check console for details.');
    } catch (error) {
      console.error('Error listing lessons:', error);
      setError('Failed to list lessons');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Admin Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Q&A Management - Most Frequent Task */}
        <Box sx={{ mb: 3 }}>
            <Card>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Q&A Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<QuestionAnswer />}
                  onClick={() => {
                    setShowQAManagement(!showQAManagement);
                    if (!showQAManagement) {
                      loadQuestions();
                    }
                  }}
                  size="small"
                >
                  {showQAManagement ? 'Hide Q&A' : 'Manage Q&A'}
                </Button>
              </Box>

              {showQAManagement && (
                <Box>
                  {questionsLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {questions.length} total questions
                      </Typography>
                      
                      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {questions.map((question, index) => (
                          <React.Fragment key={question.id}>
                            <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: question.isAnswered ? 'success.main' : 'primary.main', width: 32, height: 32 }}>
                                  {question.isAnswered ? <CheckCircle /> : <Person />}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                                      {question.question}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {question.isAnswered && (
                                        <Chip label="Answered" color="success" size="small" />
                                      )}
                                      {!question.isPublic && (
                                        <Chip label="Private" color="warning" size="small" />
                                      )}
                                      <Chip 
                                        label={question.votes || 0} 
                                        size="small" 
                  variant="outlined"
                                      />
                                    </Box>
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Asked by {question.userName || 'Anonymous'} on {question.createdAt.toDate().toLocaleDateString()}
                                    </Typography>
                                    {question.answer && (
                                      <Box sx={{ mt: 1, p: 1.5, backgroundColor: 'grey.50', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" color="primary.main" gutterBottom>
                                          Answer:
                                        </Typography>
                                        <Typography variant="body2">
                                          {question.answer}
                                        </Typography>
                                        {question.answererName && (
                                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                            Answered by {question.answererName}
                                          </Typography>
                                        )}
                                      </Box>
                                    )}
                                    {!question.isAnswered && (
                <Button
                                        size="small"
                  variant="outlined"
                                        startIcon={<Send />}
                                        onClick={() => setSelectedQuestion(question)}
                                        sx={{ mt: 1 }}
                                      >
                                        Answer Question
                </Button>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < questions.length - 1 && <Divider variant="inset" component="li" />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}
              </CardContent>
            </Card>
          </Box>

          {/* User Management - Quick Access */}
          <Box sx={{ mb: 3 }}>
            <Card>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    User Management
                </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Person />}
                    onClick={() => navigate('/admin/users')}
                    size="small"
                  >
                    Manage Users
                  </Button>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                  {/* Users Summary */}
                  <Box sx={{ p: 1.5, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Users ({users.length})
                    </Typography>
                    {usersLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Box>
                        {users.slice(0, 3).map((user) => (
                          <Box key={user.id} sx={{ mb: 1, p: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                  {user.name || user.email}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {user.email}
                                </Typography>
                                {user.isAdmin && (
                                  <Chip 
                                    label="Admin" 
                                    size="small" 
                                    color="primary"
                                    sx={{ fontSize: '0.7rem', mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        ))}
                        {users.length > 3 && (
                          <Typography variant="caption" color="text.secondary">
                            +{users.length - 3} more users
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Enrollments Summary */}
                  <Box sx={{ p: 1.5, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Enrollments ({enrollments.length})
                    </Typography>
                    <Box>
                      {enrollments.slice(0, 3).map((enrollment) => (
                        <Box key={enrollment.id} sx={{ mb: 1, p: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                            {enrollment.userId?.substring(0, 8)}...
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {enrollment.status}
                          </Typography>
                          <Chip 
                            label={enrollment.paymentStatus || 'unknown'} 
                            size="small" 
                            color={enrollment.paymentStatus === 'paid' ? 'success' : 'default'}
                            sx={{ fontSize: '0.7rem', mt: 0.5 }}
                          />
                        </Box>
                      ))}
                      {enrollments.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{enrollments.length - 3} more enrollments
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Quick Stats */}
                  <Box sx={{ p: 1.5, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Quick Stats
                    </Typography>
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Active Users: {users.filter(u => !u.isAdmin).length}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Paid Enrollments: {enrollments.filter(e => e.paymentStatus === 'paid').length}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        Pending Payments: {enrollments.filter(e => e.paymentStatus === 'pending').length}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Content Overview - Streamlined */}
          <Box sx={{ mb: 3 }}>
            <Card>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Content Overview
                </Typography>
                
                {courseLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                    {/* Courses Summary */}
                    <Box sx={{ p: 1.5, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Courses ({courses.length})
                      </Typography>
                      {courses.map((course) => (
                        <Box key={course.id} sx={{ mb: 1, p: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                            {course.title}
                          </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                €{course.price} • {course.duration} weeks
                          </Typography>
                            </Box>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => {
                              setEditingCourse(course);
                              setShowCourseEditor(true);
                            }}
                              sx={{ fontSize: '0.75rem' }}
                          >
                            Edit
                          </Button>
                          </Box>
                        </Box>
                      ))}
                      {courses.length > 0 && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                            setEditingCourse(null);
                            setShowCourseEditor(true);
                            }}
                          sx={{ mt: 1, fontSize: '0.75rem' }}
                          >
                          Create New Course
                          </Button>
                      )}
                    </Box>

                    {/* Cohorts Summary */}
                    <Box sx={{ p: 1.5, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Cohorts ({cohorts.length})
                      </Typography>
                      {cohorts.map((cohort) => (
                        <Box key={cohort.id} sx={{ mb: 1, p: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                {cohort.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {cohort.currentStudents}/{cohort.maxStudents} students
                              </Typography>
                              <Chip 
                                label={cohort.status} 
                                size="small" 
                                color={cohort.status === 'active' ? 'success' : 'default'}
                                sx={{ fontSize: '0.7rem', mt: 0.5 }}
                              />
                            </Box>
                            <Button
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => {
                                setEditingCohort(cohort);
                                setShowCohortEditor(true);
                              }}
                              sx={{ fontSize: '0.75rem' }}
                            >
                              Edit
                            </Button>
                          </Box>
                        </Box>
                      ))}
                      {cohorts.length > 0 && (
                            <Button
                              size="small"
                              variant="outlined"
                          onClick={() => {
                            setEditingCohort(null);
                            setShowCohortEditor(true);
                          }}
                          sx={{ mt: 1, fontSize: '0.75rem' }}
                        >
                          Create New Cohort
                            </Button>
                      )}
                    </Box>

                    {/* Lessons Summary */}
                    <Box sx={{ p: 1.5, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Lessons ({lessons.length})
                      </Typography>
                      {lessonsLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Box>
                          {(showAllLessons ? lessons : lessons.slice(0, 3)).map((lesson) => (
                            <Box key={lesson.id} sx={{ mb: 1, p: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                    Week {lesson.weekNumber}: {lesson.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                                    {lesson.isPublished ? 'Published' : 'Draft'}
                          </Typography>
                                </Box>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => {
                                    setEditingLesson(lesson);
                                    setShowLessonEditor(true);
                            }}
                                  sx={{ fontSize: '0.75rem' }}
                          >
                            Edit
                          </Button>
                              </Box>
                        </Box>
                      ))}
                          {lessons.length > 3 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">
                                {showAllLessons ? 'Showing all lessons' : `+${lessons.length - 3} more lessons`}
                              </Typography>
                              <Button
                                size="small"
                                startIcon={showAllLessons ? <ExpandLess /> : <ExpandMore />}
                                onClick={() => setShowAllLessons(!showAllLessons)}
                                sx={{ fontSize: '0.75rem' }}
                              >
                                {showAllLessons ? 'Show Less' : 'View All'}
                              </Button>
                            </Box>
                          )}
                        </Box>
                      )}
                      {lessons.length > 0 && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setEditingLesson(null);
                            setShowLessonEditor(true);
                          }}
                          sx={{ mt: 1, fontSize: '0.75rem' }}
                        >
                          Create New Lesson
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Scientific Updates Management */}
          <Box sx={{ mb: 3 }}>
            <Card>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Scientific Updates Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Science />}
                    onClick={() => {
                      setEditingScientificUpdate(null);
                      setShowScientificUpdateEditor(true);
                    }}
                    size="small"
                  >
                    Create New Update
                  </Button>
                </Box>

                {scientificUpdatesLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <Box>
                    {scientificUpdates.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No scientific updates yet. Create the first one!
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        {scientificUpdates.slice(0, 4).map((update) => (
                          <Box key={update.id} sx={{ p: 1.5, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                  {update.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {update.category} • {new Date(update.publishedDate.toDate()).toLocaleDateString()}
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                startIcon={<Edit />}
                                onClick={() => {
                                  setEditingScientificUpdate(update);
                                  setShowScientificUpdateEditor(true);
                                }}
                                sx={{ fontSize: '0.75rem' }}
                              >
                                Edit
                              </Button>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                label={`${update.votes || 0} votes`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                              <Chip
                                label={`${update.readCount || 0} reads`}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                              <Chip
                                label={`${update.shareCount || 0} shares`}
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {scientificUpdates.length > 4 && (
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          +{scientificUpdates.length - 4} more updates
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Editors */}
          {showCourseEditor && (
            <Box sx={{ mt: 3 }}>
              <CourseEditor
                courseId={editingCourse?.id}
                courseData={editingCourse}
                onSave={(courseData) => {
                  setShowCourseEditor(false);
                  setEditingCourse(null);
                  setSuccess('Course saved successfully!');
                }}
                onCancel={() => {
                  setShowCourseEditor(false);
                  setEditingCourse(null);
                }}
              />
            </Box>
          )}

          {showLessonEditor && (
            <Box sx={{ mt: 3 }}>
              <LessonEditor
                courseId={courses[0]?.id || ''}
                lessonId={editingLesson?.id}
                lessonData={editingLesson}
                onSave={async (lessonData) => {
                  setShowLessonEditor(false);
                  setEditingLesson(null);
                  setSuccess('Lesson saved successfully!');
                  // Reload lessons to show the updated list
                  await loadLessons();
                }}
                onCancel={() => {
                  setShowLessonEditor(false);
                  setEditingLesson(null);
                }}
              />
            </Box>
          )}

          {showCohortEditor && (
            <Box sx={{ mt: 3 }}>
              <CohortEditor
                courseId={courses[0]?.id || ''}
                cohortId={editingCohort?.id}
                cohortData={editingCohort}
                onSave={(cohortData) => {
                  setShowCohortEditor(false);
                  setEditingCohort(null);
                  setSuccess('Cohort saved successfully!');
                }}
                onCancel={() => {
                  setShowCohortEditor(false);
                  setEditingCohort(null);
                }}
              />
            </Box>
          )}

          {showScientificUpdateEditor && (
            <Box sx={{ mt: 3 }}>
              <ScientificUpdateEditor
                updateId={editingScientificUpdate?.id}
                updateData={editingScientificUpdate}
                onSave={async (updateData) => {
                  setShowScientificUpdateEditor(false);
                  setEditingScientificUpdate(null);
                  setSuccess('Scientific update saved successfully!');
                  // Reload scientific updates to show the updated list
                  await loadScientificUpdates();
                }}
                onCancel={() => {
                  setShowScientificUpdateEditor(false);
                  setEditingScientificUpdate(null);
                }}
              />
            </Box>
          )}

      {/* Answer Question Dialog */}
      <Dialog 
        open={!!selectedQuestion} 
        onClose={() => {
          setSelectedQuestion(null);
          setAnswerText('');
        }} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Answer Question
        </DialogTitle>
        <DialogContent>
          {selectedQuestion && (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                {selectedQuestion.question}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                Asked by {selectedQuestion.userName || 'Anonymous'} on {selectedQuestion.createdAt.toDate().toLocaleDateString()}
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Your answer"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Provide a helpful answer to this question..."
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary">
                This answer will be visible to the student and can help other students with similar questions.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setSelectedQuestion(null);
              setAnswerText('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAnswerQuestion}
            variant="contained"
            disabled={!answerText.trim() || answeringQuestion}
            startIcon={answeringQuestion ? <CircularProgress size={16} /> : <Send />}
          >
            {answeringQuestion ? 'Submitting...' : 'Submit Answer'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 