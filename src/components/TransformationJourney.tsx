import React from 'react';
import {
  Box,
  Typography,
  Card,
  Container,
  useTheme,
} from '@mui/material';

interface JourneyPhase {
  label: string;
  title: string;
  description: string;
}

interface TransformationJourneyProps {
  title?: string;
  phases?: JourneyPhase[];
  sx?: any;
}

const defaultPhases: JourneyPhase[] = [
  {
    label: "1",
    title: "Foundation & Mindset",
    description: "Build your transformation foundation with proven mindset techniques, goal setting strategies, and understanding the science behind reverse aging."
  },
  {
    label: "2-7",
    title: "Master Your Health",
    description: "Dive deep into nutrition optimization, movement patterns, advanced breathwork techniques, and cold and heat exposure protocols."
  },
  {
    label: "∞",
    title: "Daily Practices",
    description: "Develop a comprehensive, personalized plan that stacks sustainable habits in your daily routine for long-lasting transformation."
  }
];

const TransformationJourney: React.FC<TransformationJourneyProps> = ({
  title = "7-Pillar Transformation Journey",
  phases = defaultPhases,
  sx = {}
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: theme.palette.background.default, ...sx }}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary, textAlign: 'center' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {phases.map((phase, index) => (
            <Box key={index} sx={{ flex: { xs: 1, md: 4 } }}>
              <Card sx={{ 
                height: '100%', 
                p: 3, 
                textAlign: 'center', 
                borderRadius: 3,
                backgroundColor: theme.palette.background.default,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 40px rgba(0,0,0,0.3)`,
                }
              }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  backgroundColor: theme.palette.primary.main, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
                  }
                }}>
                  <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold' }}>
                    {phase.label}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                  {phase.title}
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                  {phase.description}
                </Typography>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default TransformationJourney;
