import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import TrustIndicators from './TrustIndicators';
import { courseManagementService } from '../services/courseManagementService';

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
  const [upcomingCohort, setUpcomingCohort] = useState<any>(null);
  const [loadingCohort, setLoadingCohort] = useState(false);
  const [dynamicSubtitle, setDynamicSubtitle] = useState<string | undefined>(subtitle);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [dynamicSpecialOffer, setDynamicSpecialOffer] = useState(specialOffer);

  // Load course info and upcoming cohort if courseId is provided
  useEffect(() => {
    if (courseId) {
      setLoadingCohort(true);
      
      // Load course information first
      courseManagementService.getCourse(courseId)
        .then((course) => {
          console.log('🔍 ProgramCard - Course data loaded:', course);
          if (course) {
            setCourseInfo(course);
            // Set dynamic special offer with course price and specialOffer
            if (course.price) {
              console.log('🔍 ProgramCard - Course price:', course.price, 'Special offer:', course.specialOffer);
              // Only show special offer if course.specialOffer exists and is greater than 0
              if (course.specialOffer && course.specialOffer > 0) {
                console.log('🔍 ProgramCard - Setting special offer:', course.specialOffer);
                setDynamicSpecialOffer({
                  regularPrice: `€${course.price}`,
                  specialPrice: `€${course.specialOffer}`,
                  offerText: 'Special Offer'
                });
              } else {
                console.log('🔍 ProgramCard - No special offer, clearing dynamic offer');
                // No special offer - clear the dynamic special offer
                setDynamicSpecialOffer(undefined);
              }
            }
          }
        })
        .catch((error) => {
          console.error('Error loading course info:', error);
        });

      // Load upcoming cohort
      courseManagementService.getNextUpcomingCohort(courseId)
        .then((cohort) => {
          console.log('🔍 ProgramCard - Cohort data loaded:', cohort);
          if (cohort) {
            setUpcomingCohort(cohort);
            const cohortDate = cohort.startDate.toDate().toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric' 
            });
            console.log('🔍 ProgramCard - Setting dynamic subtitle:', `Next cohort starts: ${cohortDate}`);
            setDynamicSubtitle(`Next cohort starts: ${cohortDate}`);
          } else {
            console.log('🔍 ProgramCard - No upcoming cohort found');
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
          {(dynamicSpecialOffer || specialOffer) && (
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
                  Regular Price: {(dynamicSpecialOffer || specialOffer)?.regularPrice}
                </Typography>
              
              {/* Special Offer Box */}
              <Box sx={{
                background: 'linear-gradient(135deg, #2A2D35 0%, #1C1F26 100%)',
                border: '2px solid #50EB97',
                borderRadius: 3,
                p: 2.5,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(80, 235, 151, 0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(80, 235, 151, 0.25)',
                  borderColor: '#4CAF50',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(80, 235, 151, 0.1), transparent)',
                  animation: 'shimmer 2s infinite',
                }
              }}>
                {/* Offer Title */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#fff', 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: '1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <Box component="span" sx={{ 
                    display: 'inline-block',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' }
                    }
                  }}>
                    🎉 {(dynamicSpecialOffer || specialOffer)?.offerText || 'Special Launch Offer'}
                  </Box>
                </Typography>
                
                {/* Special Price */}
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#fff', 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: '2rem'
                  }}
                >
                  {(dynamicSpecialOffer || specialOffer)?.specialPrice}
                </Typography>
                
                {/* Limited Time Text */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary, 
                    fontSize: '0.75rem'
                  }}
                >
                  Limited time offer
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
              } else if (courseId && upcomingCohort) {
                // Navigate to payment with cohort info
                window.location.href = `/payment/${courseId}?cohortId=${upcomingCohort.id}`;
              } else if (courseId) {
                // Navigate to payment without specific cohort
                window.location.href = `/payment/${courseId}`;
              }
            }}
            endIcon={<ArrowForward />}
            sx={getButtonStyles()}
          >
            {buttonText}
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
