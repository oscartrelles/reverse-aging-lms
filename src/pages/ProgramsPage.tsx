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
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import ProgramCard from '../components/ProgramCard';

const ProgramsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showAuthModal } = useAuthModal();

  const handleJoinAcademy = () => {
    if (currentUser) {
      // User is already signed in, show success message
      return;
    }
    // Show auth modal with the same message as landing page
    showAuthModal('signup', 'Create Your Account', 'Get free access to our evolving library of healthspan science, plus weekly digests on the latest research.');
  };

  const handleApplyRetreat = () => {
    // Always open the retreat page in a new tab
    window.open('https://7weekreverseagingchallenge.com', '_blank');
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
            From science to practice, choose your path to better healthspan
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
              The Reverse Aging Academy is here to do more than share research, we're here to help you live it.
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              Every program we create takes cutting‑edge science and turns it into habits you can sustain, so you're not just adding years to your life, you're adding life to your years.
            </Typography>
          </CardContent>
        </Card>

        {/* Programs Grid */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 6 }}>
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
            additionalText="👉 This is your blueprint for building habits that reverse the damage of modern life and help you feel stronger, sharper, and more resilient at any age."
          />

          <ProgramCard
            title="The 7-Day Reverse Aging Reset"
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
                  onClick={handleApplyRetreat}
            additionalText="👉 This isn't a 'wellness escape.' It's a reset for your nervous system, your habits, and your health."
          />
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
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 2, textAlign: 'center' }}>
              Which Path Is Right for You?
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center', mb: 3, color: theme.palette.text.secondary, maxWidth: 600, mx: 'auto' }}>
              Whether you're just getting started or ready for a full transformation, you're in the right place. Choose your entry point:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: { xs: 1, md: '0 0 calc(33.333% - 16px)' } }}>
                <Box sx={{ textAlign: 'center', p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CheckCircle sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1.5 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Start here
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary, flex: 1 }}>
                    <strong>Create a free Academy account</strong> to access our evolving library of healthspan and longevity research.
                    Get digestible updates on new studies, explore evidence-based practices, and connect with a like-minded community at your own pace.
                  </Typography>
                  <Button
                    variant="text"
                    onClick={handleJoinAcademy}
                    endIcon={currentUser ? undefined : <ArrowForward />}
                    disabled={currentUser ? true : false}
                    sx={{ 
                      fontWeight: 600,
                      color: currentUser ? theme.palette.primary.main : undefined,
                      cursor: currentUser ? 'default' : 'pointer',
                      width: '100%',
                      justifyContent: 'center',
                      mt: 'auto'
                    }}
                  >
                    {currentUser ? 'You Are In!' : 'Join Free Academy'}
                  </Button>
                </Box>
              </Box>

              <Box sx={{ flex: { xs: 1, md: '0 0 calc(33.333% - 16px)' } }}>
                <Box sx={{ textAlign: 'center', p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CheckCircle sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1.5 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Ready for a system
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary, flex: 1 }}>
                    <strong>Enroll in the 7-Week Reverse Aging Challenge,</strong> our core online course designed to help you build sustainable, science-backed habits.
                    You'll learn how to use breath, cold, heat, fasting, movement, mindset, and more with weekly guidance inside the Academy.
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => {
                      if (currentUser) {
                        navigate('/payment/hTLj9Lx1MAkBks0INzxS');
                      } else {
                        showAuthModal('signup', 'Create Your Account', 'You need a free account to enroll in a course.');
                      }
                    }}
                    endIcon={<ArrowForward />}
                    sx={{ 
                      fontWeight: 600,
                      width: '100%',
                      justifyContent: 'center',
                      mt: 'auto'
                    }}
                  >
                    Enroll in Online Course
                  </Button>
                </Box>
              </Box>

              <Box sx={{ flex: { xs: 1, md: '0 0 calc(33.333% - 16px)' } }}>
                <Box sx={{ textAlign: 'center', p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CheckCircle sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1.5 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Ready for a reset
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary, flex: 1 }}>
                    <strong>Apply for the 7‑Day Reverse Aging Retreat,</strong> an immersive, in‑person experience set in the hills of southern Spain.
                    This is more than a retreat, it's a full systems reset where you'll practice everything you've learned, in community, with expert and dedicated guidance.
                  </Typography>
                  <Button
                    variant="text"
                    onClick={handleApplyRetreat}
                    endIcon={<ArrowForward />}
                    sx={{ 
                      fontWeight: 600,
                      width: '100%',
                      justifyContent: 'center',
                      mt: 'auto'
                    }}
                  >
                    Apply for In-Person Reset
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