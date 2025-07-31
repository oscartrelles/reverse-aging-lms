import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface EmailSignInProps {
  onSuccess?: () => void;
}

const EmailSignIn: React.FC<EmailSignInProps> = ({ onSuccess }) => {
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
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
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
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

      <Box sx={{ textAlign: 'center' }}>
        <Button
          onClick={() => setIsSignUp(!isSignUp)}
          sx={{ mb: 1 }}
          disabled={loading}
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Button>
      </Box>
    </Box>
  );
};

export default EmailSignIn; 