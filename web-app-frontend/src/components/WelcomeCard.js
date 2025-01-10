// src/components/WelcomeCard.jsx

import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';
import dayjs from 'dayjs';
import homeCardBg from '../assets/welcome_card_bg.svg'; 

// Styled Card with Background Image
const StyledCard = styled(Card)(({ theme }) => ({
  backgroundImage: `url(${homeCardBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: theme.palette.primary.contrastText,
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  marginBottom: theme.spacing(4),
  position: 'relative',
  height: '300px', // Adjust height as needed
}));

// Overlay to darken the background for better text readability
const Overlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
  borderRadius: '16px',
}));

// Content Container to position text above the overlay
const ContentBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  padding: theme.spacing(2),
}));

const WelcomeCard = ({ userName }) => {
  // Get Current Date
  const currentDate = dayjs().format('dddd, MMMM D, YYYY'); // e.g., Monday, September 20, 2023

  // Generate a Dynamic Greeting Message Based on Time
  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <StyledCard>
      {/* Overlay */}
      <Overlay />

      {/* Content */}
      <ContentBox>
        <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={1}>
          <Typography variant="h6">{currentDate}</Typography>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Welcome, {userName}!
        </Typography>
        <Typography variant="h6" sx={{ fontStyle: 'italic' }}>
          {getGreeting()}! We're glad to have you here.
        </Typography>
      </ContentBox>
    </StyledCard>
  );
};

export default WelcomeCard;
