import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';

import {
  PlayCircle,
  Description,
  CalendarToday,
  AcUnit,
  LocalFireDepartment,
  FitnessCenter,
  Psychology,
  Restaurant,
  Group,
  Spa,
  SelfImprovement,
  HealthAndSafety,
  Air,
  DirectionsRun,
  LocationOn,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import { courseManagementService } from '../services/courseManagementService';
import { cohortPricingService } from '../services/cohortPricingService';
import { useSEO } from '../hooks/useSEO';
import { seoService } from '../services/seoService';
import { format, isAfter } from 'date-fns';
import { Lesson as DBLesson, Cohort, Course } from '../types';
import Testimonials from '../components/Testimonials';
import ProgramCard from '../components/ProgramCard';

// Local interface that matches the database types
interface Lesson extends Omit<DBLesson, 'releaseDate'> {
  releaseDate?: Date;
}

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showAuthModal } = useAuthModal();
  
  // SEO setup - will be updated when course data loads
  useSEO({
    title: 'Course Details - Reverse Aging Academy',
    description: 'Explore our comprehensive course on reverse aging and health optimization. Join our community and transform your healthspan.',
    canonicalPath: `/course/${courseId || 'default'}`,
    type: 'website',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Programs', url: '/programs' },
      { name: 'Course Details', url: `/course/${courseId || 'default'}` }
    ]
  });

  // State for data
  const [course, setCourse] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortPricing, setCohortPricing] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [loadingCohorts, setLoadingCohorts] = useState(false);
  
  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        // Load course
        const courseData = await courseManagementService.getCourse(courseId);
        setCourse(courseData);
        
        // Load lessons
        const lessonsData = await courseManagementService.getCourseLessons(courseId);
        const convertedLessons: Lesson[] = lessonsData.map((lesson: DBLesson) => ({
          ...lesson,
          releaseDate: lesson.releaseDate ? lesson.releaseDate.toDate() : undefined
        }));
        setCourseLessons(convertedLessons);
      } catch (error) {
        console.error('Error loading course data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  // Load cohorts for this course
  useEffect(() => {
    if (courseId) {
      setLoadingCohorts(true);
      courseManagementService.getCourseCohorts(courseId)
        .then(async (cohortsData) => {
          setCohorts(cohortsData);
          
          // Load pricing information for each cohort
          const pricingPromises = cohortsData.map(async (cohort) => {
            try {
              const pricingDisplay = await cohortPricingService.getPricingDisplay(cohort.id);
              return { cohortId: cohort.id, pricing: pricingDisplay };
            } catch (error) {
              console.error(`Error loading pricing for cohort ${cohort.id}:`, error);
              return { cohortId: cohort.id, pricing: null };
            }
          });
          
          const pricingResults = await Promise.all(pricingPromises);
          const pricingMap = pricingResults.reduce((acc, result) => {
            if (result.pricing) {
              acc[result.cohortId] = result.pricing;
            }
            return acc;
          }, {} as {[key: string]: any});
          
          setCohortPricing(pricingMap);
        })
        .catch((error) => {
          console.error('Error loading cohorts:', error);
        })
        .finally(() => {
          setLoadingCohorts(false);
        });
    }
  }, [courseId]);
  
  // Update SEO when course data loads
  useEffect(() => {
    if (course) {
      seoService.setupPageSEO({
        title: `${course.title} - Reverse Aging Academy`,
        description: course.description,
        canonicalPath: `/course/${course.id}`,
        type: 'website',
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Programs', url: '/programs' },
          { name: course.title, url: `/course/${course.id}` }
        ]
      });
      
      seoService.addCourseSchema({
        name: course.title,
        description: course.description,
        url: `/course/${course.id}`,
        provider: 'The Reverse Aging Academy',
        duration: 'P7W',
        educationalLevel: 'Beginner'
      });
    }
  }, [course]);

  // Calculate total lessons for display
  const totalLessons = courseLessons.length;

  // Format video duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Get lesson icon based on week number or content
  const getLessonIcon = (lesson: Lesson) => {
    const weekNumber = lesson.weekNumber;
    const title = lesson.title.toLowerCase();
    
    // Check for specific keywords in title first
    if (title.includes('cold') || title.includes('ice') || title.includes('cryo')) {
      return { icon: <AcUnit />, color: '#4CAF50' }; // Green for cold
    }
    if (title.includes('heat') || title.includes('sauna') || title.includes('thermal')) {
      return { icon: <LocalFireDepartment />, color: '#4CAF50' }; // Green for heat
    }
    if (title.includes('breath') || title.includes('breathing') || title.includes('respiratory')) {
      return { icon: <Air />, color: '#4CAF50' }; // Green for breath (wind icon)
    }
    if (title.includes('movement') || title.includes('exercise') || title.includes('fitness')) {
      return { icon: <FitnessCenter />, color: '#4CAF50' }; // Green for movement
    }
    if (title.includes('mindset') || title.includes('psychology') || title.includes('mental')) {
      return { icon: <Psychology />, color: '#4CAF50' }; // Green for mindset
    }
    if (title.includes('nourish') || title.includes('nutrition') || title.includes('diet')) {
      return { icon: <Restaurant />, color: '#4CAF50' }; // Green for nutrition
    }
    if (title.includes('community') || title.includes('social') || title.includes('connection')) {
      return { icon: <Group />, color: '#4CAF50' }; // Green for community
    }
    
    // Fallback to week-based icons
    switch (weekNumber) {
      case 1:
        return { icon: <Air />, color: '#4CAF50' }; // Green for breath (wind icon)
      case 2:
        return { icon: <FitnessCenter />, color: '#4CAF50' }; // Green for movement
      case 3:
        return { icon: <DirectionsRun />, color: '#4CAF50' }; // Green for person moving
      case 4:
        return { icon: <LocalFireDepartment />, color: '#4CAF50' }; // Green for heat
      case 5:
        return { icon: <Restaurant />, color: '#4CAF50' }; // Green for nutrition
      case 6:
        return { icon: <Psychology />, color: '#4CAF50' }; // Green for mindset
      case 7:
        return { icon: <Group />, color: '#4CAF50' }; // Green for community
      default:
        return { icon: <Spa />, color: '#4CAF50' }; // Green for general wellness
    }
  };



  // Helper functions for cohort management
  const getCohortStatus = (cohort: Cohort) => {
    const now = new Date();
    const startDate = cohort.startDate.toDate();
    const endDate = cohort.endDate.toDate();
    
    if (now < startDate) {
      return 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'active';
    } else {
      return 'completed';
    }
  };

  const formatCohortDate = (date: Date) => {
    return format(date, 'MMMM d, yyyy');
  };

  const handleEnrollInCohort = (cohort: Cohort) => {
    if (!currentUser) {
      showAuthModal('signup', 'Create Your Account', 'A free account is required for enrollment');
      return;
    }
    navigate(`/payment/${courseId}?cohortId=${cohort.id}`);
  };

  // Sort cohorts by start date
  const sortedCohorts = cohorts.sort((a, b) => {
    return a.startDate.toDate().getTime() - b.startDate.toDate().getTime();
  });

  // Show loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading course content...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4">Course not found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            The course you're looking for doesn't exist or has been removed.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Course Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {course.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {course.description}
          </Typography>



          {/* Available Cohorts - Show for all users */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Available Cohorts
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {currentUser 
                ? "Choose a cohort that fits your schedule and start your transformation journey."
                : "Sign up to join a cohort and start your transformation journey."
              }
            </Typography>
              
              {loadingCohorts ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : sortedCohorts.length === 0 ? (
                <Alert severity="info">
                  No cohorts are currently available for this course. Please check back later.
                </Alert>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                  {sortedCohorts.map((cohort) => {
                    const status = getCohortStatus(cohort);
                    const isUpcoming = status === 'upcoming';
                    const isActive = status === 'active';
                    
                    return (
                      <Box key={cohort.id}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            border: '1px solid',
                            borderColor: isUpcoming ? 'rgba(80, 235, 151, 0.3)' : 'divider',
                            backgroundColor: isUpcoming ? 'rgba(80, 235, 151, 0.02)' : 'background.paper',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {isUpcoming && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                backgroundColor: 'primary.main',
                                zIndex: 1
                              }}
                            />
                          )}
                          
                          <CardContent sx={{ 
                            p: 3, 
                            pt: isUpcoming ? 4 : 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            {/* Top Section - Title and Description */}
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <CalendarToday sx={{ fontSize: 20, color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {cohort.name}
                                </Typography>
                              </Box>
                              
                              {/* Cohort Description */}
                              {cohort.description && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ 
                                    fontStyle: 'italic',
                                    lineHeight: 1.4,
                                    px: 1,
                                    py: 0.5,
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                    borderRadius: 1,
                                    border: '1px solid rgba(0, 0, 0, 0.08)'
                                  }}>
                                    {cohort.description}
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            {/* Spacer to push content to bottom */}
                            <Box sx={{ flexGrow: 1 }} />

                            {/* Bottom Section - All other content */}
                            <Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                <strong>Start Date:</strong> {formatCohortDate(cohort.startDate.toDate())}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                <strong>End Date:</strong> {formatCohortDate(cohort.endDate.toDate())}
                              </Typography>
                              <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Enrollment Progress</strong>
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {Math.round(((cohort.currentStudents || 0) / cohort.maxStudents) * 100)}%
                                  </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                                  value={((cohort.currentStudents || 0) / cohort.maxStudents) * 100} 
                                  sx={{ 
                                    height: 6, 
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: isUpcoming ? 'primary.main' : 'success.main'
                                    }
                                  }}
                                />
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                              <Chip 
                                label={status === 'upcoming' ? 'Upcoming' : status === 'active' ? 'Active' : 'Completed'}
                                color={status === 'upcoming' ? 'primary' : status === 'active' ? 'success' : 'default'}
                                size="small"
                              />
                              {isUpcoming && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {(() => {
                                    const pricing = cohortPricing[cohort.id];
                                    if (pricing) {
                                      if (pricing.isFree) {
                                        return (
                                          <Chip 
                                            label="FREE"
                                            color="success"
                                            size="small"
                                          />
                                        );
                                      } else {
                                        let displayPrice = pricing.specialOffer && pricing.specialOffer > 0 
                                          ? pricing.specialOffer 
                                          : pricing.basePrice;
                                        
                                        let chipColor: "secondary" | "primary" = "secondary";
                                        let showSpecialOffer = !!(pricing.specialOffer && pricing.specialOffer > 0);
                                        let showEarlyBird = false;
                                        
                                        // Apply early bird discount if valid
                                        if (pricing.earlyBirdDiscount && pricing.earlyBirdDiscount.amount > 0 && new Date() < new Date(pricing.earlyBirdDiscount.validUntil)) {
                                          if (pricing.earlyBirdDiscount.type === 'percentage') {
                                            displayPrice = displayPrice - (displayPrice * pricing.earlyBirdDiscount.amount / 100);
                                          } else {
                                            displayPrice = displayPrice - pricing.earlyBirdDiscount.amount;
                                          }
                                          showEarlyBird = true;
                                          chipColor = "primary"; // Use primary color for early bird
                                        }
                                        
                                        return (
                                          <>
                                            <Chip 
                                              label={`€${Math.round(displayPrice)}`}
                                              color={chipColor}
                                              size="small"
                                            />
                                            {showSpecialOffer && !showEarlyBird && (
                                              <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                  color: 'secondary.main',
                                                  fontWeight: 600,
                                                  fontSize: '0.7rem',
                                                  textTransform: 'uppercase',
                                                  letterSpacing: '0.5px'
                                                }}
                                              >
                                                SPECIAL OFFER
                                              </Typography>
                                            )}
                                            {showEarlyBird && (
                                              <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                  color: 'primary.main',
                                                  fontWeight: 600,
                                                  fontSize: '0.7rem',
                                                  textTransform: 'uppercase',
                                                  letterSpacing: '0.5px'
                                                }}
                                              >
                                                EARLY BIRD
                                              </Typography>
                                            )}
                                          </>
                                        );
                                      }
                                    } else {
                                      // No cohort pricing available
                                      return (
                                        <Chip 
                                          label="Contact us"
                                          color="secondary"
                                          size="small"
                                        />
                                      );
                                    }
                                  })()}
                                </Box>
                              )}
                            </Box>
                            
                            {isUpcoming ? (
              <Button
                variant="contained"
                                fullWidth
                                onClick={() => handleEnrollInCohort(cohort)}
                                sx={{ fontWeight: 600 }}
                              >
                                Enroll in This Cohort
                              </Button>
                            ) : isActive ? (
                              <Button
                                variant="outlined"
                                fullWidth
                                disabled
                                sx={{ fontWeight: 600 }}
                              >
                                Cohort Full
              </Button>
                            ) : (
              <Button
                variant="outlined"
                                fullWidth
                                disabled
                                sx={{ fontWeight: 600 }}
              >
                                Completed
              </Button>
                            )}
                            </Box> {/* Close bottom section */}
                          </CardContent>
                        </Card>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
        </Box>

        {/* Divider between cohorts and lessons */}
        <Divider sx={{ my: 4, borderColor: 'rgba(80, 235, 151, 0.1)', borderWidth: 1 }} />

        {/* Course Overview Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Course Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {courseLessons.length > 0 
              ? `Explore the ${courseLessons.length} lessons in this comprehensive course designed to guide your transformation journey.`
              : "Course content will be available soon."
            }
          </Typography>
        </Box>

        {/* Lessons Grid */}
        {courseLessons.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No lessons available yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Course content will be available soon.
            </Typography>
          </Box>
        ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {courseLessons.map((lesson) => {
              const lessonIcon = getLessonIcon(lesson);

            return (
              <Card 
                key={lesson.id}
                sx={{ 
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Lesson Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'primary.main',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            mb: 1,
                            display: 'block'
                          }}
                        >
                          Week {lesson.weekNumber}
                        </Typography>
                      <Typography variant="h6" gutterBottom>
                          {lesson.title}
                      </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 2,
                            whiteSpace: 'pre-line',
                            lineHeight: 1.6
                          }}
                        >
                        {lesson.description}
                      </Typography>
                    </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                        <Box sx={{ 
                          color: lessonIcon.color, 
                          fontSize: 32,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {lessonIcon.icon}
                        </Box>
                      </Box>
                    </Box>





                    {/* Spacer to push content to bottom */}
                    <Box sx={{ flex: 1 }} />

                    {/* Workbook Integration - Moved to bottom */}
                    <Box sx={{ 
                      mb: 1, 
                      p: 2, 
                      backgroundColor: 'rgba(80, 235, 151, 0.05)', 
                      borderRadius: 1,
                      border: '1px solid rgba(80, 235, 151, 0.1)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Description sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
                          Key Practices and Integration Tasks
                      </Typography>
                    </Box>
                      <Typography variant="caption" color="text.secondary">
                        A workbook will be available for you to download at the start of the course. Use it to track your progress and complete exercises.
                      </Typography>
                  </Box>

                    {/* Divider above lesson duration */}
                    <Divider sx={{ mb: 1, borderColor: 'rgba(0, 0, 0, 0.08)', borderWidth: 1 }} />

                    {/* Lesson Details */}
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PlayCircle sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {lesson.videoDuration ? formatDuration(lesson.videoDuration) : 'Video lesson'}
        </Typography>
                      </Box>
                    </Box>


                </CardContent>
              </Card>
            );
          })}
          
          {/* In-Person Reset Advertisement Card */}
          <ProgramCard
            title="The 7-Day Reverse Aging Reset"
            subtitle="Next retreat: October 25-31, 2025"
            description="For those ready to go all in, our 7‑day retreat in the Málaga countryside is an immersive reset."
            features={[
              {
                icon: <FitnessCenter sx={{ fontSize: 20 }} />,
                text: "<strong>Breathwork, cold, and heat exposure</strong> every day, guided by certified instructors"
              },
              {
                icon: <Psychology sx={{ fontSize: 20 }} />,
                text: "<strong>Movement and mindset training</strong> designed to rewire how your body responds to stress"
              },
              {
                icon: <Restaurant sx={{ fontSize: 20 }} />,
                text: "<strong>Chef‑prepared, metabolically aligned meals</strong> to fuel the transformation"
              },
              {
                icon: <Group sx={{ fontSize: 20 }} />,
                text: "<strong>A small, supportive group</strong> creating breakthroughs that last long after you leave"
              }
            ]}
            buttonText="Apply for In-Person Reset"
            buttonVariant="outlined"
            icon={<Spa sx={{ fontSize: 32 }} />}
            iconColor="secondary"
            externalUrl="https://7weekreverseagingchallenge.com"
            sx={{
              gridColumn: { xs: '1', md: '1 / -1' },
              maxWidth: { md: '600px' },
              mx: 'auto'
            }}
          />
        </Box>
        )}



        {/* Testimonials */}
        <Box sx={{ mt: 6 }}>
          <Testimonials />
        </Box>
      </Box>
    </Container>
  );
};

export default CoursePage; 