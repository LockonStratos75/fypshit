// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#004080',
      dark: '#003060',
      light: '#6FB9FF',
    },
    text: {
      primary: '#333333',
      secondary: '#555555',
    },
    background: {
      default: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
