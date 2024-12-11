// src/components/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, styled, useTheme } from '@mui/material';
import logo from '../../assets/Eunoia.png'; 
import backgroundImage from '../../assets/home_bg.gif';

const Background = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100vh',
  fontFamily: "'Poppins', sans-serif", 
  overflow: 'hidden',
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
  backgroundColor: 'rgba(255,255,255,0.85)',
  borderRadius: '16px',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
}));

export default function Home() {
  const theme = useTheme();
  
  return (
    <Background>
      <BackgroundImage src={backgroundImage} alt="Background GIF" />
      <LogoWrapper>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img 
            alt="EUNOIA Logo" 
            src={logo} 
            style={{ maxWidth: '150px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} 
          />
        </Link>
      </LogoWrapper>
      <ContentWrapper>
        <Typography 
          variant="h3" 
          fontWeight={700} 
          gutterBottom 
          sx={{
            fontFamily: "'Poppins', sans-serif",
            color: theme.palette.primary.main,
          }}
        >
          Welcome to EUNOIA
        </Typography>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{
            fontFamily: "'Poppins', sans-serif",
            color: theme.palette.text.secondary
          }}
        >
          Empowering mental health professionals with advanced analytics
        </Typography>
        <Typography 
          variant="body1" 
          paragraph
          sx={{
            fontFamily: "'Poppins', sans-serif",
            color: theme.palette.text.primary,
            fontSize: '1rem',
          }}
        >
          Start now to help!
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/login"
          sx={{
            borderRadius: '50px',
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            textTransform: 'none',
            fontFamily: "'Poppins', sans-serif",
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          }}
        >
          Get Started
        </Button>
      </ContentWrapper>
    </Background>
  );
}
