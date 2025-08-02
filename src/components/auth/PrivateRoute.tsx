import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowUnauthenticated?: boolean;
  onAuthRequired?: () => void;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowUnauthenticated = false, onAuthRequired }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (currentUser) {
    return <>{children}</>;
  }

  // If unauthenticated and allowUnauthenticated is true, show children with auth prompt
  if (allowUnauthenticated) {
    // Call onAuthRequired if provided
    if (onAuthRequired) {
      onAuthRequired();
    }
    return <>{children}</>;
  }

  // Default behavior: redirect to landing page
  return <Navigate to="/" replace />;
};

export default PrivateRoute; 