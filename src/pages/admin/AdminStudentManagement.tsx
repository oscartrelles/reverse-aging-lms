import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Grid,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  RemoveCircle as RemoveCircleIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TransferWithinAStation as TransferIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCourse } from '../../contexts/CourseContext';
import { studentManagementService, StudentFilters, StudentData, StudentAnalytics } from '../../services/studentManagementService';
import { userManagementService } from '../../services/userManagementService';
import { enrollmentService } from '../../services/enrollmentService';
import { Timestamp } from 'firebase/firestore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminStudentManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { courses, cohorts } = useCourse();
  
  // State
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [strugglingStudents, setStrugglingStudents] = useState<StudentData[]>([]);
  const [topPerformers, setTopPerformers] = useState<StudentData[]>([]);
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<StudentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Selection
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  
  // Dialogs
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [studentDetailDialogOpen, setStudentDetailDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [enrollmentForm, setEnrollmentForm] = useState({
    userId: '',
    courseId: '',
    cohortId: '',
    paymentStatus: 'paid' as 'pending' | 'paid' | 'failed' | 'refunded',
  });
  const [transferForm, setTransferForm] = useState({
    newCohortId: '',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, filters, tabValue, strugglingStudents, topPerformers]);

  const loadData = async () => {
      setLoading(true);
    try {
      // Load students using studentManagementService
      const studentsData = await studentManagementService.getStudents(filters);
      setStudents(studentsData);
      
      // Load struggling students and top performers
      const [strugglingData, topPerformersData] = await Promise.all([
        studentManagementService.getStrugglingStudents(),
        studentManagementService.getTopPerformers(10)
      ]);
      setStrugglingStudents(strugglingData);
      setTopPerformers(topPerformersData);
      
      // Load analytics
      const analyticsData = await studentManagementService.getStudentAnalytics();
      setAnalytics(analyticsData);
      
    } catch (error) {
      console.error('Error loading students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = students;
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.user.name?.toLowerCase().includes(searchLower) ||
        student.user.email?.toLowerCase().includes(searchLower) ||
        student.user.firstName?.toLowerCase().includes(searchLower) ||
        student.user.lastName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply tab-specific filtering
    if (tabValue === 1) {
      // Struggling Students tab - use the pre-loaded struggling students
      filtered = strugglingStudents.filter(student => {
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return student.user.name?.toLowerCase().includes(searchLower) ||
                 student.user.email?.toLowerCase().includes(searchLower) ||
                 student.user.firstName?.toLowerCase().includes(searchLower) ||
                 student.user.lastName?.toLowerCase().includes(searchLower);
        }
        return true;
      });
    } else if (tabValue === 2) {
      // Top Performers tab - use the pre-loaded top performers
      filtered = topPerformers.filter(student => {
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return student.user.name?.toLowerCase().includes(searchLower) ||
                 student.user.email?.toLowerCase().includes(searchLower) ||
                 student.user.firstName?.toLowerCase().includes(searchLower) ||
                 student.user.lastName?.toLowerCase().includes(searchLower);
        }
        return true;
      });
    }

    setFilteredStudents(filtered);
    setPage(0); // Reset to first page when filters change
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredStudents.map(student => student.userId);
      setSelectedStudents(newSelected);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string) => {
    const selectedIndex = selectedStudents.indexOf(studentId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedStudents, studentId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedStudents.slice(1));
    } else if (selectedIndex === selectedStudents.length - 1) {
      newSelected = newSelected.concat(selectedStudents.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedStudents.slice(0, selectedIndex),
        selectedStudents.slice(selectedIndex + 1),
      );
    }

    setSelectedStudents(newSelected);
  };

  const handleViewStudent = (student: StudentData) => {
    setSelectedStudent(student);
    setStudentDetailDialogOpen(true);
  };

  const handleEnrollStudent = (student: StudentData) => {
    setSelectedStudent(student);
    setEnrollmentForm({
      userId: student.userId,
      courseId: '',
      cohortId: '',
      paymentStatus: 'paid',
    });
    setEnrollmentDialogOpen(true);
  };

  const handleTransferStudent = (student: StudentData) => {
    setSelectedStudent(student);
    setTransferForm({
      newCohortId: '',
    });
    setTransferDialogOpen(true);
  };

  const handleEnrollmentSubmit = async () => {
    if (!enrollmentForm.courseId || !enrollmentForm.cohortId) {
      setError('Please select a course and cohort');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await studentManagementService.enrollStudent(
        enrollmentForm.userId,
        enrollmentForm.courseId,
        enrollmentForm.cohortId,
        {
          paymentStatus: enrollmentForm.paymentStatus,
        }
      );

      setSuccess('Student enrolled successfully!');
      setEnrollmentDialogOpen(false);
      loadData();

    } catch (error) {
      console.error('Error enrolling student:', error);
      setError('Failed to enroll student');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async () => {
    if (!selectedStudent || !transferForm.newCohortId) {
      setError('Please select a new cohort');
        return;
      }

    try {
      setLoading(true);
      setError(null);

      await studentManagementService.transferStudent(selectedStudent.userId, transferForm.newCohortId);

      setSuccess('Student transferred successfully!');
      setTransferDialogOpen(false);
      loadData();

    } catch (error) {
      console.error('Error transferring student:', error);
      setError('Failed to transfer student');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenrollStudent = async (student: StudentData) => {
    if (!window.confirm(`Are you sure you want to unenroll ${student.user.name}?`)) {
        return;
      }

    try {
      setLoading(true);
      setError(null);

      await studentManagementService.unenrollStudent(student.userId, student.enrollment.courseId);

      setSuccess('Student unenrolled successfully!');
      loadData();

    } catch (error) {
      console.error('Error unenrolling student:', error);
      setError('Failed to unenroll student');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStudent = async (student: StudentData) => {
    if (!window.confirm(`Are you sure you want to mark ${student.user.name} as completed?`)) {
        return;
      }

    try {
      setLoading(true);
      setError(null);

      await studentManagementService.completeStudent(student.userId);

      setSuccess('Student marked as completed!');
      loadData();

    } catch (error) {
      console.error('Error completing student:', error);
      setError('Failed to complete student');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedStudents.length === 0) {
      setError('Please select students first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      switch (action) {
        case 'unenroll':
          for (const studentId of selectedStudents) {
            const student = students.find(s => s.userId === studentId);
            if (student) {
              await studentManagementService.unenrollStudent(student.userId, student.enrollment.courseId);
            }
          }
          setSuccess(`${selectedStudents.length} students unenrolled successfully!`);
          break;
        case 'complete':
          for (const studentId of selectedStudents) {
            await studentManagementService.completeStudent(studentId);
          }
          setSuccess(`${selectedStudents.length} students marked as completed!`);
          break;
        default:
          setError('Invalid action');
          return;
      }
      
      setSelectedStudents([]);
      loadData();

    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError('Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  const getCohortsForCourse = (courseId: string) => {
    return cohorts.filter(cohort => cohort.courseId === courseId);
  };

  const formatDate = (date: Timestamp | undefined) => {
    if (!date) return 'N/A';
    return date.toDate().toLocaleDateString();
  };

  if (loading && students.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading students...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Student Management
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage student enrollments, progress, and academic performance
        </Typography>

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

        {/* Analytics Cards */}
        {analytics && (
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Students
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {analytics.totalStudents}
                </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Students
        </Typography>
                <Typography variant="h4" color="success.main">
                  {analytics.activeStudents}
                </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                  Completion Rate
                  </Typography>
                <Typography variant="h4" color="info.main">
                  {analytics.averageCompletionRate.toFixed(1)}%
                </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                  Completed
                  </Typography>
                <Typography variant="h4" color="secondary.main">
                  {analytics.completedStudents}
                </Typography>
            </CardContent>
          </Card>
        </Box>
        )}

          {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                label="Search students"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Course</InputLabel>
                  <Select
                  value={filters.courseId || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, courseId: e.target.value || undefined }))}
                  label="Course"
                >
                  <MenuItem value="">All Courses</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.title}
                    </MenuItem>
                  ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Cohort</InputLabel>
                  <Select
                  value={filters.cohortId || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, cohortId: e.target.value || undefined }))}
                    label="Cohort"
                  >
                  <MenuItem value="">All Cohorts</MenuItem>
                  {cohorts.map((cohort) => (
                      <MenuItem key={cohort.id} value={cohort.id}>
                      {cohort.name} ({cohort.status})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                  <Select
                  value={filters.enrollmentStatus || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, enrollmentStatus: e.target.value as any || undefined }))}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
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

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label={`All Students (${students.length})`} />
            <Tab label={`Struggling Students (${strugglingStudents.length})`} />
            <Tab label={`Top Performers (${topPerformers.length})`} />
          </Tabs>
        </Box>

        {/* Students Table */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {tabValue === 0 && `All Students (${filteredStudents.length})`}
                {tabValue === 1 && `Struggling Students (${filteredStudents.length})`}
                {tabValue === 2 && `Top Performers (${filteredStudents.length})`}
              </Typography>
              {selectedStudents.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleBulkAction('unenroll')}
                  >
                    Unenroll Selected ({selectedStudents.length})
                </Button>
                <Button
                  size="small"
                    variant="outlined"
                    color="info"
                    onClick={() => handleBulkAction('complete')}
                  >
                    Complete Selected ({selectedStudents.length})
                </Button>
              </Box>
          )}
            </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                        checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Student</TableCell>
                    <TableCell>Course & Cohort</TableCell>
                  <TableCell>Progress</TableCell>
                    <TableCell>Status</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student) => {
                      const isSelected = selectedStudents.indexOf(student.userId) !== -1;
                      const course = courses.find(c => c.id === student.enrollment.courseId);
                      const cohort = cohorts.find(c => c.id === student.enrollment.cohortId);
                      
                      return (
                        <TableRow key={student.userId} selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                              checked={isSelected}
                              onChange={() => handleSelectStudent(student.userId)}
                        />
                      </TableCell>
                      <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar src={student.user.photoURL} sx={{ width: 32, height: 32 }}>
                                {student.user.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                                  {student.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                  {student.user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {course?.title || 'Unknown Course'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {cohort?.name || 'Unknown Cohort'}
                              </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={student.progress.completionPercentage}
                                color={getProgressColor(student.progress.completionPercentage) as any}
                                sx={{ width: 60 }}
                              />
                          <Typography variant="body2">
                                {student.progress.completionPercentage.toFixed(0)}%
                          </Typography>
                            </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                              label={student.enrollment.status}
                              color={getStatusColor(student.enrollment.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2">
                              {formatDate(student.progress.lastActivity)}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewStudent(student)}
                                  color="primary"
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                              <Tooltip title="Enroll in Course">
                              <IconButton
                                size="small"
                                  onClick={() => handleEnrollStudent(student)}
                                  color="secondary"
                              >
                                  <AddIcon />
                              </IconButton>
                            </Tooltip>
                              <Tooltip title="Transfer Cohort">
                              <IconButton
                                size="small"
                                  onClick={() => handleTransferStudent(student)}
                                  color="info"
                              >
                                  <TransferIcon />
                              </IconButton>
                            </Tooltip>
                              <Tooltip title="Mark as Completed">
                              <IconButton
                                size="small"
                                  onClick={() => handleCompleteStudent(student)}
                                  color="success"
                              >
                                  <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                              <Tooltip title="Unenroll">
                              <IconButton
                                size="small"
                                  onClick={() => handleUnenrollStudent(student)}
                                  color="error"
                              >
                                  <RemoveCircleIcon />
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

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredStudents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
                </CardContent>
              </Card>

        {/* Enrollment Dialog */}
        <Dialog open={enrollmentDialogOpen} onClose={() => setEnrollmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
            Enroll Student in Course
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
              Enroll Student
          </Button>
        </DialogActions>
      </Dialog>

        {/* Transfer Dialog */}
        <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
            Transfer Student to New Cohort
        </DialogTitle>
        <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>New Cohort</InputLabel>
              <Select
                  value={transferForm.newCohortId}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, newCohortId: e.target.value }))}
                  label="New Cohort"
                >
                  {cohorts.map((cohort) => (
                    <MenuItem key={cohort.id} value={cohort.id}>
                      {cohort.name} ({cohort.currentStudents}/{cohort.maxStudents} students)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTransferSubmit}
              variant="contained"
              disabled={!transferForm.newCohortId}
            >
              Transfer Student
            </Button>
        </DialogActions>
      </Dialog>

        {/* Student Detail Dialog */}
        <Dialog open={studentDetailDialogOpen} onClose={() => setStudentDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
            Student Details
        </DialogTitle>
        <DialogContent>
            {selectedStudent && (
              <Box sx={{ pt: 2 }}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 300 }}>
                    <Typography variant="h6" gutterBottom>
                      Student Information
                </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar src={selectedStudent.user.photoURL} sx={{ width: 64, height: 64 }}>
                        {selectedStudent.user.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{selectedStudent.user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedStudent.user.email}
              </Typography>
            </Box>
          </Box>
                    <Typography variant="body2">
                      <strong>Joined:</strong> {formatDate(selectedStudent.user.createdAt)}
                  </Typography>
                    <Typography variant="body2">
                      <strong>Last Activity:</strong> {formatDate(selectedStudent.progress.lastActivity)}
                  </Typography>
                </Box>
                  <Box sx={{ flex: 1, minWidth: 300 }}>
                    <Typography variant="h6" gutterBottom>
                      Academic Progress
                  </Typography>
                    <Typography variant="body2">
                      <strong>Lessons Completed:</strong> {selectedStudent.progress.lessonsCompleted}/{selectedStudent.progress.totalLessons}
                  </Typography>
                    <Typography variant="body2">
                      <strong>Completion:</strong> {selectedStudent.progress.completionPercentage.toFixed(1)}%
                  </Typography>
                                <Typography variant="body2">
                      <strong>Current Week:</strong> {selectedStudent.progress.currentWeek}
                                </Typography>
                    <Typography variant="body2">
                      <strong>Streak:</strong> {selectedStudent.progress.streak} days
                              </Typography>
                    <Box sx={{ mt: 2 }}>
                                <LinearProgress
                                  variant="determinate"
                        value={selectedStudent.progress.completionPercentage}
                        color={getProgressColor(selectedStudent.progress.completionPercentage) as any}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                              </Box>
                              </Box>
                  </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Community Engagement
            </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ minWidth: 200 }}>
                    <strong>Questions Asked:</strong> {selectedStudent.academic.questionsAsked}
                          </Typography>
                  <Typography variant="body2" sx={{ minWidth: 200 }}>
                    <strong>Questions Answered:</strong> {selectedStudent.academic.questionsAnswered}
                          </Typography>
                  <Typography variant="body2" sx={{ minWidth: 200 }}>
                    <strong>Participation Score:</strong> {selectedStudent.academic.communityParticipation}
                  </Typography>
            </Box>
          </Box>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setStudentDetailDialogOpen(false)}>
              Close
            </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Container>
  );
};

export default AdminStudentManagement; 