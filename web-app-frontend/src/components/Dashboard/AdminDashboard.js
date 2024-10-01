import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import api from '../../services/ApiService';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    systemHealth: 'Good',
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const systemMetricsRes = await api.get('/analytics/system-metrics');
        console.log('System Metrics:', systemMetricsRes.data);
        setStats({
          totalUsers: systemMetricsRes.data.totalUsers || 0,
          activeUsers: systemMetricsRes.data.activeUsers || 0,
          systemHealth: systemMetricsRes.data.systemHealth || 'Good',
        });
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        toast.error('Failed to fetch dashboard data');
      }
    };

    fetchAdminData();
  }, []);

  return (
    <Container>
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Grid container spacing={3}>
          {/* Total Users */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </Paper>
          </Grid>

          {/* Active Users */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">Active Users (Last 24 Hours)</Typography>
              <Typography variant="h4">{stats.activeUsers}</Typography>
            </Paper>
          </Grid>

          {/* System Health */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">System Health</Typography>
              <Typography variant="h4">{stats.systemHealth}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
