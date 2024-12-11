// src/components/pages/ProfileRejectedPage.js

import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProfileRejectedPage = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/psychologist/profile'); // Redirect to profile completion
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#c62828' }}>
          Profile Rejected
        </Typography>
        <Typography variant="body1" gutterBottom>
          Unfortunately, your application has been rejected. Please contact support for more details or try submitting your application again.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleRetry} sx={{ mt: 3 }}>
          Retry Profile Completion
        </Button>
      </Box>
    </Container>
  );
};

export default ProfileRejectedPage;
