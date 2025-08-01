import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useAuth } from '../../contexts/AuthContext';

const FacebookSignIn: React.FC = () => {
  const { signInWithFacebook } = useAuth();

  const handleFacebookSignIn = async () => {
    try {
      await signInWithFacebook();
    } catch (error) {
      console.error('Facebook sign-in error:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Button
        variant="contained"
        fullWidth
        onClick={handleFacebookSignIn}
        sx={{
          backgroundColor: '#1877f2',
          color: 'white',
          '&:hover': {
            backgroundColor: '#166fe5',
          },
          py: 1.5,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
        }}
        startIcon={<FacebookIcon />}
      >
        Continue with Facebook
      </Button>
    </Box>
  );
};

export default FacebookSignIn; 