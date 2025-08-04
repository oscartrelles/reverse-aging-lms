import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Google, Facebook } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';

const AuthModal: React.FC = () => {
  const { isOpen, mode, title, description, hideAuthModal } = useAuthModal();
  const { signUp, signIn, signInWithGoogle, signInWithFacebook, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      hideAuthModal();
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true);
      setError('');
      
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'facebook') {
        await signInWithFacebook();
      }
    } catch (error) {
      console.error(`${provider} sign-in error:`, error);
      
      // Enhanced error handling
      let errorMessage = 'Sign-in failed. Please try again.';
      
      if (provider === 'facebook') {
        if (error instanceof Error) {
          if (error.message.includes('domain') || error.message.includes('redirect')) {
            errorMessage = 'Facebook login is being configured. Please try again in a few minutes or use Google sign-in.';
          } else if (error.message.includes('popup')) {
            errorMessage = 'Please allow popups for this site to sign in with Facebook.';
          } else {
            errorMessage = `Facebook sign-in error: ${error.message}`;
          }
        }
      } else if (provider === 'google') {
        if (error instanceof Error) {
          errorMessage = `Google sign-in error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <Dialog
      open={isOpen}
      onClose={hideAuthModal}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          maxWidth: '400px',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
          {title || (isSignUp ? 'Create Your Account' : 'Welcome back!')}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        ) : isSignUp && !title ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create a free account to access weekly evidence reports on healthspan and other exclusive content.
          </Typography>
        ) : null}
      </DialogTitle>

      <DialogContent sx={{ pb: 1, pt: 1 }}>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="dense"
              size="small"
              required
              disabled={loading}
              sx={{ mb: 1 }}
            />
          )}
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="dense"
            size="small"
            required
            disabled={loading}
            sx={{ mb: 1 }}
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="dense"
            size="small"
            required
            disabled={loading}
            sx={{ mb: 1 }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="medium"
            disabled={loading}
            sx={{ mt: 2, mb: 1, py: 1 }}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </Button>
          
          {/* Forgot Password link - only show on sign in */}
          {!isSignUp && (
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                onClick={() => {
                  // For now, just show a message. In the future, this could open a password reset flow
                  setError('Password reset functionality is coming soon. Please contact support if you need immediate assistance.');
                }}
                sx={{ 
                  p: 0, 
                  minWidth: 'auto', 
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  color: 'text.secondary'
                }}
                disabled={loading}
              >
                Forgot Password?
              </Button>
            </Box>
          )}
        </form>

        <Divider sx={{ my: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<Google />}
            onClick={() => handleSocialSignIn('google')}
            disabled={loading}
            sx={{ py: 0.75 }}
          >
            Continue with Google
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            size="large"
            disabled={loading}
            startIcon={<Facebook />}
            onClick={() => handleSocialSignIn('facebook')}
            sx={{
              mb: 2,
              borderColor: '#1877f2',
              color: '#1877f2',
              '&:hover': {
                borderColor: '#166fe5',
                backgroundColor: 'rgba(24, 119, 242, 0.04)',
              },
            }}
          >
            Continue with Facebook
          </Button>
          
          {/* Temporary notice for Facebook configuration */}
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              color: 'text.secondary',
              fontStyle: 'italic',
              mb: 2
            }}
          >
            Facebook login is being configured. If you encounter issues, please use Google sign-in.
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <Button
              onClick={toggleMode}
              sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
              disabled={loading}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Button>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={hideAuthModal}
          disabled={loading}
          sx={{ width: '100%' }}
        >
          Continue Browsing
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthModal; 