// src/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Customize your primary color
    },
    secondary: {
      main: '#dc004e', // Customize your secondary color
    },
    background: {
      default: '#f4f6f8', // Light background
    },
  },
  typography: {
    // Customize typography if needed
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // Remove uppercase from buttons
    },
  },
  components: {
    // Override default MUI component styles if needed
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;
