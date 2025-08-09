import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Container,
  useTheme,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface Testimonial {
  text: string;
  author: string;
}

interface TestimonialsProps {
  title?: string;
  testimonials?: Testimonial[];
  autoRotate?: boolean;
  autoRotateInterval?: number;
  sx?: any;
}

const defaultTestimonials: Testimonial[] = [
  {
    text: "Oscar has a calm confidence and genuine passion for what he teaches. His guidance was clear and supportive, making the experience accessible even for beginners. I left feeling invigorated and with tools I can use every day.",
    author: "Pablo L."
  },
  {
    text: "Since the first moment I met Oscar, I knew I had met someone special. He transmits a positive energy that makes you feel safe and confident to explore new practices. Thank you for such a transformative experience.",
    author: "Spencer F."
  },
  {
    text: "Oscar is a fantastic instructor who creates memorable and engaging experiences. His ability to explain concepts and hold space is truly special.",
    author: "Abbie G."
  },
  {
    text: "What I valued most was how Oscar helped me unlock internal blocks that were holding me back. As a result, I'm able to live out my potential more fully and confidently.",
    author: "Viyan N."
  },
  {
    text: "Oscar has a way of guiding you to celebrate your journey and recognize the abundance in your life. His approach is compassionate, non-judgmental, and deeply grounding.",
    author: "Lucy Y."
  },
  {
    text: "Working with Oscar has been transformative. He helped me gain clarity, define my vision, and most importantly, believe in myself and my capabilities.",
    author: "Adina D."
  }
];

const Testimonials: React.FC<TestimonialsProps> = ({
  title = "What Our Students Say",
  testimonials = defaultTestimonials,
  autoRotate = true,
  autoRotateInterval = 5000,
  sx = {}
}) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const theme = useTheme();

  // Auto-rotate testimonials
  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, autoRotateInterval);
    
    return () => clearInterval(interval);
  }, [testimonials.length, autoRotate, autoRotateInterval]);

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, color: theme.palette.text.primary, ...sx }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1.5,
            }}
          >
            {title}
          </Typography>
        </Box>
        
        <Card sx={{ 
          maxWidth: 800, 
          mx: 'auto', 
          position: 'relative',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}10 100%)`,
          border: `1px solid ${theme.palette.primary.main}30`,
          borderRadius: 4,
          boxShadow: `0 10px 30px rgba(0,0,0,0.3)`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 15px 40px rgba(0,0,0,0.4)`,
          }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center', position: 'relative' }}>
            {/* Navigation Buttons */}
            <IconButton
              onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
              sx={{
                position: 'absolute',
                left: { xs: 4, sm: 8 },
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: `${theme.palette.background.paper}E6`,
                border: `1px solid ${theme.palette.primary.main}30`,
                color: theme.palette.primary.main,
                transition: 'all 0.3s ease',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                  transform: 'translateY(-50%) scale(1.1)',
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                },
                zIndex: 2,
              }}
            >
              <ChevronLeft sx={{ fontSize: { xs: 18, sm: 24 } }} />
            </IconButton>
            
            <IconButton
              onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
              sx={{
                position: 'absolute',
                right: { xs: 4, sm: 8 },
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: `${theme.palette.background.paper}E6`,
                border: `1px solid ${theme.palette.primary.main}30`,
                color: theme.palette.primary.main,
                transition: 'all 0.3s ease',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                  transform: 'translateY(-50%) scale(1.1)',
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                },
                zIndex: 2,
              }}
            >
              <ChevronRight sx={{ fontSize: { xs: 18, sm: 24 } }} />
            </IconButton>

            {/* Testimonial Content */}
            <Box sx={{ px: { xs: 2, sm: 4 } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  color: theme.palette.text.primary,
                  minHeight: { xs: 'auto', sm: 140 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  px: { xs: 3, sm: 0 },
                }}
              >
                "{testimonials[currentTestimonial].text}"
              </Typography>
              
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.primary.main,
                  mb: 2
                }}
              >
                — {testimonials[currentTestimonial].author}
              </Typography>
            </Box>

            {/* Dots Indicator */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
              {testimonials.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: index === currentTestimonial ? theme.palette.primary.main : `${theme.palette.primary.main}40`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: index === currentTestimonial ? theme.palette.primary.main : `${theme.palette.primary.main}60`,
                      transform: 'scale(1.2)',
                    }
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Testimonials;
