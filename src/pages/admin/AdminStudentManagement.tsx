import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminStudentManagement: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Student Management
        </Typography>
        <Typography variant="body1">
          This is where you'll manage student enrollments and progress.
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminStudentManagement; 