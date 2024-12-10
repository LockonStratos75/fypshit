// src/pages/Dashboard/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../components/services/ApiService'; // Ensure your ApiService path is correct

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
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#004080' }}>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Total Users */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ p: 3, borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}
          >
            <Typography variant="h6" sx={{ color: '#5b3586', fontWeight: 600 }}>
              Total Users
            </Typography>
            <Typography variant="h3" sx={{ color: '#004080', fontWeight: 700 }}>
              {stats.totalUsers}
            </Typography>
          </Paper>
        </Grid>

        {/* Active Users */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ p: 3, borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}
          >
            <Typography variant="h6" sx={{ color: '#5b3586', fontWeight: 600 }}>
              Active Users (Last 24 Hours)
            </Typography>
            <Typography variant="h3" sx={{ color: '#004080', fontWeight: 700 }}>
              {stats.activeUsers}
            </Typography>
          </Paper>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ p: 3, borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}
          >
            <Typography variant="h6" sx={{ color: '#5b3586', fontWeight: 600 }}>
              System Health
            </Typography>
            <Typography variant="h3" sx={{ color: '#004080', fontWeight: 700 }}>
              {stats.systemHealth}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
