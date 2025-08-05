import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { Cancel, Home, Payment } from '@mui/icons-material';

const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh',
      textAlign: 'center'
    }}>
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Cancel sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom>
            Payment Cancelled
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your payment was cancelled. No charges have been made to your account.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              startIcon={<Payment />}
              onClick={() => navigate('/dashboard')}
            >
              Try Again
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<Home />}
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentCancelled; 