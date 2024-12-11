// src/components/pages/ApplicationStatusPage.js

import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import logo from '../../assets/Eunoia.png';

export default function ApplicationStatusPage() {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      bgcolor="#FFFFFF"
      alignItems="center"
      justifyContent="center"
      p={2}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          p: 4,
          borderRadius: '12px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent sx={{ textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <img src={logo} alt="EUNOIA Logo" style={{ maxWidth: '120px' }} />
            <Typography
              variant="h5"
              fontWeight={700}
              color="primary"
              mt={2}
              fontFamily="Poppins"
            >
              EUNOIA
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight={500}
            gutterBottom
            fontFamily="Poppins"
          >
            Application Submitted
          </Typography>
          <Typography
            variant="subtitle1"
            gutterBottom
            fontFamily="Poppins"
          >
            Thank you for registering as a psychologist. Your application is currently under review by our administrators.
          </Typography>
          <Typography variant="body1" mt={2} fontFamily="Poppins">
            You will be notified via email once your application has been approved or rejected.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
