import React from 'react';
import {
  Box,
  Typography,
  Container,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Instagram,
  LinkedIn,
  Facebook,
  WhatsApp,
  ArrowUpward,
} from '@mui/icons-material';
import { useContactModal } from '../../contexts/ContactModalContext';

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Add error handling for the contact modal hook
  let openContactModal: (() => void) | null = null;
  try {
    const contactModal = useContactModal();
    openContactModal = contactModal.openContactModal;
  } catch (error) {
    console.warn('ContactModal context not available:', error);
    openContactModal = () => {
      // Fallback: open email client
      window.open('mailto:info@breathingflame.com', '_blank');
    };
  }

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/reverse.aging.challenge',
      color: '#E4405F',
      followers: '2.5K'
    },
    {
      name: 'LinkedIn',
      icon: LinkedIn,
      url: 'https://www.linkedin.com/company/breathingflame',
      color: '#0077B5',
      followers: '1.2K'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://www.facebook.com/breathingflame',
      color: '#1877F2',
      followers: '3.8K'
    },
    {
      name: 'WhatsApp',
      icon: WhatsApp,
      url: 'https://chat.whatsapp.com/ENDOITwgM22Js1C3N1iO2T',
      color: '#25D366',
      followers: 'Direct'
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: `${theme.palette.background.paper}E6`,
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto',
        position: 'relative'
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Box sx={{ py: 6 }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
            gap: 4,
            alignItems: 'start'
          }}>
            {/* Brand Section */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                The Reverse Aging Challenge
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, maxWidth: 400 }}>
                Transform your health and vitality through our comprehensive 7-week program and join a global movement reclaiming healthspan through evidence‑based, nature‑powered practices and a supportive community.
              </Typography>
            </Box>

            {/* Quick Links */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { name: 'About Us', href: '/about' },
                  { name: 'Our Programs', href: '/programs' },
                  { name: 'Scientific Evidence', href: '/evidence' },
                ].map((link) => (
                  <Typography
                    key={link.name}
                    variant="body2"
                    component="a"
                    href={link.href}
                    sx={{
                      color: theme.palette.text.secondary,
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        color: theme.palette.primary.main,
                        transform: 'translateX(4px)',
                      }
                    }}
                  >
                    {link.name}
                  </Typography>
                ))}
              </Box>
            </Box>

            {/* Social Links */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
                Join Our Community
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Follow our journey and connect with a global community of health enthusiasts
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
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
                        backgroundColor: `${theme.palette.background.default}80`,
                        border: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.text.secondary,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: `${social.color}20`,
                          color: social.color,
                          transform: 'translateY(-4px) scale(1.1)',
                          boxShadow: `0 8px 20px ${social.color}40`,
                        },
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
        <Divider sx={{ borderColor: theme.palette.divider }} />

        {/* Bottom Section */}
        <Box sx={{
          py: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            © {new Date().getFullYear()} <Typography
              component="a"
              href="https://breathingflame.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: theme.palette.primary.main,
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
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                '&:hover': { 
                  color: theme.palette.primary.main 
                }
              }}
            >
              Privacy Policy
            </Typography>
            <Typography
              variant="body2"
              component="a"
              href="/terms"
              sx={{
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                '&:hover': { 
                  color: theme.palette.primary.main 
                }
              }}
            >
              Terms of Service
            </Typography>
            <Typography
              variant="body2"
              component="button"
              onClick={openContactModal || (() => {})}
              sx={{
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                '&:hover': { 
                  color: theme.palette.primary.main 
                }
              }}
            >
              Contact
            </Typography>
          </Box>

          {/* Back to Top Button */}
          <IconButton
            onClick={scrollToTop}
            sx={{
              backgroundColor: `${theme.palette.primary.main}20`,
              color: theme.palette.primary.main,
              border: `1px solid ${theme.palette.primary.main}30`,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: '#000',
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
              }
            }}
          >
            <ArrowUpward />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 