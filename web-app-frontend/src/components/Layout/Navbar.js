// src/components/Layout/Navbar.js
import React, { useState } from 'react';
import {
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Collapse,
  Tooltip
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import {
  ExpandLess,
  ExpandMore,
  Home,
  Report,
  ExitToApp,
  Warning as EmergencyIcon,
} from '@mui/icons-material';
import logo from '../../assets/Eunoia.png';

const mainColor = '#004080';
const highlightColor = '#caa3f7';
const hoverBg = '#5b3586';

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

  const [openRecords, setOpenRecords] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // Redirect to home screen after logout
  };

  const toggleRecords = () => {
    setOpenRecords(!openRecords);
  };

  const handleLogoClick = () => {
    // Based on role, redirect:
    // If role === 'admin' or 'psychologist', go to respective dashboards
    // If role is new psychologist (not approved or no profile?), handle that logic
    // For simplicity, just navigate to /dashboard:
    navigate('/dashboard');
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
    paddingX: '8px',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: hoverBg,
    },
    color: '#fff',
  };

  const iconStyle = {
    marginRight: collapsed ? 0 : 2,
    marginLeft: collapsed ? '5px' : 0,
    transition: 'margin 0.3s',
    color: '#fff'
  };

  const textStyle = {
    fontWeight: 500,
    fontSize: '1rem',
    color: '#fff',
    marginLeft: collapsed ? '0px' : '10px',
    transition: 'margin 0.3s',
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? 80 : 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? 80 : 240,
          boxSizing: 'border-box',
          backgroundColor: mainColor,
          color: '#fff',
          border: 0,
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
          paddingTop: 2,
          paddingBottom: 2,
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
      >
        <img
          src={logo}
          alt="Eunoia Logo"
          style={{ width: collapsed ? 50 : 100, transition: 'width 0.3s' }}
        />
        {!collapsed && (
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              color: highlightColor,
              fontWeight: 700,
              marginTop: 1,
              fontSize: '1.2rem',
            }}
          >
            EUNOIA
          </Typography>
        )}
      </Box>

      <List sx={{ paddingTop: 0 }}>
        {/* Home */}
        <Tooltip title="Home" placement="right" arrow disableHoverListener={!collapsed}>
          <ListItem
            button
            component={Link}
            to="/dashboard"
            sx={navItemStyle}
          >
            <Home sx={iconStyle} />
            {!collapsed && <ListItemText primary="Home" sx={textStyle} />}
          </ListItem>
        </Tooltip>

        <Divider sx={{ backgroundColor: '#34495e', marginY: 1 }} />

        {/* Records Section */}
        {role === 'admin' && (
          !collapsed ? (
            <>
              <ListItem button onClick={toggleRecords} sx={navItemStyle}>
                <Report sx={iconStyle} />
                <ListItemText primary="Records" sx={textStyle} />
                {openRecords ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={openRecords} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    component={Link}
                    to="/admin/records"
                    sx={{ ...navItemStyle, paddingLeft: collapsed ? '15px' : '30px' }}
                  >
                    <ListItemText primary="View Records" sx={textStyle} />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/admin/add-record"
                    sx={{ ...navItemStyle, paddingLeft: collapsed ? '15px' : '30px' }}
                  >
                    <ListItemText primary="Add Record" sx={textStyle} />
                  </ListItem>
                </List>
              </Collapse>
            </>
          ) : (
            <Tooltip title="Records" placement="right" arrow disableHoverListener={!collapsed}>
              <ListItem
                button
                component={Link}
                to="/admin/records"
                sx={navItemStyle}
              >
                <Report sx={iconStyle} />
              </ListItem>
            </Tooltip>
          )
        )}

        {/* Generate Report (Admin Only) */}
        {role === 'admin' && (
          <Tooltip title="Generate Report" placement="right" arrow disableHoverListener={!collapsed}>
            <ListItem
              button
              component={Link}
              to="/admin/report"
              sx={navItemStyle}
            >
              <Report sx={iconStyle} />
              {!collapsed && <ListItemText primary="Generate Report" sx={textStyle} />}
            </ListItem>
          </Tooltip>
        )}

        {/* Emergency (Admin Only) */}
        {role === 'admin' && (
          <Tooltip title="Emergency" placement="right" arrow disableHoverListener={!collapsed}>
            <ListItem
              button
              component={Link}
              to="/admin/emergency"
              sx={navItemStyle}
            >
              <EmergencyIcon sx={iconStyle} />
              {!collapsed && <ListItemText primary="Emergency" sx={textStyle} />}
            </ListItem>
          </Tooltip>
        )}

        {/* Logout Button */}
        {token && (
          <Tooltip title="Logout" placement="right" arrow disableHoverListener={!collapsed}>
            <ListItem button onClick={handleLogout} sx={navItemStyle}>
              <ExitToApp sx={iconStyle} />
              {!collapsed && <ListItemText primary="Logout" sx={textStyle} />}
            </ListItem>
          </Tooltip>
        )}
      </List>
    </Drawer>
  );
};

export default Navbar;
