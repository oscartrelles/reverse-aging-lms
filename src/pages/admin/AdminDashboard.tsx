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
  ListItemIcon,
} from '@mui/material';
import { 
  Analytics,
  People,
  School,
  QuestionAnswer,
  Science,
  ArrowForward,
  Warning,
  CheckCircle,
  Book,
  Visibility,
  Email,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCourse } from '../../contexts/CourseContext';
import { questionService } from '../../services/questionService';
import { scientificUpdateService } from '../../services/scientificUpdateService';

import { userManagementService } from '../../services/userManagementService';
import { enrollmentService } from '../../services/enrollmentService';
import { studentManagementService } from '../../services/studentManagementService';
import EmailTestPanel from '../../components/admin/EmailTestPanel';

// Helper function to check user permissions
const hasPermission = (user: any, permission: 'admin' | 'moderator' | 'full') => {
  if (!user) return false;
  
  switch (permission) {
    case 'admin':
      return user.isAdmin;
    case 'moderator':
      return user.isAdmin || user.isModerator;
    case 'full':
      return user.isAdmin;
    default:
      return false;
  }
};

interface DashboardStats {
  totalUsers: number;
  newUsersSinceLastLogin: number;
  totalStudents: number;
  newEnrollmentsSinceLastLogin: number;
  unansweredQuestions: number;
  newQuestionsSinceLastLogin: number;
  totalScientificUpdates: number;
  newUpdatesSinceLastLogin: number;
  activeCohorts: number;
  upcomingCohorts: number;
  strugglingStudents: number;
  topPerformers: number;
}

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { courses, cohorts } = useCourse();
  const navigate = useNavigate();
  
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersSinceLastLogin: 0,
    totalStudents: 0,
    newEnrollmentsSinceLastLogin: 0,
    unansweredQuestions: 0,
    newQuestionsSinceLastLogin: 0,
    totalScientificUpdates: 0,
    newUpdatesSinceLastLogin: 0,
    activeCohorts: 0,
    upcomingCohorts: 0,
    strugglingStudents: 0,
    topPerformers: 0,
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [
        users,
        enrollments,
        questions,
        scientificUpdates,
        strugglingStudents,
        topPerformers
      ] = await Promise.all([
        userManagementService.getUsers(),
        enrollmentService.getAllEnrollments(),
        questionService.getAllQuestions(),
        scientificUpdateService.getAllUpdates(),
        studentManagementService.getStrugglingStudents(),
        studentManagementService.getTopPerformers()
      ]);

      // Calculate stats
      const now = new Date();
      const lastLogin = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 24 hours ago

      const newUsersSinceLastLogin = users.filter(user => 
        user.createdAt?.toDate() > lastLogin
      ).length;

      const newEnrollmentsSinceLastLogin = enrollments.filter(enrollment => 
        enrollment.enrolledAt?.toDate() > lastLogin
      ).length;

      const unansweredQuestions = questions.filter(q => !q.isAnswered).length;
      const newQuestionsSinceLastLogin = questions.filter(q => 
        q.createdAt?.toDate() > lastLogin
      ).length;

      const newUpdatesSinceLastLogin = scientificUpdates.filter(update => 
        update.createdAt?.toDate() > lastLogin
      ).length;

      const activeCohorts = cohorts.filter(c => c.status === 'active').length;
      const upcomingCohorts = cohorts.filter(c => c.status === 'upcoming').length;

      setStats({
        totalUsers: users.length,
        newUsersSinceLastLogin,
        totalStudents: enrollments.length,
        newEnrollmentsSinceLastLogin,
        unansweredQuestions,
        newQuestionsSinceLastLogin,
        totalScientificUpdates: scientificUpdates.length,
        newUpdatesSinceLastLogin,
        activeCohorts,
        upcomingCohorts,
        strugglingStudents: strugglingStudents.length,
        topPerformers: topPerformers.length,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const ManagementBox: React.FC<{
    title: string;
    icon: React.ReactNode;
    highlights: Array<{ label: string; value: string | number; color?: 'success' | 'warning' | 'error' | 'info' }>;
    actionItems?: Array<{ label: string; count: number; color?: 'success' | 'warning' | 'error' | 'info' }>;
    linkTo: string;
    permission?: 'admin' | 'moderator' | 'full';
  }> = ({ title, icon, highlights, actionItems, linkTo, permission = 'full' }) => {
    if (!hasPermission(currentUser, permission)) return null;

    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {icon}
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowForward />}
              onClick={() => navigate(linkTo)}
            >
              Manage
            </Button>
          </Box>

          {/* Highlights */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Highlights
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              {highlights.map((highlight, index) => (
                <Box key={index}>
                  <Box sx={{ 
                    p: 1, 
                    backgroundColor: 'rgba(255,255,255,0.02)', 
                    borderRadius: 1,
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {highlight.label}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={highlight.color ? `${highlight.color}.main` : 'primary.main'}
                      sx={{ fontWeight: 600 }}
                    >
                      {highlight.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Action Items */}
          {actionItems && actionItems.length > 0 && (
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Action Items
              </Typography>
              <List dense sx={{ p: 0 }}>
                {actionItems.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {item.color === 'warning' && <Warning color="warning" />}
                      {item.color === 'error' && <Warning color="error" />}
                      {item.color === 'success' && <CheckCircle color="success" />}
                      {item.color === 'info' && <Visibility color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {item.label}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {item.count} items need attention
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

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
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          {currentUser?.isAdmin ? 'Admin' : 'Moderator'} Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Management System Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {/* Analytics Management */}
          <Box>
            <ManagementBox
              title="Analytics"
              icon={<Analytics color="primary" />}
              highlights={[
                { label: 'Total Users', value: stats.totalUsers },
                { label: 'Active Students', value: stats.totalStudents },
                { label: 'Active Cohorts', value: stats.activeCohorts },
                { label: 'Upcoming Cohorts', value: stats.upcomingCohorts },
              ]}
              actionItems={[
                { label: 'Review performance trends', count: 1, color: 'info' as const },
              ]}
              linkTo="/admin/analytics"
              permission="full"
            />
          </Box>

          {/* User Management */}
          <Box>
            <ManagementBox
              title="User Management"
              icon={<People color="primary" />}
              highlights={[
                { label: 'Total Users', value: stats.totalUsers },
                { label: 'New Since Login', value: stats.newUsersSinceLastLogin, color: 'success' as const },
              ]}
              actionItems={[
                { label: 'New users to review', count: stats.newUsersSinceLastLogin, color: 'info' as const },
              ]}
              linkTo="/admin/users"
              permission="full"
            />
          </Box>

          {/* Student Management */}
          <Box>
            <ManagementBox
              title="Student Management"
              icon={<School color="primary" />}
              highlights={[
                { label: 'Total Students', value: stats.totalStudents },
                { label: 'New Enrollments', value: stats.newEnrollmentsSinceLastLogin, color: 'success' as const },
                { label: 'Struggling', value: stats.strugglingStudents, color: 'warning' as const },
                { label: 'Top Performers', value: stats.topPerformers, color: 'success' as const },
              ]}
              actionItems={[
                { label: 'Students need support', count: stats.strugglingStudents, color: 'warning' as const },
                { label: 'New enrollments to review', count: stats.newEnrollmentsSinceLastLogin, color: 'info' as const },
              ]}
              linkTo="/admin/students"
              permission="full"
            />
          </Box>

          {/* Q&A Management */}
          <Box>
            <ManagementBox
              title="Q&A Management"
              icon={<QuestionAnswer color="primary" />}
              highlights={[
                { label: 'Unanswered', value: stats.unansweredQuestions, color: 'warning' as const },
                { label: 'New Since Login', value: stats.newQuestionsSinceLastLogin, color: 'success' as const },
              ]}
              actionItems={[
                { label: 'Questions need answers', count: stats.unansweredQuestions, color: 'warning' as const },
                { label: 'New questions to review', count: stats.newQuestionsSinceLastLogin, color: 'info' as const },
              ]}
              linkTo="/admin/qa"
              permission="moderator"
            />
          </Box>

          {/* Scientific Updates Management */}
          <Box>
            <ManagementBox
              title="Scientific Updates"
              icon={<Science color="primary" />}
              highlights={[
                { label: 'Total Updates', value: stats.totalScientificUpdates },
                { label: 'New Since Login', value: stats.newUpdatesSinceLastLogin, color: 'success' as const },
              ]}
              actionItems={[
                { label: 'New updates to review', count: stats.newUpdatesSinceLastLogin, color: 'info' as const },
              ]}
              linkTo="/admin/scientific-updates"
              permission="moderator"
            />
          </Box>

          {/* Course Management */}
          <Box>
            <ManagementBox
              title="Course Management"
              icon={<Book color="primary" />}
              highlights={[
                { label: 'Total Courses', value: courses.length },
                { label: 'Active Cohorts', value: stats.activeCohorts },
                { label: 'Upcoming Cohorts', value: stats.upcomingCohorts },
                { label: 'Total Lessons', value: 0 }, // TODO: Add lessons count
              ]}
              actionItems={[
                { label: 'Upcoming cohorts to prepare', count: stats.upcomingCohorts, color: 'info' as const },
              ]}
              linkTo="/admin/courses"
              permission="full"
            />
          </Box>
        </Box>

        {/* Quick Actions */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {hasPermission(currentUser, 'moderator') && (
                <Button
                  variant="outlined"
                  startIcon={<QuestionAnswer />}
                  onClick={() => navigate('/admin/qa')}
                >
                  Answer Questions
                </Button>
              )}
              {hasPermission(currentUser, 'moderator') && (
                <Button
                  variant="outlined"
                  startIcon={<Science />}
                  onClick={() => navigate('/admin/scientific-updates')}
                >
                  Create Scientific Update
                </Button>
              )}
              {hasPermission(currentUser, 'full') && (
                <Button
                  variant="outlined"
                  startIcon={<School />}
                  onClick={() => navigate('/admin/students')}
                >
                  Manage Students
                </Button>
              )}
              {hasPermission(currentUser, 'full') && (
                <Button
                  variant="outlined"
                  startIcon={<People />}
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </Button>
              )}
              {hasPermission(currentUser, 'full') && (
                <Button
                  variant="outlined"
                  startIcon={<Analytics />}
                  onClick={() => navigate('/admin/analytics')}
                >
                  View Analytics
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Email System Test */}
        {hasPermission(currentUser, 'full') && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="primary" />
                Email System Test
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Test the MailerSend email integration and welcome email template
              </Typography>
              <EmailTestPanel />
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboard; 