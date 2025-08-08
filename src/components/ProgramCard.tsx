import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
} from '@mui/material';
import { ArrowForward, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import TrustIndicators from './TrustIndicators';
import { courseManagementService } from '../services/courseManagementService';
import { cohortPricingService } from '../services/cohortPricingService';

interface ProgramFeature {
  icon: React.ReactNode;
  text: string;
}

interface ProgramCardProps {
  title: string;
  subtitle?: string;
  description: string;
  features: ProgramFeature[];
  buttonText: string;
  buttonVariant?: 'contained' | 'outlined';
  buttonColor?: 'primary' | 'secondary';
  icon: React.ReactNode;
  iconColor?: 'primary' | 'secondary';
  onClick?: () => void;
  additionalText?: string;
  specialOffer?: {
    regularPrice: string;
    specialPrice: string;
    offerText?: string;
  };
  showTrustIndicators?: boolean;
  // New props for dynamic cohort handling
  courseId?: string;
  externalUrl?: string;
  sx?: any;
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  title,
  subtitle,
  description,
  features,
  buttonText,
  buttonVariant = 'contained',
  buttonColor = 'primary',
  icon,
  iconColor = 'primary',
  onClick,
  additionalText,
  specialOffer,
  showTrustIndicators = false,
  courseId,
  externalUrl,
  sx = {}
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [upcomingCohort, setUpcomingCohort] = useState<any>(null);
  const [loadingCohort, setLoadingCohort] = useState(false);
  const [dynamicSubtitle, setDynamicSubtitle] = useState<string | undefined>(subtitle);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [dynamicSpecialOffer, setDynamicSpecialOffer] = useState(specialOffer);
  const [courseLoading, setCourseLoading] = useState(false);

  // Load course info and upcoming cohort if courseId is provided
  useEffect(() => {
    if (courseId) {
      setLoadingCohort(true);
      setCourseLoading(true);
      
      // Load course information first
      courseManagementService.getCourse(courseId)
        .then((course) => {
          if (course) {
            setCourseInfo(course);
            // Pricing is now handled by cohorts, not courses
            // Clear any course-level special offers since we use cohort pricing
            setDynamicSpecialOffer(undefined);
          }
        })
        .catch((error) => {
          console.error('Error loading course info:', error);
        })
        .finally(() => {
          setCourseLoading(false);
        });

      // Load upcoming cohort
      courseManagementService.getNextUpcomingCohort(courseId)
        .then(async (cohort) => {
          if (cohort) {
            setUpcomingCohort(cohort);
            const cohortDate = cohort.startDate.toDate().toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric' 
            });
            setDynamicSubtitle(`Next cohort starts: ${cohortDate}`);
            
            // Get cohort pricing information
            try {
              const pricingDisplay = await cohortPricingService.getPricingDisplay(cohort.id);
              
              // Update special offer with cohort pricing
              if (pricingDisplay.specialOffer && pricingDisplay.specialOffer > 0) {
                setDynamicSpecialOffer({
                  regularPrice: `€${pricingDisplay.basePrice}`,
                  specialPrice: `€${pricingDisplay.specialOffer}`,
                  offerText: 'Special Offer'
                });
              } else if (!pricingDisplay.isFree) {
                // No special offer but not free - clear dynamic special offer
                setDynamicSpecialOffer(undefined);
              }
            } catch (pricingError) {
              console.error('Error loading cohort pricing:', pricingError);
              // Fallback to course pricing if cohort pricing fails
            }
          }
        })
        .catch((error) => {
          console.error('Error loading upcoming cohort:', error);
        })
        .finally(() => {
          setLoadingCohort(false);
        });
    }
  }, [courseId]);

  const getIconColor = () => {
    return iconColor === 'secondary' ? theme.palette.secondary.main : theme.palette.primary.main;
  };

  const getButtonStyles = () => {
    if (buttonVariant === 'outlined') {
      return {
        borderColor: getIconColor(),
        color: getIconColor(),
        fontWeight: 600,
        py: 1.5,
        '&:hover': {
          borderColor: iconColor === 'secondary' ? theme.palette.secondary.dark : theme.palette.primary.dark,
          backgroundColor: `${getIconColor()}10`,
        }
      };
    }
    
    return {
      backgroundColor: getIconColor(),
      color: '#000',
      fontWeight: 600,
      py: 1.5,
      '&:hover': {
        backgroundColor: iconColor === 'secondary' ? theme.palette.secondary.dark : theme.palette.primary.dark,
      }
    };
  };

  return (
    <Box sx={{ 
      flex: { xs: 1, md: '0 0 calc(50% - 16px)' },
      '@keyframes shimmer': {
        '0%': {
          left: '-100%',
        },
        '100%': {
          left: '100%',
        },
      },
      '@keyframes float': {
        '0%, 100%': {
          transform: 'translateY(0px) rotate(0deg)',
        },
        '50%': {
          transform: 'translateY(-10px) rotate(1deg)',
        },
      },
    }}>
      <Card
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.default,
          borderRadius: 3,
          height: '100%',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 40px rgba(0,0,0,0.15)`,
          },
          ...sx
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ color: getIconColor(), fontSize: 32 }}>
              {icon}
            </Box>
            <Box>
              <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                {title}
              </Typography>
              {(dynamicSubtitle || subtitle) && (
                <Typography variant="body2" sx={{ color: getIconColor(), fontWeight: 600, mt: 0.5 }}>
                  {loadingCohort ? 'Loading...' : (dynamicSubtitle || subtitle)}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Typography variant="subtitle1" sx={{ mb: 3, color: theme.palette.text.secondary, fontWeight: 600 }}>
            {description}
          </Typography>

          <Box sx={{ mb: 4, flex: 1 }}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Box sx={{ color: getIconColor(), mt: 0.5 }}>
                  {feature.icon}
                </Box>
                <Typography variant="body2" dangerouslySetInnerHTML={{ __html: feature.text }} />
              </Box>
            ))}
          </Box>

          {additionalText && (
            <Typography variant="body1" sx={{ mb: 4, fontStyle: 'italic', color: theme.palette.text.secondary }}>
              {additionalText}
            </Typography>
          )}

          {/* Special Offer Callout */}
          {(dynamicSpecialOffer || specialOffer || (courseInfo?.specialOffer && courseInfo?.specialOffer > 0)) && (
            <Box sx={{ mb: 4 }}>
              {/* Regular Price (Crossed Out) */}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  textDecoration: 'line-through',
                  mb: 1,
                  fontSize: '0.875rem'
                }}
                              >
                  Regular Price: {(dynamicSpecialOffer || specialOffer)?.regularPrice || (courseInfo?.price ? `€${courseInfo.price}` : '')}
                </Typography>
              
              {/* Special Offer Box - Nature-Inspired Glassmorphism */}
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(80, 235, 151, 0.08) 0%, rgba(172, 255, 34, 0.04) 50%, rgba(80, 235, 151, 0.06) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(80, 235, 151, 0.2)',
                borderRadius: '24px 8px 24px 8px', // Organic, asymmetric shape
                p: 3,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(80, 235, 151, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-3px) scale(1.02)',
                  boxShadow: '0 16px 48px rgba(80, 235, 151, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(80, 235, 151, 0.3)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(80, 235, 151, 0.03) 0%, transparent 70%)',
                  animation: 'float 6s ease-in-out infinite',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2350EB97" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  opacity: 0.5,
                  pointerEvents: 'none',
                }
              }}>
                {/* Offer Title - Nature-Inspired */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    fontWeight: 600, 
                    mb: 1.5,
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    position: 'relative',
                    zIndex: 1,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  <Box component="span" sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    animation: 'gentleGlow 3s ease-in-out infinite',
                    '@keyframes gentleGlow': {
                      '0%, 100%': { 
                        textShadow: '0 0 8px rgba(80, 235, 151, 0.3)',
                        opacity: 0.9
                      },
                      '50%': { 
                        textShadow: '0 0 16px rgba(80, 235, 151, 0.5)',
                        opacity: 1
                      }
                    }
                                      }}>
                      <Star sx={{ 
                        fontSize: 16, 
                        color: 'rgba(80, 235, 151, 0.9)',
                        filter: 'drop-shadow(0 0 4px rgba(80, 235, 151, 0.3))'
                      }} />
                      {(dynamicSpecialOffer || specialOffer)?.offerText || 'Special Offer'}
                    </Box>
                </Typography>
                
                {/* Special Price - Elegant Typography */}
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.98)', 
                    fontWeight: 700, 
                    mb: 1.5,
                    fontSize: '2.2rem',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {(dynamicSpecialOffer || specialOffer)?.specialPrice || (courseInfo?.specialOffer ? `€${courseInfo.specialOffer}` : '')}
                </Typography>
                
                                  {/* Limited Time Text - Nature-Inspired */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      fontSize: '0.75rem',
                      fontStyle: 'italic',
                      letterSpacing: '0.3px',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    Limited to founding members
                  </Typography>
              </Box>
            </Box>
          )}

          <Button
            variant={buttonVariant}
            size="large"
            onClick={() => {
              if (onClick) {
                onClick();
              } else if (externalUrl) {
                window.open(externalUrl, '_blank');
              } else if (courseId) {
                // Navigate to course page to view available cohorts
                navigate(`/course/${courseId}`);
              }
            }}
            endIcon={<ArrowForward />}
            sx={getButtonStyles()}
          >
            {courseId ? 'View Available Cohorts' : buttonText}
          </Button>

          {/* Trust Indicators */}
          {showTrustIndicators && (
            <TrustIndicators sx={{ mt: 3 }} />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProgramCard;
