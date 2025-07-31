import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1">
          This is where you'll manage courses, students, and content.
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 