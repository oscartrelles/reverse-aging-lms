import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  QuestionAnswer,
  Send,
  ExpandMore,
  Person,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { questionService } from '../services/questionService';
import { Question } from '../types';
import { format } from 'date-fns';

interface LessonQAProps {
  lessonId: string;
  courseId: string;
  lessonTitle: string;
}

const LessonQA: React.FC<LessonQAProps> = ({ lessonId, courseId, lessonTitle }) => {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAskDialog, setShowAskDialog] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  // Load questions on component mount
  useEffect(() => {
    loadQuestions();
  }, [lessonId]);

  const loadQuestions = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const [publicQuestions, userSpecificQuestions] = await Promise.all([
        questionService.getLessonQuestions(lessonId, false),
        questionService.getUserLessonQuestions(currentUser.id, lessonId),
      ]);

      setQuestions(publicQuestions);
      setUserQuestions(userSpecificQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!currentUser || !newQuestion.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await questionService.createQuestion({
        userId: currentUser.id,
        lessonId,
        courseId,
        question: newQuestion.trim(),
        isPublic: !isPrivate,
      });

      setSuccess('Question submitted successfully!');
      setNewQuestion('');
      setShowAskDialog(false);
      setIsPrivate(false);
      
      // Reload questions to show the new one
      await loadQuestions();
    } catch (error) {
      console.error('Error submitting question:', error);
      setError('Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuestionStats = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter(q => q.isAnswered).length;
    const unansweredQuestions = totalQuestions - answeredQuestions;

    return { totalQuestions, answeredQuestions, unansweredQuestions };
  };

  const stats = getQuestionStats();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Q&A for Week {lessonTitle}
        </Typography>
        <Button
          variant="contained"
          startIcon={<QuestionAnswer />}
          onClick={() => setShowAskDialog(true)}
          size="small"
        >
          Ask a Question
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip 
          label={`${stats.totalQuestions} total questions`}
          variant="outlined"
          size="small"
        />
        <Chip 
          label={`${stats.answeredQuestions} answered`}
          color="success"
          variant="outlined"
          size="small"
        />
        <Chip 
          label={`${stats.unansweredQuestions} pending`}
          color="warning"
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Alerts */}
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

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <QuestionAnswer sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No questions yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Be the first to ask a question about this lesson!
            </Typography>
            <Button
              variant="contained"
              startIcon={<QuestionAnswer />}
              onClick={() => setShowAskDialog(true)}
            >
              Ask the First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <List>
          {questions.map((question, index) => (
            <React.Fragment key={question.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: question.isAnswered ? 'success.main' : 'primary.main' }}>
                    {question.isAnswered ? <CheckCircle /> : <Person />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {question.question}
                      </Typography>
                      {question.isAnswered && (
                        <Chip label="Answered" color="success" size="small" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule sx={{ fontSize: 16 }} />
                        {format(question.createdAt.toDate(), 'MMM d, yyyy h:mm a')}
                      </Typography>
                      {question.answer && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="subtitle2" color="primary.main" gutterBottom>
                            Answer:
                          </Typography>
                          <Typography variant="body2">
                            {question.answer}
                          </Typography>
                          {question.answeredAt && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              Answered on {format(question.answeredAt.toDate(), 'MMM d, yyyy h:mm a')}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < questions.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* User's Private Questions */}
      {userQuestions.some(q => !q.isPublic) && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" color="text.secondary">
              Your Private Questions ({userQuestions.filter(q => !q.isPublic).length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {userQuestions
                .filter(q => !q.isPublic)
                .map((question, index) => (
                  <React.Fragment key={question.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: question.isAnswered ? 'success.main' : 'warning.main' }}>
                          {question.isAnswered ? <CheckCircle /> : <Schedule />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {question.question}
                            </Typography>
                            <Chip label="Private" color="warning" size="small" />
                            {question.isAnswered && (
                              <Chip label="Answered" color="success" size="small" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {format(question.createdAt.toDate(), 'MMM d, yyyy h:mm a')}
                            </Typography>
                            {question.answer && (
                              <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="primary.main" gutterBottom>
                                  Answer:
                                </Typography>
                                <Typography variant="body2">
                                  {question.answer}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < userQuestions.filter(q => !q.isPublic).length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Ask Question Dialog */}
      <Dialog open={showAskDialog} onClose={() => setShowAskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ask a Question</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ask a question about "{lessonTitle}". Your question will help other students and can be answered during the live Q&A session.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="What would you like to know about this lesson?"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={isPrivate ? "Private Question" : "Public Question"}
              color={isPrivate ? "warning" : "primary"}
              variant="outlined"
              onClick={() => setIsPrivate(!isPrivate)}
              clickable
            />
            <Typography variant="caption" color="text.secondary">
              {isPrivate 
                ? "Only you and the instructor can see this question"
                : "Other students can see and benefit from this question"
              }
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAskDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitQuestion}
            variant="contained"
            disabled={!newQuestion.trim() || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <Send />}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Question'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LessonQA; 