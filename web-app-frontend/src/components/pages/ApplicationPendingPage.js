// src/components/pages/ApplicationPendingPage.js

import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ApplicationPendingPage = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#004080' }}>
          Application Pending
        </Typography>
        <Typography variant="body1" gutterBottom>
          Your application is currently under review. You will be notified once it's approved or rejected.
        </Typography>
      </Box>
    </Container>
  );
};

export default ApplicationPendingPage;
