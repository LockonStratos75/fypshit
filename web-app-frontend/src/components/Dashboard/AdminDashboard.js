import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Paper, Button } from '@mui/material';
import api from '../../services/ApiService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    systemHealth: 'Good',
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/analytics/system-metrics');
        setStats(response.data);
      } catch (error) {
        toast.error('Failed to fetch system metrics');
      }
    };
    fetchMetrics();
  }, []);

  return (
    <Container>
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">Active Users (Last 24h)</Typography>
              <Typography variant="h4">{stats.activeUsers}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">System Health</Typography>
              <Typography variant="h4">{stats.systemHealth}</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Box mt={4}>
          <Button variant="contained" color="primary" component={Link} to="/admin/report">
            Generate User Report
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
