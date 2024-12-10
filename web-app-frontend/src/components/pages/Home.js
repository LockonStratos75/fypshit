// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, styled } from '@mui/material';
import logo from '../assets/Eunoia.png'; 
import backgroundImage from '../assets/home_bg.gif';

const Background = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100vh'
}));

const BackgroundImage = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  zIndex: -1,
});

const LogoWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(4),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  color: theme.palette.text.primary,
  maxWidth: '500px',
  padding: theme.spacing(4),
  backgroundColor: 'rgba(255,255,255,0.8)',
  borderRadius: '8px',
}));

export default function Home() {
  return (
    <Background>
      <BackgroundImage src={backgroundImage} alt="Background GIF" />
      <LogoWrapper>
        <Link to="/">
          <img alt="EUNOIA Logo" src={logo} style={{ maxWidth: '150px' }} />
        </Link>
      </LogoWrapper>
      <ContentWrapper>
        <Typography variant="h3" fontWeight={700} gutterBottom color="primary">
          Welcome to EUNOIA
        </Typography>
        <Typography variant="h6" gutterBottom>
          Empowering mental health professionals with advanced analytics
        </Typography>
        <Typography variant="body1" paragraph>
          EUNOIA provides cutting-edge tools to help professionals elevate mental health care.
          Start now to explore the features!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/login"
          sx={{ borderRadius: '30px', px: 4, py: 1.5, fontSize: '1rem', textTransform: 'none' }}
        >
          Get Started
        </Button>
      </ContentWrapper>
    </Background>
  );
}
