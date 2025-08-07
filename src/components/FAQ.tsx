import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  useTheme,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  faqs?: FAQItem[];
  sx?: any;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "What's the difference between the online course and in-person retreat?",
    answer: "The online course offers flexible, self-paced learning with lifetime access to materials and community support. The in-person retreat provides an immersive, intensive experience with hands-on guidance, group dynamics, and immediate feedback in a dedicated environment designed for transformation."
  },
  {
    question: "Are these programs suitable for beginners?",
    answer: "Absolutely! Both programs are designed to meet you where you are. Whether you're a complete beginner or have some experience with wellness practices, our step-by-step approach ensures everyone can participate and benefit from the experience."
  },
  {
    question: "What equipment or preparation do I need?",
    answer: "For the online course, you'll need comfortable clothing for movement, a quiet space for meditation, and access to cold water for cold exposure practices. For the in-person retreat, we provide all necessary equipment and materials - you just need to bring comfortable clothing and an open mind."
  },
  {
    question: "How much time do I need to commit?",
    answer: "Our online course is designed to be flexible - you can start with just 15-20 minutes per day and gradually build up to 30-45 minutes as you progress. The in-person retreat is a 7-day immersive experience with full-day programming, meals, and activities included."
  },
  {
    question: "What if I'm not satisfied with the program?",
    answer: "We offer a 30-day money-back guarantee for our online course. If you're not completely satisfied within the first 30 days, we'll refund your full investment, no questions asked. For our in-person retreat, we offer a satisfaction guarantee with specific terms outlined in your enrollment agreement."
  }
];

const FAQ: React.FC<FAQProps> = ({
  title = "Frequently Asked Questions",
  faqs = defaultFAQs,
  sx = {}
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: theme.palette.background.default, ...sx }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ mb: 4, color: theme.palette.text.primary, fontWeight: 600 }}>
          {title}
        </Typography>
        
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {faqs.map((faq, index) => (
            <Accordion 
              key={index}
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                backgroundColor: theme.palette.background.paper, 
                '&:before': { display: 'none' } 
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.6, color: theme.palette.text.secondary }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FAQ;
