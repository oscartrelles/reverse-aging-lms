import React, { useState, useEffect } from 'react';
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
  useMediaQuery,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { 
  Science, 
  PlayArrow, 
  ChevronLeft, 
  ChevronRight, 
  ExpandMore,
  KeyboardArrowDown,
  School
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useSearchParams } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { showAuthModal } = useAuthModal();
  const navigate = useNavigate();
  
  // Scientific Updates Preview
  const [recentUpdate, setRecentUpdate] = useState<any>(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Testimonial carousel state
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams] = useSearchParams();

  // Testimonials data
  const testimonials = [
    {
      text: "Oscar has a calm confidence and genuine passion for what he teaches. His guidance was clear and supportive, making the experience accessible even for beginners. I left feeling invigorated and with tools I can use every day.",
      author: "Pablo L."
    },
    {
      text: "Since the first moment I met Oscar, I knew I had met someone special. He transmits a positive energy that makes you feel safe and confident to explore new practices. Thank you for such a transformative experience.",
      author: "Spencer F."
    },
    {
      text: "Oscar is a fantastic instructor who creates memorable and engaging experiences. His ability to explain concepts and hold space is truly special.",
      author: "Abbie G."
    },
    {
      text: "What I valued most was how Oscar helped me unlock internal blocks that were holding me back. As a result, I'm able to live out my potential more fully and confidently.",
      author: "Viyan N."
    },
    {
      text: "Oscar has a way of guiding you to celebrate your journey and recognize the abundance in your life. His approach is compassionate, non-judgmental, and deeply grounding.",
      author: "Lucy Y."
    },
    {
      text: "Working with Oscar has been transformative. He helped me gain clarity, define my vision, and most importantly, believe in myself and my capabilities.",
      author: "Adina D."
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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

  // Load a recent scientific update for preview
  useEffect(() => {
    const loadRecentUpdate = async () => {
      setLoadingUpdate(true);
      try {
        const { scientificUpdateService } = await import('../services/scientificUpdateService');
        const updates = await scientificUpdateService.getAllUpdates({ limit: 1 });
        if (updates.length > 0) {
          setRecentUpdate(updates[0]);
        }
      } catch (error) {
        console.error('Error loading recent scientific update:', error);
      } finally {
        setLoadingUpdate(false);
      }
    };

    loadRecentUpdate();
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && currentUser) {
      console.log('LandingPage: User is authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [currentUser, authLoading, navigate]);

  return (
    <Box sx={{ minHeight: '100vh' }}>
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
                onClick={() => showAuthModal('signup', 'Create Your Account', 'Create a free account to access weekly evidence reports on healthspan and other exclusive content.')}
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
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      backgroundColor: `${theme.palette.primary.main}20`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: `1px solid ${theme.palette.primary.main}30`
                    }}>
                      <Science sx={{ fontSize: 24, color: theme.palette.primary.main }} />
                    </Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                      Latest Scientific Evidence
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 4, color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                    Get access to cutting-edge research on healthspan and longevity. Stay ahead with weekly scientific updates.
                  </Typography>

                  {loadingUpdate ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : recentUpdate ? (
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: `${theme.palette.primary.main}15`, 
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.primary.main}30`,
                      boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
                      position: 'relative',
                      transition: 'all 0.3s ease',
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
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.text.primary, fontSize: '1rem' }}>
                        {recentUpdate.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.5, color: theme.palette.text.secondary, fontWeight: 500 }}>
                        {recentUpdate.summary.length > 120 
                          ? `${recentUpdate.summary.substring(0, 120)}...` 
                          : recentUpdate.summary
                        }
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ 
                          px: 2, 
                          py: 0.75, 
                          backgroundColor: theme.palette.primary.main, 
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          alignSelf: 'flex-start',
                          boxShadow: `0 2px 8px ${theme.palette.primary.main}40`
                        }}>
                          <Typography variant="caption" sx={{ color: '#000', fontWeight: 700, fontSize: '0.75rem' }}>
                            {recentUpdate.category}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                          Published: {new Date(recentUpdate.publishedDate.toDate()).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: `${theme.palette.primary.main}20`, 
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.primary.main}30`,
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Weekly scientific updates coming soon...
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: theme.palette.text.secondary, fontWeight: 500 }}>
                    <strong style={{ color: theme.palette.primary.main }}>Free accounts</strong> get access to all scientific evidence
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
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: theme.palette.background.paper }}>
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
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 800, mx: 'auto', mb: 3 }}
            >
              Transform your health and vitality through our comprehensive 7-week program
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

          {/* Course Overview */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary, textAlign: 'center' }}>
              7-Week Transformation Journey
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              <Box sx={{ flex: { xs: 1, md: 4 } }}>
                <Card sx={{ 
                  height: '100%', 
                  p: 3, 
                  textAlign: 'center', 
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.default,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px rgba(0,0,0,0.3)`,
                  }
                }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.primary.main, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
                    }
                  }}>
                    <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold' }}>
                      1
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                    Foundation & Mindset
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                    Build your transformation foundation with proven mindset techniques, goal setting strategies, and understanding the science behind reverse aging.
                  </Typography>
                </Card>
              </Box>
              <Box sx={{ flex: { xs: 1, md: 4 } }}>
                <Card sx={{ 
                  height: '100%', 
                  p: 3, 
                  textAlign: 'center', 
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.default,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px rgba(0,0,0,0.3)`,
                  }
                }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.primary.main, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
                    }
                  }}>
                    <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold' }}>
                      2-7
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                    Master Your Health
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                    Dive deep into nutrition optimization, movement patterns, advanced breathwork techniques, and cold exposure protocols.
                  </Typography>
                </Card>
              </Box>
              <Box sx={{ flex: { xs: 1, md: 4 } }}>
                <Card sx={{ 
                  height: '100%', 
                  p: 3, 
                  textAlign: 'center', 
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.default,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px rgba(0,0,0,0.3)`,
                  }
                }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.primary.main, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
                    }
                  }}>
                    <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold' }}>
                      ∞
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                    Daily Practices
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                    Develop a comprehensive daily routine including meditation, journaling, movement, and breathwork for lasting transformation.
                  </Typography>
                </Card>
              </Box>
            </Box>
          </Box>

          {/* Final CTA */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
              Ready to Start Your Transformation?
            </Typography>
            <Typography variant="h6" sx={{ mb: 1, maxWidth: 600, mx: 'auto', color: theme.palette.text.secondary }}>
              Join thousands of students who have already transformed their lives through our evidence-based approach to health and wellness.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => showAuthModal('signup', 'Create Your Account', 'Create a free account to access weekly evidence reports on healthspan and other exclusive content.')}
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

      {/* FAQ Section */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ mb: 4, color: theme.palette.text.primary, fontWeight: 600 }}>
            Frequently Asked Questions
          </Typography>
          
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Accordion sx={{ mb: 2, borderRadius: 2, backgroundColor: theme.palette.background.paper, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  What if I'm not satisfied with the program?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.6, color: theme.palette.text.secondary }}>
                  We offer a 30-day money-back guarantee. If you're not completely satisfied with the program within the first 30 days, we'll refund your full investment, no questions asked.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2, borderRadius: 2, backgroundColor: theme.palette.background.paper, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  How much time do I need to commit each day?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.6, color: theme.palette.text.secondary }}>
                  The program is designed to be flexible. You can start with just 15-20 minutes per day and gradually build up to 30-45 minutes as you progress through the program.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2, borderRadius: 2, backgroundColor: theme.palette.background.paper, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Is this program suitable for beginners?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.6, color: theme.palette.text.secondary }}>
                  Absolutely! The program is designed to meet you where you are. Whether you're a complete beginner or have some experience with wellness practices, our step-by-step approach ensures everyone can participate and benefit.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2, borderRadius: 2, backgroundColor: theme.palette.background.paper, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  What equipment do I need?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.6, color: theme.palette.text.secondary }}>
                  The program requires minimal equipment. You'll need comfortable clothing for movement, a quiet space for meditation, and access to cold water for cold exposure practices. We'll provide detailed guidance on any additional items.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 1.5,
              }}
            >
              What Our Students Say
            </Typography>
            <Typography
              variant="h6"
              sx={{ maxWidth: 600, mx: 'auto', color: theme.palette.text.secondary }}
            >
              Join thousands of students who have transformed their lives through our evidence-based approach
            </Typography>
          </Box>
          
          <Card sx={{ 
            maxWidth: 800, 
            mx: 'auto', 
            position: 'relative',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}10 100%)`,
            border: `1px solid ${theme.palette.primary.main}30`,
            borderRadius: 4,
            boxShadow: `0 10px 30px rgba(0,0,0,0.3)`,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: `0 15px 40px rgba(0,0,0,0.4)`,
            }
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
              {/* Navigation Buttons */}
              <IconButton
                onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: `${theme.palette.background.paper}E6`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  color: theme.palette.primary.main,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.background.paper,
                    transform: 'translateY(-50%) scale(1.1)',
                    boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                  },
                  zIndex: 2,
                }}
              >
                <ChevronLeft />
              </IconButton>
              
              <IconButton
                onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: `${theme.palette.background.paper}E6`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  color: theme.palette.primary.main,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.background.paper,
                    transform: 'translateY(-50%) scale(1.1)',
                    boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                  },
                  zIndex: 2,
                }}
              >
                <ChevronRight />
              </IconButton>

              {/* Testimonial Content */}
              <Box sx={{ px: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3, 
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    color: theme.palette.text.primary,
                    minHeight: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  "{testimonials[currentTestimonial].text}"
                </Typography>
                
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.primary.main,
                    mb: 2
                  }}
                >
                  — {testimonials[currentTestimonial].author}
                </Typography>
              </Box>

              {/* Dots Indicator */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
                {testimonials.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: index === currentTestimonial ? theme.palette.primary.main : `${theme.palette.primary.main}40`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: index === currentTestimonial ? theme.palette.primary.main : `${theme.palette.primary.main}60`,
                        transform: 'scale(1.2)',
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Trust Indicators Section */}
      <Box sx={{ py: { xs: 3, md: 4 }, backgroundColor: theme.palette.background.default, color: theme.palette.text.primary, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3, fontWeight: 500, fontSize: '1.1rem' }}>
              Trusted by thousands of students worldwide
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: { xs: 2, md: 4 },
              flexWrap: 'wrap'
            }}>
              <Box sx={{ 
                px: 4, 
                py: 2, 
                backgroundColor: `${theme.palette.primary.main}20`, 
                borderRadius: 3,
                border: `1px solid ${theme.palette.primary.main}40`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}30`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 20px ${theme.palette.primary.main}30`,
                }
              }}>
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  backgroundColor: theme.palette.primary.main, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: `0 2px 8px ${theme.palette.primary.main}50`
                }}>
                  <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    ✓
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.primary.main, fontSize: '1rem' }}>
                  30-Day Guarantee
                </Typography>
              </Box>
              <Box sx={{ 
                px: 4, 
                py: 2, 
                backgroundColor: `${theme.palette.primary.main}20`, 
                borderRadius: 3,
                border: `1px solid ${theme.palette.primary.main}40`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}30`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 20px ${theme.palette.primary.main}30`,
                }
              }}>
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  backgroundColor: theme.palette.primary.main, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: `0 2px 8px ${theme.palette.primary.main}50`
                }}>
                  <Science sx={{ fontSize: 20, color: '#000' }} />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.primary.main, fontSize: '1rem' }}>
                  Evidence-Based
                </Typography>
              </Box>
              <Box sx={{ 
                px: 4, 
                py: 2, 
                backgroundColor: `${theme.palette.primary.main}20`, 
                borderRadius: 3,
                border: `1px solid ${theme.palette.primary.main}40`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}30`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 20px ${theme.palette.primary.main}30`,
                }
              }}>
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  backgroundColor: theme.palette.primary.main, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: `0 2px 8px ${theme.palette.primary.main}50`
                }}>
                  <School sx={{ fontSize: 20, color: '#000' }} />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.primary.main, fontSize: '1rem' }}>
                  Expert-Led
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 