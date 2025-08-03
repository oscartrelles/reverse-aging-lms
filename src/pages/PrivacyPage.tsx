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

const PrivacyPage: React.FC = () => {
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
              Privacy Policy
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
            The Reverse Aging Academy ("Academy," "we," "us," or "our") is operated by Breathing Flame, based in Málaga, Spain. We respect your privacy and are committed to protecting your personal data in line with the EU General Data Protection Regulation (GDPR).
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
                1. Data We Collect
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                When you create a free account, we collect:
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
                  • <strong>Basic details:</strong> Name, email, and password
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • <strong>Optional profile information</strong> you choose to provide
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • <strong>Platform activity:</strong> Course progress, upvotes, and engagement with content
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                  fontStyle: 'italic',
                }}
              >
                We do not request or store sensitive health data. All information provided is for educational purposes only.
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
                2. How We Use Your Data
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                We use your information to:
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
                  • Provide access to the Academy and its features
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • Send weekly updates and relevant communications
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • Improve the content and functionality of the platform
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                }}
              >
                We will never sell your personal data.
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
                3. Data Storage & Security
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                Your data is stored securely on Google Firebase servers in compliance with GDPR standards. We take reasonable measures to protect your information from unauthorized access, loss, or misuse.
              </Typography>
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
                4. Sharing of Data
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                We may share your information only with trusted service providers (e.g., hosting and email providers) necessary to operate the Academy. These providers are bound by strict data protection obligations.
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
                5. Your Rights
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                Under GDPR, you have the right to:
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
                  • Access the personal data we hold about you
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • Request corrections or deletion of your data
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                  }}
                >
                  • Withdraw consent or request that we limit data use
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                To exercise these rights, contact us at{' '}
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
                6. Cookies & Analytics
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                We may use cookies and analytics tools to understand site usage and improve user experience. You can control or disable cookies through your browser settings.
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
                7. Updates to This Policy
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                We may update this Privacy Policy from time to time. Updates will be posted on this page, and continued use of the site after changes constitutes acceptance of the new policy.
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
                8. Contact Us
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                }}
              >
                If you have questions about this Privacy Policy or how we handle your data, contact us at:
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

export default PrivacyPage; 