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
} from '@mui/material';
import { Add, School, People, Schedule, Edit, Create } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCourse } from '../../contexts/CourseContext';
import { initializeCourseData, makeUserAdmin, updateCourse, createCohort } from '../../utils/initializeData';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import CourseEditor from '../../components/admin/CourseEditor';
import LessonEditor from '../../components/admin/LessonEditor';
import CohortEditor from '../../components/admin/CohortEditor';

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

  const loadLessons = async () => {
    setLessonsLoading(true);
    try {
      const lessonsSnapshot = await getDocs(collection(db, 'lessons'));
      const lessonsData = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLessonsLoading(false);
    }
  };

  // Load lessons when component mounts
  useEffect(() => {
    loadLessons();
  }, []);

  const handleInitializeData = async () => {
    try {
      setLoading(true);
      setError(null);
      await initializeCourseData();
      setSuccess('Course data initialized successfully!');
    } catch (err) {
      setError('Failed to initialize data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async () => {
    if (!currentUser) {
      setError('No user logged in');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await makeUserAdmin(currentUser.id);
      setSuccess('You are now an admin!');
    } catch (err) {
      setError('Failed to make user admin');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
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

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          {/* Quick Actions */}
          <Box sx={{ flex: { md: 1 } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                
                {currentUser && !currentUser.isAdmin && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={handleMakeAdmin}
                    disabled={loading}
                    startIcon={<People />}
                    sx={{ mb: 2 }}
                  >
                    Make Me Admin
                  </Button>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleInitializeData}
                  disabled={loading}
                  startIcon={<Add />}
                >
                  {loading ? <CircularProgress size={20} /> : 'Initialize Course Data'}
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Instructions */}
          <Box sx={{ flex: { md: 1 } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Instructions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  1. If you're not an admin, click "Make Me Admin" first
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  2. Click "Initialize Course Data" to create the course, lessons, and cohort
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  3. The enrollment button on the dashboard should now work
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

                  {/* Management Actions */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Management Actions
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Create />}
                    onClick={() => {
                      setEditingCourse(null);
                      setShowCourseEditor(true);
                    }}
                  >
                    Create Course
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Create />}
                    onClick={() => {
                      setEditingLesson(null);
                      setShowLessonEditor(true);
                    }}
                    disabled={courses.length === 0}
                  >
                    Create Lesson
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Create />}
                    onClick={() => {
                      setEditingCohort(null);
                      setShowCohortEditor(true);
                    }}
                    disabled={courses.length === 0}
                  >
                    Create Cohort
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Existing Data */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Existing Data
                </Typography>
                
                {courseLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    {/* Courses */}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Courses ({courses.length})
                      </Typography>
                      {courses.map((course) => (
                        <Box key={course.id} sx={{ mb: 2, p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {course.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {course.id}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Price: €{course.price} | Duration: {course.duration} weeks
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => {
                              setEditingCourse(course);
                              setShowCourseEditor(true);
                            }}
                            sx={{ mt: 1, mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setEditingLesson(null);
                              setShowLessonEditor(true);
                            }}
                          >
                            Add Lesson
                          </Button>
                        </Box>
                      ))}
                    </Box>

                    {/* Lessons */}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Lessons ({lessons?.length || 0})
                      </Typography>
                      {lessonsLoading ? (
                        <CircularProgress size={20} />
                      ) : lessons && lessons.length > 0 ? (
                        lessons.map((lesson) => (
                          <Box key={lesson.id} sx={{ mb: 2, p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {lesson.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {lesson.id}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Week: {lesson.weekNumber} | Order: {lesson.order}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Published: {lesson.isPublished ? 'Yes' : 'No'}
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => {
                                setEditingLesson(lesson);
                                setShowLessonEditor(true);
                              }}
                              sx={{ mt: 1 }}
                            >
                              Edit
                            </Button>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No lessons found
                        </Typography>
                      )}
                    </Box>

                    {/* Cohorts */}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Cohorts ({cohorts.length})
                      </Typography>
                      {cohorts.map((cohort) => (
                        <Box key={cohort.id} sx={{ mb: 2, p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {cohort.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {cohort.id}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Students: {cohort.currentStudents}/{cohort.maxStudents}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Status: {cohort.status}
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => {
                              setEditingCohort(cohort);
                              setShowCohortEditor(true);
                            }}
                            sx={{ mt: 1 }}
                          >
                            Edit
                          </Button>
                        </Box>
                      ))}
                    </Box>
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
      </Box>
    </Container>
  );
};

export default AdminDashboard; 