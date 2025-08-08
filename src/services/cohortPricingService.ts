import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Cohort, CohortCoupon } from '../types';
import { courseManagementService } from './courseManagementService';

export interface PricingResult {
  originalPrice: number;
  finalPrice: number;
  discount: number;
  appliedCoupon?: CohortCoupon;
  appliedEarlyBird?: boolean;
  error?: string;
  currency: string;
  isFree: boolean;
}

export interface CouponValidationResult {
  isValid: boolean;
  message: string;
  coupon?: CohortCoupon;
}

export const cohortPricingService = {
  /**
   * Get cohort pricing information including applied discounts
   */
  async getCohortPricing(cohortId: string, couponCode?: string): Promise<PricingResult> {
    try {
      const cohortDoc = await getDoc(doc(db, 'cohorts', cohortId));
      if (!cohortDoc.exists()) {
        throw new Error('Cohort not found');
      }

      const cohort = { id: cohortDoc.id, ...cohortDoc.data() } as Cohort;
      const pricingResult = courseManagementService.calculateCohortPrice(cohort, couponCode);

      return {
        ...pricingResult,
        currency: cohort.pricing.currency,
        isFree: cohort.pricing.isFree,
      };
    } catch (error) {
      console.error('Error getting cohort pricing:', error);
      throw error;
    }
  },

  /**
   * Validate a coupon code for a specific cohort
   */
  async validateCoupon(cohortId: string, couponCode: string): Promise<CouponValidationResult> {
    try {
      const cohortDoc = await getDoc(doc(db, 'cohorts', cohortId));
      if (!cohortDoc.exists()) {
        return { isValid: false, message: 'Cohort not found' };
      }

      const cohort = { id: cohortDoc.id, ...cohortDoc.data() } as Cohort;
      const now = new Date();
      
      const coupon = cohort.coupons.find(c => 
        c.code.toLowerCase() === couponCode.toLowerCase() && 
        c.isActive &&
        c.validFrom.toDate() <= now &&
        c.validUntil.toDate() > now &&
        c.currentUses < c.maxUses
      );

      if (!coupon) {
        return { isValid: false, message: 'Invalid or expired coupon code' };
      }

      // Check minimum amount requirement if specified
      const basePrice = cohort.pricing.specialOffer && cohort.pricing.specialOffer > 0 
        ? cohort.pricing.specialOffer 
        : cohort.pricing.basePrice;

      if (coupon.minAmount && basePrice < coupon.minAmount) {
        return { 
          isValid: false, 
          message: `Minimum purchase amount of ${coupon.minAmount} ${cohort.pricing.currency} required for this coupon` 
        };
      }

      return { 
        isValid: true, 
        message: 'Coupon is valid',
        coupon 
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { isValid: false, message: 'Error validating coupon' };
    }
  },

  /**
   * Create a checkout session with cohort pricing
   */
  async createCheckoutSession(cohortId: string, courseTitle: string, courseId: string, couponCode?: string) {
    try {
      const pricingResult = await this.getCohortPricing(cohortId, couponCode);
      
      if (pricingResult.error) {
        throw new Error(pricingResult.error);
      }

      if (pricingResult.isFree || pricingResult.finalPrice === 0) {
        // Handle free enrollment separately
        return { 
          isFree: true, 
          price: 0,
          checkoutUrl: null,
          pricingResult
        };
      }

      // Import stripe service dynamically to avoid circular dependencies
      const { createCheckoutSession } = await import('./stripeService');
      
      const checkoutUrl = await createCheckoutSession(
        pricingResult.finalPrice,
        courseId,
        courseTitle,
        cohortId
      );

      return {
        isFree: false,
        price: pricingResult.finalPrice,
        checkoutUrl,
        pricingResult
      };
    } catch (error) {
      console.error('Error creating checkout session with cohort pricing:', error);
      throw error;
    }
  },

  /**
   * Apply coupon during payment process
   */
  async applyCouponToPayment(cohortId: string, couponCode: string): Promise<{ success: boolean; message: string }> {
    try {
      return await courseManagementService.applyCoupon(cohortId, couponCode);
    } catch (error) {
      console.error('Error applying coupon to payment:', error);
      return { success: false, message: 'Error applying coupon' };
    }
  },

  /**
   * Get display-friendly pricing information for UI
   */
  async getPricingDisplay(cohortId: string): Promise<{
    basePrice: number;
    specialOffer?: number;
    currency: string;
    isFree: boolean;
    tier: string;
    earlyBirdDiscount?: {
      amount: number;
      type: 'percentage' | 'fixed';
      validUntil: Date;
    };
    availableCoupons: number;
  }> {
    try {
      const cohortDoc = await getDoc(doc(db, 'cohorts', cohortId));
      if (!cohortDoc.exists()) {
        throw new Error('Cohort not found');
      }

      const cohort = { id: cohortDoc.id, ...cohortDoc.data() } as Cohort;
      const now = new Date();
      
      // Count available (active) coupons
      const availableCoupons = cohort.coupons.filter(c => 
        c.isActive &&
        c.validFrom.toDate() <= now &&
        c.validUntil.toDate() > now &&
        c.currentUses < c.maxUses
      ).length;

      return {
        basePrice: cohort.pricing.basePrice,
        specialOffer: cohort.pricing.specialOffer,
        currency: cohort.pricing.currency,
        isFree: cohort.pricing.isFree,
        tier: cohort.pricing.tier,
        earlyBirdDiscount: cohort.pricing.earlyBirdDiscount ? {
          amount: cohort.pricing.earlyBirdDiscount.amount,
          type: cohort.pricing.earlyBirdDiscount.type,
          validUntil: cohort.pricing.earlyBirdDiscount.validUntil.toDate()
        } : undefined,
        availableCoupons
      };
    } catch (error) {
      console.error('Error getting pricing display:', error);
      throw error;
    }
  }
};
