import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const GoogleSignIn: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    console.log('Google Sign-In button clicked');
    setIsLoading(true);
    try {
      console.log('Calling signInWithGoogle...');
      await signInWithGoogle();
      console.log('signInWithGoogle completed');
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={isLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      fullWidth
      sx={{
        textTransform: 'none',
        fontWeight: 500,
        py: 1.5,
      }}
    >
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </Button>
  );
};

export default GoogleSignIn; 