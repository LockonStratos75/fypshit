// src/components/theme/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#004080', // Existing primary blue
      dark: '#003060',
      light: '#6FB9FF',
      contrastText: '#ffffff', // Ensures text/icons on primary color are white
    },
    secondary: {
      main: '#FF6F61', // New secondary color for accents
      dark: '#E65C50',
      light: '#FF8A75',
      contrastText: '#ffffff', // Ensures text/icons on secondary color are white
    },
    text: {
      primary: '#333333', // Dark gray for main content
      secondary: '#555555', // Slightly lighter gray for secondary content
    },
    background: {
      default: '#ffffff', // White background for general content
      paper: '#f5f5f5', // Light gray for Paper components
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h4: {
      fontWeight: 700,
      color: '#004080', // Primary color for headers
    },
    h5: {
      fontWeight: 700,
      color: '#ffffff', // White color for drawer titles
    },
    body1: {
      color: '#333333', // Consistent with text.primary
    },
  },
  shape: {
    borderRadius: 8, // Maintains consistent border radius across components
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0D1B2A', // Very dark blue for the drawer
          color: '#ffffff', // White text for drawer items
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#ffffff', // Ensures primary text in list items is white
          fontWeight: 500,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#333333', // Dark tooltip background
          color: '#ffffff', // White tooltip text
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '30px', // Rounded buttons
          transition: 'background-color 0.3s, transform 0.3s',
        },
      },
    },
  },
});

export default theme;
