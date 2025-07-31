import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Page
        </Typography>
        <Typography variant="body1">
          This is where students can manage their profile and preferences.
        </Typography>
      </Box>
    </Container>
  );
};

export default ProfilePage; 