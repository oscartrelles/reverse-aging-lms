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
} from '@mui/material';
import { Google, Facebook, ChevronLeft, ChevronRight, Science } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import { handleRedirectResult } from '../firebaseConfig';
import { useSearchParams } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { showAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Scientific Updates Preview
  const [recentUpdate, setRecentUpdate] = useState<any>(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams] = useSearchParams();

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
        // Import the service dynamically to avoid issues with authentication
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
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: 'calc(100vh - 140px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 4,
            alignItems: 'flex-start',
          }}
        >
          {/* Hero Section */}
          <Box sx={{ flex: { xs: 1, md: 3 }, textAlign: isMobile ? 'center' : 'left' }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 2,
              }}
            >
              The Reverse Aging Challenge
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              paragraph
              sx={{ mb: 3 }}
            >
              Transform your health and vitality through our comprehensive 7-week program
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              Join thousands of students who have already transformed their lives through 
              our evidence-based approach to health and wellness. Plus, get access to cutting-edge 
              scientific research on healthspan and longevity with a free account.
            </Typography>

            {/* Call to Action */}
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => showAuthModal('signup', 'Create Your Account', 'Join our community and start your health transformation journey.')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Start Your Journey
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => showAuthModal('signup', 'Create Your Account', 'Join our community and start your health transformation journey.')}
                startIcon={<Science />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Get Free Evidence Access
              </Button>
            </Box>
            
            {/* Course Preview Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" component="h3" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                See What You'll Learn
              </Typography>
              
              {/* YouTube Video Embed */}
              <Card sx={{ mb: 3, overflow: 'hidden' }}>
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
              
              {/* Course Overview */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
                  7-Week Transformation Journey
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ 
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.5
                    }}>
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', fontSize: '1rem' }}>
                        ✓
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                        Week 1: Foundation & Mindset
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        Build your transformation foundation with proven mindset techniques, goal setting strategies, and understanding the science behind reverse aging. Learn how to create sustainable habits that will last a lifetime.
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ 
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.5
                    }}>
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', fontSize: '1rem' }}>
                        ✓
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                        Weeks 2-7: Master Your Health
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        Dive deep into nutrition optimization, movement patterns, advanced breathwork techniques, and cold exposure protocols. Discover how these practices work together to activate your body's natural anti-aging mechanisms and boost cellular regeneration.
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ 
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.5
                    }}>
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', fontSize: '1rem' }}>
                        ✓
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                        Daily Practices & Integration
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        Develop a comprehensive daily routine including meditation, journaling, movement, and breathwork. Learn how to integrate these practices seamlessly into your lifestyle for lasting transformation and optimal health outcomes.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right Column - Auth & Pricing */}
          <Box sx={{ flex: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Scientific Updates Preview */}
            <Card sx={{ 
              width: '100%', 
              minWidth: 350, 
              maxWidth: 400,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(66, 165, 245, 0.05) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.2)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Science sx={{ fontSize: 28, color: 'primary.main' }} />
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Latest Scientific Evidence
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Get access to cutting-edge research on healthspan and longevity. Stay ahead with weekly scientific updates.
                </Typography>

                {loadingUpdate ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : recentUpdate ? (
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(255,255,255,0.5)', 
                    borderRadius: 2,
                    border: '1px solid rgba(25, 118, 210, 0.1)'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                      {recentUpdate.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                      {recentUpdate.summary.length > 120 
                        ? `${recentUpdate.summary.substring(0, 120)}...` 
                        : recentUpdate.summary
                      }
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ 
                        px: 1.5, 
                        py: 0.5, 
                        backgroundColor: 'primary.main', 
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                          {recentUpdate.category}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(recentUpdate.publishedDate.toDate()).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {recentUpdate.readCount || 0} reads
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {recentUpdate.votes || 0} votes
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(255,255,255,0.5)', 
                    borderRadius: 2,
                    border: '1px solid rgba(25, 118, 210, 0.1)',
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Weekly scientific updates coming soon...
                    </Typography>
                  </Box>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  <strong>Free accounts</strong> get access to all scientific evidence
                </Typography>
              </CardContent>
            </Card>

            {/* Call to Action Card */}
            <Card sx={{ 
              width: '100%', 
              minWidth: 350, 
              maxWidth: 400,
              background: 'linear-gradient(135deg, rgba(80, 235, 151, 0.1) 0%, rgba(172, 255, 34, 0.05) 100%)',
              border: '2px solid rgba(80, 235, 151, 0.3)'
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Ready to Transform Your Health?
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                  Join thousands of students who have already started their health transformation journey. Get access to our comprehensive course and cutting-edge scientific evidence.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => showAuthModal('signup', 'Create Your Account', 'Join our community and start your health transformation journey.')}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1.1rem',
                    }}
                  >
                    Start Your Journey
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => showAuthModal('signin', 'Welcome Back', 'Sign in to access your personalized health dashboard.')}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1.1rem',
                    }}
                  >
                    Sign In
                  </Button>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Free accounts</strong> get access to:
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Typography variant="caption" sx={{ color: '#000', fontWeight: 'bold', fontSize: '0.7rem' }}>
                        ✓
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Weekly scientific updates
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Typography variant="caption" sx={{ color: '#000', fontWeight: 'bold', fontSize: '0.7rem' }}>
                        ✓
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Community access
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Typography variant="caption" sx={{ color: '#000', fontWeight: 'bold', fontSize: '0.7rem' }}>
                        ✓
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Health resources library
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

          {/* Pricing Card */}
          <Card sx={{ minWidth: 350, maxWidth: 400, width: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom align="center" color="primary.main">
                Investment
              </Typography>
              
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                {/* Special Offer */}
                <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.5)', borderRadius: 2, border: '2px solid', borderColor: 'success.main' }}>
                  <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, mb: 1 }}>
                    🎉 Special Launch Offer
                  </Typography>
                  <Typography variant="h3" color="text.primary" sx={{ fontWeight: 700, mb: 1 }}>
                    €299
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                    Enroll before September 30th
                  </Typography>
                </Box>
                
                {/* Regular Price */}
                <Box sx={{ opacity: 0.7 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    Regular Price: €499
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  What's Included:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', fontSize: '0.75rem' }}>
                        ✓
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      7 weeks of comprehensive content
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', fontSize: '0.75rem' }}>
                        ✓
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Daily practices & guided sessions
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', fontSize: '0.75rem' }}>
                        ✓
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Community support & Q&A
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', fontSize: '0.75rem' }}>
                        ✓
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Lifetime access to materials
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
          </Box>
        </Box>
      </Box>

      {/* Testimonial Carousel */}
      <Box sx={{ py: 6, mt: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 4, color: 'primary.main', fontWeight: 600 }}>
            What Our Students Say
          </Typography>
          
          <Card sx={{ 
            maxWidth: 800, 
            mx: 'auto', 
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(80, 235, 151, 0.1) 0%, rgba(172, 255, 34, 0.05) 100%)',
            border: '1px solid rgba(80, 235, 151, 0.2)'
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
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
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
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
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
                    color: 'text.primary',
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
                    color: 'primary.main',
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
                      backgroundColor: index === currentTestimonial ? 'primary.main' : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: index === currentTestimonial ? 'primary.main' : 'rgba(255,255,255,0.5)',
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>


    </Container>
  );
};

export default LandingPage; 