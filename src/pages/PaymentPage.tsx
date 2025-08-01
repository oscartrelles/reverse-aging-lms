import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  CheckCircle,
  ArrowBack,
} from '@mui/icons-material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { useCourse } from '../contexts/CourseContext';
import PaymentForm from '../components/payment/PaymentForm';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

const PaymentPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getCourse } = useCourse();
  
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  const course = getCourse(courseId || '');

  if (!currentUser) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4">Please sign in to continue</Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4">Course not found</Typography>
        </Box>
      </Container>
    );
  }

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentStatus('success');
    // TODO: Create enrollment in Firestore
    // TODO: Redirect to dashboard after a delay
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus('error');
    setErrorMessage(error);
  };

  if (paymentStatus === 'success') {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom>
            Welcome to The Reverse Aging Challenge!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Your enrollment is complete. You'll receive an email confirmation shortly.
          </Typography>
          
          <Card sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What's Next?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Check your email for course access details<br/>
                • Join our community forum<br/>
                • Prepare for your transformation journey<br/>
                • Your first lesson will be available on the course start date
              </Typography>
            </CardContent>
          </Card>
          
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/course/${courseId}`)}
          sx={{ mb: 3 }}
        >
          Back to Course
        </Button>

        {paymentStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Elements stripe={stripePromise}>
          <PaymentForm
            courseId={courseId || ''}
            courseTitle={course.title}
            price={course.price}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Elements>
      </Box>
    </Container>
  );
};

export default PaymentPage; 