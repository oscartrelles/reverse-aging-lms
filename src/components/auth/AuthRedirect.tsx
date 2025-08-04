import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const AuthRedirect: React.FC = () => {
  const { currentUser, loading } = useAuth();



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
    
    return <Navigate to="/dashboard" replace />;
  } else {
    
    return <Navigate to="/" replace />;
  }
};

export default AuthRedirect; 