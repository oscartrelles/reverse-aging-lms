import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  People,
  Science,
  Timeline,
  Assessment,
  Refresh,
  Visibility,
  TrendingDown,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCourse } from '../../contexts/CourseContext';
import { cohortAnalysisService, CohortAnalysisResult } from '../../services/cohortAnalysisService';
import { abTestingService, ExperimentResult } from '../../services/abTestingService';
import { realTimeAnalyticsService, RealTimeMetrics } from '../../services/realTimeAnalyticsService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentEnrollment, currentCohort } = useCourse();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Real-time metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [realTimeLoading, setRealTimeLoading] = useState(true);
  const [realTimeError, setRealTimeError] = useState<string | null>(null);
  
  // Cohort analysis
  const [cohortResults, setCohortResults] = useState<CohortAnalysisResult[]>([]);
  const [cohortLoading, setCohortLoading] = useState(false);
  const [cohortError, setCohortError] = useState<string | null>(null);
  
  // A/B testing
  const [experimentResults, setExperimentResults] = useState<ExperimentResult[]>([]);
  const [experimentLoading, setExperimentLoading] = useState(false);
  const [experimentError, setExperimentError] = useState<string | null>(null);

  // Load real-time metrics
  useEffect(() => {
    const loadRealTimeMetrics = async () => {
      try {
        setRealTimeLoading(true);
        setRealTimeError(null);
        const metrics = await realTimeAnalyticsService.getRealTimeMetrics();
        setRealTimeMetrics(metrics);
      } catch (error) {
        console.error('Error loading real-time metrics:', error);
        if (error instanceof Error && (error.message.includes('permission') || error.message.includes('index'))) {
          setRealTimeError('Analytics data not available - using demo data');
        } else {
          setRealTimeError('Failed to load real-time metrics');
        }
      } finally {
        setRealTimeLoading(false);
      }
    };

    loadRealTimeMetrics();
    
    // Subscribe to real-time updates
    const unsubscribe = realTimeAnalyticsService.subscribeToRealTimeUpdates((metrics) => {
      setRealTimeMetrics(metrics);
    });

    return unsubscribe;
  }, []);

  // Load cohort analysis
  const loadCohortAnalysis = async () => {
    if (!currentCohort?.id) return;
    
    try {
      setCohortLoading(true);
      setCohortError(null);
      const result = await cohortAnalysisService.getCohortAnalysis(currentCohort.id);
      setCohortResults([result]);
    } catch (error) {
      console.error('Error loading cohort analysis:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        setCohortError('Cohort data not available - using demo data');
      } else {
        setCohortError('Failed to load cohort analysis');
      }
    } finally {
      setCohortLoading(false);
    }
  };

  // Load A/B testing results
  const loadExperimentResults = async () => {
    try {
      setExperimentLoading(true);
      // For demo purposes, we'll create a mock experiment result
      const mockResult: ExperimentResult = {
        experimentId: 'demo-experiment',
        experimentName: 'Landing Page CTA Test',
        variantResults: {
          control: {
            name: 'Control (Green Button)',
            users: 150,
            conversions: 15,
            conversionRate: 10.0,
            avgValue: 99.99,
            totalValue: 1499.85,
            confidence: 95.2,
            isWinner: false,
          },
          variantA: {
            name: 'Variant A (Blue Button)',
            users: 148,
            conversions: 18,
            conversionRate: 12.2,
            avgValue: 99.99,
            totalValue: 1799.82,
            confidence: 96.1,
            isWinner: true,
          },
        },
        statisticalSignificance: 96.1,
        recommendedVariant: 'variantA',
        insights: [
          'Variant A shows 22% improvement in conversion rate',
          'Statistical significance: 96.1% confidence',
          'Recommended to implement Variant A',
        ],
        createdAt: new Date() as any,
      };
      
      setExperimentResults([mockResult]);
    } catch (error) {
      console.error('Error loading experiment results:', error);
    } finally {
      setExperimentLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (value: number, threshold: number) => {
    return value >= threshold ? 'success' : 'warning';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Analytics />
        Advanced Analytics Dashboard
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This dashboard provides comprehensive analytics including real-time metrics, cohort analysis, and A/B testing results.
      </Alert>

      {/* Error Alerts */}
      {realTimeError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setRealTimeError(null)}>
          {realTimeError}
        </Alert>
      )}
      
      {cohortError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setCohortError(null)}>
          {cohortError}
        </Alert>
      )}
      
      {experimentError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setExperimentError(null)}>
          {experimentError}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Real-Time Metrics" icon={<Timeline />} />
          <Tab label="Cohort Analysis" icon={<People />} />
          <Tab label="A/B Testing" icon={<Science />} />
        </Tabs>
      </Box>

      {/* Real-Time Metrics Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
          {/* Key Metrics */}
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4">
                {realTimeLoading ? <CircularProgress size={24} /> : realTimeMetrics?.activeUsers || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last 5 minutes
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Revenue
              </Typography>
              <Typography variant="h4">
                {realTimeLoading ? <CircularProgress size={24} /> : formatCurrency(realTimeMetrics?.revenueMetrics.todayRevenue || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {realTimeMetrics?.revenueMetrics.todayConversions || 0} conversions
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Order Value
              </Typography>
              <Typography variant="h4">
                {realTimeLoading ? <CircularProgress size={24} /> : formatCurrency(realTimeMetrics?.revenueMetrics.avgOrderValue || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Per conversion
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Top Pages
              </Typography>
              <Typography variant="h4">
                {realTimeLoading ? <CircularProgress size={24} /> : realTimeMetrics?.topPages.length || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active pages
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Conversion Funnel */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conversion Funnel
              </Typography>
              {realTimeMetrics?.conversionFunnel.map((step, index) => (
                <Box key={step.step} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{step.step}</Typography>
                    <Typography variant="body2">{step.users} users</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={step.conversionRate} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {step.conversionRate.toFixed(1)}% conversion rate
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Top Performing Products */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Products
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Conversions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {realTimeMetrics?.revenueMetrics.topPerformingProducts.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                        <TableCell align="right">{product.conversions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      {/* Cohort Analysis Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={loadCohortAnalysis}
            disabled={cohortLoading || !currentCohort}
            startIcon={cohortLoading ? <CircularProgress size={20} /> : <Assessment />}
          >
            {cohortLoading ? 'Loading...' : 'Load Cohort Analysis'}
          </Button>
        </Box>

        {cohortResults.map((result) => (
          <Card key={result.cohortId} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {result.cohortName} - {result.period}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography color="textSecondary">Total Users</Typography>
                  <Typography variant="h4">{result.totalUsers}</Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary">Active Users</Typography>
                  <Typography variant="h4">{result.activeUsers}</Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary">Retention Rate</Typography>
                  <Typography variant="h4">{result.retentionRate}%</Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary">Engagement Score</Typography>
                  <Typography variant="h4">{result.engagementScore}/100</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              {result.recommendations.map((recommendation, index) => (
                <Alert key={index} severity="info" sx={{ mb: 1 }}>
                  {recommendation}
                </Alert>
              ))}
            </CardContent>
          </Card>
        ))}
      </TabPanel>

      {/* A/B Testing Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={loadExperimentResults}
            disabled={experimentLoading}
            startIcon={experimentLoading ? <CircularProgress size={20} /> : <Science />}
          >
            {experimentLoading ? 'Loading...' : 'Load Experiment Results'}
          </Button>
        </Box>

        {experimentResults.map((result) => (
          <Card key={result.experimentId} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {result.experimentName}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={`${result.statisticalSignificance}% Confidence`}
                  color={result.statisticalSignificance > 95 ? 'success' : 'warning'}
                  icon={result.statisticalSignificance > 95 ? <CheckCircle /> : <Warning />}
                />
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Variant</TableCell>
                      <TableCell align="right">Users</TableCell>
                      <TableCell align="right">Conversions</TableCell>
                      <TableCell align="right">Conversion Rate</TableCell>
                      <TableCell align="right">Avg Value</TableCell>
                      <TableCell align="right">Confidence</TableCell>
                      <TableCell align="center">Winner</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(result.variantResults).map(([variantId, variant]) => (
                      <TableRow key={variantId}>
                        <TableCell>{variant.name}</TableCell>
                        <TableCell align="right">{variant.users}</TableCell>
                        <TableCell align="right">{variant.conversions}</TableCell>
                        <TableCell align="right">{variant.conversionRate}%</TableCell>
                        <TableCell align="right">{formatCurrency(variant.avgValue)}</TableCell>
                        <TableCell align="right">{variant.confidence}%</TableCell>
                        <TableCell align="center">
                          {variant.isWinner && <CheckCircle color="success" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Insights
              </Typography>
              {result.insights.map((insight, index) => (
                <Alert key={index} severity="info" sx={{ mb: 1 }}>
                  {insight}
                </Alert>
              ))}
            </CardContent>
          </Card>
        ))}
      </TabPanel>
    </Box>
  );
}; 