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
  Tooltip,
  Divider,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  School,
  Search,
  Sort,
  ExpandMore,
  PlayArrow,
  People,
  Schedule,
  AttachMoney,
  CheckCircle,
  Warning,
  Archive,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { courseManagementService } from '../../services/courseManagementService';
import CourseEditor from '../../components/admin/CourseEditor';
import LessonEditor from '../../components/admin/LessonEditor';
import CohortEditor from '../../components/admin/CohortEditor';
import { Course, Lesson, Cohort } from '../../types';
import { format } from 'date-fns';

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
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const AdminCourseManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Editor states
  const [showCourseEditor, setShowCourseEditor] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Lesson management states
  const [showLessonEditor, setShowLessonEditor] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState<Course | null>(null);
  
  // Cohort management states
  const [showCohortEditor, setShowCohortEditor] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [selectedCourseForCohort, setSelectedCourseForCohort] = useState<Course | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // View states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [coursesData, lessonsData, cohortsData] = await Promise.all([
        courseManagementService.getAllCourses(),
        courseManagementService.getAllLessons(),
        courseManagementService.getAllCohorts(),
      ]);
      setCourses(coursesData);
      setLessons(lessonsData);
      setCohorts(cohortsData);
    } catch (error) {
      console.error('Error loading course data:', error);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowCourseEditor(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowCourseEditor(true);
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowViewDialog(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This will also delete all associated lessons and cohorts. This action cannot be undone.')) {
      return;
    }

    try {
      await courseManagementService.deleteCourse(courseId);
      setSuccess('Course deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting course:', error);
      setError('Failed to delete course');
    }
  };

  const handleSaveCourse = async (courseData: any) => {
    try {
      if (editingCourse) {
        await courseManagementService.updateCourse(editingCourse.id, courseData);
        setSuccess('Course updated successfully');
      } else {
        await courseManagementService.createCourse(courseData);
        setSuccess('Course created successfully');
      }
      setShowCourseEditor(false);
      setEditingCourse(null);
      loadData();
    } catch (error) {
      console.error('Error saving course:', error);
      setError('Failed to save course');
    }
  };

  const handleCancelEdit = () => {
    setShowCourseEditor(false);
    setEditingCourse(null);
  };

  // Lesson management functions
  const handleCreateLesson = (course: Course) => {
    setSelectedCourseForLesson(course);
    setEditingLesson(null);
    setShowLessonEditor(true);
  };

  const handleEditLesson = (lesson: Lesson, course: Course) => {
    setSelectedCourseForLesson(course);
    setEditingLesson(lesson);
    setShowLessonEditor(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    try {
      await courseManagementService.deleteLesson(lessonId);
      setSuccess('Lesson deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setError('Failed to delete lesson');
    }
  };

  const handleSaveLesson = async (lessonData: any) => {
    try {
      if (editingLesson) {
        await courseManagementService.updateLesson(editingLesson.id, lessonData);
        setSuccess('Lesson updated successfully');
      } else {
        await courseManagementService.createLesson(lessonData);
        setSuccess('Lesson created successfully');
      }
      setShowLessonEditor(false);
      setEditingLesson(null);
      setSelectedCourseForLesson(null);
      loadData();
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError('Failed to save lesson');
    }
  };

  const handleCancelLessonEdit = () => {
    setShowLessonEditor(false);
    setEditingLesson(null);
    setSelectedCourseForLesson(null);
  };

  // Cohort management functions
  const handleCreateCohort = (course: Course) => {
    setSelectedCourseForCohort(course);
    setEditingCohort(null);
    setShowCohortEditor(true);
  };

  const handleEditCohort = (cohort: Cohort, course: Course) => {
    setSelectedCourseForCohort(course);
    setEditingCohort(cohort);
    setShowCohortEditor(true);
  };

  const handleDeleteCohort = async (cohortId: string) => {
    // Find the cohort to get its name for better messaging
    const cohort = cohorts.find(c => c.id === cohortId);
    const cohortName = cohort?.name || 'this cohort';
    
    // Check if cohort has enrolled students
    if (cohort && cohort.currentStudents > 0) {
      const forceDelete = window.confirm(
        `⚠️ WARNING: "${cohortName}" has ${cohort.currentStudents} enrolled student(s)!\n\n` +
        `This will:\n` +
        `• Delete ALL student enrollments for this cohort\n` +
        `• Delete ALL lesson releases for this cohort\n` +
        `• Delete the cohort itself\n\n` +
        `This action cannot be undone!\n\n` +
        `Are you sure you want to FORCE DELETE this cohort?`
      );
      
      if (!forceDelete) {
        setError(`Cannot delete cohort: ${cohort.currentStudents} student(s) are currently enrolled. Please reassign them to another cohort first.`);
        return;
      }
      
      // Force delete with confirmation
      try {
        setError(null);
        await courseManagementService.deleteCohort(cohortId, true);
        setSuccess(`Cohort "${cohortName}" force deleted successfully (${cohort.currentStudents} enrollments removed)`);
        loadData();
      } catch (error) {
        console.error('Error force deleting cohort:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to force delete cohort';
        setError(errorMessage);
      }
      return;
    }
    
    // Normal deletion for cohorts without students
    if (!window.confirm(`Are you sure you want to delete "${cohortName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null); // Clear any previous errors
      await courseManagementService.deleteCohort(cohortId, false);
      setSuccess(`Cohort "${cohortName}" deleted successfully`);
      loadData();
    } catch (error) {
      console.error('Error deleting cohort:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete cohort';
      setError(errorMessage);
    }
  };

  const handleSaveCohort = async (cohortData: any) => {
    try {
      setError(null); // Clear any previous errors
      
      if (editingCohort) {
        await courseManagementService.updateCohort(editingCohort.id, cohortData);
        setSuccess(`Cohort "${cohortData.name}" updated successfully`);
      } else {
        await courseManagementService.createCohort(cohortData);
        setSuccess(`Cohort "${cohortData.name}" created successfully`);
      }
      setShowCohortEditor(false);
      setEditingCohort(null);
      setSelectedCourseForCohort(null);
      loadData();
    } catch (error) {
      console.error('Error saving cohort:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save cohort';
      setError(errorMessage);
    }
  };

  const handleCancelCohortEdit = () => {
    setShowCohortEditor(false);
    setEditingCohort(null);
    setSelectedCourseForCohort(null);
  };

  // Filter and sort courses
  const filteredAndSortedCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = a.createdAt.toDate();
          bValue = b.createdAt.toDate();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
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
    const totalCourses = courses.length;
    const activeCourses = courses.filter(c => c.status === 'active').length;
    const draftCourses = courses.filter(c => c.status === 'draft').length;
    const archivedCourses = courses.filter(c => c.status === 'archived').length;
    const totalLessons = lessons.length;
    const totalCohorts = cohorts.length;
    const activeCohorts = cohorts.filter(c => c.status === 'active').length;
    const totalRevenue = courses.reduce((sum, course) => sum + (course.price * course.maxStudents), 0);
    
    return { 
      totalCourses, 
      activeCourses, 
      draftCourses, 
      archivedCourses, 
      totalLessons, 
      totalCohorts, 
      activeCohorts, 
      totalRevenue 
    };
  };

  const stats = getStats();

  const getCourseLessons = (courseId: string) => {
    return lessons.filter(lesson => lesson.courseId === courseId);
  };

  const getCourseCohorts = (courseId: string) => {
    return cohorts.filter(cohort => cohort.courseId === courseId);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Course Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateCourse}
          >
            Create New Course
          </Button>
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
                {stats.totalCourses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Courses
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                {stats.activeCourses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Courses
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                {stats.totalLessons}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Lessons
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                {stats.activeCohorts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Cohorts
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search courses..."
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
                  <MenuItem value="all">All Courses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="createdAt">Date Created</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="duration">Duration</MenuItem>
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

        {/* Courses List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Courses ({filteredAndSortedCourses.length})
            </Typography>
            
            {filteredAndSortedCourses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No courses found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first course to get started'
                  }
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredAndSortedCourses.map((course, index) => (
                  <React.Fragment key={course.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                            {course.title}
                          </Typography>
                          <Chip 
                            label={course.status} 
                            size="small" 
                            color={course.status === 'active' ? 'success' : course.status === 'draft' ? 'warning' : 'default'}
                          />
                          {course.isFree && (
                            <Chip label="Free" size="small" color="primary" variant="outlined" />
                          )}
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {course.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AttachMoney sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="caption" color="text.secondary">
                              ${course.price}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Schedule sx={{ fontSize: 16, color: 'info.main' }} />
                            <Typography variant="caption" color="text.secondary">
                              {course.duration} weeks
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <People sx={{ fontSize: 16, color: 'warning.main' }} />
                            <Typography variant="caption" color="text.secondary">
                              Max {course.maxStudents} students
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PlayArrow sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="caption" color="text.secondary">
                              {getCourseLessons(course.id).length} lessons
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <People sx={{ fontSize: 16, color: 'info.main' }} />
                            <Typography variant="caption" color="text.secondary">
                              {getCourseCohorts(course.id).length} cohorts
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Created: {format(course.createdAt.toDate(), 'MMM d, yyyy')}
                          </Typography>
                        </Box>
                      </Box>
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Course">
                            <IconButton
                              size="small"
                              onClick={() => handleViewCourse(course)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Course">
                            <IconButton
                              size="small"
                              onClick={() => handleEditCourse(course)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Course">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < filteredAndSortedCourses.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Course Editor Dialog */}
        {showCourseEditor && (
          <Dialog
            open={showCourseEditor}
            onClose={handleCancelEdit}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </DialogTitle>
            <DialogContent>
              <CourseEditor
                courseId={editingCourse?.id}
                courseData={editingCourse}
                onSave={handleSaveCourse}
                onCancel={handleCancelEdit}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Lesson Editor Dialog */}
        {showLessonEditor && selectedCourseForLesson && (
          <Dialog
            open={showLessonEditor}
            onClose={handleCancelLessonEdit}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Course: {selectedCourseForLesson.title}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <LessonEditor
                lessonId={editingLesson?.id}
                courseId={selectedCourseForLesson.id}
                lessonData={editingLesson}
                onSave={handleSaveLesson}
                onCancel={handleCancelLessonEdit}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Cohort Editor Dialog */}
        {showCohortEditor && selectedCourseForCohort && (
          <Dialog
            open={showCohortEditor}
            onClose={handleCancelCohortEdit}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {editingCohort ? 'Edit Cohort' : 'Create New Cohort'}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Course: {selectedCourseForCohort.title}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <CohortEditor
                cohortId={editingCohort?.id}
                courseId={selectedCourseForCohort.id}
                cohortData={editingCohort}
                onSave={handleSaveCohort}
                onCancel={handleCancelCohortEdit}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* View Course Dialog */}
        <Dialog
          open={showViewDialog}
          onClose={() => setShowViewDialog(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Course Details
          </DialogTitle>
          <DialogContent>
            {selectedCourse && (
              <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label="Overview" />
                    <Tab label={`Lessons (${getCourseLessons(selectedCourse.id).length})`} />
                    <Tab label={`Cohorts (${getCourseCohorts(selectedCourse.id).length})`} />
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {selectedCourse.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Chip label={selectedCourse.status} color={selectedCourse.status === 'active' ? 'success' : 'default'} />
                      {selectedCourse.isFree && <Chip label="Free" color="primary" variant="outlined" />}
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedCourse.description}
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" color="primary.main">
                            ${selectedCourse.price}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Course Price
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" color="info.main">
                            {selectedCourse.duration} weeks
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Duration
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" color="warning.main">
                            {selectedCourse.maxStudents}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Max Students
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Course Lessons
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => handleCreateLesson(selectedCourse)}
                      >
                        Add Lesson
                      </Button>
                    </Box>
                    {getCourseLessons(selectedCourse.id).length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary" gutterBottom>
                          No lessons created yet.
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={() => handleCreateLesson(selectedCourse)}
                        >
                          Create First Lesson
                        </Button>
                      </Box>
                    ) : (
                      <List>
                        {getCourseLessons(selectedCourse.id).map((lesson, index) => (
                          <ListItem key={lesson.id}>
                            <ListItemText
                              primary={lesson.title}
                              secondary={`Week ${lesson.weekNumber} • ${lesson.isPublished ? 'Published' : 'Draft'}`}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={lesson.isPublished ? 'Published' : 'Draft'} 
                                size="small" 
                                color={lesson.isPublished ? 'success' : 'warning'}
                              />
                              <Tooltip title="Edit Lesson">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditLesson(lesson, selectedCourse)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Lesson">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Course Cohorts
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => handleCreateCohort(selectedCourse)}
                      >
                        Add Cohort
                      </Button>
                    </Box>
                    {getCourseCohorts(selectedCourse.id).length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary" gutterBottom>
                          No cohorts created yet.
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={() => handleCreateCohort(selectedCourse)}
                        >
                          Create First Cohort
                        </Button>
                      </Box>
                    ) : (
                      <List>
                        {getCourseCohorts(selectedCourse.id).map((cohort, index) => (
                          <ListItem 
                            key={cohort.id}
                            sx={{
                              backgroundColor: cohort.currentStudents > 0 ? 'rgba(255, 152, 0, 0.05)' : 'transparent',
                              borderLeft: cohort.currentStudents > 0 ? '3px solid #ff9800' : 'none'
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {cohort.name}
                                  {cohort.currentStudents > 0 && (
                                    <Chip 
                                      label={`${cohort.currentStudents} enrolled`} 
                                      size="small" 
                                      color="warning"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              }
                              secondary={`${cohort.currentStudents}/${cohort.maxStudents} students • ${cohort.status}`}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={cohort.status} 
                                size="small" 
                                color={cohort.status === 'active' ? 'success' : cohort.status === 'upcoming' ? 'info' : 'default'}
                              />
                              <Tooltip title="Edit Cohort">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditCohort(cohort, selectedCourse)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={cohort.currentStudents > 0 ? `Force delete: ${cohort.currentStudents} student(s) will be removed` : "Delete Cohort"}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteCohort(cohort.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </TabPanel>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {selectedCourse && (
              <Button
                variant="contained"
                onClick={() => {
                  setShowViewDialog(false);
                  handleEditCourse(selectedCourse);
                }}
              >
                Edit Course
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminCourseManagement; 