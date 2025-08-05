import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { CheckCircle, Home } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { createEnrollment, getActiveEnrollment } from '../services/enrollmentService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      // Prevent double execution in StrictMode
      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;
      try {
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          setError('No session ID found');
          setLoading(false);
          return;
        }

        if (!currentUser) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        console.log('Processing successful payment for session:', sessionId);

        // Get the cohort ID from the checkout session
        // In production, you'd verify this with Stripe's API
        const checkoutSessionDoc = await getDoc(doc(db, 'checkoutSessions', sessionId));
        const cohortId = checkoutSessionDoc.exists() ? checkoutSessionDoc.data().cohortId : 'default-cohort-id';
        
        // Create enrollment using the proper service (with built-in duplicate prevention)
        const enrollmentId = await createEnrollment({
          userId: currentUser.id,
          courseId: 'hTLj9Lx1MAkBks0INzxS', // Default course ID
          cohortId: cohortId,
          paymentId: sessionId,
          paymentStatus: 'paid',
          enrollmentStatus: 'active',
          stripeCustomerId: sessionId // Using session ID as placeholder
        });

        console.log('Enrollment created successfully:', enrollmentId);
        setSuccess(true);
        setLoading(false);

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

      } catch (error) {
        console.error('Error processing payment success:', error);
        setError('Failed to process payment. Please contact support.');
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [searchParams, currentUser, navigate]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        textAlign: 'center'
      }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h5" gutterBottom>
          Processing Your Payment...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please wait while we confirm your enrollment.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        textAlign: 'center'
      }}>
        <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<Home />}
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </Box>
    );
  }

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
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom>
            Payment Successful!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Thank you for enrolling in The Reverse Aging Challenge. Your payment has been processed successfully.
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            You will be redirected to your dashboard in a few seconds...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentSuccess; 