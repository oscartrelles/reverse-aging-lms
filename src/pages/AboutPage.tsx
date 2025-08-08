import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { Science, School, Psychology, ArrowForward, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AboutPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser } = useAuth();

  const handleJoinAcademy = () => {
    // Navigate to signup or show auth modal
    window.location.href = '/?signup=true';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      py: { xs: 4, md: 6 }
    }}>
      <Container maxWidth="lg">
        
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            The Reverse Aging Academy
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              lineHeight: 1.6,
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            The Reverse Aging Academy is the online home for the 7-Week Reverse Aging Challenge—and much more.
          </Typography>
        </Box>

        {/* Academy Section */}
        <Paper 
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            p: { xs: 3, md: 5 },
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 3,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
            }}
          >
            About the Academy
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              lineHeight: 1.8,
              color: theme.palette.text.primary,
              fontSize: '1.1rem',
            }}
          >
            Here, we bring together the latest science on healthspan and longevity, turning dense research into practical, easy‑to‑apply insights. Members can:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                backgroundColor: `${theme.palette.primary.main}20`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.5,
              }}>
                <Science sx={{ fontSize: 24, color: theme.palette.primary.main }} />
              </Box>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                  fontSize: '1.1rem',
                }}
              >
                Access weekly research digests on topics like breathwork, fasting, cold exposure, and mindset
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                backgroundColor: `${theme.palette.secondary.main}20`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.5,
              }}>
                <Psychology sx={{ fontSize: 24, color: theme.palette.secondary.main }} />
              </Box>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                  fontSize: '1.1rem',
                }}
              >
                Upvote, share, and discuss findings with a growing community
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                backgroundColor: `${theme.palette.primary.main}20`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.5,
              }}>
                <School sx={{ fontSize: 24, color: theme.palette.primary.main }} />
              </Box>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                  fontSize: '1.1rem',
                }}
              >
                Dive deeper into our flagship course and join our in‑person resets for a full systems‑level health reboot
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              color: theme.palette.text.primary,
              fontSize: '1.1rem',
              fontStyle: 'italic',
              textAlign: 'center',
              p: 3,
              backgroundColor: `${theme.palette.primary.main}10`,
              borderRadius: 2,
              border: `1px solid ${theme.palette.primary.main}30`,
            }}
          >
            The Academy exists to cut through the noise, focus on what's proven to work, and help you build habits that keep you strong, sharp, and resilient for life.
          </Typography>
        </Paper>

        {/* Breathing Flame Section */}
        <Paper 
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            p: { xs: 3, md: 5 },
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 3,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
            }}
          >
            Breathing Flame
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              lineHeight: 1.8,
              color: theme.palette.text.primary,
              fontSize: '1.1rem',
            }}
          >
            The Academy is powered by Breathing Flame, a coaching and facilitation practice dedicated to helping people—and the systems they're part of—break through limitations and thrive.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              color: theme.palette.text.primary,
              fontSize: '1.1rem',
            }}
          >
            Through programs like Unblocked in Ten Weeks, 9D Breathwork Journeys, Business Constellations, and Wim Hof Method workshops, Breathing Flame brings together science, ancient practices, and systemic coaching to unlock transformation that lasts.
          </Typography>
        </Paper>

        {/* Oscar Trelles Section */}
        <Paper 
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            p: { xs: 3, md: 5 },
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: { xs: 'center', md: 'flex-start' } }}>
            {/* Oscar's Picture */}
            <Box sx={{ flexShrink: 0 }}>
              <Box
                component="img"
                src="/oscar-trelles.jpg"
                alt="Oscar Trelles - Systemic Coach and Wim Hof Method Instructor"
                sx={{
                  width: { xs: 200, md: 250 },
                  height: { xs: 200, md: 250 },
                  borderRadius: 3,
                  objectFit: 'cover',
                  border: `3px solid ${theme.palette.primary.main}30`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.2)`,
                }}
                onError={(e) => {
                  // Fallback to avatar if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback Avatar */}
              <Box
                sx={{
                  width: { xs: 200, md: 250 },
                  height: { xs: 200, md: 250 },
                  borderRadius: 3,
                  backgroundColor: `${theme.palette.primary.main}20`,
                  border: `3px solid ${theme.palette.primary.main}30`,
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: { xs: '4rem', md: '5rem' },
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.2)`,
                }}
              >
                OT
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 2,
                  fontSize: { xs: '1.8rem', md: '2.2rem' },
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                Oscar Trelles
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  lineHeight: 1.8,
                  color: theme.palette.text.primary,
                  fontSize: '1.1rem',
                }}
              >
                The driving force behind the Academy is Oscar Trelles—systemic coach, certified Wim Hof Method instructor, and Program Director of the 7-Week Reverse Aging Challenge.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  lineHeight: 1.8,
                  color: theme.palette.text.primary,
                  fontSize: '1.1rem',
                }}
              >
                Originally from Peru, Oscar spent two decades in New York working at the intersection of marketing, technology, and entrepreneurship before relocating to Málaga, Spain. Today, his work blends his background in business, resilience training, and human performance with one goal:
              </Typography>

              <Box sx={{ 
                p: 3, 
                backgroundColor: `${theme.palette.secondary.main}10`,
                borderRadius: 2,
                border: `1px solid ${theme.palette.secondary.main}30`,
                mb: 3,
                textAlign: 'center',
              }}>
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    color: theme.palette.text.primary,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    fontStyle: 'italic',
                  }}
                >
                  "I want you to be so fit and healthy that food and pharma companies can't profit from you."
                </Typography>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  color: theme.palette.text.primary,
                  fontSize: '1.1rem',
                }}
              >
                Oscar leads all Breathing Flame programs and the Reverse Aging Academy, guiding people toward evidence‑based, natural practices to extend not just how long we live—but how well.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Join the Academy CTA Section */}
        <Paper 
          elevation={0}
          sx={{
            backgroundColor: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
            borderRadius: 3,
            p: { xs: 4, md: 6 },
            border: `1px solid ${theme.palette.primary.main}30`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 30% 70%, ${theme.palette.primary.main}10 0%, transparent 50%), radial-gradient(circle at 70% 30%, ${theme.palette.secondary.main}10 0%, transparent 50%)`,
              pointerEvents: 'none',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Ready to Transform Your Health?
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: theme.palette.text.secondary,
                fontWeight: 500,
                lineHeight: 1.6,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Join a global movement reclaiming healthspan through evidence‑based, nature‑powered practices and a supportive community.
            </Typography>

            <Button
              variant={currentUser ? "outlined" : "contained"}
              size="large"
              onClick={currentUser ? undefined : handleJoinAcademy}
              disabled={!!currentUser}
              sx={{
                backgroundColor: currentUser ? 'transparent' : theme.palette.primary.main,
                color: currentUser ? theme.palette.success.main : '#000',
                borderColor: currentUser ? theme.palette.success.main : 'transparent',
                fontWeight: 700,
                fontSize: '1.2rem',
                px: 4,
                py: 2,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: currentUser ? 'none' : `0 8px 32px ${theme.palette.primary.main}40`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: currentUser ? 'transparent' : theme.palette.primary.dark,
                  transform: currentUser ? 'none' : 'translateY(-2px)',
                  boxShadow: currentUser ? 'none' : `0 12px 40px ${theme.palette.primary.main}50`,
                },
                '&:active': {
                  transform: currentUser ? 'none' : 'translateY(0)',
                }
              }}
              endIcon={currentUser ? <CheckCircle /> : <ArrowForward />}
            >
              {currentUser ? 'You Are In!' : 'Join the Academy'}
            </Button>

            <Typography
              variant="body2"
              sx={{
                mt: 3,
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              Free account • No credit card required • Start your journey today
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutPage; 