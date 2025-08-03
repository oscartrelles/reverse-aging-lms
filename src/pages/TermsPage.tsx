import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Email } from '@mui/icons-material';

const TermsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      py: { xs: 4, md: 6 }
    }}>
      <Container maxWidth="md">
        <Paper 
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            p: { xs: 3, md: 5 },
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Terms of Service
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              Effective Date: August 2025
            </Typography>
          </Box>

          {/* Introduction */}
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              lineHeight: 1.7,
              color: theme.palette.text.primary,
              fontSize: '1.1rem',
            }}
          >
            Welcome to the Reverse Aging Academy ("Academy," "we," "our," or "us"), operated by Breathing Flame, based in Málaga, Spain. By creating an account or using our services at academy.7weekreverseagingchallenge.com, you agree to these Terms of Service.
          </Typography>

          {/* Sections */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            
            {/* Section 1 */}
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                }}
              >
                1. Purpose of the Academy
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                The Academy provides educational content on healthspan, longevity, and related practices. It is not medical advice. Content is for informational and educational purposes only and should not replace professional healthcare guidance.
              </Typography>
            </Box>

            {/* Section 2 */}
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                }}
              >
                2. Eligibility
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                You must be at least 18 years old to create an account and use the Academy. By signing up, you confirm you meet this requirement.
              </Typography>
            </Box>

            {/* Section 3 */}
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                }}
              >
                3. Accounts & Responsibilities
              </Typography>
              <Box sx={{ pl: 3, mb: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • You are responsible for keeping your login information secure.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • You agree not to share your account or use the Academy for unlawful or harmful purposes.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • You may request account deletion at any time by contacting{' '}
                  <Typography
                    component="a"
                    href="mailto:info@breathingflame.com"
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    info@breathingflame.com
                  </Typography>
                  .
                </Typography>
              </Box>
            </Box>

            {/* Section 4 */}
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                }}
              >
                4. Free & Paid Features
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                The Academy currently offers free access to research digests and community features. Paid programs, such as the Reverse Aging Challenge online course, may be offered through the site. Prices and offerings are subject to change.
              </Typography>
            </Box>

            {/* Section 5 */}
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                }}
              >
                5. Refund Policy for Online Courses
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                We want you to feel confident about your investment in our programs.
              </Typography>
              <Box sx={{ pl: 3, mb: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • <strong>30‑Day Money Back Guarantee:</strong> If you purchase the Reverse Aging Challenge online course and decide it's not for you, you may request a full refund within 30 days of purchase.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • <strong>How to Request a Refund:</strong> Email{' '}
                  <Typography
                    component="a"
                    href="mailto:info@breathingflame.com"
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    info@breathingflame.com
                  </Typography>
                  {' '}with your purchase details. Refunds will be issued to the original payment method within 10 business days.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • <strong>After 30 Days:</strong> Refunds will no longer be available, but you will retain lifetime access to any course content you've purchased (unless otherwise stated).
                </Typography>
              </Box>
            </Box>

            {/* Section 6 */}
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                }}
              >
                6. Community Guidelines
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                To keep the Academy a safe, respectful space, you agree not to:
              </Typography>
              <Box sx={{ pl: 3, mb: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • Post offensive, harmful, or misleading content
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • Share spam or advertisements
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • Violate intellectual property rights
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                We reserve the right to remove content or suspend accounts that breach these guidelines.
              </Typography>
            </Box>

            {/* Section 7 */}
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                }}
              >
                7. Intellectual Property
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                All Academy content—including research summaries, course materials, and branding—is owned by Breathing Flame and protected by copyright. You may not reproduce or distribute it without permission.
              </Typography>
            </Box>

            {/* Section 8 */}
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                }}
              >
                8. Limitation of Liability
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                Use of the Academy is at your own risk. Breathing Flame is not responsible for any damages, health outcomes, or losses that result from the use of our site or content.
              </Typography>
            </Box>

            {/* Section 9 */}
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                }}
              >
                9. Privacy
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                Your use of the Academy is also governed by our{' '}
                <Typography
                  component="a"
                  href="/privacy"
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  Privacy Policy
                </Typography>
                .
              </Typography>
            </Box>

            {/* Section 10 */}
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                }}
              >
                10. Changes to These Terms
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                We may update these Terms of Service as the Academy evolves. We'll post updates on this page, and continued use of the site after changes means you accept the revised terms.
              </Typography>
            </Box>

            {/* Section 11 */}
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                }}
              >
                11. Contact Us
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                Questions about these terms or our refund policy? Contact us at:
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 2,
                backgroundColor: `${theme.palette.primary.main}10`,
                borderRadius: 2,
                border: `1px solid ${theme.palette.primary.main}30`,
              }}>
                <Email sx={{ color: theme.palette.primary.main }} />
                <Typography
                  component="a"
                  href="mailto:info@breathingflame.com"
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  info@breathingflame.com
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsPage; 