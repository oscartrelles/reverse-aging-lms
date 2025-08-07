import React, { useState, useEffect, useRef } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { getActiveEnrollment } from '../../services/enrollmentService';
import { createCheckoutSession } from '../../services/stripeService';
import { getAvailableCohorts } from '../../services/cohortService';
import { Cohort } from '../../types';

interface PaymentFormProps {
  courseId: string;
  courseTitle: string;
  price: number;
  specialOffer?: number;
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
  specialOffer,
  onSuccess,
  onError,
}) => {
  const { currentUser } = useAuth();

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [loading, setLoading] = useState(false);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [availableCohorts, setAvailableCohorts] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>('');
  const hasSetInitialCohort = useRef(false);

  // Check if user is already enrolled and get available cohorts
  useEffect(() => {
    const checkEnrollmentAndCohorts = async () => {
      if (currentUser) {
        const enrollment = await getActiveEnrollment(currentUser.id, courseId);
        setIsEnrolled(!!enrollment);
        
        // Get available cohorts for enrollment
        const cohorts = await getAvailableCohorts(courseId);
        setAvailableCohorts(cohorts);
        
        // Auto-select the first available cohort (only once)
        if (cohorts.length > 0 && !hasSetInitialCohort.current) {
          setSelectedCohortId(cohorts[0].id);
          hasSetInitialCohort.current = true;
        }
      }
    };
    checkEnrollmentAndCohorts();
  }, [currentUser, courseId]);

  // Mock discount codes - replace with real validation
  const validDiscountCodes: DiscountCode[] = [
    { code: 'WELCOME50', type: 'fixed', value: 50, isValid: true },
    { code: 'EARLYBIRD', type: 'percentage', value: 10, isValid: true },
    { code: 'FRIEND20', type: 'percentage', value: 20, isValid: true },
  ];



  const calculatePrice = () => {
    // Use special offer price if available and greater than 0
    let basePrice = (specialOffer && specialOffer > 0) ? specialOffer : price;
    let finalPrice = basePrice;
    
    if (appliedDiscount) {
      if (appliedDiscount.type === 'fixed') {
        finalPrice = Math.max(0, basePrice - appliedDiscount.value);
      } else {
        finalPrice = basePrice * (1 - appliedDiscount.value / 100);
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
    
    if (!currentUser) {
      onError('User is not authenticated.');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating Stripe Checkout session...');
      console.log('Course ID:', courseId);
      console.log('Amount:', calculatePrice());
      console.log('User ID:', currentUser.id);

      // Create a Stripe Checkout session
      const amount = Math.round(calculatePrice() * 100); // Convert to cents
      
      // Validate cohort selection
      if (!selectedCohortId) {
        throw new Error('Please select a cohort to join.');
      }

      // Create checkout session
      const checkoutUrl = await createCheckoutSession(amount, courseId, courseTitle, selectedCohortId);
      console.log('Received checkout URL:', checkoutUrl);
      
      setCheckoutUrl(checkoutUrl);
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
      
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



      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Course Details
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1">{courseTitle}</Typography>
            <Box sx={{ textAlign: 'right' }}>
              {specialOffer && specialOffer > 0 ? (
                <>
                  <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                    €{price}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="success.main">
                    €{specialOffer}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" fontWeight="medium">
                  €{price}
                </Typography>
              )}
            </Box>
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

      {/* Cohort Selection */}
      {availableCohorts.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Select Your Cohort
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which cohort you'd like to join:
            </Typography>
            
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedCohortId}
                onChange={(e) => setSelectedCohortId(e.target.value)}
              >
                {availableCohorts.map((cohort) => (
                  <FormControlLabel
                    key={cohort.id}
                    value={cohort.id}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {cohort.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Starts: {cohort.startDate.toDate().toLocaleDateString()} • 
                          {cohort.currentStudents}/{cohort.maxStudents} students enrolled
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      )}

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

      {/* Checkout Button */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Complete Your Purchase
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click the button below to securely complete your payment using Stripe Checkout.
          </Typography>
          
          <Button
            onClick={handleSubmit}
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !selectedCohortId}
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
                Opening Checkout...
              </Box>
            ) : (
              `Pay €${finalPrice} with Stripe Checkout`
            )}
          </Button>
          
          {checkoutUrl && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Checkout window opened. Please complete your payment there.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentForm; 