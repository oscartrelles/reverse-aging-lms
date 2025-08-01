import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import {
  CreditCard,
  Discount,
  CheckCircle,
} from '@mui/icons-material';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useAuth } from '../../contexts/AuthContext';
import { processSuccessfulPayment, processFailedPayment } from '../../services/paymentService';
import { getActiveEnrollment } from '../../services/enrollmentService';

interface PaymentFormProps {
  courseId: string;
  courseTitle: string;
  price: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

interface DiscountCode {
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  isValid: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  courseId,
  courseTitle,
  price,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'full' | 'installments'>('full');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [showTestCards, setShowTestCards] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Check if user is already enrolled
  useEffect(() => {
    const checkEnrollment = async () => {
      if (currentUser) {
        const enrollment = await getActiveEnrollment(currentUser.id, courseId);
        setIsEnrolled(!!enrollment);
      }
    };
    checkEnrollment();
  }, [currentUser, courseId]);

  // Mock discount codes - replace with real validation
  const validDiscountCodes: DiscountCode[] = [
    { code: 'WELCOME50', type: 'fixed', value: 50, isValid: true },
    { code: 'EARLYBIRD', type: 'percentage', value: 10, isValid: true },
    { code: 'FRIEND20', type: 'percentage', value: 20, isValid: true },
  ];

  // Stripe test card numbers
  const testCards = [
    { name: 'Visa (Success)', number: '4242424242424242', cvv: '123', expiry: '12/25' },
    { name: 'Visa (Declined)', number: '4000000000000002', cvv: '123', expiry: '12/25' },
    { name: 'Mastercard (Success)', number: '5555555555554444', cvv: '123', expiry: '12/25' },
    { name: '3D Secure (Success)', number: '4000002500003155', cvv: '123', expiry: '12/25' },
  ];

  const calculatePrice = () => {
    let finalPrice = price;
    
    if (appliedDiscount) {
      if (appliedDiscount.type === 'fixed') {
        finalPrice = Math.max(0, price - appliedDiscount.value);
      } else {
        finalPrice = price * (1 - appliedDiscount.value / 100);
      }
    }
    
    return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
  };

  const calculateInstallments = () => {
    const finalPrice = calculatePrice();
    return Math.round(finalPrice / 2 * 100) / 100;
  };

  const handleApplyDiscount = () => {
    const discount = validDiscountCodes.find(d => d.code === discountCode.toUpperCase());
    if (discount) {
      setAppliedDiscount(discount);
      setDiscountCode('');
    } else {
      onError('Invalid discount code');
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
  };

  // Check if user is already enrolled
  if (isEnrolled) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          You're Already Enrolled!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You have already enrolled in this course. You can access your course content from the dashboard.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => window.location.href = '/dashboard'}
        >
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !currentUser) {
      onError('Payment system not ready. Please try again.');
      return;
    }

    setLoading(true);

    try {
      console.log('Processing payment with Stripe...');
      console.log('Course ID:', courseId);
      console.log('Amount:', calculatePrice());
      console.log('User ID:', currentUser.id);

      // Get the card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card information is required.');
      }

      // Create payment intent (simulated for now - in production this would call your backend)
      const amount = Math.round(calculatePrice() * 100); // Convert to cents
      const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentId, // In production, this would be a real client secret from your backend
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName,
            },
          },
        }
      );

      if (error) {
        console.error('Payment failed:', error);
        throw new Error(error.message || 'Payment failed. Please try again.');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment successful! Payment Intent ID:', paymentIntent.id);
        
        // Process the successful payment
        const paymentId = await processSuccessfulPayment(
          currentUser.id,
          courseId,
          'default-cohort-id', // You'll need to get the actual cohort ID
          calculatePrice(),
          paymentIntent.id
        );

        onSuccess(paymentId);
      } else {
        throw new Error('Payment was not successful.');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      onError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const finalPrice = calculatePrice();
  const installmentAmount = calculateInstallments();

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Complete Your Enrollment
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Join The Reverse Aging Challenge and transform your health
      </Typography>

      {/* Test Mode Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Test Mode:</strong> Use these test card numbers to simulate payments:
        <Button 
          size="small" 
          onClick={() => setShowTestCards(!showTestCards)}
          sx={{ ml: 1 }}
        >
          {showTestCards ? 'Hide' : 'Show'} Test Cards
        </Button>
      </Alert>

      {showTestCards && (
        <Card sx={{ mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.1)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Card Numbers
            </Typography>
            {testCards.map((card, index) => (
              <Box key={index} sx={{ mb: 1, p: 1, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {card.name}
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                  {card.number} | CVV: {card.cvv} | Exp: {card.expiry}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Course Details
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1">{courseTitle}</Typography>
            <Typography variant="body1" fontWeight="medium">
              €{price}
            </Typography>
          </Box>
          
          {appliedDiscount && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Discount sx={{ color: 'success.main', fontSize: 16 }} />
                <Typography variant="body2" color="success.main">
                  Discount ({appliedDiscount.code})
                </Typography>
              </Box>
              <Typography variant="body2" color="success.main">
                -€{appliedDiscount.type === 'fixed' ? appliedDiscount.value : Math.round(price * appliedDiscount.value / 100)}
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6" color="primary.main">
              €{finalPrice}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Discount Code */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Discount Code
          </Typography>
          
          {appliedDiscount ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label={appliedDiscount.code}
                color="success"
                variant="outlined"
                icon={<CheckCircle />}
              />
              <Button 
                variant="text" 
                size="small"
                onClick={handleRemoveDiscount}
              >
                Remove
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Enter discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                size="small"
              />
              <Button 
                variant="outlined" 
                onClick={handleApplyDiscount}
                disabled={!discountCode.trim()}
              >
                Apply
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Method
          </Typography>
          
          <FormControl component="fieldset">
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'full' | 'installments')}
            >
              <FormControlLabel
                value="full"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Pay in Full</Typography>
                    <Typography variant="body2" color="text.secondary">
                      €{finalPrice} (one-time payment)
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="installments"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Pay in Installments</Typography>
                    <Typography variant="body2" color="text.secondary">
                      2 payments of €{installmentAmount} each
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Details
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Cardholder Name"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Card Information
              </Typography>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </Box>
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !cardholderName}
              sx={{
                backgroundColor: 'primary.main',
                color: '#000',
                fontWeight: 700,
                '&:hover': {
                  backgroundColor: 'primary.light',
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Processing Payment...
                </Box>
              ) : (
                `Pay €${finalPrice}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentForm; 