// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  palette: {
    primary: {
      main: '#004080', 
    },
    secondary: {
      main: '#caa3f7',
    },
    background: {
      default: '#FFFFFF',
    },
    text: {
      primary: '#333333',
    },
  },
});

export default theme;
