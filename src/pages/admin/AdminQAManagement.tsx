import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Divider,
  Avatar,
  TextareaAutosize,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  QuestionAnswer,
  Search,
  FilterList,
  Sort,
  ThumbUp,
  CheckCircle,
  Person,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { questionService } from '../../services/questionService';
import { Question, Lesson } from '../../types';
import { format } from 'date-fns';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const AdminQAManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lessonFilter, setLessonFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // View and edit states
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const [questionsData, lessonsData] = await Promise.all([
        questionService.getAllQuestions(),
        getDocs(collection(db, 'lessons')).then(snapshot => 
          snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Lesson))
        )
      ]);
      setQuestions(questionsData);
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setShowViewDialog(true);
  };

  const handleAnswerQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setAnswerText(question.answer || '');
    setShowAnswerDialog(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      await questionService.deleteQuestion(questionId);
      setSuccess('Question deleted successfully');
      loadQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      setError('Failed to delete question');
    }
  };

  const handleSaveAnswer = async () => {
    if (!selectedQuestion || !answerText.trim()) return;

    try {
      await questionService.answerQuestion(selectedQuestion.id, answerText, currentUser?.name || 'Admin');
      setSuccess('Answer saved successfully');
      setShowAnswerDialog(false);
      setSelectedQuestion(null);
      setAnswerText('');
      loadQuestions();
    } catch (error) {
      console.error('Error saving answer:', error);
      setError('Failed to save answer');
    }
  };

  const handleCancelAnswer = () => {
    setShowAnswerDialog(false);
    setSelectedQuestion(null);
    setAnswerText('');
  };

  // Get unique lesson titles from questions
  const lessonTitles = Array.from(new Set(questions.map(q => {
    const lesson = lessons.find(l => l.id === q.lessonId);
    return lesson?.title || 'Unknown Lesson';
  }))).sort();

  // Filter and sort questions
  const filteredAndSortedQuestions = questions
    .filter(question => {
      const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (question.answer && question.answer.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           question.userName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'answered' && question.isAnswered) ||
                           (statusFilter === 'unanswered' && !question.isAnswered);
      
      const lesson = lessons.find(l => l.id === question.lessonId);
      const questionLessonTitle = lesson?.title || 'Unknown Lesson';
      const matchesLesson = lessonFilter === 'all' || questionLessonTitle === lessonFilter;
      
      return matchesSearch && matchesStatus && matchesLesson;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = a.createdAt.toDate();
          bValue = b.createdAt.toDate();
          break;
        case 'votes':
          aValue = a.votes || 0;
          bValue = b.votes || 0;
          break;
        case 'question':
          aValue = a.question.toLowerCase();
          bValue = b.question.toLowerCase();
          break;
        case 'userName':
          aValue = a.userName?.toLowerCase() || '';
          bValue = b.userName?.toLowerCase() || '';
          break;
        default:
          aValue = a.createdAt.toDate();
          bValue = b.createdAt.toDate();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStats = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter(q => q.isAnswered).length;
    const unansweredQuestions = totalQuestions - answeredQuestions;
    const totalVotes = questions.reduce((sum, q) => sum + (q.votes || 0), 0);
    
    return { totalQuestions, answeredQuestions, unansweredQuestions, totalVotes };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Q&A Management
          </Typography>
        </Box>

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

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                {stats.totalQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Questions
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                {stats.answeredQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Answered
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                {stats.unansweredQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unanswered
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                {stats.totalVotes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Votes
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Questions</MenuItem>
                  <MenuItem value="answered">Answered</MenuItem>
                  <MenuItem value="unanswered">Unanswered</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Lesson</InputLabel>
                <Select
                  value={lessonFilter}
                  onChange={(e) => setLessonFilter(e.target.value)}
                  label="Lesson"
                >
                  <MenuItem value="all">All Lessons</MenuItem>
                                      {lessonTitles.map(lessonTitle => (
                      <MenuItem key={lessonTitle} value={lessonTitle}>{lessonTitle}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="createdAt">Date</MenuItem>
                  <MenuItem value="votes">Votes</MenuItem>
                  <MenuItem value="question">Question</MenuItem>
                  <MenuItem value="userName">User</MenuItem>
                </Select>
              </FormControl>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                startIcon={<Sort />}
              >
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Questions ({filteredAndSortedQuestions.length})
            </Typography>
            
            {filteredAndSortedQuestions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <QuestionAnswer sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No questions found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || statusFilter !== 'all' || lessonFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No questions have been asked yet'
                  }
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredAndSortedQuestions.map((question, index) => (
                  <React.Fragment key={question.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                              {question.question}
                            </Typography>
                            {question.isAnswered && (
                              <Chip 
                                label="Answered" 
                                size="small" 
                                color="success" 
                                icon={<CheckCircle />}
                              />
                            )}
                            {!question.isAnswered && (
                              <Chip 
                                label="Unanswered" 
                                size="small" 
                                color="warning" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {question.answer && question.answer.length > 200
                                ? `${question.answer.substring(0, 200)}...`
                                : question.answer
                              }
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Lesson: {lessons.find(l => l.id === question.lessonId)?.title || 'Unknown Lesson'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                • {format(question.createdAt.toDate(), 'MMM d, yyyy h:mm a')}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ThumbUp sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {question.votes || 0}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Person sx={{ fontSize: 16, color: 'info.main' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {question.userName || 'Anonymous'}
                                </Typography>
                              </Box>
                            </Box>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Question">
                            <IconButton
                              size="small"
                              onClick={() => handleViewQuestion(question)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {!question.isAnswered && (
                            <Tooltip title="Answer Question">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleAnswerQuestion(question)}
                              >
                                <QuestionAnswer />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete Question">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < filteredAndSortedQuestions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* View Question Dialog */}
        <Dialog
          open={showViewDialog}
          onClose={() => setShowViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Question Details
          </DialogTitle>
          <DialogContent>
            {selectedQuestion && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedQuestion.question}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip label={lessons.find(l => l.id === selectedQuestion.lessonId)?.title || 'Unknown Lesson'} size="small" />
                  <Typography variant="caption" color="text.secondary">
                    Asked by {selectedQuestion.userName || 'Anonymous'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(selectedQuestion.createdAt.toDate(), 'MMM d, yyyy h:mm a')}
                  </Typography>
                </Box>
                
                {selectedQuestion.answer && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Answer:
                    </Typography>
                    <Typography variant="body2">
                      {selectedQuestion.answer}
                    </Typography>
                    {selectedQuestion.answeredAt && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Answered on {format(selectedQuestion.answeredAt.toDate(), 'MMM d, yyyy h:mm a')}
                        {selectedQuestion.answererName && ` by ${selectedQuestion.answererName}`}
                      </Typography>
                    )}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbUp sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="body2">
                      {selectedQuestion.votes || 0} votes
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {selectedQuestion && !selectedQuestion.isAnswered && (
              <Button
                variant="contained"
                onClick={() => {
                  setShowViewDialog(false);
                  handleAnswerQuestion(selectedQuestion);
                }}
              >
                Answer Question
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Answer Question Dialog */}
        <Dialog
          open={showAnswerDialog}
          onClose={handleCancelAnswer}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Answer Question
          </DialogTitle>
          <DialogContent>
            {selectedQuestion && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Question:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedQuestion.question}
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  Your Answer:
                </Typography>
                <TextareaAutosize
                  minRows={6}
                  placeholder="Enter your answer..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.9)',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelAnswer}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAnswer}
              disabled={!answerText.trim()}
            >
              Save Answer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminQAManagement; 