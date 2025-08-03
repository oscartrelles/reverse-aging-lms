import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  School,
  Spa,
  Science,
  Build,
  Public,
  CheckCircle,
  ArrowForward,
  TrendingUp,
  Group,
  Restaurant,
  Psychology,
  FitnessCenter,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProgramsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleJoinAcademy = () => {
    // Navigate to signup or show auth modal
    navigate('/');
  };

  const handleEnrollCourse = () => {
    // Open the auth modal to sign up/enroll
    // This will be handled by the auth modal context
    navigate('/');
  };

  const handleApplyRetreat = () => {
    // Navigate to the retreat application page
    window.open('https://7weekreverseagingchallenge.com/#apply', '_blank');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      py: { xs: 3, md: 4 }
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Our Programs
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            From science to practice — choose your path to better healthspan
          </Typography>
        </Box>

        {/* Why We Exist Section */}
        <Card
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            p: { xs: 3, md: 4 },
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
            mb: 6,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <TrendingUp sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                              <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  Why We Exist
                </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.7 }}>
              The Reverse Aging Academy is here to do more than share research — we're here to help you live it.
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              Every program we create takes cutting‑edge science and turns it into habits you can sustain, so you're not just adding years to your life — you're adding life to your years.
            </Typography>
          </CardContent>
        </Card>

        {/* Programs Grid */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 6 }}>
          {/* Online Course */}
          <Box sx={{ flex: { xs: 1, md: '0 0 calc(50% - 16px)' } }}>
            <Card
              elevation={0}
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 3,
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 40px rgba(0,0,0,0.15)`,
                }
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <School sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                  <Typography variant="h4" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    The 7‑Week Reverse Aging Challenge
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ mb: 3, color: theme.palette.text.secondary, fontWeight: 600 }}>
                  Our flagship online course is a guided, 7‑week experience that teaches you how to integrate the seven core pillars of the Academy: breath, movement, cold, heat, nourish, mindset, and community.
                </Typography>

                <Box sx={{ mb: 4, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Science sx={{ color: theme.palette.primary.main, mt: 0.5 }} />
                    <Typography variant="body1">
                      <strong>Science you can use:</strong> Weekly modules break down the research in plain language.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Build sx={{ color: theme.palette.primary.main, mt: 0.5 }} />
                    <Typography variant="body1">
                      <strong>Step‑by‑step practices:</strong> Small daily actions stack into lasting change.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Public sx={{ color: theme.palette.primary.main, mt: 0.5 }} />
                    <Typography variant="body1">
                      <strong>Flexible & accessible:</strong> Join from anywhere, on your own schedule, with lifetime access.
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 4, fontStyle: 'italic', color: theme.palette.text.secondary }}>
                  👉 This is your blueprint for building habits that reverse the damage of modern life — and help you feel stronger, sharper, and more resilient at any age.
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleEnrollCourse}
                  endIcon={<ArrowForward />}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: '#000',
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }}
                >
                  Enroll in Course
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* In-Person Retreat */}
          <Box sx={{ flex: { xs: 1, md: '0 0 calc(50% - 16px)' } }}>
            <Card
              elevation={0}
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 3,
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 40px rgba(0,0,0,0.15)`,
                }
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Spa sx={{ fontSize: 32, color: theme.palette.secondary.main }} />
                  <Typography variant="h4" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    The 7‑Day Reverse Aging Reset
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ mb: 3, color: theme.palette.text.secondary, fontWeight: 600 }}>
                  For those ready to go all in, our 7‑day retreat in the Málaga countryside is an immersive reset.
                </Typography>

                <Box sx={{ mb: 4, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <FitnessCenter sx={{ color: theme.palette.secondary.main, mt: 0.5 }} />
                    <Typography variant="body1">
                      <strong>Breathwork, cold, and heat exposure</strong> every day — guided by certified instructors
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Psychology sx={{ color: theme.palette.secondary.main, mt: 0.5 }} />
                    <Typography variant="body1">
                      <strong>Movement and mindset training</strong> designed to rewire how your body responds to stress
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Restaurant sx={{ color: theme.palette.secondary.main, mt: 0.5 }} />
                    <Typography variant="body1">
                      <strong>Chef‑prepared, metabolically aligned meals</strong> to fuel the transformation
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Group sx={{ color: theme.palette.secondary.main, mt: 0.5 }} />
                    <Typography variant="body1">
                      <strong>A small, supportive group</strong> — creating breakthroughs that last long after you leave
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 4, fontStyle: 'italic', color: theme.palette.text.secondary }}>
                  👉 This isn't a "wellness escape." It's a reset — for your nervous system, your habits, and your health.
                </Typography>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleApplyRetreat}
                  endIcon={<ArrowForward />}
                  sx={{
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': {
                      borderColor: theme.palette.secondary.dark,
                      backgroundColor: `${theme.palette.secondary.main}10`,
                    }
                  }}
                >
                  Apply for Retreat
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Which Path Section */}
        <Card
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            p: { xs: 3, md: 4 },
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
          }}
        >
          <CardContent>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 4, textAlign: 'center' }}>
              Which Path Is Right for You?
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: { xs: 1, md: '0 0 calc(33.333% - 16px)' } }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <CheckCircle sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Start here
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                    Join the free Academy for weekly science updates and community access.
                  </Typography>
                  <Button
                    variant="text"
                    onClick={handleJoinAcademy}
                    endIcon={<ArrowForward />}
                    sx={{ fontWeight: 600 }}
                  >
                    Join Free Academy
                  </Button>
                </Box>
              </Box>

              <Box sx={{ flex: { xs: 1, md: '0 0 calc(33.333% - 16px)' } }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <CheckCircle sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Ready for a system
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                    Enroll in the 7‑Week Reverse Aging Challenge.
                  </Typography>
                  <Button
                    variant="text"
                    onClick={handleEnrollCourse}
                    endIcon={<ArrowForward />}
                    sx={{ fontWeight: 600 }}
                  >
                    Enroll in Course
                  </Button>
                </Box>
              </Box>

              <Box sx={{ flex: { xs: 1, md: '0 0 calc(33.333% - 16px)' } }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <CheckCircle sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Ready for a reset
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                    Apply for the 7‑Day Retreat and experience the full transformation.
                  </Typography>
                  <Button
                    variant="text"
                    onClick={handleApplyRetreat}
                    endIcon={<ArrowForward />}
                    sx={{ fontWeight: 600 }}
                  >
                    Apply for Retreat
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ProgramsPage; 