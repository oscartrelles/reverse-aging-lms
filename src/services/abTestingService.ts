import { collection, query, where, getDocs, orderBy, Timestamp, addDoc, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { analyticsEvents } from './analyticsService';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: Timestamp;
  endDate?: Timestamp;
  variants: ExperimentVariant[];
  targetAudience: {
    userTypes: string[];
    enrollmentStatus: string[];
    geographicRegions?: string[];
  };
  metrics: {
    primary: string;
    secondary: string[];
  };
  trafficSplit: {
    control: number; // percentage
    variantA: number; // percentage
    variantB?: number; // percentage
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  type: 'control' | 'variant';
  configuration: Record<string, any>;
  isActive: boolean;
}

export interface UserExperiment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: Timestamp;
  isActive: boolean;
  events: ExperimentEvent[];
}

export interface ExperimentEvent {
  eventType: string;
  timestamp: Timestamp;
  data: Record<string, any>;
  conversionValue?: number;
}

export interface ExperimentResult {
  experimentId: string;
  experimentName: string;
  variantResults: {
    [variantId: string]: {
      name: string;
      users: number;
      conversions: number;
      conversionRate: number;
      avgValue: number;
      totalValue: number;
      confidence: number;
      isWinner: boolean;
    };
  };
  statisticalSignificance: number;
  recommendedVariant: string;
  insights: string[];
  createdAt: Timestamp;
}

export const abTestingService = {
  // Create a new experiment
  async createExperiment(experimentData: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const experimentRef = await addDoc(collection(db, 'experiments'), {
        ...experimentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log(`✅ Created experiment: ${experimentData.name}`);
      return experimentRef.id;
    } catch (error) {
      console.error('❌ Error creating experiment:', error);
      throw error;
    }
  },

  // Get active experiments for a user
  async getUserExperiments(userId: string, userContext: {
    userType: string;
    enrollmentStatus: string;
    geographicRegion?: string;
  }): Promise<Experiment[]> {
    try {
      const activeExperimentsQuery = query(
        collection(db, 'experiments'),
        where('status', '==', 'active'),
        where('startDate', '<=', Timestamp.now())
      );
      
      const snapshot = await getDocs(activeExperimentsQuery);
      const experiments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Experiment[];
      
      // Filter experiments based on target audience
      return experiments.filter(experiment => {
        const { targetAudience } = experiment;
        
        // Check user type
        if (targetAudience.userTypes.length > 0 && 
            !targetAudience.userTypes.includes(userContext.userType)) {
          return false;
        }
        
        // Check enrollment status
        if (targetAudience.enrollmentStatus.length > 0 && 
            !targetAudience.enrollmentStatus.includes(userContext.enrollmentStatus)) {
          return false;
        }
        
        // Check geographic region
        if (targetAudience.geographicRegions && 
            targetAudience.geographicRegions.length > 0 && 
            userContext.geographicRegion &&
            !targetAudience.geographicRegions.includes(userContext.geographicRegion)) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error('❌ Error getting user experiments:', error);
      throw error;
    }
  },

  // Assign user to experiment variant
  async assignUserToVariant(userId: string, experimentId: string): Promise<string> {
    try {
      // Check if user is already assigned
      const existingAssignmentQuery = query(
        collection(db, 'userExperiments'),
        where('userId', '==', userId),
        where('experimentId', '==', experimentId),
        where('isActive', '==', true)
      );
      
      const existingSnapshot = await getDocs(existingAssignmentQuery);
      if (!existingSnapshot.empty) {
        return existingSnapshot.docs[0].data().variantId;
      }
      
      // Get experiment details
      const experimentDoc = await getDoc(doc(db, 'experiments', experimentId));
      if (!experimentDoc.exists()) {
        throw new Error('Experiment not found');
      }
      
      const experiment = experimentDoc.data() as Experiment;
      
      // Determine variant based on traffic split
      const random = Math.random() * 100;
      let cumulativePercentage = 0;
      let selectedVariantId = '';
      
      for (const variant of experiment.variants) {
        const variantPercentage = experiment.trafficSplit[variant.id as keyof typeof experiment.trafficSplit] || 0;
        cumulativePercentage += variantPercentage;
        
        if (random <= cumulativePercentage) {
          selectedVariantId = variant.id;
          break;
        }
      }
      
      // If no variant selected, default to control
      if (!selectedVariantId) {
        selectedVariantId = experiment.variants.find(v => v.type === 'control')?.id || '';
      }
      
      // Create user experiment assignment
      await addDoc(collection(db, 'userExperiments'), {
        userId,
        experimentId,
        variantId: selectedVariantId,
        assignedAt: Timestamp.now(),
        isActive: true,
        events: [],
      });
      
      // Track experiment assignment
      analyticsEvents.trackEvent('experiment_assigned', {
        experiment_id: experimentId,
        experiment_name: experiment.name,
        variant_id: selectedVariantId,
        user_id: userId,
      });
      
      console.log(`✅ Assigned user ${userId} to variant ${selectedVariantId} in experiment ${experimentId}`);
      return selectedVariantId;
    } catch (error) {
      console.error('❌ Error assigning user to variant:', error);
      throw error;
    }
  },

  // Track experiment event
  async trackExperimentEvent(
    userId: string, 
    experimentId: string, 
    eventType: string, 
    eventData: Record<string, any> = {},
    conversionValue?: number
  ): Promise<void> {
    try {
      // Find user's experiment assignment
      const userExperimentQuery = query(
        collection(db, 'userExperiments'),
        where('userId', '==', userId),
        where('experimentId', '==', experimentId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(userExperimentQuery);
      if (snapshot.empty) {
        return; // User not in experiment
      }
      
      const userExperimentDoc = snapshot.docs[0];
      const userExperiment = userExperimentDoc.data() as UserExperiment;
      
      // Add event to user experiment
      const newEvent: ExperimentEvent = {
        eventType,
        timestamp: Timestamp.now(),
        data: eventData,
        conversionValue,
      };
      
      await updateDoc(doc(db, 'userExperiments', userExperimentDoc.id), {
        events: [...userExperiment.events, newEvent],
      });
      
      // Track in analytics
      analyticsEvents.trackEvent('experiment_event', {
        experiment_id: experimentId,
        variant_id: userExperiment.variantId,
        event_type: eventType,
        user_id: userId,
        conversion_value: conversionValue,
        ...eventData,
      });
      
      console.log(`✅ Tracked experiment event: ${eventType} for user ${userId} in experiment ${experimentId}`);
    } catch (error) {
      console.error('❌ Error tracking experiment event:', error);
      throw error;
    }
  },

  // Get experiment results
  async getExperimentResults(experimentId: string): Promise<ExperimentResult> {
    try {
      const experimentDoc = await getDoc(doc(db, 'experiments', experimentId));
      if (!experimentDoc.exists()) {
        throw new Error('Experiment not found');
      }
      
      const experiment = experimentDoc.data() as Experiment;
      
      // Get all user experiments for this experiment
      const userExperimentsQuery = query(
        collection(db, 'userExperiments'),
        where('experimentId', '==', experimentId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(userExperimentsQuery);
      const userExperiments = snapshot.docs.map(doc => doc.data() as UserExperiment);
      
      // Calculate results for each variant
      const variantResults: ExperimentResult['variantResults'] = {};
      
      for (const variant of experiment.variants) {
        const variantUsers = userExperiments.filter(ue => ue.variantId === variant.id);
        const conversions = variantUsers.filter(ue => 
          ue.events.some(e => e.eventType === experiment.metrics.primary)
        );
        
        const conversionValue = conversions.reduce((sum, ue) => {
          const primaryEvents = ue.events.filter(e => e.eventType === experiment.metrics.primary);
          return sum + primaryEvents.reduce((eventSum, e) => eventSum + (e.conversionValue || 0), 0);
        }, 0);
        
        const conversionRate = variantUsers.length > 0 ? (conversions.length / variantUsers.length) * 100 : 0;
        const avgValue = conversions.length > 0 ? conversionValue / conversions.length : 0;
        
        variantResults[variant.id] = {
          name: variant.name,
          users: variantUsers.length,
          conversions: conversions.length,
          conversionRate: Math.round(conversionRate * 100) / 100,
          avgValue: Math.round(avgValue * 100) / 100,
          totalValue: conversionValue,
          confidence: this.calculateConfidence(variantUsers.length, conversions.length),
          isWinner: false, // Will be set after comparison
        };
      }
      
      // Determine winner and statistical significance
      const controlVariant = experiment.variants.find(v => v.type === 'control');
      const testVariants = experiment.variants.filter(v => v.type === 'variant');
      
      let winner = controlVariant?.id || '';
      let maxImprovement = 0;
      
      for (const variant of testVariants) {
        const controlResult = variantResults[controlVariant?.id || ''];
        const variantResult = variantResults[variant.id];
        
        if (controlResult && variantResult) {
          const improvement = variantResult.conversionRate - controlResult.conversionRate;
          if (improvement > maxImprovement && variantResult.confidence > 95) {
            maxImprovement = improvement;
            winner = variant.id;
          }
        }
      }
      
      // Mark winner
      if (winner) {
        variantResults[winner].isWinner = true;
      }
      
      // Generate insights
      const insights = this.generateInsights(variantResults, experiment);
      
      return {
        experimentId,
        experimentName: experiment.name,
        variantResults,
        statisticalSignificance: Math.max(...Object.values(variantResults).map(r => r.confidence)),
        recommendedVariant: winner,
        insights,
        createdAt: Timestamp.now(),
      };
    } catch (error) {
      console.error('❌ Error getting experiment results:', error);
      
      // Return fallback data if permissions are denied
      if (error instanceof Error && error.message.includes('permission')) {
        console.log('⚠️ Using fallback experiment data due to permissions');
        return {
          experimentId: 'demo-experiment',
          experimentName: 'Demo Experiment',
          variantResults: {
            control: {
              name: 'Control',
              users: 0,
              conversions: 0,
              conversionRate: 0,
              avgValue: 0,
              totalValue: 0,
              confidence: 0,
              isWinner: false,
            },
          },
          statisticalSignificance: 0,
          recommendedVariant: 'control',
          insights: ['Demo data - no real experiment data available'],
          createdAt: Timestamp.now(),
        };
      }
      
      throw error;
    }
  },

  // Calculate statistical confidence
  calculateConfidence(sampleSize: number, conversions: number): number {
    if (sampleSize === 0) return 0;
    
    const conversionRate = conversions / sampleSize;
    const standardError = Math.sqrt((conversionRate * (1 - conversionRate)) / sampleSize);
    const zScore = 1.96; // 95% confidence interval
    
    return Math.min(100, Math.round((1 - (standardError * zScore)) * 100));
  },

  // Generate insights from experiment results
  generateInsights(variantResults: ExperimentResult['variantResults'], experiment: Experiment): string[] {
    const insights: string[] = [];
    const controlVariant = experiment.variants.find(v => v.type === 'control');
    
    if (!controlVariant) return insights;
    
    const controlResult = variantResults[controlVariant.id];
    if (!controlResult) return insights;
    
    for (const [variantId, result] of Object.entries(variantResults)) {
      if (variantId === controlVariant.id) continue;
      
      const improvement = result.conversionRate - controlResult.conversionRate;
      const improvementPercent = ((improvement / controlResult.conversionRate) * 100);
      
      if (result.confidence > 95) {
        if (improvement > 0) {
          insights.push(`${result.name} shows ${improvementPercent.toFixed(1)}% improvement with ${result.confidence}% confidence`);
        } else {
          insights.push(`${result.name} shows ${Math.abs(improvementPercent).toFixed(1)}% decrease with ${result.confidence}% confidence`);
        }
      } else if (result.confidence > 80) {
        insights.push(`${result.name} shows potential improvement but needs more data (${result.confidence}% confidence)`);
      }
    }
    
    if (insights.length === 0) {
      insights.push('No statistically significant differences detected between variants');
    }
    
    return insights;
  },

  // Get user's current variant for an experiment
  async getUserVariant(userId: string, experimentId: string): Promise<string | null> {
    try {
      const userExperimentQuery = query(
        collection(db, 'userExperiments'),
        where('userId', '==', userId),
        where('experimentId', '==', experimentId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(userExperimentQuery);
      if (snapshot.empty) {
        return null;
      }
      
      return snapshot.docs[0].data().variantId;
    } catch (error) {
      console.error('❌ Error getting user variant:', error);
      return null;
    }
  },
}; 