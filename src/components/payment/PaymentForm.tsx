import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  LocalOffer,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveEnrollment } from '../../services/enrollmentService';
import { createCheckoutSession } from '../../services/stripeService';
import { getAvailableCohorts } from '../../services/cohortService';
import { cohortPricingService } from '../../services/cohortPricingService';
import { Cohort } from '../../types';

interface PaymentFormProps {
  courseId: string;
  courseTitle: string;
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
  onSuccess,
  onError,
}) => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [loading, setLoading] = useState(false);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [availableCohorts, setAvailableCohorts] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>('');
  const [cohortPricing, setCohortPricing] = useState<{[key: string]: any}>({});
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
        
        // Load pricing information for each cohort
        const pricingPromises = cohorts.map(async (cohort) => {
          try {
            const pricingDisplay = await cohortPricingService.getPricingDisplay(cohort.id);
            return { cohortId: cohort.id, pricing: pricingDisplay };
          } catch (error) {
            console.error(`Error loading pricing for cohort ${cohort.id}:`, error);
            return { cohortId: cohort.id, pricing: null };
          }
        });
        
        const pricingResults = await Promise.all(pricingPromises);
        const pricingMap = pricingResults.reduce((acc, result) => {
          if (result.pricing) {
            acc[result.cohortId] = result.pricing;
          }
          return acc;
        }, {} as {[key: string]: any});
        
        setCohortPricing(pricingMap);
        
        // Auto-select cohort based on URL parameter or fallback to first (only once)
        if (cohorts.length > 0 && !hasSetInitialCohort.current) {
          const cohortIdFromUrl = searchParams.get('cohortId');
          
          // Check if the URL parameter cohort exists in available cohorts
          if (cohortIdFromUrl && cohorts.some(c => c.id === cohortIdFromUrl)) {
            setSelectedCohortId(cohortIdFromUrl);
          } else {
            // Fallback to first available cohort
            setSelectedCohortId(cohorts[0].id);
          }
          
          hasSetInitialCohort.current = true;
        }
      }
    };
    checkEnrollmentAndCohorts();
  }, [currentUser, courseId, searchParams]);

  // Mock discount codes - replace with real validation
  const validDiscountCodes: DiscountCode[] = [
    { code: 'WELCOME50', type: 'fixed', value: 50, isValid: true },
    { code: 'EARLYBIRD', type: 'percentage', value: 10, isValid: true },
    { code: 'FRIEND20', type: 'percentage', value: 20, isValid: true },
  ];



  const calculatePrice = () => {
    // Get cohort pricing if available
    const pricing = selectedCohortId ? cohortPricing[selectedCohortId] : null;
    
    let basePrice;
    if (pricing) {
      if (pricing.isFree) {
        basePrice = 0;
      } else {
        // Calculate price with early bird discount if applicable
        let displayPrice = pricing.specialOffer && pricing.specialOffer > 0 
          ? pricing.specialOffer 
          : pricing.basePrice;
        
        // Apply early bird discount if valid
        if (pricing.earlyBirdDiscount && pricing.earlyBirdDiscount.amount > 0 && new Date() < new Date(pricing.earlyBirdDiscount.validUntil)) {
          if (pricing.earlyBirdDiscount.type === 'percentage') {
            displayPrice = displayPrice - (displayPrice * pricing.earlyBirdDiscount.amount / 100);
          } else {
            displayPrice = displayPrice - pricing.earlyBirdDiscount.amount;
          }
        }
        basePrice = displayPrice;
      }
    } else {
      // No cohort pricing available, default to 0
      basePrice = 0;
    }
    
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
    // First check cohort-specific coupons if a cohort is selected
    if (selectedCohortId && availableCohorts.length > 0) {
      const selectedCohort = availableCohorts.find(c => c.id === selectedCohortId);
      
      if (selectedCohort && selectedCohort.coupons && selectedCohort.coupons.length > 0) {
        
        const cohortCoupon = selectedCohort.coupons.find(coupon => {
          const codeMatch = coupon.code.toUpperCase() === discountCode.toUpperCase();
          const isActive = coupon.isActive;
          const usesValid = coupon.maxUses === undefined || (coupon.currentUses || 0) < coupon.maxUses;
          
          // Handle Firestore Timestamp objects - they come as serialized objects
          const validFromDate = coupon.validFrom?.seconds ? 
            new Date(coupon.validFrom.seconds * 1000) : 
            coupon.validFrom?.toDate ? coupon.validFrom.toDate() : 
            typeof coupon.validFrom === 'string' || typeof coupon.validFrom === 'number' ? 
            new Date(coupon.validFrom) : new Date();
          
          const validUntilDate = coupon.validUntil?.seconds ? 
            new Date(coupon.validUntil.seconds * 1000) : 
            coupon.validUntil?.toDate ? coupon.validUntil.toDate() : 
            typeof coupon.validUntil === 'string' || typeof coupon.validUntil === 'number' ? 
            new Date(coupon.validUntil) : new Date();
          const now = new Date();
          
          const dateValid = now >= validFromDate && now <= validUntilDate;
          
          return codeMatch && isActive && usesValid && dateValid;
        });
        
        if (cohortCoupon) {
          // Convert cohort coupon to DiscountCode format
          const discount: DiscountCode = {
            code: cohortCoupon.code,
            type: cohortCoupon.type,
            value: cohortCoupon.value,
            isValid: true
          };
          setAppliedDiscount(discount);
          setDiscountCode('');
          return;
        }
      }
    }
    
    // Fallback to hardcoded discount codes
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

  // Get display pricing for course details section
  const getCohortDisplayPricing = () => {
    const pricing = selectedCohortId ? cohortPricing[selectedCohortId] : null;
    
    if (pricing) {
      if (pricing.isFree) {
        return { 
          basePrice: 0, 
          displayPrice: 0, 
          showStrikethrough: false,
          discountReason: 'Free cohort',
          hasSpecialOffer: false,
          hasEarlyBird: false
        };
      }
      
      const basePrice = pricing.basePrice;
      let displayPrice = pricing.basePrice;
      let discountReason = '';
      let hasSpecialOffer = false;
      let hasEarlyBird = false;
      
      // Check for special offer
      if (pricing.specialOffer && pricing.specialOffer > 0) {
        displayPrice = pricing.specialOffer;
        hasSpecialOffer = true;
        discountReason = 'Special Offer';
      }
      
      // Check for early bird discount
      if (pricing.earlyBirdDiscount && pricing.earlyBirdDiscount.amount > 0 && new Date() < new Date(pricing.earlyBirdDiscount.validUntil)) {
        hasEarlyBird = true;
        
        if (pricing.earlyBirdDiscount.type === 'percentage') {
          displayPrice = displayPrice - (displayPrice * pricing.earlyBirdDiscount.amount / 100);
        } else {
          displayPrice = displayPrice - pricing.earlyBirdDiscount.amount;
        }
        
        if (hasSpecialOffer) {
          discountReason = `Special Offer + Early Bird (${pricing.earlyBirdDiscount.amount}${pricing.earlyBirdDiscount.type === 'percentage' ? '%' : '€'} off)`;
        } else {
          discountReason = `Early Bird Discount (${pricing.earlyBirdDiscount.amount}${pricing.earlyBirdDiscount.type === 'percentage' ? '%' : '€'} off)`;
        }
      }
      
      const showStrikethrough = hasSpecialOffer || hasEarlyBird;
      
      return { 
        basePrice,
        displayPrice: Math.round(displayPrice), 
        showStrikethrough,
        discountReason,
        hasSpecialOffer,
        hasEarlyBird
      };
    }
    
    // No cohort pricing available, return default values
    return { 
      basePrice: 0, 
      displayPrice: 0,
      showStrikethrough: false,
      discountReason: 'No pricing available',
      hasSpecialOffer: false,
      hasEarlyBird: false
    };
  };

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">{courseTitle}</Typography>
            <Typography variant="body1" fontWeight="medium">
              €{(() => {
                const { basePrice } = getCohortDisplayPricing();
                return basePrice;
              })()}
            </Typography>
          </Box>
          
          {/* Discount Reason with discounted price */}
          {(() => {
            const { discountReason, showStrikethrough, hasEarlyBird, hasSpecialOffer, displayPrice } = getCohortDisplayPricing();
            if (discountReason && showStrikethrough) {
              // Choose appropriate icon based on discount type
              const DiscountIcon = hasEarlyBird ? AccessTime : hasSpecialOffer ? LocalOffer : Discount;
              
              return (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DiscountIcon sx={{ color: 'success.main', fontSize: 16 }} />
                    <Typography variant="body2" color="success.main">
                      {discountReason}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium" color="success.main">
                    €{displayPrice}
                  </Typography>
                </Box>
              );
            }
            return null;
          })()}
          
          {appliedDiscount && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Discount sx={{ color: 'success.main', fontSize: 16 }} />
                <Typography variant="body2" color="success.main">
                  Coupon ({appliedDiscount.code})
                </Typography>
              </Box>
              <Typography variant="body2" color="success.main">
                {(() => {
                  const { displayPrice } = getCohortDisplayPricing();
                  const discountAmount = appliedDiscount.type === 'fixed' 
                    ? appliedDiscount.value 
                    : Math.round(displayPrice * appliedDiscount.value / 100);
                  return `-€${discountAmount}`;
                })()}
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
                          Ends: {cohort.endDate.toDate().toLocaleDateString()}
                          {(() => {
                            const spotsLeft = cohort.maxStudents - (cohort.currentStudents || 0);
                            if (spotsLeft < 10) {
                              return ` • ${spotsLeft} spots left`;
                            }
                            return '';
                          })()}
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