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
import { Add, School, People, Schedule, Edit, Create, PlayArrow } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCourse } from '../../contexts/CourseContext';
import { updateLessonVideoUrls, setSpecificVideoUrl, setVideoUrlByLessonId, listAllLessons } from '../../utils/initializeData';
import { updateCohortStatus } from '../../utils/lessonUtils';
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

  // Load lessons when component mounts
  useEffect(() => {
    loadLessons();
  }, []);

  // Update cohort status when cohorts change
  useEffect(() => {
    const updateCohortStatuses = async () => {
      for (const cohort of cohorts) {
        await updateCohortStatus(cohort);
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
      await updateLessonVideoUrls();
      setSuccess('Video URLs updated successfully!');
    } catch (error) {
      console.error('Error updating video URLs:', error);
      setError('Failed to update video URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleSetSpecificVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      // Set your specific video for lesson 1
      await setSpecificVideoUrl(1, 'https://www.youtube.com/watch?v=YYSJypPgqvE');
      setSuccess('Specific video URL set successfully!');
    } catch (error) {
      console.error('Error setting specific video URL:', error);
      setError('Failed to set specific video URL');
    } finally {
      setLoading(false);
    }
  };

  const handleListLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      await listAllLessons();
      setSuccess('Check console for lesson list!');
    } catch (error) {
      console.error('Error listing lessons:', error);
      setError('Failed to list lessons');
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
          {/* Lesson Management */}
          <Box sx={{ flex: { md: 1 } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lesson Management
                </Typography>
                
                <Button
                  fullWidth
                  variant="outlined"
                  color="info"
                  onClick={handleUpdateVideoUrls}
                  disabled={loading}
                  startIcon={<PlayArrow />}
                  sx={{ mb: 2 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Update Video URLs'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  onClick={handleSetSpecificVideo}
                  disabled={loading}
                  startIcon={<PlayArrow />}
                  sx={{ mb: 2 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Set Video for Lesson 1'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  onClick={handleListLessons}
                  disabled={loading}
                  startIcon={<School />}
                >
                  {loading ? <CircularProgress size={20} /> : 'List All Lessons'}
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Instructions */}
          <Box sx={{ flex: { md: 1 } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Video Management
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  1. Use "List All Lessons" to see available lessons
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  2. Use "Update Video URLs" to fix embed formats
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  3. Use "Set Video for Lesson 1" to test specific videos
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
                            {lesson.theme && (
                              <Typography variant="caption" display="block" color="primary.main">
                                Theme: {lesson.theme}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              ID: {lesson.id}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Week: {lesson.weekNumber} | Order: {lesson.order}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Published: {lesson.isPublished ? 'Yes' : 'No'}
                            </Typography>
                            {lesson.videoUrl && (
                              <Typography variant="caption" display="block" color="primary.main">
                                Video: {lesson.videoUrl.includes('embed') ? '✅ Embed URL' : '⚠️ Watch URL'}
                              </Typography>
                            )}
                            {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                Objectives: {lesson.learningObjectives.length} items
                              </Typography>
                            )}
                            <Button
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => {
                                setEditingLesson(lesson);
                                setShowLessonEditor(true);
                              }}
                              sx={{ mt: 1, mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<PlayArrow />}
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  await setVideoUrlByLessonId(lesson.id, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                                  setSuccess(`Video set for ${lesson.title}`);
                                  loadLessons(); // Refresh the lessons list
                                } catch (error) {
                                  setError(`Failed to set video for ${lesson.title}`);
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              disabled={loading}
                            >
                              Test Video
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