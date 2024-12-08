// src/components/Navbar.js

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
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import {
  ExpandLess,
  ExpandMore,
  Home,
  Report,
  ExitToApp,
  Emergency, // Import Emergency icon
} from '@mui/icons-material';
import logo from '../../assets/Eunoia.png';

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

  const [openRecords, setOpenRecords] = useState(false); // State to manage collapsing Records section
  const [collapsed, setCollapsed] = useState(true); // Start with the sidebar collapsed

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // Redirect to home screen after logout
  };

  const toggleRecords = () => {
    setOpenRecords(!openRecords);
  };

  const handleLogoClick = () => {
    navigate('/dashboard'); // Redirect to dashboard on logo click
  };

  // Expand sidebar on mouse enter
  const handleMouseEnter = () => {
    setCollapsed(false);
  };

  // Collapse sidebar on mouse leave
  const handleMouseLeave = () => {
    setCollapsed(true);
  };

  return (
    <>
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? 80 : 240, // Conditionally change width based on collapse state
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: collapsed ? 80 : 240, // Apply the same conditional width to the drawer paper
            boxSizing: 'border-box',
            backgroundColor: '#2c3e50',
            color: '#fff',
            border: 0,
            transition: 'width 0.5s', // Smooth width transition
            overflowX: 'hidden', // Hide horizontal overflow
          },
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo and Text */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 2,
            cursor: 'pointer',
          }}
          onClick={handleLogoClick}
        >
          <img
            src={logo}
            alt="Eunoia Logo"
            style={{ width: 100 }}
          />
          {!collapsed && (
            <Typography variant="h6" sx={{ textAlign: 'center', color: '#caa3f7' }}>
              EUNOIA
            </Typography>
          )}
        </Box>

        {/* Sidebar Menu */}
        <List>
          {/* Home */}
          <ListItem
            button
            component={Link}
            to="/dashboard"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Home sx={{ marginRight: collapsed ? 0 : 2, marginLeft: collapsed ? 1 : 0 }} />
            {!collapsed && <ListItemText primary="Home" />}
          </ListItem>

          {/* Divider */}
          <Divider sx={{ backgroundColor: '#34495e' }} />

          {/* Records Section */}
          {!collapsed ? (
            <>
              {/* Records Section (Collapsible) */}
              <ListItem
                button
                onClick={toggleRecords}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Report sx={{ marginRight: 2 }} />
                <ListItemText primary="Records" />
                {openRecords ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={openRecords} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    component={Link}
                    to="/admin/records"
                    sx={{ paddingLeft: 4 }}
                  >
                    <ListItemText primary="View Records" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/admin/add-record"
                    sx={{ paddingLeft: 4 }}
                  >
                    <ListItemText primary="Add Record" />
                  </ListItem>
                </List>
              </Collapse>
            </>
          ) : (
            // When collapsed, show only the icon without expand/collapse functionality
            <ListItem
              button
              component={Link}
              to="/admin/records"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Report sx={{ marginRight: 0, marginLeft: 1 }} />
            </ListItem>
          )}

          {/* Generate Report */}
          {role === 'admin' && (
            <ListItem
              button
              component={Link}
              to="/admin/report"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Report
                sx={{ marginRight: collapsed ? 0 : 2, marginLeft: collapsed ? 1 : 0 }}
              />
              {!collapsed && <ListItemText primary="Generate Report" />}
            </ListItem>
          )}

          {/* Emergency */}
          {role === 'admin' && (
            <ListItem
              button
              component={Link}
              to="/admin/emergency"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Emergency
                sx={{ marginRight: collapsed ? 0 : 2, marginLeft: collapsed ? 1 : 0 }}
              />
              {!collapsed && <ListItemText primary="Emergency" />}
            </ListItem>
          )}

          {/* Logout Button */}
          {token && (
            <ListItem
              button
              onClick={handleLogout}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <ExitToApp
                sx={{ marginRight: collapsed ? 0 : 2, marginLeft: collapsed ? 1 : 0 }}
              />
              {!collapsed && <ListItemText primary="Logout" />}
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
