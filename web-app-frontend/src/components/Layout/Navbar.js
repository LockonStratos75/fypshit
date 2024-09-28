// src/components/Layout/Navbar.js

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let decoded = null;
  let role = null;

  if (token) {
    try {
      decoded = jwtDecode(token);
      role = decoded.role;
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        EUNOIA
        </Typography>
        {!token ? (
          <>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/signup">Signup</Button>
          </>
        ) : (
          <>
            {role === 'admin' && (
              <>
                <Button color="inherit" component={Link} to="/admin/dashboard">Admin Dashboard</Button>
                <Button color="inherit" component={Link} to="/admin/report">Generate Report</Button>
              </>
            )}
            {role === 'psychologist' && (
              <>
                <Button color="inherit" component={Link} to="/psychologist/dashboard">Psychologist Dashboard</Button>
                <Button color="inherit" component={Link} to="/admin/report">Generate Report</Button>
              </>
            )}
            <Box ml={2}>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
