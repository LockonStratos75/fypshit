// src/pages/NotFound.js

import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container>
      <Box mt={10} textAlign="center">
        <Typography variant="h3" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" gutterBottom>
          Oops! The page you're looking for doesn't exist.
        </Typography>
        <Button variant="contained" color="primary" component={Link} to="/">
          Go Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
