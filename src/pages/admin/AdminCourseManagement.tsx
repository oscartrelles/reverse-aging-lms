import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminCourseManagement: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Course Management
        </Typography>
        <Typography variant="body1">
          This is where you'll manage course content and lessons.
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminCourseManagement; 