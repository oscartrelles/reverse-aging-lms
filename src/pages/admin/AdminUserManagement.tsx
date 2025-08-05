import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  School,
  Person,
  Email,
  CalendarToday,
  AdminPanelSettings,
  Block,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { User, Course, Cohort, Enrollment } from '../../types';
import { Timestamp } from 'firebase/firestore';
import { enrollmentService } from '../../services/enrollmentService';
import { userManagementService, UserFilters } from '../../services/userManagementService';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<UserFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [userManagementDialogOpen, setUserManagementDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [enrollmentForm, setEnrollmentForm] = useState({
    courseId: '',
    cohortId: '',
    paymentStatus: 'paid' as 'pending' | 'paid' | 'failed' | 'refunded',
  });
  const [userManagementForm, setUserManagementForm] = useState({
    isAdmin: false,
    isModerator: false,
    isDisabled: false,
    isSuspended: false,
    emailVerified: false,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users using userManagementService
      const usersData = await userManagementService.getUsers({
        ...filters,
        search: searchTerm || undefined
      });
      setUsers(usersData);

      // Load courses
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Course[];
      setCourses(coursesData);

      // Load cohorts
      const cohortsSnapshot = await getDocs(collection(db, 'cohorts'));
      const cohortsData = cohortsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
      })) as Cohort[];
      setCohorts(cohortsData);

      // Load enrollments
      const enrollmentsData = await enrollmentService.getAllEnrollments();
      setEnrollments(enrollmentsData as Enrollment[]);

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getUserEnrollments = (userId: string) => {
    return enrollments.filter(e => e.userId === userId);
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Unknown Course';
  };

  const getCohortName = (cohortId: string) => {
    const cohort = cohorts.find(c => c.id === cohortId);
    return cohort ? cohort.name : 'Unknown Cohort';
  };

  const handleEnrollUser = (user: User) => {
    setSelectedUser(user);
    setEnrollmentForm({
      courseId: '',
      cohortId: '',
      paymentStatus: 'paid',
    });
    setEnrollmentDialogOpen(true);
  };

  const handleUserManagement = (user: User) => {
    setSelectedUser(user);
    setUserManagementForm({
      isAdmin: user.isAdmin || false,
      isModerator: user.isModerator || false,
      isDisabled: user.isDisabled || false,
      isSuspended: user.isSuspended || false,
      emailVerified: user.emailVerified || false,
    });
    setUserManagementDialogOpen(true);
  };

  const handleEnrollmentSubmit = async () => {
    if (!selectedUser || !enrollmentForm.courseId || !enrollmentForm.cohortId) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if user is already enrolled in this course
      const existingEnrollment = enrollments.find(
        e => e.userId === selectedUser.id && e.courseId === enrollmentForm.courseId
      );

      if (existingEnrollment) {
        // Update existing enrollment to new cohort (cohort switching)
        await enrollmentService.updateEnrollment(existingEnrollment.id, {
          cohortId: enrollmentForm.cohortId,
          paymentStatus: enrollmentForm.paymentStatus,
        });
        
        setSuccess('User switched to new cohort successfully!');
        setEnrollmentDialogOpen(false);
        loadData(); // Reload data to show updated enrollments
        return;
      }

      // Create enrollment
      await enrollmentService.createEnrollment({
        userId: selectedUser.id,
        courseId: enrollmentForm.courseId,
        cohortId: enrollmentForm.cohortId,
        status: 'active',
        paymentStatus: enrollmentForm.paymentStatus,
      });

      setSuccess('User enrolled successfully!');
      setEnrollmentDialogOpen(false);
      loadData(); // Reload data to show updated enrollments

    } catch (error) {
      console.error('Error enrolling user:', error);
      setError('Failed to enroll user');
    } finally {
      setLoading(false);
    }
  };

  const handleUserManagementSubmit = async () => {
    if (!selectedUser) {
      setError('No user selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await userManagementService.updateUser(selectedUser.id, {
        isAdmin: userManagementForm.isAdmin,
        isModerator: userManagementForm.isModerator,
        isDisabled: userManagementForm.isDisabled,
        isSuspended: userManagementForm.isSuspended,
        emailVerified: userManagementForm.emailVerified,
      });

      setSuccess('User updated successfully!');
      setUserManagementDialogOpen(false);
      loadData(); // Reload data to show updated users

    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await userManagementService.deleteUser(userId);
      setSuccess('User deleted successfully!');
      loadData();

    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      await userManagementService.suspendUser(userId, 'Suspended by admin');
      setSuccess('User suspended successfully!');
      loadData();

    } catch (error) {
      console.error('Error suspending user:', error);
      setError('Failed to suspend user');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      await userManagementService.reactivateUser(userId);
      setSuccess('User reactivated successfully!');
      loadData();

    } catch (error) {
      console.error('Error reactivating user:', error);
      setError('Failed to reactivate user');
    } finally {
      setLoading(false);
    }
  };

  const getCohortsForCourse = (courseId: string) => {
    return cohorts.filter(cohort => cohort.courseId === courseId);
  };

  const formatDate = (date: Date | undefined | any) => {
    if (!date) return 'N/A';
    
    // Handle Firestore Timestamp
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString();
    }
    
    // Handle regular Date
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    
    return 'N/A';
  };

  const getUserStatus = (user: User) => {
    if (user.isSuspended) return { label: 'Suspended', color: 'error' as const };
    if (user.isDisabled) return { label: 'Disabled', color: 'warning' as const };
    return { label: 'Active', color: 'success' as const };
  };

  const getUserRole = (user: User) => {
    if (user.isAdmin) return { label: 'Admin', color: 'primary' as const };
    if (user.isModerator) return { label: 'Moderator', color: 'secondary' as const };
    return { label: 'User', color: 'default' as const };
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users, roles, and account status
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                label="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filters.role || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as any || undefined }))}
                  label="Role"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="moderator">Moderator</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined }))}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Email Verified</InputLabel>
                <Select
                  value={filters.emailVerified === undefined ? '' : filters.emailVerified.toString()}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    emailVerified: e.target.value === '' ? undefined : e.target.value === 'true'
                  }))}
                  label="Email Verified"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Verified</MenuItem>
                  <MenuItem value="false">Not Verified</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4" color="primary.main">
                {users.length}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4" color="success.main">
                {users.filter(u => !u.isDisabled && !u.isSuspended).length}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Admins
              </Typography>
              <Typography variant="h4" color="primary.main">
                {users.filter(u => u.isAdmin).length}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enrollments
              </Typography>
              <Typography variant="h4" color="secondary.main">
                {enrollments.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Users Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Users ({users.length})
            </Typography>
            
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Enrollments</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => {
                    const userEnrollments = getUserEnrollments(user.id);
                    const userStatus = getUserStatus(user);
                    const userRole = getUserRole(user);
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person />
                            <Typography variant="body2">
                              {user.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email fontSize="small" />
                            {user.email}
                            {user.emailVerified && (
                              <CheckCircle fontSize="small" color="success" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={userRole.label}
                            color={userRole.color}
                            size="small"
                            icon={user.isAdmin ? <AdminPanelSettings /> : undefined}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={userStatus.label}
                            color={userStatus.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday fontSize="small" />
                            {formatDate(user.createdAt)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {userEnrollments.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                No enrollments
                              </Typography>
                            ) : (
                              userEnrollments.map((enrollment) => (
                                <Chip
                                  key={enrollment.id}
                                  label={`${getCourseName(enrollment.courseId)} - ${getCohortName(enrollment.cohortId)}`}
                                  size="small"
                                  color={enrollment.status === 'active' ? 'success' : 'default'}
                                  variant="outlined"
                                />
                              ))
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Manage User">
                              <IconButton
                                size="small"
                                onClick={() => handleUserManagement(user)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Enroll in Course">
                              <IconButton
                                size="small"
                                onClick={() => handleEnrollUser(user)}
                                color="secondary"
                              >
                                <Add />
                              </IconButton>
                            </Tooltip>
                            {user.isSuspended ? (
                              <Tooltip title="Reactivate User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleReactivateUser(user.id)}
                                  color="success"
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Suspend User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleSuspendUser(user.id)}
                                  color="warning"
                                >
                                  <Warning />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete User">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteUser(user.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Enrollment Dialog */}
        <Dialog open={enrollmentDialogOpen} onClose={() => setEnrollmentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Enroll {selectedUser?.name} in Course
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  value={enrollmentForm.courseId}
                  onChange={(e) => setEnrollmentForm(prev => ({ ...prev, courseId: e.target.value, cohortId: '' }))}
                  label="Course"
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Cohort</InputLabel>
                <Select
                  value={enrollmentForm.cohortId}
                  onChange={(e) => setEnrollmentForm(prev => ({ ...prev, cohortId: e.target.value }))}
                  label="Cohort"
                  disabled={!enrollmentForm.courseId}
                >
                  {enrollmentForm.courseId && getCohortsForCourse(enrollmentForm.courseId).map((cohort) => (
                    <MenuItem key={cohort.id} value={cohort.id}>
                      {cohort.name} ({cohort.currentStudents}/{cohort.maxStudents} students)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={enrollmentForm.paymentStatus}
                  onChange={(e) => setEnrollmentForm(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
                  label="Payment Status"
                >
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEnrollmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEnrollmentSubmit}
              variant="contained"
              disabled={!enrollmentForm.courseId || !enrollmentForm.cohortId}
            >
              Enroll User
            </Button>
          </DialogActions>
        </Dialog>

        {/* User Management Dialog */}
        <Dialog open={userManagementDialogOpen} onClose={() => setUserManagementDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Manage {selectedUser?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userManagementForm.isAdmin}
                    onChange={(e) => setUserManagementForm(prev => ({ ...prev, isAdmin: e.target.checked }))}
                  />
                }
                label="Admin Access"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={userManagementForm.isModerator}
                    onChange={(e) => setUserManagementForm(prev => ({ ...prev, isModerator: e.target.checked }))}
                  />
                }
                label="Moderator Access"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={userManagementForm.isDisabled}
                    onChange={(e) => setUserManagementForm(prev => ({ ...prev, isDisabled: e.target.checked }))}
                  />
                }
                label="Disabled Account"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={userManagementForm.isSuspended}
                    onChange={(e) => setUserManagementForm(prev => ({ ...prev, isSuspended: e.target.checked }))}
                  />
                }
                label="Suspended Account"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={userManagementForm.emailVerified}
                    onChange={(e) => setUserManagementForm(prev => ({ ...prev, emailVerified: e.target.checked }))}
                  />
                }
                label="Email Verified"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserManagementDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUserManagementSubmit}
              variant="contained"
            >
              Update User
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminUserManagement; 