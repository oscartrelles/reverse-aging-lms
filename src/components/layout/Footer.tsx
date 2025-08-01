import React from 'react';
import {
  Box,
  Typography,
  Container,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Instagram,
  LinkedIn,
  Facebook,
  WhatsApp,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/reverse.aging.challenge',
      color: '#E4405F'
    },
    {
      name: 'LinkedIn',
      icon: LinkedIn,
      url: 'https://www.linkedin.com/company/breathingflame',
      color: '#0077B5'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://www.facebook.com/breathingflame',
      color: '#1877F2'
    },
    {
      name: 'WhatsApp',
      icon: WhatsApp,
      url: 'https://wa.me/34611006408',
      color: '#25D366'
    }
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Box sx={{ py: 4 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: 3
          }}>
            {/* Brand Section */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1
                }}
              >
                The Reverse Aging Challenge
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                Transform your health and vitality through our comprehensive 7-week program designed for people over 40.
              </Typography>
            </Box>

            {/* Social Links */}
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                Follow Our Journey
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', md: 'flex-end' } }}>
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <IconButton
                      key={social.name}
                      component="a"
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'text.secondary',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: social.color,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <IconComponent />
                    </IconButton>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Divider */}
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Bottom Section */}
        <Box sx={{
          py: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} <Typography
              component="a"
              href="https://breathingflame.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Breathing Flame
            </Typography>. All rights reserved.
          </Typography>

          <Box sx={{
            display: 'flex',
            gap: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center'
          }}>
            <Typography
              variant="body2"
              component="a"
              href="/privacy"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Privacy Policy
            </Typography>
            <Typography
              variant="body2"
              component="a"
              href="/terms"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Terms of Service
            </Typography>
            <Typography
              variant="body2"
              component="a"
              href="/contact"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Contact
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 