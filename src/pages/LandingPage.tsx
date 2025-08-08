import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  IconButton,
} from '@mui/material';
import { 
  Science, 
  PlayArrow, 
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  School,
  Spa,
  Build,
  Public,
  FitnessCenter,
  Psychology,
  Restaurant,
  Group,
  ArrowForward
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { useLandingPageSEO } from '../hooks/useSEO';
import { courseManagementService } from '../services/courseManagementService';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import ProgramCard from '../components/ProgramCard';
import TransformationJourney from '../components/TransformationJourney';

const LandingPage: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { showAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  
  // SEO setup
  useLandingPageSEO();
  
  // Scientific Updates Preview
  const [scientificUpdates, setScientificUpdates] = useState<any[]>([]);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);

  // Upcoming cohort
  const [upcomingCohort, setUpcomingCohort] = useState<any>(null);
  const [loadingCohort, setLoadingCohort] = useState(false);



  const theme = useTheme();
  const [searchParams] = useSearchParams();

  // Carousel navigation handlers
  const handlePrevUpdate = useCallback(() => {
    setCurrentUpdateIndex(prev => 
      prev === 0 ? scientificUpdates.length - 1 : prev - 1
    );
  }, [scientificUpdates.length]);

  const handleNextUpdate = useCallback(() => {
    setCurrentUpdateIndex(prev => 
      prev === scientificUpdates.length - 1 ? 0 : prev + 1
    );
  }, [scientificUpdates.length]);

  // Load upcoming cohort
  const loadUpcomingCohort = useCallback(async () => {
    try {
      setLoadingCohort(true);
      const cohort = await courseManagementService.getNextUpcomingCohort();
      setUpcomingCohort(cohort);
    } catch (error) {
      console.error('Error loading upcoming cohort:', error);
    } finally {
      setLoadingCohort(false);
    }
  }, []);

  // Format cohort date
  const formatCohortDate = (date: Date | any) => {
    if (!date) return 'Coming Soon';
    
    try {
      let dateObj;
      if (date instanceof Date) {
        dateObj = date;
      } else if (date && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      } else {
        return 'Coming Soon';
      }
      
      return dateObj.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Coming Soon';
    }
  };



  // Auto-rotate scientific updates
  useEffect(() => {
    if (scientificUpdates.length > 1) {
      const interval = setInterval(() => {
        setCurrentUpdateIndex((prev) => (prev === scientificUpdates.length - 1 ? 0 : prev + 1));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [scientificUpdates.length]);

  // Handle URL parameters for auth modal
  useEffect(() => {
    const signup = searchParams.get('signup');
    const signin = searchParams.get('signin');
    
    if (signup === 'true') {
      showAuthModal('signup', 'Create Your Account', 'Join our community and start your health transformation journey.');
    } else if (signin === 'true') {
      showAuthModal('signin', 'Welcome Back', 'Sign in to continue your health transformation journey.');
    }
  }, [searchParams, showAuthModal]);

  // Load recent scientific updates and upcoming cohort for preview
  useEffect(() => {
    const loadData = async () => {
      setLoadingUpdate(true);
      setLoadingCohort(true);
      try {
        // Load scientific updates
        const { scientificUpdateService } = await import('../services/scientificUpdateService');
        const updates = await scientificUpdateService.getAllUpdates({ limit: 5 });
        setScientificUpdates(updates);
        
        // Load upcoming cohort
        const cohort = await courseManagementService.getNextUpcomingCohort();
        setUpcomingCohort(cohort);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingUpdate(false);
        setLoadingCohort(false);
      }
    };

    loadData();
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, authLoading, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 50%, ${theme.palette.background.default} 100%)`,
          color: theme.palette.text.primary,
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 80%, ${theme.palette.primary.main}15 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${theme.palette.primary.main}10 0%, transparent 50%)`,
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
            {/* Mission Statement */}
            <Box sx={{ flex: { xs: 1, md: 7 } }}>
              <Typography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '2rem', md: '2.8rem' },
                  lineHeight: 1.2,
                  animation: 'fadeInUp 0.8s ease-out',
                  '@keyframes fadeInUp': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(30px)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                Take Control of Your Health
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  color: theme.palette.text.secondary,
                  lineHeight: 1.6,
                  fontWeight: 400,
                  animation: 'fadeInUp 0.8s ease-out 0.2s both',
                  '@keyframes fadeInUp': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(30px)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                The Reverse Aging Academy helps people of all ages take the lead in their own healthcare, 
                giving them access to evidence-based tools and guiding them to develop sustainable habits 
                using natural tools.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  trackEvent.ctaClick('create_account_hero', '/');
                  showAuthModal('signup', 'Create Your Account', 'Get free access to our evolving library of healthspan science, plus weekly digests on the latest research.');
                }}
                sx={{
                  px: 4,
                  py: 2,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  backgroundColor: theme.palette.primary.main,
                  color: '#000',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'translateY(0)',
                  boxShadow: `0 4px 14px ${theme.palette.primary.main}40`,
                  animation: 'fadeInUp 0.8s ease-out 0.4s both',
                  '@keyframes fadeInUp': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(30px)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${theme.palette.primary.main}60`,
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: `0 4px 14px ${theme.palette.primary.main}40`,
                  },
                }}
              >
                Create Free Account
              </Button>
            </Box>

            {/* Latest Scientific Evidence Box */}
            <Box sx={{ flex: { xs: 1, md: 5 } }}>
              <Card sx={{ 
                background: `${theme.palette.background.paper}CC`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
                boxShadow: `0 25px 50px rgba(0,0,0,0.3), 0 0 0 1px ${theme.palette.divider}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'fadeInUp 0.8s ease-out 0.6s both',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(30px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 35px 60px rgba(0,0,0,0.4), 0 0 0 1px ${theme.palette.primary.main}30`,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper}20 0%, ${theme.palette.background.paper}10 100%)`,
                  pointerEvents: 'none',
                }
              }}>
                <CardContent sx={{ p: 2.5, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      backgroundColor: `${theme.palette.primary.main}20`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: `1px solid ${theme.palette.primary.main}30`
                    }}>
                      <Science sx={{ fontSize: 22, color: theme.palette.primary.main }} />
                    </Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '1.1rem' }}>
                      Latest Scientific Evidence
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.secondary, lineHeight: 1.5, fontSize: '0.9rem' }}>
                    Get access to cutting-edge research on healthspan and longevity. Stay ahead with weekly scientific updates.
                  </Typography>

                  {loadingUpdate ? (
                    <Box sx={{ textAlign: 'center', py: 2, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : scientificUpdates.length > 0 ? (
                    <Box sx={{ position: 'relative' }}>
                      {/* Navigation Controls - Outside Content */}
                      {scientificUpdates.length > 1 && (
                        <Box sx={{ 
                          position: 'absolute', 
                          top: '50%', 
                          left: -20, 
                          right: -20, 
                          transform: 'translateY(-50%)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          pointerEvents: 'none',
                          zIndex: 2
                        }}>
                          <IconButton
                            onClick={handlePrevUpdate}
                            sx={{
                              backgroundColor: `${theme.palette.background.default}CC`,
                              backdropFilter: 'blur(10px)',
                              border: `1px solid ${theme.palette.divider}`,
                              color: theme.palette.text.primary,
                              pointerEvents: 'auto',
                              transition: 'all 0.3s ease',
                              width: 40,
                              height: 40,
                              '&:hover': {
                                backgroundColor: `${theme.palette.primary.main}20`,
                                transform: 'scale(1.1)',
                              }
                            }}
                          >
                            <ChevronLeft />
                          </IconButton>
                          <IconButton
                            onClick={handleNextUpdate}
                            sx={{
                              backgroundColor: `${theme.palette.background.default}CC`,
                              backdropFilter: 'blur(10px)',
                              border: `1px solid ${theme.palette.divider}`,
                              color: theme.palette.text.primary,
                              pointerEvents: 'auto',
                              transition: 'all 0.3s ease',
                              width: 40,
                              height: 40,
                              '&:hover': {
                                backgroundColor: `${theme.palette.primary.main}20`,
                                transform: 'scale(1.1)',
                              }
                            }}
                          >
                            <ChevronRight />
                          </IconButton>
                        </Box>
                      )}

                      {/* Content Card with Fixed Height */}
                      <Box sx={{ 
                        p: 2, 
                        backgroundColor: `${theme.palette.primary.main}15`, 
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.primary.main}30`,
                        boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        height: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        '&:hover': {
                          backgroundColor: `${theme.palette.primary.main}25`,
                          boxShadow: `0 6px 16px ${theme.palette.primary.main}30`,
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.primary.main}05 100%)`,
                          borderRadius: 3,
                          pointerEvents: 'none',
                        }
                      }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary, fontSize: '0.95rem', lineHeight: 1.3 }}>
                            {scientificUpdates[currentUpdateIndex].title}
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.4, color: theme.palette.text.secondary, fontWeight: 500, fontSize: '0.85rem' }}>
                            {scientificUpdates[currentUpdateIndex].summary.length > 160 
                              ? `${scientificUpdates[currentUpdateIndex].summary.substring(0, 160)}...` 
                              : scientificUpdates[currentUpdateIndex].summary
                            }
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                          <Box sx={{ 
                            px: 1.5, 
                            py: 0.5, 
                            backgroundColor: theme.palette.primary.main, 
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: `0 2px 8px ${theme.palette.primary.main}40`
                          }}>
                            <Typography variant="caption" sx={{ color: '#000', fontWeight: 700, fontSize: '0.7rem' }}>
                              {scientificUpdates[currentUpdateIndex].category}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500, fontSize: '0.75rem' }}>
                            Published: {new Date(scientificUpdates[currentUpdateIndex].publishedDate.toDate()).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Dots Indicator */}
                      {scientificUpdates.length > 1 && (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          gap: 0.75, 
                          mt: 1.5 
                        }}>
                          {scientificUpdates.map((_, index) => (
                            <Box
                              key={index}
                              onClick={() => setCurrentUpdateIndex(index)}
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: index === currentUpdateIndex 
                                  ? theme.palette.primary.main 
                                  : theme.palette.text.secondary,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.main,
                                  transform: 'scale(1.2)',
                                }
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: `${theme.palette.primary.main}20`, 
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.primary.main}30`,
                      textAlign: 'center',
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Weekly scientific updates coming soon...
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" sx={{ mt: 2.5, textAlign: 'center', color: theme.palette.text.secondary, fontWeight: 500, fontSize: '0.85rem' }}>
                    <strong 
                      style={{ 
                        color: theme.palette.primary.main,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.color = theme.palette.primary.dark}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.color = theme.palette.primary.main}
                      onClick={() => {
                        trackEvent.ctaClick('free_account_evidence_box', '/');
                        showAuthModal('signup', 'Create Your Account', 'Get free access to our evolving library of healthspan science, plus weekly digests on the latest research.');
                      }}
                    >
                      Free accounts
                    </strong> get access to all scientific evidence
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Scroll Indicator */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': {
                transform: 'translateX(-50%) translateY(0)',
              },
              '40%': {
                transform: 'translateX(-50%) translateY(-10px)',
              },
              '60%': {
                transform: 'translateX(-50%) translateY(-5px)',
              },
            },
          }}>
            <KeyboardArrowDown sx={{ fontSize: 40, color: theme.palette.text.secondary }} />
          </Box>
        </Container>
      </Box>

      {/* Reverse Aging Challenge Section */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 1.5,
              }}
            >
              The Reverse Aging Challenge
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
              Transform your health and vitality through our comprehensive programs designed to help you build sustainable habits supported by evidence‑based, nature‑powered practices and a global community. Choose from our 7-week online course or 7-day in-person reset experience.
            </Typography>
          </Box>

          {/* Course Preview Video */}
          <Box sx={{ mb: 4 }}>
            <Card sx={{ 
              overflow: 'hidden', 
              borderRadius: 3, 
              boxShadow: `0 10px 30px rgba(0,0,0,0.2)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 15px 40px rgba(0,0,0,0.3)`,
                transform: 'translateY(-2px)',
              }
            }}>
              <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe
                  src="https://www.youtube.com/embed/GvQCmyzAhMM"
                  title="The Reverse Aging Challenge Preview"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
            </Card>
          </Box>

          {/* Program Options */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: theme.palette.text.primary, textAlign: 'center' }}>
              Choose Your Path
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              <ProgramCard
                title="The 7-Week Reverse Aging Challenge"
                description="Our flagship online course is a guided, 7-week experience that teaches you how to integrate the seven core pillars of the Academy: breath, movement, cold, heat, nourish, mindset, and community."
                features={[
                  {
                    icon: <Science />,
                    text: "<strong>Science you can use:</strong> Weekly modules break down the research in plain language."
                  },
                  {
                    icon: <Build />,
                    text: "<strong>Step‑by‑step practices:</strong> Small daily actions stack into lasting change."
                  },
                  {
                    icon: <Public />,
                    text: "<strong>Flexible & accessible:</strong> Join from anywhere, on your own schedule, with lifetime access."
                  }
                ]}
                buttonText="Enroll in Online Course"
                icon={<School />}
                iconColor="primary"
                courseId="hTLj9Lx1MAkBks0INzxS"
              />

              <ProgramCard
                title="The 7-Day Reverse Aging Reset"
                subtitle="Next retreat: October 25-31, 2024"
                description="For those ready to go all in, our 7‑day retreat in the Málaga countryside is an immersive reset."
                features={[
                  {
                    icon: <FitnessCenter />,
                    text: "<strong>Breathwork, cold, and heat exposure</strong> every day, guided by certified instructors"
                  },
                  {
                    icon: <Psychology />,
                    text: "<strong>Movement and mindset training</strong> designed to rewire how your body responds to stress"
                  },
                  {
                    icon: <Restaurant />,
                    text: "<strong>Chef‑prepared, metabolically aligned meals</strong> to fuel the transformation"
                  },
                  {
                    icon: <Group />,
                    text: "<strong>A small, supportive group</strong> creating breakthroughs that last long after you leave"
                  }
                ]}
                buttonText="Apply for In-Person Reset"
                buttonVariant="outlined"
                icon={<Spa />}
                iconColor="secondary"
                externalUrl="https://7weekreverseagingchallenge.com"
              />
            </Box>
          </Box>

          <TransformationJourney />


        </Container>
      </Box>

      <Testimonials />

      <FAQ />





      {/* Final CTA - Moved to bottom */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
              Ready to Start Your Transformation?
            </Typography>
            <Typography variant="h6" sx={{ mb: 5, maxWidth: 600, mx: 'auto', color: theme.palette.text.secondary, lineHeight: 1.6 }}>
              Join a global community of people who are already transforming their lives through our evidence-based approach to health and wellness.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                trackEvent.ctaClick('start_journey_footer', '/');
                navigate('/programs');
              }}
              sx={{
                px: 6,
                py: 2.5,
                fontWeight: 600,
                fontSize: '1.2rem',
                backgroundColor: theme.palette.primary.main,
                color: '#000',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)',
                boxShadow: `0 4px 14px ${theme.palette.primary.main}40`,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${theme.palette.primary.main}60`,
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: `0 4px 14px ${theme.palette.primary.main}40`,
                },
              }}
            >
              Start Your Journey
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 