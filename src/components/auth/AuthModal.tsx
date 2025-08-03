import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Box,
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
    setError('');
    setLoading(true);

    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithFacebook();
      }
      hideAuthModal();
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
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
            size="small"
            startIcon={<Facebook />}
            onClick={() => handleSocialSignIn('facebook')}
            disabled={loading}
            sx={{ py: 0.75 }}
          >
            Continue with Facebook
          </Button>
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