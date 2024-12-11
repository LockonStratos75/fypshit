// src/components/Layout/Navbar.js

import React from 'react';
import {
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Correct import
import {
  Home,
  Report,
  Logout,
  Emergency as EmergencyIcon,
  BarChart,
  History, 
  Settings// More appropriate icon for Logs
} from '@mui/icons-material';
import logo from '../../assets/Eunoia.png';

const drawerWidthExpanded = 240;
const drawerWidthCollapsed = 80;

const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme(); // Utilize MUI's theme for consistent styling
  const token = localStorage.getItem('token');
  let decoded = null;
  let role = null;

  if (token) {
    try {
      decoded = jwtDecode(token);
      role = decoded.userType;
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  const [collapsed, setCollapsed] = React.useState(true); // Control drawer collapse

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // Redirect to home screen after logout
  };

  const handleLogoClick = () => {
    // Based on role, redirect:
    if (role === 'AdminProfile') {
      navigate('/admin/dashboard');
    } else if (role === 'PsychologistProfile') {
      navigate('/psychologist/dashboard');
    } else {
      // Default to home
      navigate('/');
    }
  };

  const handleMouseEnter = () => {
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    setCollapsed(true);
  };

  const navItemStyle = {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    marginY: '5px',
    marginX: collapsed ? '5px' : '10px',
    paddingY: '8px',
    paddingX: '12px',
    transition: 'background-color 0.3s, padding 0.3s',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    color: 'inherit', // Inherit color from Drawer
  };

  const iconStyle = {
    minWidth: '35px',
    color: 'inherit', // Inherit color from Drawer
  };

  const textStyle = {
    fontWeight: 500,
    fontSize: '1rem',
    marginLeft: collapsed ? '0px' : '10px',
    transition: 'margin 0.3s',
    whiteSpace: 'nowrap',
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? drawerWidthCollapsed : drawerWidthExpanded,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? drawerWidthCollapsed : drawerWidthExpanded,
          boxSizing: 'border-box',
          backgroundColor: '#0D1B2A', // Very dark blue for the drawer
          color: '#ffffff', // White text for drawer items
          border: 'none',
          transition: 'width 0.5s',
          overflowX: 'hidden',
        },
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo and Title */}
      <Box
        onClick={handleLogoClick}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 3,
          paddingBottom: 2,
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
      >
        <img
          src={logo}
          alt="Eunoia Logo"
          style={{
            width: collapsed ? 50 : 100,
            transition: 'width 0.3s',
            marginBottom: collapsed ? 0 : 8,
          }}
        />
        {!collapsed && (
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              color: theme.palette.secondary.main, // Use secondary color for contrast
              fontWeight: 700,
              fontSize: '1.3rem',
            }}
          >
            EUNOIA
          </Typography>
        )}
      </Box>

      <List sx={{ paddingTop: 0 }}>
        {/* Home */}
        <Tooltip title="Home" placement="right" arrow disableHoverListener={!collapsed}>
          <ListItemButton
            component={Link}
            to="/admin/dashboard" // Admin's home route
            sx={navItemStyle}
          >
            <ListItemIcon sx={iconStyle}>
              <Home />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Home" sx={textStyle} />}
          </ListItemButton>
        </Tooltip>

        {/* Records */}
        <Tooltip title="Records" placement="right" arrow disableHoverListener={!collapsed}>
          <ListItemButton
            component={Link}
            to="/admin/records" // Direct link without dropdown
            sx={navItemStyle}
          >
            <ListItemIcon sx={iconStyle}>
              <Report />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Records" sx={textStyle} />}
          </ListItemButton>
        </Tooltip>

        {/* Reports */}
        <Tooltip title="Reports" placement="right" arrow disableHoverListener={!collapsed}>
          <ListItemButton
            component={Link}
            to="/admin/report"
            sx={navItemStyle}
          >
            <ListItemIcon sx={iconStyle}>
              <BarChart />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Reports" sx={textStyle} />}
          </ListItemButton>
        </Tooltip>

        {/* Applications */}
        <Tooltip title="Applications" placement="right" arrow disableHoverListener={!collapsed}>
          <ListItemButton
            component={Link}
            to="/admin/applications"
            sx={navItemStyle}
          >
            <ListItemIcon sx={iconStyle}>
              <Settings />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Applications" sx={textStyle} />}
          </ListItemButton>
        </Tooltip>

        {/* Emergency */}
        <Tooltip title="Emergency" placement="right" arrow disableHoverListener={!collapsed}>
          <ListItemButton
            component={Link}
            to="/admin/emergency"
            sx={navItemStyle}
          >
            <ListItemIcon sx={iconStyle}>
              <EmergencyIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Emergency" sx={textStyle} />}
          </ListItemButton>
        </Tooltip>

        {/* Logs */}
        <Tooltip title="Logs" placement="right" arrow disableHoverListener={!collapsed}>
          <ListItemButton
            component={Link}
            to="/admin/logs"
            sx={navItemStyle}
          >
            <ListItemIcon sx={iconStyle}>
              <History /> {/* More appropriate icon for Logs */}
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Logs" sx={textStyle} />}
          </ListItemButton>
        </Tooltip>

        {/* Logout Button */}
        {token && (
          <Tooltip title="Logout" placement="right" arrow disableHoverListener={!collapsed}>
            <ListItemButton onClick={handleLogout} sx={navItemStyle}>
              <ListItemIcon sx={iconStyle}>
                <Logout />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Logout" sx={textStyle} />}
            </ListItemButton>
          </Tooltip>
        )}
      </List>
    </Drawer>
  );
};

export default Navbar;
