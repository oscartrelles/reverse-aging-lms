import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const AuthRedirect: React.FC = () => {
  const { currentUser, loading } = useAuth();

  console.log('AuthRedirect - currentUser:', currentUser);
  console.log('AuthRedirect - loading:', loading);

  // Show loading while authentication is being determined
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // Redirect based on authentication status
  if (currentUser) {
    console.log('AuthRedirect - redirecting to dashboard...');
    return <Navigate to="/dashboard" replace />;
  } else {
    console.log('AuthRedirect - redirecting to landing...');
    return <Navigate to="/" replace />;
  }
};

export default AuthRedirect; 