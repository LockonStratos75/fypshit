// src/pages/Home.js

import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Home = () => {
  return (
    <Container>
      <Box mt={5} textAlign="center">
        <Typography variant="h3" gutterBottom>
          Welcome to Fypshit
        </Typography>
        <Typography variant="h6">
          Empowering mental health professionals to manage and support users effectively.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
