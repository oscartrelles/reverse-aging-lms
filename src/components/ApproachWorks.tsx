import React from 'react';
import {
  Box,
  Typography,
  Card,
  Container,
  useTheme,
} from '@mui/material';
import { 
  Science, 
  People, 
  Schedule, 
  VerifiedUser 
} from '@mui/icons-material';

interface ApproachFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ApproachWorksProps {
  title?: string;
  features?: ApproachFeature[];
  sx?: any;
}

const defaultFeatures: ApproachFeature[] = [
  {
    icon: <Science />,
    title: "Evidence-Based Science",
    description: "All protocols are backed by the latest research in longevity, cellular biology, and anti-aging science."
  },
  {
    icon: <People />,
    title: "Community Support",
    description: "Join a community of like-minded individuals on the same transformation journey."
  },
  {
    icon: <Schedule />,
    title: "Sustainable Integration",
    description: "Designed to fit seamlessly into your daily life with sustainable habits that become part of your lifestyle."
  },
  {
    icon: <VerifiedUser />,
    title: "Proven Results",
    description: "Join hundreds of students who have already transformed their health and vitality."
  }
];

const ApproachWorks: React.FC<ApproachWorksProps> = ({
  title = "Why Our Approach Works",
  features = defaultFeatures,
  sx = {}
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: theme.palette.background.default, ...sx }}>
      <Container maxWidth="lg">
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 4, color: 'primary.main', textAlign: 'center' }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {features.map((feature, index) => (
            <Card key={index} sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, rgba(80, 235, 151, 0.05) 0%, rgba(172, 255, 34, 0.02) 100%)',
              border: '1px solid rgba(80, 235, 151, 0.2)',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                }}>
                  <Box sx={{ color: '#ffffff', fontSize: 24 }}>
                    {feature.icon}
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                  {feature.title}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#e0e0e0', lineHeight: 1.7, fontSize: '1rem' }}>
                {feature.description}
              </Typography>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default ApproachWorks;
