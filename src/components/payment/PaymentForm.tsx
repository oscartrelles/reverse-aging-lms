import React, { useState } from 'react';
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
} from '@mui/material';
import {
  CreditCard,
  Discount,
  CheckCircle,
} from '@mui/icons-material';

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

  const [paymentMethod, setPaymentMethod] = useState<'full' | 'installments'>('full');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Mock discount codes - replace with real validation
  const validDiscountCodes: DiscountCode[] = [
    { code: 'WELCOME50', type: 'fixed', value: 50, isValid: true },
    { code: 'EARLYBIRD', type: 'percentage', value: 10, isValid: true },
    { code: 'FRIEND20', type: 'percentage', value: 20, isValid: true },
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

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Integrate with Stripe API
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentId = `pay_${Date.now()}`;
      onSuccess(paymentId);
    } catch (error) {
      onError('Payment failed. Please try again.');
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
          
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'full' | 'installments')}
            >
              <FormControlLabel
                value="full"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Box>
                      <Typography variant="body1">Pay in Full</Typography>
                      <Typography variant="body2" color="text.secondary">
                        One-time payment
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary.main">
                      €{finalPrice}
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', mb: 2 }}
              />
              
              <FormControlLabel
                value="installments"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Box>
                      <Typography variant="body1">Pay in Installments</Typography>
                      <Typography variant="body2" color="text.secondary">
                        2 payments of €{installmentAmount}
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary.main">
                      €{finalPrice}
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%' }}
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
              margin="normal"
              required
              disabled={loading}
            />
            
            <TextField
              fullWidth
              label="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              margin="normal"
              required
              disabled={loading}
              inputProps={{ maxLength: 19 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Expiry Date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                required
                disabled={loading}
                inputProps={{ maxLength: 5 }}
                sx={{ flex: 1 }}
              />
              
              <TextField
                label="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                required
                disabled={loading}
                inputProps={{ maxLength: 4 }}
                sx={{ flex: 1 }}
              />
            </Box>
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CreditCard />}
              sx={{ mt: 3 }}
            >
              {loading ? 'Processing...' : `Pay €${finalPrice}`}
            </Button>
          </form>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Your payment is secure and encrypted. You can cancel your subscription at any time.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentForm; 