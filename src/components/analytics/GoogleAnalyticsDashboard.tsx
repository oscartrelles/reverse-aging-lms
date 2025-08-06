import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  Switch,
} from '@mui/material';
import {
  Analytics,
  People,
  Science,
  Timeline,
  Assessment,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

import { useCourse } from '../../contexts/CourseContext';
import { cohortAnalysisService, CohortAnalysisResult } from '../../services/cohortAnalysisService';
import { ExperimentResult } from '../../services/abTestingService';
import { googleAnalyticsEmbedService, GAEmbedData } from '../../services/googleAnalyticsEmbedService';
import { businessAnalyticsService, BusinessMetrics } from '../../services/businessAnalyticsService';

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

export const GoogleAnalyticsDashboard: React.FC = () => {
  const { currentCohort } = useCourse();
  
  const [tabValue, setTabValue] = useState(0);
  
  // Google Analytics metrics
  const [gaData, setGaData] = useState<GAEmbedData | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Business metrics
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [businessLoading, setBusinessLoading] = useState(false);
  
  // Conversion funnel
  const [funnelData, setFunnelData] = useState<any>(null);
  const [funnelLoading, setFunnelLoading] = useState(false);
  
  // Cohort analysis
  const [cohortResults, setCohortResults] = useState<CohortAnalysisResult[]>([]);
  const [cohortLoading, setCohortLoading] = useState(false);
  const [cohortError, setCohortError] = useState<string | null>(null);
  
  // A/B testing
  const [experimentResults, setExperimentResults] = useState<ExperimentResult[]>([]);
  const [experimentLoading, setExperimentLoading] = useState(false);
  const [experimentError, setExperimentError] = useState<string | null>(null);
  
  // Live View toggle
  const [liveView, setLiveView] = useState(false);

  // Load Google Analytics data
  const loadAnalyticsData = async () => {
    try {
      setAnalyticsError(null);
      
      // Initialize Google Analytics Embed API
      await googleAnalyticsEmbedService.initialize();
      
      // Check if authenticated
      const authenticated = await googleAnalyticsEmbedService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        // Load real data from Google Analytics
        const data = await googleAnalyticsEmbedService.getRealTimeData();
        setGaData(data);
      }
      // If not authenticated, don't set an error - the sign-in alert will handle this
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
      if (error instanceof Error && error.message.includes('Not authenticated')) {
        // Don't set error for authentication issues - the sign-in alert handles this
      } else {
        setAnalyticsError('Failed to load analytics data');
      }
    }
  };

  // Load business metrics
  const loadBusinessMetrics = async () => {
    try {
      setBusinessLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      
      const metrics = await businessAnalyticsService.getBusinessMetrics({
        startDate,
        endDate
      });
      
      setBusinessMetrics(metrics);
    } catch (error) {
      console.error('Error loading business metrics:', error);
      setBusinessMetrics(null);
    } finally {
      setBusinessLoading(false);
    }
  };

  // Load conversion funnel
  const loadFunnelData = async () => {
    try {
      setFunnelLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      
      const funnel = await businessAnalyticsService.getFunnelData({
        startDate,
        endDate
      });
      
      setFunnelData(funnel);
    } catch (error) {
      console.error('Error loading funnel data:', error);
      setFunnelData(null);
    } finally {
      setFunnelLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
    
    // Only load business data after checking authentication
    const loadBusinessData = async () => {
      const isAuth = await googleAnalyticsEmbedService.isAuthenticated();
      if (isAuth) {
        loadBusinessMetrics();
        loadFunnelData();
      }
    };
    
    loadBusinessData();
    
    // Only set up refresh interval if live view is enabled
    let interval: NodeJS.Timeout | null = null;
    
    if (liveView) {
      interval = setInterval(() => {
        loadAnalyticsData();
        loadBusinessData();
      }, 30000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [liveView]);

  // Reload data when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      loadAnalyticsData();
      loadBusinessMetrics();
      loadFunnelData();
    }
  }, [isAuthenticated]);
  
  // Handle live view toggle changes
  useEffect(() => {
    if (liveView && isAuthenticated) {
      // When turning on live view, refresh data immediately
      loadAnalyticsData();
      loadBusinessMetrics();
      loadFunnelData();
    }
  }, [liveView]);

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

  // Safe percentage formatter to handle Infinity values
  const formatPercentage = (value: number) => {
    if (!isFinite(value)) {
      return '0.0%';
    }
    return `${value.toFixed(1)}%`;
  };



  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Analytics />
          Google Analytics Dashboard
        </Typography>
        
        {isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Live View
            </Typography>
            <Switch
              checked={liveView}
              onChange={(e) => setLiveView(e.target.checked)}
              size="small"
            />
          </Box>
        )}
      </Box>
      
      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              Sign in to Google Analytics to see real data from your GA4 property.
            </Typography>
            <Button 
              variant="contained" 
              size="small"
              sx={{ 
                minWidth: 'auto',
                px: 2,
                py: 0.5,
                fontSize: '0.875rem'
              }}
              onClick={async () => {
                try {
                  await googleAnalyticsEmbedService.signIn();
                  // Refresh data after successful sign-in
                  await loadAnalyticsData();
                } catch (error) {
                  console.error('Sign in failed:', error);
                  alert(`Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              }}
            >
              Sign in
            </Button>
          </Box>
        </Alert>
      )}

      {/* Error Alerts */}
      {analyticsError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setAnalyticsError(null)}>
          {analyticsError}
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
          <Tab label="Business Analytics" icon={<Timeline />} />
          <Tab label="Conversion Funnel" icon={<Assessment />} />
          <Tab label="Cohort Analysis" icon={<People />} />
          <Tab label="A/B Testing" icon={<Science />} />
        </Tabs>
      </Box>

      {/* Business Analytics Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
          {/* Key Business Metrics */}
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue (30 days)
              </Typography>
              <Typography variant="h4">
                {businessLoading ? <CircularProgress size={24} /> : formatCurrency(businessMetrics?.totalRevenue || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                From {businessMetrics?.courseEnrollments || 0} enrollments
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h4">
                {businessLoading ? <CircularProgress size={24} /> : `${(businessMetrics?.conversionRate || 0).toFixed(1)}%`}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Checkout to enrollment
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Order Value
              </Typography>
              <Typography variant="h4">
                {businessLoading ? <CircularProgress size={24} /> : formatCurrency(businessMetrics?.averageOrderValue || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Per enrollment
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Course Completion Rate
              </Typography>
              <Typography variant="h4">
                {businessLoading ? <CircularProgress size={24} /> : `${(businessMetrics?.courseCompletionRate || 0).toFixed(1)}%`}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Student success rate
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Page Views Chart */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Page Views Distribution
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {gaData?.topPages?.map((page, index) => (
                  <Box key={page.pagePath} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {page.pageTitle}
                      </Typography>
                      <Typography variant="body2">
                        {page.pageViews} views
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(page.pageViews / (gaData?.pageViews || 1)) * 100} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Analytics Summary */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analytics Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {gaData?.lastUpdated?.toLocaleString() || 'Never'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Data Source
                  </Typography>
                  <Typography variant="body1">
                    {isAuthenticated ? 'Google Analytics (Real)' : 'Not Connected'}
                  </Typography>
                </Box>
                {!isAuthenticated && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Sign in to Google Analytics to see real data from your GA4 property.
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      {/* Conversion Funnel Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Conversion Funnel (Last 30 Days)
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Track how visitors progress from landing page to successful enrollment
          </Typography>
        </Box>

        {funnelLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : funnelData ? (
          <Box>
            {/* Funnel Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography color="textSecondary">Total Conversion Rate</Typography>
                    <Typography variant="h4" color="primary">
                      {funnelData.totalConversionRate.toFixed(2)}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography color="textSecondary">Total Revenue</Typography>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(funnelData.totalRevenue)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Funnel Steps */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {funnelData.steps.map((step: any, index: number) => (
                <Card key={index}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {step.name}
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {step.count.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      <Box>
                        <Typography color="textSecondary">Conversion Rate</Typography>
                        <Typography variant="h6" color="success.main">
                          {formatPercentage(step.conversionRate)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography color="textSecondary">Drop-off Rate</Typography>
                        <Typography variant="h6" color="error.main">
                          {formatPercentage(step.dropoffRate)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Progress bar */}
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={isFinite(step.conversionRate) ? Math.min(step.conversionRate, 100) : 0} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: isFinite(step.conversionRate) && step.conversionRate > 50 ? 'success.main' : 
                                           isFinite(step.conversionRate) && step.conversionRate > 25 ? 'warning.main' : 'error.main'
                          }
                        }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        ) : (
          <Alert severity="info">
            No funnel data available. Please ensure you have Google Analytics connected and business data in your database.
          </Alert>
        )}
      </TabPanel>

      {/* Cohort Analysis Tab */}
      <TabPanel value={tabValue} index={2}>
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
      <TabPanel value={tabValue} index={3}>
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