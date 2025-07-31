import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Google, Facebook } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { signUp, signIn, signInWithGoogle, signInWithFacebook } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setError('');
    setLoading(true);

    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithFacebook();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: 'calc(100vh - 140px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 4,
            alignItems: 'center',
          }}
        >
          {/* Hero Section */}
          <Box sx={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 2,
              }}
            >
              The Reverse Aging Challenge
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              paragraph
              sx={{ mb: 3 }}
            >
              Transform your health and vitality through our comprehensive 7-week program
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              Join thousands of students who have already transformed their lives through 
              our evidence-based approach to health and wellness.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" color="primary.main">
                €499
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                or 2 installments of €249.50
              </Typography>
            </Box>
          </Box>

          {/* Auth Form */}
          <Card sx={{ minWidth: 350, maxWidth: 400, width: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom align="center">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {isSignUp && (
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    margin="normal"
                    required
                    disabled={loading}
                  />
                )}
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </form>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  onClick={() => handleSocialSignIn('google')}
                  disabled={loading}
                >
                  Continue with Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Facebook />}
                  onClick={() => handleSocialSignIn('facebook')}
                  disabled={loading}
                >
                  Continue with Facebook
                </Button>
              </Box>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <Button
                    onClick={() => setIsSignUp(!isSignUp)}
                    sx={{ ml: 1 }}
                    disabled={loading}
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Button>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default LandingPage; 