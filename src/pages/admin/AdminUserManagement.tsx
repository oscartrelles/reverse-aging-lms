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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  School,
  Person,
  Email,
  CalendarToday,
} from '@mui/icons-material';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { User, Course, Cohort, Enrollment } from '../../types';
import { Timestamp } from 'firebase/firestore';
import { enrollmentService } from '../../services/enrollmentService';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [enrollmentForm, setEnrollmentForm] = useState({
    courseId: '',
    cohortId: '',
    paymentStatus: 'paid' as 'pending' | 'paid' | 'failed' | 'refunded',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as User[];
      
      // Remove duplicates (keep the one with the most recent createdAt)
      const uniqueUsers = usersData.reduce((acc, user) => {
        const existingUser = acc.find(u => u.email === user.email);
        if (!existingUser) {
          acc.push(user);
        } else if (user.createdAt && existingUser.createdAt && user.createdAt > existingUser.createdAt) {
          // Replace with newer user data
          const index = acc.findIndex(u => u.email === user.email);
          acc[index] = user;
        }
        return acc;
      }, [] as User[]);
      
      setUsers(uniqueUsers);

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
        startDate: doc.data().startDate,
        endDate: doc.data().endDate,
      })) as Cohort[];
      setCohorts(cohortsData);

      // Load enrollments
      const enrollmentsSnapshot = await getDocs(collection(db, 'enrollments'));
      const enrollmentsData = enrollmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        enrolledAt: doc.data().enrolledAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as Enrollment[];
      setEnrollments(enrollmentsData);

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getUserEnrollments = (userId: string) => {
    return enrollments.filter(enrollment => enrollment.userId === userId);
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  const getCohortName = (cohortId: string) => {
    const cohort = cohorts.find(c => c.id === cohortId);
    return cohort?.name || 'Unknown Cohort';
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
        const enrollmentRef = doc(db, 'enrollments', existingEnrollment.id);
        await updateDoc(enrollmentRef, {
          cohortId: enrollmentForm.cohortId,
          paymentStatus: enrollmentForm.paymentStatus,
          updatedAt: Timestamp.now(),
        });
        
        setSuccess('User switched to new cohort successfully!');
        setEnrollmentDialogOpen(false);
        loadData(); // Reload data to show updated enrollments
        return;
      }

      // Create enrollment
      const enrollmentId = await enrollmentService.createEnrollment({
        userId: selectedUser.id,
        courseId: enrollmentForm.courseId,
        cohortId: enrollmentForm.cohortId,
        status: 'active',
        paymentStatus: enrollmentForm.paymentStatus,
      });

      // Update cohort student count
      const cohort = cohorts.find(c => c.id === enrollmentForm.cohortId);
      if (cohort) {
        const cohortRef = doc(db, 'cohorts', cohort.id);
        await updateDoc(cohortRef, {
          currentStudents: cohort.currentStudents + 1,
        });
      }

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

  const cleanupDuplicateUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as User[];
      
      // Group users by email
      const userGroups = usersData.reduce((acc, user) => {
        if (!acc[user.email]) {
          acc[user.email] = [];
        }
        acc[user.email].push(user);
        return acc;
      }, {} as Record<string, User[]>);
      
      // Delete duplicates (keep the most recent one)
      let deletedCount = 0;
      for (const [email, users] of Object.entries(userGroups)) {
        if (users.length > 1) {
          // Sort by createdAt, keep the most recent
          users.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            
            // Handle Firestore Timestamps
            const aTime = a.createdAt && typeof a.createdAt.toDate === 'function' 
              ? a.createdAt.toDate().getTime() 
              : a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
            
            const bTime = b.createdAt && typeof b.createdAt.toDate === 'function' 
              ? b.createdAt.toDate().getTime() 
              : b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
            
            return bTime - aTime;
          });
          
          // Delete all but the most recent
          const toDelete = users.slice(1);
          for (const user of toDelete) {
            await deleteDoc(doc(db, 'users', user.id));
            deletedCount++;
          }
        }
      }
      
      setSuccess(`Cleaned up ${deletedCount} duplicate users!`);
      loadData(); // Reload the data
      
    } catch (error) {
      console.error('Error cleaning up duplicate users:', error);
      setError('Failed to clean up duplicate users');
    } finally {
      setLoading(false);
    }
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
              Manage users and their course enrollments
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="warning"
            onClick={cleanupDuplicateUsers}
            disabled={loading}
          >
            Clean Up Duplicates
          </Button>
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
                Total Enrollments
              </Typography>
              <Typography variant="h4" color="primary.main">
                {enrollments.length}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Courses
              </Typography>
              <Typography variant="h4" color="primary.main">
                {courses.filter(c => c.status === 'active').length}
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
                    <TableCell>Joined</TableCell>
                    <TableCell>Enrollments</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => {
                    const userEnrollments = getUserEnrollments(user.id);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person />
                            <Typography variant="body2">
                              {user.name}
                            </Typography>
                            {user.isAdmin && (
                              <Chip label="Admin" size="small" color="primary" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email fontSize="small" />
                            {user.email}
                          </Box>
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
                          <Chip
                            label={userEnrollments.length > 0 ? 'Enrolled' : 'Not Enrolled'}
                            color={userEnrollments.length > 0 ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Enroll in Course">
                            <IconButton
                              size="small"
                              onClick={() => handleEnrollUser(user)}
                              color="primary"
                            >
                              <Add />
                            </IconButton>
                          </Tooltip>
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
      </Box>
    </Container>
  );
};

export default AdminUserManagement; 