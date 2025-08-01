import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
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

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // Allow non-admin users to access admin dashboard for the purpose of making themselves admin
  if (!currentUser.isAdmin) {
    // Check if we're on the admin dashboard page specifically
    const isAdminDashboard = window.location.pathname === '/admin';
    if (isAdminDashboard) {
      // Allow access to admin dashboard for non-admin users
      return <>{children}</>;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute; 