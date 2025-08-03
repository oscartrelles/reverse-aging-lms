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
} from '@mui/material';
import { Science, PlayArrow } from '@mui/icons-material';
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
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
            {/* Mission Statement */}
            <Box sx={{ flex: { xs: 1, md: 7 } }}>
                             <Typography
                 variant="h2"
                 component="h1"
                 gutterBottom
                 sx={{
                   fontWeight: 700,
                   mb: 3,
                   fontSize: { xs: '2rem', md: '2.8rem' },
                   lineHeight: 1.2,
                 }}
               >
                 Take Control of Your Health
               </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: 1.6,
                  fontWeight: 400,
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
                  backgroundColor: '#50EB97',
                  color: '#000',
                  '&:hover': {
                    backgroundColor: '#45d88a',
                  },
                }}
              >
                Create Free Account
              </Button>
            </Box>

            {/* Latest Scientific Evidence Box */}
            <Box sx={{ flex: { xs: 1, md: 5 } }}>
              <Card sx={{ 
                background: 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 4,
                boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  pointerEvents: 'none',
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(80, 235, 151, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid rgba(80, 235, 151, 0.2)'
                    }}>
                      <Science sx={{ fontSize: 24, color: '#50EB97' }} />
                    </Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      Latest Scientific Evidence
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 4, color: 'rgba(26, 26, 26, 0.8)', lineHeight: 1.6 }}>
                    Get access to cutting-edge research on healthspan and longevity. Stay ahead with weekly scientific updates.
                  </Typography>

                  {loadingUpdate ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                                     ) : recentUpdate ? (
                     <Box sx={{ 
                       p: 2, 
                       backgroundColor: 'rgba(80, 235, 151, 0.08)', 
                       borderRadius: 3,
                       border: '1px solid rgba(80, 235, 151, 0.15)',
                       boxShadow: '0 4px 12px rgba(80, 235, 151, 0.1)',
                       position: 'relative',
                       '&::before': {
                         content: '""',
                         position: 'absolute',
                         top: 0,
                         left: 0,
                         right: 0,
                         bottom: 0,
                         background: 'linear-gradient(135deg, rgba(80, 235, 151, 0.05) 0%, rgba(80, 235, 151, 0.02) 100%)',
                         borderRadius: 3,
                         pointerEvents: 'none',
                       }
                     }}>
                       <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#1a1a1a', fontSize: '1rem' }}>
                         {recentUpdate.title}
                       </Typography>
                       <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.5, color: 'rgba(26, 26, 26, 0.85)', fontWeight: 500 }}>
                         {recentUpdate.summary.length > 120 
                           ? `${recentUpdate.summary.substring(0, 120)}...` 
                           : recentUpdate.summary
                         }
                       </Typography>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          px: 2, 
                          py: 0.75, 
                          backgroundColor: '#50EB97', 
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          boxShadow: '0 2px 8px rgba(80, 235, 151, 0.3)'
                        }}>
                          <Typography variant="caption" sx={{ color: '#000', fontWeight: 700, fontSize: '0.75rem' }}>
                            {recentUpdate.category}
                          </Typography>
                                                 </Box>
                         <Typography variant="caption" sx={{ color: 'rgba(26, 26, 26, 0.75)', fontWeight: 500 }}>
                           {new Date(recentUpdate.publishedDate.toDate()).toLocaleDateString()}
                         </Typography>
                       </Box>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(80, 235, 151, 0.1)', 
                      borderRadius: 2,
                      border: '1px solid rgba(80, 235, 151, 0.2)',
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Weekly scientific updates coming soon...
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'rgba(26, 26, 26, 0.7)', fontWeight: 500 }}>
                    <strong style={{ color: '#50EB97' }}>Free accounts</strong> get access to all scientific evidence
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Reverse Aging Challenge Section */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: '#1a1a1a',
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
            <Card sx={{ overflow: 'hidden', borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
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
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1a1a1a', textAlign: 'center' }}>
              7-Week Transformation Journey
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              <Box sx={{ flex: { xs: 1, md: 4 } }}>
                <Card sx={{ height: '100%', p: 3, textAlign: 'center', borderRadius: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    backgroundColor: '#50EB97', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold' }}>
                      1
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                    Foundation & Mindset
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Build your transformation foundation with proven mindset techniques, goal setting strategies, and understanding the science behind reverse aging.
                  </Typography>
                </Card>
              </Box>
              <Box sx={{ flex: { xs: 1, md: 4 } }}>
                <Card sx={{ height: '100%', p: 3, textAlign: 'center', borderRadius: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    backgroundColor: '#50EB97', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold' }}>
                      2-7
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                    Master Your Health
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Dive deep into nutrition optimization, movement patterns, advanced breathwork techniques, and cold exposure protocols.
                  </Typography>
                </Card>
              </Box>
              <Box sx={{ flex: { xs: 1, md: 4 } }}>
                <Card sx={{ height: '100%', p: 3, textAlign: 'center', borderRadius: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    backgroundColor: '#50EB97', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold' }}>
                      ∞
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                    Daily Practices
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Develop a comprehensive daily routine including meditation, journaling, movement, and breathwork for lasting transformation.
                  </Typography>
                </Card>
              </Box>
            </Box>
          </Box>

          {/* Final CTA */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#1a1a1a' }}>
              Ready to Start Your Transformation?
            </Typography>
            <Typography variant="h6" sx={{ mb: 1, maxWidth: 600, mx: 'auto', color: 'rgba(26, 26, 26, 0.8)' }}>
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
                backgroundColor: '#50EB97',
                color: '#000',
                '&:hover': {
                  backgroundColor: '#45d88a',
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