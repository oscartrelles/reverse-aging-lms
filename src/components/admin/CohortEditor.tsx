import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, AttachMoney } from '@mui/icons-material';
import { Cohort, Course, CohortPricing, CohortCoupon } from '../../types';
import { courseManagementService } from '../../services/courseManagementService';
import { db } from '../../firebaseConfig';

// Form-specific types for date handling
interface FormCohortPricing {
  basePrice: number;
  currency: string;
  specialOffer?: number;
  isFree: boolean;
  tier: 'basic' | 'premium' | 'vip';
  earlyBirdDiscount?: {
    amount: number;
    type: 'percentage' | 'fixed';
    validUntil: string; // Form uses string dates
  };
}

interface FormCohortCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  validFrom: string; // Form uses string dates
  validUntil: string; // Form uses string dates
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  description?: string;
  minAmount?: number;
}

interface CohortEditorProps {
  cohortId?: string;
  courseId: string;
  cohortData?: Cohort | null;
  onSave: (cohortData: any) => Promise<void>;
  onCancel: () => void;
}

const CohortEditor: React.FC<CohortEditorProps> = ({
  cohortId,
  courseId,
  cohortData,
  onSave,
  onCancel,
}) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: cohortData?.name || '',
    description: cohortData?.description || '',
    startDate: cohortData?.startDate ? cohortData.startDate.toDate().toISOString().split('T')[0] : '',
    endDate: cohortData?.endDate ? cohortData.endDate.toDate().toISOString().split('T')[0] : '',
    maxStudents: cohortData?.maxStudents || 50,
    currentStudents: cohortData?.currentStudents || 0,
    status: cohortData?.status || 'upcoming',
    isActive: cohortData?.isActive || false,
    enrollmentDeadline: cohortData?.enrollmentDeadline ? cohortData.enrollmentDeadline.toDate().toISOString().split('T')[0] : '',
    // Pricing fields
    pricing: {
      basePrice: cohortData?.pricing?.basePrice || 0,
      currency: cohortData?.pricing?.currency || 'EUR',
      specialOffer: cohortData?.pricing?.specialOffer || 0,
      isFree: cohortData?.pricing?.isFree || false,
      tier: cohortData?.pricing?.tier || 'basic',
      earlyBirdDiscount: cohortData?.pricing?.earlyBirdDiscount ? {
        amount: cohortData.pricing.earlyBirdDiscount.amount,
        type: cohortData.pricing.earlyBirdDiscount.type,
        validUntil: cohortData.pricing.earlyBirdDiscount.validUntil.toDate().toISOString().split('T')[0]
      } : null
    } as FormCohortPricing,
    coupons: cohortData?.coupons?.map(coupon => ({
      ...coupon,
      validFrom: coupon.validFrom.toDate().toISOString().split('T')[0],
      validUntil: coupon.validUntil.toDate().toISOString().split('T')[0]
    })) || [] as FormCohortCoupon[]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch course data to get duration
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await courseManagementService.getCourse(courseId);
        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };
    
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Update current students count from enrollments for existing cohorts
  useEffect(() => {
    const updateCurrentStudents = async () => {
      if (!cohortId) return; // Only for existing cohorts
      
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('cohortId', '==', cohortId)
        );
        
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const currentStudents = enrollmentsSnapshot.docs.length;
        
        setFormData(prev => ({
          ...prev,
          currentStudents
        }));
      } catch (error) {
        console.error('Error fetching current students:', error);
      }
    };
    
    updateCurrentStudents();
  }, [cohortId]);

  // Auto-calculate endDate when startDate changes
  useEffect(() => {
    if (formData.startDate && course?.duration && !cohortId) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (course.duration * 7)); // Add weeks
      
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.startDate, course?.duration, cohortId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePricingChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value,
      }
    }));
  };

  const handleEarlyBirdChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        earlyBirdDiscount: prev.pricing.earlyBirdDiscount ? {
          ...prev.pricing.earlyBirdDiscount,
          [field]: value,
        } : {
          amount: field === 'amount' ? value : 0,
          type: field === 'type' ? value : 'percentage',
          validUntil: field === 'validUntil' ? value : ''
        }
      }
    }));
  };

  const toggleEarlyBird = () => {
    setFormData(prev => {
      const newPricing = { ...prev.pricing };
      
      if (prev.pricing.earlyBirdDiscount) {
        // Remove the earlyBirdDiscount field entirely when toggling off
        delete newPricing.earlyBirdDiscount;
      } else {
        // Add early bird discount when toggling on
        newPricing.earlyBirdDiscount = {
          amount: 10,
          type: 'percentage' as const,
          validUntil: ''
        };
      }
      
      return {
        ...prev,
        pricing: newPricing
      };
    });
  };

  const addCoupon = () => {
    const newCoupon: FormCohortCoupon = {
      code: '',
      type: 'percentage' as const,
      value: 0,
      validFrom: '',
      validUntil: '',
      maxUses: 100,
      currentUses: 0,
      isActive: true,
      description: '',
      minAmount: 0
    };
    
    setFormData(prev => ({
      ...prev,
      coupons: [...prev.coupons, newCoupon]
    }));
  };

  const removeCoupon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coupons: prev.coupons.filter((_, i) => i !== index)
    }));
  };

  const updateCoupon = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      coupons: prev.coupons.map((coupon, i) => 
        i === index ? { ...coupon, [field]: value } : coupon
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Cohort name is required');
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }

    if (!formData.endDate) {
      setError('End date is required');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    if (formData.maxStudents <= 0) {
      setError('Maximum students must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create dates in local timezone to avoid timezone conversion issues
      const createLocalDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed
      };

      // Process pricing with early bird discount
      const processedPricing: any = {
        ...formData.pricing,
        earlyBirdDiscount: formData.pricing.earlyBirdDiscount && formData.pricing.earlyBirdDiscount.validUntil ? {
          ...formData.pricing.earlyBirdDiscount,
          validUntil: createLocalDate(formData.pricing.earlyBirdDiscount.validUntil)
        } : null
      };
      
      // Remove earlyBirdDiscount field if it's null to avoid Firestore errors
      if (processedPricing.earlyBirdDiscount === null || !processedPricing.earlyBirdDiscount.validUntil) {
        delete processedPricing.earlyBirdDiscount;
      }

      // Process coupons with date conversion
      const processedCoupons = formData.coupons
        .filter(coupon => coupon.code.trim()) // Only include coupons with codes
        .map(coupon => ({
          ...coupon,
          validFrom: createLocalDate(coupon.validFrom),
          validUntil: createLocalDate(coupon.validUntil),
        }));

      const cohortDataToSave = {
        ...formData,
        courseId,
        startDate: createLocalDate(formData.startDate),
        endDate: createLocalDate(formData.endDate),
        enrollmentDeadline: formData.enrollmentDeadline ? createLocalDate(formData.enrollmentDeadline) : null,
        pricing: processedPricing,
        coupons: processedCoupons,
      };

      await onSave(cohortDataToSave);
    } catch (error) {
      console.error('Error saving cohort:', error);
      setError('Failed to save cohort');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <TextField
            fullWidth
            label="Cohort Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            placeholder="Enter cohort name"
          />
        </Box>

        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            multiline
            rows={3}
            placeholder="Enter cohort description"
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            required
            disabled={!cohortId && !!course?.duration} // Auto-calculated for new cohorts
            InputLabelProps={{
              shrink: true,
            }}
            helperText={!cohortId && course?.duration ? `Auto-calculated based on ${course.duration} week course duration` : ""}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Enrollment Deadline"
            type="date"
            value={formData.enrollmentDeadline}
            onChange={(e) => handleInputChange('enrollmentDeadline', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Optional: Set enrollment deadline"
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Maximum Students"
            type="number"
            value={formData.maxStudents}
            onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 50)}
            inputProps={{ min: 1 }}
            required
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Current Students"
            type="number"
            value={formData.currentStudents}
            inputProps={{ min: 0, readOnly: true }}
            disabled={true} // Always read-only - updated automatically from enrollments
            helperText="Updated automatically from student enrollments"
          />
        </Box>

        <Box>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
              />
            }
            label="Active Cohort"
          />
        </Box>
      </Box>

      {/* Pricing Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney color="primary" />
            Pricing Configuration
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.pricing.isFree}
                  onChange={(e) => handlePricingChange('isFree', e.target.checked)}
                />
              }
              label="Free Cohort"
            />
            
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.pricing.currency}
                onChange={(e) => handlePricingChange('currency', e.target.value)}
                label="Currency"
              >
                <MenuItem value="EUR">EUR (€)</MenuItem>
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="GBP">GBP (£)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Tier</InputLabel>
              <Select
                value={formData.pricing.tier}
                onChange={(e) => handlePricingChange('tier', e.target.value)}
                label="Tier"
              >
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="vip">VIP</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {!formData.pricing.isFree && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Base Price"
                type="number"
                value={formData.pricing.basePrice}
                onChange={(e) => handlePricingChange('basePrice', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: formData.pricing.currency === 'EUR' ? '€' : formData.pricing.currency === 'USD' ? '$' : '£'
                }}
              />
              
              <TextField
                fullWidth
                label="Special Offer Price (Optional)"
                type="number"
                value={formData.pricing.specialOffer || ''}
                onChange={(e) => handlePricingChange('specialOffer', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: formData.pricing.currency === 'EUR' ? '€' : formData.pricing.currency === 'USD' ? '$' : '£'
                }}
                helperText="Leave 0 or empty for no special offer"
              />
            </Box>
          )}

          {/* Early Bird Discount */}
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!formData.pricing.earlyBirdDiscount}
                  onChange={toggleEarlyBird}
                />
              }
              label="Enable Early Bird Discount"
            />
            
            {formData.pricing.earlyBirdDiscount && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label="Discount Amount"
                  type="number"
                  value={formData.pricing.earlyBirdDiscount.amount}
                  onChange={(e) => handleEarlyBirdChange('amount', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    value={formData.pricing.earlyBirdDiscount.type}
                    onChange={(e) => handleEarlyBirdChange('type', e.target.value)}
                    label="Discount Type"
                  >
                    <MenuItem value="percentage">Percentage (%)</MenuItem>
                    <MenuItem value="fixed">Fixed Amount</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Valid Until"
                  type="date"
                  value={formData.pricing.earlyBirdDiscount.validUntil}
                  onChange={(e) => handleEarlyBirdChange('validUntil', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Coupons Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Coupons</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addCoupon}
              variant="outlined"
              size="small"
            >
              Add Coupon
            </Button>
          </Box>
          
          {formData.coupons.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No coupons added yet. Click "Add Coupon" to create one.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {formData.coupons.map((coupon, index) => (
                <Card key={index} variant="outlined">
                  <CardContent sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip 
                        label={`Coupon #${index + 1}`} 
                        size="small" 
                        color="primary" 
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeCoupon(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Coupon Code"
                        value={coupon.code}
                        onChange={(e) => updateCoupon(index, 'code', e.target.value.toUpperCase())}
                        placeholder="SAVE10"
                        required
                      />
                      
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={coupon.type}
                          onChange={(e) => updateCoupon(index, 'type', e.target.value)}
                          label="Type"
                        >
                          <MenuItem value="percentage">Percentage</MenuItem>
                          <MenuItem value="fixed">Fixed Amount</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <TextField
                        fullWidth
                        label={coupon.type === 'percentage' ? 'Percentage (%)' : 'Amount'}
                        type="number"
                        value={coupon.value}
                        onChange={(e) => updateCoupon(index, 'value', parseFloat(e.target.value) || 0)}
                        inputProps={{ min: 0 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Valid From"
                        type="date"
                        value={coupon.validFrom}
                        onChange={(e) => updateCoupon(index, 'validFrom', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                      
                      <TextField
                        fullWidth
                        label="Valid Until"
                        type="date"
                        value={coupon.validUntil}
                        onChange={(e) => updateCoupon(index, 'validUntil', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Max Uses"
                        type="number"
                        value={coupon.maxUses}
                        onChange={(e) => updateCoupon(index, 'maxUses', parseInt(e.target.value) || 0)}
                        inputProps={{ min: 1 }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Min Purchase Amount"
                        type="number"
                        value={coupon.minAmount || ''}
                        onChange={(e) => updateCoupon(index, 'minAmount', parseFloat(e.target.value) || 0)}
                        inputProps={{ min: 0, step: 0.01 }}
                        helperText="Optional minimum"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={coupon.isActive}
                            onChange={(e) => updateCoupon(index, 'isActive', e.target.checked)}
                          />
                        }
                        label="Active"
                      />
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="Description (Optional)"
                      value={coupon.description || ''}
                      onChange={(e) => updateCoupon(index, 'description', e.target.value)}
                      sx={{ mt: 2 }}
                      placeholder="Brief description of this coupon"
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {cohortId ? 'Update Cohort' : 'Create Cohort'}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default CohortEditor; 