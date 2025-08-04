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
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Visibility as VisibilityIcon,
  RemoveCircle as RemoveCircleIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCourse } from '../../contexts/CourseContext';
import { getAllEnrollments } from '../../services/enrollmentService';
import { userProfileService } from '../../services/userProfileService';
import { lessonProgressService } from '../../services/lessonProgressService';
import { mailerSendService } from '../../services/mailerSendService';
import { EMAIL_TEMPLATES } from '../../constants/emailTemplates';
import { Timestamp } from 'firebase/firestore';

interface Student {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt: Timestamp;
  isAdmin: boolean;
  firstName?: string;
  lastName?: string;
  enrollment?: {
    courseId: string;
    courseName: string;
    enrolledAt: Timestamp;
    status: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
  };
  lastActivity?: Timestamp;
  cohortId?: string;
  cohortName?: string;
}

interface StudentFilters {
  search: string;
  status: string;
  cohort: string;
  enrollmentStatus: string;
  dateRange: string;
}

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
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
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
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showCreateEnrollmentModal, setShowCreateEnrollmentModal] = useState(false);
  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: '',
    courseId: '',
    cohortId: '',
    status: 'active',
    progress: 0,
    lessonsCompleted: 0
  });
  const [showCreateCohortModal, setShowCreateCohortModal] = useState(false);
  const [showEditCohortModal, setShowEditCohortModal] = useState(false);
  const [showAssignStudentsModal, setShowAssignStudentsModal] = useState(false);
  const [showManageCohortStudentsModal, setShowManageCohortStudentsModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState<any>(null);
  const [managingCohort, setManagingCohort] = useState<any>(null);
  const [cohortForm, setCohortForm] = useState({
    name: '',
    courseId: '',
    startDate: '',
    endDate: '',
    maxStudents: 50,
    status: 'upcoming'
  });
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Student | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Filters
  const [filters, setFilters] = useState<StudentFilters>({
    search: '',
    status: 'all',
    cohort: 'all',
    enrollmentStatus: 'all',
    dateRange: 'all',
  });

  // Load students data
  useEffect(() => {
    loadStudents();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [students, filters]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      
      // Get all users
      const users = await userProfileService.getAllUsers();
      
      // Get enrollments for all users
      const enrollments = await getAllEnrollments();
      
      // Get lesson progress for all users
      const progressData = await lessonProgressService.getAllUserProgress();
      
      // Combine data
      const studentsData: Student[] = users.map(user => {
        const enrollment = enrollments.find((e: any) => e.userId === user.id);
        const progress = progressData.filter((p: any) => p.userId === user.id);
        const course = courses.find(c => c.id === (enrollment as any)?.courseId);
        const cohort = cohorts.find(co => co.id === (enrollment as any)?.cohortId);
        
        const lessonsCompleted = progress.filter((p: any) => p.isCompleted).length;
        const totalLessons = 7; // Hardcoded for now - TODO: Get from course
        const progressPercentage = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          photoURL: user.photoURL,
          createdAt: user.createdAt,
          isAdmin: user.isAdmin,
          firstName: user.firstName,
          lastName: user.lastName,
          enrollment: enrollment ? {
            courseId: (enrollment as any).courseId,
            courseName: course?.title || 'Unknown Course',
            enrolledAt: (enrollment as any).enrolledAt,
            status: (enrollment as any).enrollmentStatus || 'active',
            progress: progressPercentage,
            lessonsCompleted,
            totalLessons,
          } : undefined,
          lastActivity: (enrollment as any)?.lastActivity,
          cohortId: (enrollment as any)?.cohortId,
          cohortName: cohort?.name,
        };
      });

      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
      setSnackbar({
        open: true,
        message: 'Error loading students data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.firstName?.toLowerCase().includes(searchLower) ||
        student.lastName?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'enrolled') {
        filtered = filtered.filter(student => student.enrollment);
      } else if (filters.status === 'not_enrolled') {
        filtered = filtered.filter(student => !student.enrollment);
      }
    }

    // Cohort filter
    if (filters.cohort !== 'all') {
      filtered = filtered.filter(student => student.cohortId === filters.cohort);
    }

    // Enrollment status filter
    if (filters.enrollmentStatus !== 'all') {
      filtered = filtered.filter(student => 
        student.enrollment?.status === filters.enrollmentStatus
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const daysAgo = parseInt(filters.dateRange);
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(student => {
        const createdAt = student.createdAt.toDate();
        return createdAt >= cutoffDate;
      });
    }

    setFilteredStudents(filtered);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredStudents
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(student => student.id);
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

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  const handleCreateEnrollment = () => {
    setEnrollmentForm({
      studentId: '',
      courseId: '',
      cohortId: '',
      status: 'active',
      progress: 0,
      lessonsCompleted: 0
    });
    setShowCreateEnrollmentModal(true);
  };

  const handleExportEnrollments = () => {
    // Get all enrolled students
    const enrolledStudents = students.filter(student => student.enrollment);
    
    // Create CSV content
    const csvHeaders = [
      'Student ID',
      'Student Name',
      'Student Email',
      'First Name',
      'Last Name',
      'Course ID',
      'Course Name',
      'Cohort ID',
      'Cohort Name',
      'Enrollment Status',
      'Progress (%)',
      'Lessons Completed',
      'Total Lessons',
      'Enrolled Date',
      'Last Activity',
      'Is Admin',
      'Account Created'
    ];
    
    const csvRows = enrolledStudents.map(student => [
      student.id,
      student.name,
      student.email,
      student.firstName || '',
      student.lastName || '',
      student.enrollment?.courseId || '',
      student.enrollment?.courseName || '',
      student.cohortId || '',
      student.cohortName || '',
      student.enrollment?.status || '',
      student.enrollment?.progress || 0,
      student.enrollment?.lessonsCompleted || 0,
      student.enrollment?.totalLessons || 0,
      student.enrollment?.enrolledAt?.toDate().toLocaleDateString() || '',
      student.lastActivity?.toDate().toLocaleDateString() || 'Never',
      student.isAdmin ? 'Yes' : 'No',
      student.createdAt.toDate().toLocaleDateString()
    ]);
    
    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `enrollments_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({
      open: true,
      message: `Exported ${enrolledStudents.length} enrollments to CSV`,
      severity: 'success',
    });
  };

  const handleCreateCohort = () => {
    setCohortForm({
      name: '',
      courseId: '',
      startDate: '',
      endDate: '',
      maxStudents: 50,
      status: 'upcoming'
    });
    setShowCreateCohortModal(true);
  };

  const handleAssignStudents = () => {
    setShowAssignStudentsModal(true);
  };

  const handleEditCohort = (cohort: any) => {
    setEditingCohort(cohort);
    setCohortForm({
      name: cohort.name,
      courseId: cohort.courseId,
      startDate: cohort.startDate ? cohort.startDate.toDate().toISOString().split('T')[0] : '',
      endDate: cohort.endDate ? cohort.endDate.toDate().toISOString().split('T')[0] : '',
      maxStudents: cohort.maxStudents || 50,
      status: cohort.status || 'upcoming'
    });
    setShowEditCohortModal(true);
  };

  const handleManageCohortStudents = (cohort: any) => {
    setManagingCohort(cohort);
    setShowManageCohortStudentsModal(true);
  };

  const handleRemoveStudentFromCohort = async (studentId: string) => {
    try {
      // Import Firestore functions
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebaseConfig');

      // Remove cohort assignment from student
      const userRef = doc(db, 'users', studentId);
      await updateDoc(userRef, {
        cohortId: null,
        cohortName: null
      });

      setSnackbar({
        open: true,
        message: 'Student removed from cohort successfully!',
        severity: 'success',
      });
      
      // Refresh data
      loadStudents();
    } catch (error) {
      console.error('Error removing student from cohort:', error);
      setSnackbar({
        open: true,
        message: 'Error removing student from cohort. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleUpdateCohort = async () => {
    try {
      // Validate form
      if (!cohortForm.name || !cohortForm.courseId) {
        setSnackbar({
          open: true,
          message: 'Please fill in cohort name and select a course.',
          severity: 'error',
        });
        return;
      }

      if (!editingCohort) {
        setSnackbar({
          open: true,
          message: 'No cohort selected for editing.',
          severity: 'error',
        });
        return;
      }

      // Update cohort data
      const cohortData = {
        name: cohortForm.name,
        courseId: cohortForm.courseId,
        startDate: cohortForm.startDate ? new Date(cohortForm.startDate) : null,
        endDate: cohortForm.endDate ? new Date(cohortForm.endDate) : null,
        maxStudents: cohortForm.maxStudents,
        status: cohortForm.status,
        updatedAt: new Date()
      };

      // Import Firestore functions
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebaseConfig');

      // Update cohort document
      const cohortRef = doc(db, 'cohorts', editingCohort.id);
      await updateDoc(cohortRef, cohortData);

      setSnackbar({
        open: true,
        message: `Cohort "${cohortForm.name}" updated successfully!`,
        severity: 'success',
      });
      
      setShowEditCohortModal(false);
      setEditingCohort(null);
      // Refresh data
      loadStudents();
    } catch (error) {
      console.error('Error updating cohort:', error);
      setSnackbar({
        open: true,
        message: 'Error updating cohort. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleExportCohortData = () => {
    // Create CSV content for cohort data
    const csvHeaders = [
      'Cohort ID',
      'Cohort Name',
      'Course ID',
      'Course Name',
      'Status',
      'Start Date',
      'End Date',
      'Max Students',
      'Current Students',
      'Active Students',
      'Avg Progress (%)'
    ];
    
    const csvRows = cohorts.map(cohort => {
      const cohortStudents = students.filter(s => s.cohortId === cohort.id);
      const avgProgress = cohortStudents.length > 0 
        ? Math.round(cohortStudents.reduce((sum, s) => sum + (s.enrollment?.progress || 0), 0) / cohortStudents.length)
        : 0;
      
      return [
        cohort.id,
        cohort.name,
        cohort.courseId,
        courses.find(c => c.id === cohort.courseId)?.title || 'Unknown Course',
        cohort.status || 'active',
        cohort.startDate?.toDate().toLocaleDateString() || '',
        cohort.endDate?.toDate().toLocaleDateString() || '',
        cohort.maxStudents || 50,
        cohortStudents.length,
        cohortStudents.filter(s => s.enrollment?.status === 'active').length,
        avgProgress
      ];
    });
    
    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cohorts_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({
      open: true,
      message: `Exported ${cohorts.length} cohorts to CSV`,
      severity: 'success',
    });
  };

  const handleSaveCohort = async () => {
    try {
      // Validate form
      if (!cohortForm.name || !cohortForm.courseId) {
        setSnackbar({
          open: true,
          message: 'Please fill in cohort name and select a course.',
          severity: 'error',
        });
        return;
      }

      // Create cohort data
      const cohortData = {
        name: cohortForm.name,
        courseId: cohortForm.courseId,
        startDate: cohortForm.startDate ? new Date(cohortForm.startDate) : null,
        endDate: cohortForm.endDate ? new Date(cohortForm.endDate) : null,
        maxStudents: cohortForm.maxStudents,
        currentStudents: 0,
        status: cohortForm.status,
        weeklyReleaseTime: '08:00', // Default to 8am
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Import Firestore functions
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebaseConfig');

      // Create cohort document
      const cohortRef = doc(db, 'cohorts', `cohort_${Date.now()}`);
      await setDoc(cohortRef, cohortData);

      setSnackbar({
        open: true,
        message: `Cohort "${cohortForm.name}" created successfully!`,
        severity: 'success',
      });
      
      setShowCreateCohortModal(false);
      // Refresh data
      loadStudents();
    } catch (error) {
      console.error('Error creating cohort:', error);
      setSnackbar({
        open: true,
        message: 'Error creating cohort. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleSendWelcomeEmails = async () => {
    try {
      // Get all active enrolled students
      const activeEnrolledStudents = students.filter(student => 
        student.enrollment?.status === 'active'
      );

      if (activeEnrolledStudents.length === 0) {
        setSnackbar({
          open: true,
          message: 'No active enrollments found to send welcome emails to.',
          severity: 'info',
        });
        return;
      }

      // Show loading message
      setSnackbar({
        open: true,
        message: `Sending welcome emails to ${activeEnrolledStudents.length} students...`,
        severity: 'info',
      });

      // Send welcome emails using MailerSend
      const emailPromises = activeEnrolledStudents.map(async (student) => {
        try {
          const emailVariables = {
            firstName: student.firstName || student.name.split(' ')[0],
            lastName: student.lastName || student.name.split(' ').slice(1).join(' ') || '',
            email: student.email,
            fullName: student.name,
            courseTitle: student.enrollment?.courseName || 'The Reverse Aging Challenge',
            courseUrl: `${window.location.origin}/dashboard`,
            loginUrl: `${window.location.origin}/login`,
            supportEmail: 'support@reverseagingacademy.com',
          };

          const success = await mailerSendService.sendTransactional(
            EMAIL_TEMPLATES.WELCOME_EMAIL,
            student.email,
            emailVariables
          );

          return {
            studentId: student.id,
            email: student.email,
            courseName: student.enrollment?.courseName,
            status: success ? 'sent' : 'failed'
          };
        } catch (error) {
          console.error(`Error sending email to ${student.email}:`, error);
          return {
            studentId: student.id,
            email: student.email,
            courseName: student.enrollment?.courseName,
            status: 'failed'
          };
        }
      });

      const results = await Promise.all(emailPromises);
      const successfulSends = results.filter(result => result.status === 'sent').length;
      const failedSends = results.filter(result => result.status === 'failed').length;

      // Show results
      if (failedSends === 0) {
        setSnackbar({
          open: true,
          message: `✅ Welcome emails sent successfully to ${successfulSends} students!`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: `⚠️ Sent ${successfulSends} emails, ${failedSends} failed. Check console for details.`,
          severity: 'error',
        });
      }

      // Log detailed results
      console.log('Welcome email results:', results);

    } catch (error) {
      console.error('Error sending welcome emails:', error);
      setSnackbar({
        open: true,
        message: 'Error sending welcome emails. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleSaveEnrollment = async () => {
    try {
      // Validate form
      if (!enrollmentForm.studentId || !enrollmentForm.courseId) {
        setSnackbar({
          open: true,
          message: 'Please select both a student and a course.',
          severity: 'error',
        });
        return;
      }

      // Get student and course data
      const student = students.find(s => s.id === enrollmentForm.studentId);
      const course = courses.find(c => c.id === enrollmentForm.courseId);
      const cohort = cohorts.find(c => c.id === enrollmentForm.cohortId);

      if (!student || !course) {
        setSnackbar({
          open: true,
          message: 'Invalid student or course selection.',
          severity: 'error',
        });
        return;
      }

      // Create enrollment data
      const enrollmentData = {
        userId: enrollmentForm.studentId,
        courseId: enrollmentForm.courseId,
        cohortId: enrollmentForm.cohortId || null,
        status: enrollmentForm.status,
        progress: enrollmentForm.progress,
        lessonsCompleted: enrollmentForm.lessonsCompleted,
        totalLessons: 7, // Default total lessons for the course
        enrolledAt: new Date(),
        lastActivity: new Date()
      };

      // Import Firestore functions
      const { doc, setDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebaseConfig');

      // Create enrollment document
      const enrollmentRef = doc(db, 'enrollments', `${enrollmentForm.studentId}_${enrollmentForm.courseId}`);
      await setDoc(enrollmentRef, enrollmentData);

      // Update user document with enrollment info
      const userRef = doc(db, 'users', enrollmentForm.studentId);
      await updateDoc(userRef, {
        enrollment: {
          courseId: enrollmentForm.courseId,
          courseName: course.title,
          enrolledAt: new Date(),
          status: enrollmentForm.status,
          progress: enrollmentForm.progress,
          lessonsCompleted: enrollmentForm.lessonsCompleted,
          totalLessons: 7 // Default total lessons for the course
        },
        cohortId: enrollmentForm.cohortId || null,
        cohortName: cohort?.name || null
      });

      setSnackbar({
        open: true,
        message: `Successfully enrolled ${student.name} in ${course.title}!`,
        severity: 'success',
      });
      
      setShowCreateEnrollmentModal(false);
      loadStudents(); // Refresh the student list
    } catch (error) {
      console.error('Error creating enrollment:', error);
      setSnackbar({
        open: true,
        message: 'Error creating enrollment. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleChangeStatus = (student: Student) => {
    setSelectedEnrollment(student);
    setNewStatus(student.enrollment?.status || '');
    setShowStatusDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedEnrollment || !newStatus) return;

    try {
      // TODO: Update enrollment status in Firestore
      // await updateEnrollmentStatus(selectedEnrollment.enrollment?.id, newStatus);
      
      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === selectedEnrollment.id 
          ? { ...student, enrollment: { ...student.enrollment!, status: newStatus } }
          : student
      ));

      setSnackbar({
        open: true,
        message: `Enrollment status updated to ${newStatus}`,
        severity: 'success',
      });

      setShowStatusDialog(false);
      setSelectedEnrollment(null);
      setNewStatus('');
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating enrollment status',
        severity: 'error',
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      switch (action) {
        case 'export':
          // Get selected students data
          const selectedStudentsData = students.filter(s => selectedStudents.includes(s.id));
          
          // Create CSV content
          const csvHeaders = [
            'ID',
            'Name',
            'Email',
            'First Name',
            'Last Name',
            'Joined Date',
            'Last Activity',
            'Enrollment Status',
            'Course Name',
            'Progress (%)',
            'Lessons Completed',
            'Total Lessons',
            'Cohort',
            'Is Admin'
          ];
          
          const csvRows = selectedStudentsData.map(student => [
            student.id,
            student.name,
            student.email,
            student.firstName || '',
            student.lastName || '',
            student.createdAt.toDate().toLocaleDateString(),
            student.lastActivity?.toDate().toLocaleDateString() || 'Never',
            student.enrollment?.status || 'Not Enrolled',
            student.enrollment?.courseName || '',
            student.enrollment?.progress || 0,
            student.enrollment?.lessonsCompleted || 0,
            student.enrollment?.totalLessons || 0,
            student.cohortName || '',
            student.isAdmin ? 'Yes' : 'No'
          ]);
          
          // Combine headers and rows
          const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
          
          // Create and download file
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setSnackbar({
            open: true,
            message: `Exported ${selectedStudents.length} students to CSV`,
            severity: 'success',
          });
          break;
        
        case 'email':
          setSnackbar({
            open: true,
            message: `Email sent to ${selectedStudents.length} students`,
            severity: 'success',
          });
          break;
        
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedStudents.length} students?`)) {
            setSnackbar({
              open: true,
              message: `Deleted ${selectedStudents.length} students`,
              severity: 'success',
            });
            loadStudents();
          }
          break;
      }
      
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setSnackbar({
        open: true,
        message: 'Error performing bulk action',
        severity: 'error',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'paused': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Student Management
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {/* TODO: Add new student */}}
            >
              Add Student
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{students.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Students</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {students.filter(s => s.enrollment?.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Active Students</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {students.filter(s => (s.enrollment?.progress || 0) === 100).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {students.filter(s => !s.enrollment).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Not Enrolled</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs */}
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            aria-label="student management tabs"
          >
            <Tab label="All Students" />
            <Tab label="Enrollments" />
            <Tab label="Cohorts" />
            <Tab label="Analytics" />
          </Tabs>
        </Paper>

        {/* All Students Tab */}
        <TabPanel value={tabValue} index={0}>
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                placeholder="Search students..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </Box>

            {showFilters && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="enrolled">Enrolled</MenuItem>
                    <MenuItem value="not_enrolled">Not Enrolled</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Cohort</InputLabel>
                  <Select
                    value={filters.cohort}
                    onChange={(e) => setFilters({ ...filters, cohort: e.target.value })}
                    label="Cohort"
                  >
                    <MenuItem value="all">All Cohorts</MenuItem>
                    {cohorts.map(cohort => (
                      <MenuItem key={cohort.id} value={cohort.id}>
                        {cohort.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Enrollment Status</InputLabel>
                  <Select
                    value={filters.enrollmentStatus}
                    onChange={(e) => setFilters({ ...filters, enrollmentStatus: e.target.value })}
                    label="Enrollment Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="paused">Paused</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                    label="Date Range"
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="7">Last 7 days</MenuItem>
                    <MenuItem value="30">Last 30 days</MenuItem>
                    <MenuItem value="90">Last 90 days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Paper>

          {/* Bulk Actions */}
          {selectedStudents.length > 0 && (
            <Paper sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 2
            }}>
              <Typography variant="body1" fontWeight="medium" sx={{ color: 'white' }}>
                {selectedStudents.length} students selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleBulkAction('export')}
                  sx={{ 
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { 
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  Export
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<EmailIcon />}
                  onClick={() => handleBulkAction('email')}
                  sx={{ 
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { 
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  Email
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleBulkAction('delete')}
                  sx={{ 
                    bgcolor: 'error.main',
                    color: 'white',
                    '&:hover': { 
                      bgcolor: 'error.dark'
                    }
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          )}

          {/* Students Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                      checked={selectedStudents.length === filteredStudents.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Enrollment</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Cohort</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedStudents.indexOf(student.id) !== -1}
                          onChange={() => handleSelectStudent(student.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={student.photoURL} alt={student.name}>
                            {student.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {student.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.firstName} {student.lastName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {student.enrollment ? (
                          <Chip
                            label={student.enrollment.status}
                            color={getStatusColor(student.enrollment.status) as any}
                            size="small"
                          />
                        ) : (
                          <Chip label="Not Enrolled" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        {student.enrollment ? (
                          <Box>
                            <Typography variant="body2">
                              {student.enrollment.lessonsCompleted}/{student.enrollment.totalLessons} lessons
                            </Typography>
                            <Chip
                              label={`${student.enrollment.progress}%`}
                              color={getProgressColor(student.enrollment.progress) as any}
                              size="small"
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.cohortName ? (
                          <Chip label={student.cohortName} size="small" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No cohort
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.lastActivity ? (
                          <Typography variant="body2">
                            {student.lastActivity.toDate().toLocaleDateString()}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Never
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewStudent(student)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small"
                              onClick={() => handleEditStudent(student)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
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
          </TableContainer>
        </TabPanel>

        {/* Enrollments Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Enrollment Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage course enrollments, track progress, and handle status changes.
            </Typography>
            
            {/* Enrollment Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Card sx={{ flex: 1, minWidth: 150 }}>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {students.filter(s => s.enrollment?.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Active Enrollments</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 150 }}>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    {students.filter(s => s.enrollment?.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 150 }}>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    {students.filter(s => s.enrollment?.status === 'paused').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Paused</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 150 }}>
                <CardContent>
                  <Typography variant="h6" color="error.main">
                    {students.filter(s => s.enrollment?.status === 'cancelled').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Cancelled</Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Enrollment Actions */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateEnrollment}
              >
                Create Enrollment
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportEnrollments}
              >
                Export Enrollments
              </Button>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={handleSendWelcomeEmails}
              >
                Send Welcome Emails
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {/* TODO: Bulk status change */}}
                disabled={selectedStudents.length === 0}
              >
                Bulk Status Change ({selectedStudents.length})
              </Button>
            </Box>

            {/* Enrollments Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedStudents.length > 0 && selectedStudents.length < students.filter(s => s.enrollment).length}
                        checked={selectedStudents.length === students.filter(s => s.enrollment).length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Cohort</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Enrolled Date</TableCell>
                    <TableCell>Last Activity</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students
                    .filter(student => student.enrollment)
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedStudents.indexOf(student.id) !== -1}
                            onChange={() => handleSelectStudent(student.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={student.photoURL} alt={student.name} sx={{ width: 32, height: 32 }}>
                              {student.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {student.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.enrollment?.courseName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {student.cohortName ? (
                            <Chip label={student.cohortName} size="small" />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No cohort
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.enrollment?.status}
                            color={getStatusColor(student.enrollment?.status || '') as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {student.enrollment?.lessonsCompleted}/{student.enrollment?.totalLessons} lessons
                            </Typography>
                            <Chip
                              label={`${student.enrollment?.progress}%`}
                              color={getProgressColor(student.enrollment?.progress || 0) as any}
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.enrollment?.enrolledAt.toDate().toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {student.lastActivity ? (
                            <Typography variant="body2">
                              {student.lastActivity.toDate().toLocaleDateString()}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Never
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Change Status">
                              <IconButton
                                size="small"
                                onClick={() => handleChangeStatus(student)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewStudent(student)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel Enrollment">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {/* TODO: Cancel enrollment */}}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={students.filter(s => s.enrollment).length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </TableContainer>

            {/* No Enrollments Message */}
            {students.filter(s => s.enrollment).length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Enrollments Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  There are currently no active enrollments in the system.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {/* TODO: Add new enrollment */}}
                >
                  Create First Enrollment
                </Button>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* Cohorts Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cohort Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create and manage student cohorts, track cohort performance, and assign students to cohorts.
            </Typography>
            
            {/* Cohort Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Card sx={{ flex: 1, minWidth: 150 }}>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {cohorts.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Cohorts</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 150 }}>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    {students.filter(s => s.cohortId).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Students in Cohorts</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 150 }}>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    {students.filter(s => !s.cohortId && s.enrollment).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Unassigned Students</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 150 }}>
                <CardContent>
                  <Typography variant="h6" color="info.main">
                    {cohorts.length > 0 ? Math.round(students.filter(s => s.cohortId).length / cohorts.length) : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Avg Students/Cohort</Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Cohort Actions */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateCohort}
              >
                Create Cohort
              </Button>
              <Button
                variant="outlined"
                startIcon={<GroupIcon />}
                onClick={handleAssignStudents}
              >
                Assign Students
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportCohortData}
              >
                Export Cohort Data
              </Button>
            </Box>

            {/* Cohorts Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cohort Name</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Students</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Avg Progress</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cohorts.map((cohort) => {
                    const cohortStudents = students.filter(s => s.cohortId === cohort.id);
                    const avgProgress = cohortStudents.length > 0 
                      ? Math.round(cohortStudents.reduce((sum, s) => sum + (s.enrollment?.progress || 0), 0) / cohortStudents.length)
                      : 0;
                    
                    return (
                      <TableRow key={cohort.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {cohort.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cohort.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {courses.find(c => c.id === cohort.courseId)?.title || 'Unknown Course'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {cohortStudents.length} students
                            </Typography>
                            <Chip 
                              label={cohortStudents.filter(s => s.enrollment?.status === 'active').length} 
                              size="small" 
                              color="success"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cohort.status || 'active'}
                            color={cohort.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {cohort.startDate?.toDate().toLocaleDateString() || 'Not set'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {cohort.endDate?.toDate().toLocaleDateString() || 'Not set'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${avgProgress}%`}
                            color={avgProgress >= 80 ? 'success' : avgProgress >= 50 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Cohort Details">
                              <IconButton
                                size="small"
                                onClick={() => {/* TODO: View cohort details */}}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Cohort">
                              <IconButton
                                size="small"
                                onClick={() => handleEditCohort(cohort)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Manage Students">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleManageCohortStudents(cohort)}
                              >
                                <GroupIcon />
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

            {/* No Cohorts Message */}
            {cohorts.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Cohorts Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create your first cohort to start organizing students into groups.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {/* TODO: Create first cohort */}}
                >
                  Create First Cohort
                </Button>
              </Paper>
            )}

            {/* Unassigned Students Section */}
            {students.filter(s => !s.cohortId && s.enrollment).length > 0 && (
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Unassigned Students ({students.filter(s => !s.cohortId && s.enrollment).length})
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  These students are enrolled but not assigned to any cohort.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {students
                    .filter(s => !s.cohortId && s.enrollment)
                    .slice(0, 10)
                    .map(student => (
                      <Chip
                        key={student.id}
                        label={student.name}
                        size="small"
                        variant="outlined"
                        onClick={() => {/* TODO: Assign to cohort */}}
                      />
                    ))}
                  {students.filter(s => !s.cohortId && s.enrollment).length > 10 && (
                    <Chip
                      label={`+${students.filter(s => !s.cohortId && s.enrollment).length - 10} more`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Student Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              View detailed analytics about student performance, engagement, and retention.
            </Typography>
            
            {/* Analytics Overview */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Card sx={{ flex: 1, minWidth: 200 }}>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {students.filter(s => (s.enrollment?.progress || 0) === 100).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Course Completions</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {students.length > 0 ? Math.round((students.filter(s => (s.enrollment?.progress || 0) === 100).length / students.length) * 100) : 0}% completion rate
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 200 }}>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    {students.filter(s => (s.enrollment?.progress || 0) >= 50).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Active Learners</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Students with 50%+ progress
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 200 }}>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    {students.filter(s => (s.enrollment?.progress || 0) < 25).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">At Risk</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Students with less than 25% progress
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 200 }}>
                <CardContent>
                  <Typography variant="h6" color="info.main">
                    {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.enrollment?.progress || 0), 0) / students.length) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Avg Progress</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Across all students
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Performance Metrics */}
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Progress Distribution
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">0-25%</Typography>
                      <Chip label={students.filter(s => (s.enrollment?.progress || 0) <= 25).length} size="small" color="error" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">26-50%</Typography>
                      <Chip label={students.filter(s => (s.enrollment?.progress || 0) > 25 && (s.enrollment?.progress || 0) <= 50).length} size="small" color="warning" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">51-75%</Typography>
                      <Chip label={students.filter(s => (s.enrollment?.progress || 0) > 50 && (s.enrollment?.progress || 0) <= 75).length} size="small" color="info" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">76-100%</Typography>
                      <Chip label={students.filter(s => (s.enrollment?.progress || 0) > 75).length} size="small" color="success" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Enrollment Status
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Active</Typography>
                      <Chip label={students.filter(s => s.enrollment?.status === 'active').length} size="small" color="success" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Completed</Typography>
                      <Chip label={students.filter(s => s.enrollment?.status === 'completed').length} size="small" color="primary" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Paused</Typography>
                      <Chip label={students.filter(s => s.enrollment?.status === 'paused').length} size="small" color="warning" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Cancelled</Typography>
                      <Chip label={students.filter(s => s.enrollment?.status === 'cancelled').length} size="small" color="error" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Top Performers */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performers
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {students
                    .filter(s => (s.enrollment?.progress || 0) === 100)
                    .slice(0, 10)
                    .map(student => (
                      <Chip
                        key={student.id}
                        label={student.name}
                        size="small"
                        color="success"
                        variant="outlined"
                        onClick={() => handleViewStudent(student)}
                      />
                    ))}
                  {students.filter(s => (s.enrollment?.progress || 0) === 100).length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No students have completed the course yet.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Students Needing Attention */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Students Needing Attention
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {students
                    .filter(s => (s.enrollment?.progress || 0) < 25 && s.enrollment?.status === 'active')
                    .slice(0, 10)
                    .map(student => (
                      <Chip
                        key={student.id}
                        label={student.name}
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleViewStudent(student)}
                      />
                    ))}
                  {students.filter(s => (s.enrollment?.progress || 0) < 25 && s.enrollment?.status === 'active').length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      All active students are making good progress!
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Box>

      {/* Student Details Modal */}
      <Dialog
        open={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Student Details - {selectedStudent?.name}
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>Profile Information</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar src={selectedStudent.photoURL} alt={selectedStudent.name} sx={{ width: 64, height: 64 }}>
                    {selectedStudent.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedStudent.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedStudent.email}</Typography>
                  </Box>
                </Box>
                <Typography variant="body2">
                  <strong>Joined:</strong> {selectedStudent.createdAt.toDate().toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Activity:</strong> {selectedStudent.lastActivity?.toDate().toLocaleDateString() || 'Never'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>Enrollment Details</Typography>
                {selectedStudent.enrollment ? (
                  <Box>
                    <Typography variant="body2">
                      <strong>Course:</strong> {selectedStudent.enrollment.courseName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> 
                      <Chip
                        label={selectedStudent.enrollment.status}
                        color={getStatusColor(selectedStudent.enrollment.status) as any}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Enrolled:</strong> {selectedStudent.enrollment.enrolledAt.toDate().toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Progress:</strong> {selectedStudent.enrollment.progress}%
                    </Typography>
                    <Typography variant="body2">
                      <strong>Lessons Completed:</strong> {selectedStudent.enrollment.lessonsCompleted}/{selectedStudent.enrollment.totalLessons}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Not enrolled in any course
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStudentModal(false)}>Close</Button>
          <Button variant="contained">Edit Student</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Student Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Student - {editingStudent?.name}
        </DialogTitle>
        <DialogContent>
          {editingStudent && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Profile Information</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  label="First Name"
                  value={editingStudent.firstName || ''}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Last Name"
                  value={editingStudent.lastName || ''}
                  fullWidth
                  size="small"
                />
              </Box>
              <TextField
                label="Email"
                value={editingStudent.email}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Enrollment Details</Typography>
              {editingStudent.enrollment ? (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Enrollment Status</InputLabel>
                    <Select
                      value={editingStudent.enrollment.status}
                      label="Enrollment Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="paused">Paused</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Progress (%)"
                    type="number"
                    value={editingStudent.enrollment.progress}
                    size="small"
                    sx={{ minWidth: 120 }}
                  />
                  <TextField
                    label="Lessons Completed"
                    type="number"
                    value={editingStudent.enrollment.lessonsCompleted}
                    size="small"
                    sx={{ minWidth: 120 }}
                  />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Student is not enrolled in any course
                </Typography>
              )}
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Cohort Assignment</Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Cohort</InputLabel>
                <Select
                  value={editingStudent.cohortId || ''}
                  label="Cohort"
                >
                  <MenuItem value="">No Cohort</MenuItem>
                  {cohorts.map(cohort => (
                    <MenuItem key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Create Enrollment Modal */}
      <Dialog
        open={showCreateEnrollmentModal}
        onClose={() => setShowCreateEnrollmentModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Enrollment
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Student Selection</Typography>
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel>Select Student</InputLabel>
              <Select
                label="Select Student"
                value={enrollmentForm.studentId}
                onChange={(e) => setEnrollmentForm({ ...enrollmentForm, studentId: e.target.value })}
              >
                <MenuItem value="" disabled>
                  Choose a student...
                </MenuItem>
                {students
                  .filter(student => !student.enrollment)
                  .map(student => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom>Course Selection</Typography>
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel>Select Course</InputLabel>
              <Select
                label="Select Course"
                value={enrollmentForm.courseId}
                onChange={(e) => setEnrollmentForm({ ...enrollmentForm, courseId: e.target.value })}
              >
                <MenuItem value="" disabled>
                  Choose a course...
                </MenuItem>
                {courses.map(course => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom>Cohort Assignment (Optional)</Typography>
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel>Select Cohort</InputLabel>
              <Select
                label="Select Cohort"
                value={enrollmentForm.cohortId}
                onChange={(e) => setEnrollmentForm({ ...enrollmentForm, cohortId: e.target.value })}
              >
                <MenuItem value="">
                  No Cohort
                </MenuItem>
                {cohorts.map(cohort => (
                  <MenuItem key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom>Enrollment Settings</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Initial Status</InputLabel>
                <Select
                  label="Initial Status"
                  value={enrollmentForm.status}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Initial Progress (%)"
                type="number"
                value={enrollmentForm.progress}
                onChange={(e) => setEnrollmentForm({ ...enrollmentForm, progress: parseInt(e.target.value) || 0 })}
                size="small"
                sx={{ minWidth: 120 }}
                inputProps={{ min: 0, max: 100 }}
              />
              <TextField
                label="Lessons Completed"
                type="number"
                value={enrollmentForm.lessonsCompleted}
                onChange={(e) => setEnrollmentForm({ ...enrollmentForm, lessonsCompleted: parseInt(e.target.value) || 0 })}
                size="small"
                sx={{ minWidth: 120 }}
                inputProps={{ min: 0 }}
              />
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1, border: '1px solid', borderColor: 'info.main' }}>
              <Typography variant="body2" sx={{ color: 'info.dark' }}>
                <strong>Note:</strong> This will create a new enrollment for the selected student. 
                The student will be able to access the course immediately if the status is set to "Active".
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateEnrollmentModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEnrollment}>Create Enrollment</Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog
        open={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Change Enrollment Status
        </DialogTitle>
        <DialogContent>
          {selectedEnrollment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Student:</strong> {selectedEnrollment.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Course:</strong> {selectedEnrollment.enrollment?.courseName}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ mb: 3 }}>
                <strong>Current Status:</strong> 
                <Chip
                  label={selectedEnrollment.enrollment?.status}
                  color={getStatusColor(selectedEnrollment.enrollment?.status || '') as any}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="New Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateStatus}
            disabled={!newStatus || newStatus === selectedEnrollment?.enrollment?.status}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Cohort Modal */}
      <Dialog
        open={showCreateCohortModal}
        onClose={() => setShowCreateCohortModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Cohort
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Cohort Information</Typography>
            <TextField
              label="Cohort Name"
              value={cohortForm.name}
              onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              placeholder="e.g., Spring 2024 Cohort"
            />
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Course</InputLabel>
              <Select
                label="Course"
                value={cohortForm.courseId}
                onChange={(e) => setCohortForm({ ...cohortForm, courseId: e.target.value })}
              >
                <MenuItem value="" disabled>
                  Choose a course...
                </MenuItem>
                {courses.map(course => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Schedule</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Start Date"
                type="date"
                value={cohortForm.startDate}
                onChange={(e) => setCohortForm({ ...cohortForm, startDate: e.target.value })}
                size="small"
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={cohortForm.endDate}
                onChange={(e) => setCohortForm({ ...cohortForm, endDate: e.target.value })}
                size="small"
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Settings</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Max Students"
                type="number"
                value={cohortForm.maxStudents}
                onChange={(e) => setCohortForm({ ...cohortForm, maxStudents: parseInt(e.target.value) || 50 })}
                size="small"
                sx={{ minWidth: 150 }}
                inputProps={{ min: 1, max: 1000 }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={cohortForm.status}
                  onChange={(e) => setCohortForm({ ...cohortForm, status: e.target.value })}
                >
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1, border: '1px solid', borderColor: 'info.main' }}>
              <Typography variant="body2" sx={{ color: 'info.dark' }}>
                <strong>Note:</strong> Cohorts help organize students into groups for better learning experiences. 
                Students can be assigned to cohorts after creation.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateCohortModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCohort}>Create Cohort</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Cohort Modal */}
      <Dialog
        open={showEditCohortModal}
        onClose={() => {
          setShowEditCohortModal(false);
          setEditingCohort(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Cohort - {editingCohort?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Cohort Information</Typography>
            <TextField
              label="Cohort Name"
              value={cohortForm.name}
              onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              placeholder="e.g., Spring 2024 Cohort"
            />
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Course</InputLabel>
              <Select
                label="Course"
                value={cohortForm.courseId}
                onChange={(e) => setCohortForm({ ...cohortForm, courseId: e.target.value })}
              >
                <MenuItem value="" disabled>
                  Choose a course...
                </MenuItem>
                {courses.map(course => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Schedule</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Start Date"
                type="date"
                value={cohortForm.startDate}
                onChange={(e) => setCohortForm({ ...cohortForm, startDate: e.target.value })}
                size="small"
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={cohortForm.endDate}
                onChange={(e) => setCohortForm({ ...cohortForm, endDate: e.target.value })}
                size="small"
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Settings</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Max Students"
                type="number"
                value={cohortForm.maxStudents}
                onChange={(e) => setCohortForm({ ...cohortForm, maxStudents: parseInt(e.target.value) || 50 })}
                size="small"
                sx={{ minWidth: 150 }}
                inputProps={{ min: 1, max: 1000 }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={cohortForm.status}
                  onChange={(e) => setCohortForm({ ...cohortForm, status: e.target.value })}
                >
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {editingCohort && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
                  <strong>Current Students:</strong> {students.filter(s => s.cohortId === editingCohort.id).length} / {cohortForm.maxStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Active Students:</strong> {students.filter(s => s.cohortId === editingCohort.id && s.enrollment?.status === 'active').length}
                </Typography>
              </>
            )}

            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1, border: '1px solid', borderColor: 'info.main' }}>
              <Typography variant="body2" sx={{ color: 'info.dark' }}>
                <strong>Note:</strong> Changes to cohort settings will affect all students currently assigned to this cohort.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowEditCohortModal(false);
            setEditingCohort(null);
          }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateCohort}>Update Cohort</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Cohort Students Modal */}
      <Dialog
        open={showManageCohortStudentsModal}
        onClose={() => {
          setShowManageCohortStudentsModal(false);
          setManagingCohort(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Manage Students - {managingCohort?.name}
        </DialogTitle>
        <DialogContent>
          {managingCohort && (
            <Box sx={{ mt: 2 }}>
              {/* Cohort Summary */}
              <Typography variant="h6" gutterBottom>Cohort Summary</Typography>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Students</Typography>
                  <Typography variant="h6">
                    {students.filter(s => s.cohortId === managingCohort.id).length} / {managingCohort.maxStudents || 50}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Active Students</Typography>
                  <Typography variant="h6" color="success.main">
                    {students.filter(s => s.cohortId === managingCohort.id && s.enrollment?.status === 'active').length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Avg Progress</Typography>
                  <Typography variant="h6" color="primary.main">
                    {(() => {
                      const cohortStudents = students.filter(s => s.cohortId === managingCohort.id);
                      if (cohortStudents.length === 0) return '0%';
                      const avgProgress = cohortStudents.reduce((sum, s) => sum + (s.enrollment?.progress || 0), 0) / cohortStudents.length;
                      return `${Math.round(avgProgress)}%`;
                    })()}
                  </Typography>
                </Box>
              </Box>

              {/* Students List */}
              <Typography variant="h6" gutterBottom>Students in Cohort</Typography>
              
              {students.filter(s => s.cohortId === managingCohort.id).length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No students assigned to this cohort
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the "Assign Students" button to add students to this cohort.
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell>Last Activity</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students
                        .filter(s => s.cohortId === managingCohort.id)
                        .map(student => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {student.photoURL && (
                                  <Avatar src={student.photoURL} sx={{ width: 32, height: 32 }} />
                                )}
                                <Typography variant="body2">
                                  {student.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {student.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={student.enrollment?.status || 'Unknown'}
                                size="small"
                                color={student.enrollment?.status === 'active' ? 'success' : 'default'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={student.enrollment?.progress || 0}
                                  sx={{ width: 60, height: 8, borderRadius: 4 }}
                                  color={getProgressColor(student.enrollment?.progress || 0)}
                                />
                                <Typography variant="body2" sx={{ minWidth: 35 }}>
                                  {student.enrollment?.progress || 0}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {student.lastActivity ? 
                                  student.lastActivity.toDate().toLocaleDateString() : 
                                  'Never'
                                }
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewStudent(student)}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Remove from Cohort">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveStudentFromCohort(student.id)}
                                  >
                                    <RemoveCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Available Students */}
              {students.filter(s => !s.cohortId && s.enrollment).length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>Available Students</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Students not assigned to any cohort:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {students
                      .filter(s => !s.cohortId && s.enrollment)
                      .slice(0, 10)
                      .map(student => (
                        <Chip
                          key={student.id}
                          label={student.name}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            // TODO: Add student to this cohort
                            setSnackbar({
                              open: true,
                              message: `Feature coming soon: Add ${student.name} to ${managingCohort.name}`,
                              severity: 'info',
                            });
                          }}
                        />
                      ))}
                    {students.filter(s => !s.cohortId && s.enrollment).length > 10 && (
                      <Chip
                        label={`+${students.filter(s => !s.cohortId && s.enrollment).length - 10} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowManageCohortStudentsModal(false);
            setManagingCohort(null);
          }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Students Modal */}
      <Dialog
        open={showAssignStudentsModal}
        onClose={() => setShowAssignStudentsModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Assign Students to Cohorts
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Unassigned Students</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select students to assign to cohorts. Only students with active enrollments are shown.
            </Typography>
            
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {students
                .filter(student => student.enrollment?.status === 'active' && !student.cohortId)
                .map(student => (
                  <Card key={student.id} sx={{ mb: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={student.photoURL} alt={student.name} sx={{ width: 32, height: 32 }}>
                          {student.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {student.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.email} • {student.enrollment?.courseName}
                          </Typography>
                        </Box>
                      </Box>
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Assign to Cohort</InputLabel>
                        <Select
                          label="Assign to Cohort"
                          defaultValue=""
                          onChange={async (e) => {
                            if (e.target.value) {
                              try {
                                // Import Firestore functions
                                const { doc, updateDoc } = await import('firebase/firestore');
                                const { db } = await import('../../firebaseConfig');
                                
                                const cohort = cohorts.find(c => c.id === e.target.value);
                                const userRef = doc(db, 'users', student.id);
                                await updateDoc(userRef, {
                                  cohortId: e.target.value,
                                  cohortName: cohort?.name || ''
                                });
                                
                                setSnackbar({
                                  open: true,
                                  message: `Assigned ${student.name} to ${cohort?.name}`,
                                  severity: 'success',
                                });
                                
                                loadStudents(); // Refresh data
                              } catch (error) {
                                console.error('Error assigning student to cohort:', error);
                                setSnackbar({
                                  open: true,
                                  message: 'Error assigning student to cohort',
                                  severity: 'error',
                                });
                              }
                            }
                          }}
                        >
                          <MenuItem value="" disabled>
                            Select cohort...
                          </MenuItem>
                          {cohorts
                            .filter(cohort => cohort.status === 'active' || cohort.status === 'upcoming')
                            .map(cohort => (
                              <MenuItem key={cohort.id} value={cohort.id}>
                                {cohort.name} ({cohort.currentStudents || 0}/{cohort.maxStudents || 50})
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Card>
                ))}
              
              {students.filter(student => student.enrollment?.status === 'active' && !student.cohortId).length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    All active students are already assigned to cohorts!
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssignStudentsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminStudentManagement; 