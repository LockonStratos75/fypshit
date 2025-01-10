// src/components/Dashboard/PsychologistDashboard.js

import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Box, Paper, List, ListItem, ListItemText, Button, Tooltip } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../components/services/ApiService';
import { Link } from 'react-router-dom';
import WelcomeCard from '../WelcomeCard';
import { getUserInfo } from '../utils/authUtils';

const PsychologistDashboard = () => {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    averageSanityLevel: 0,
    latestSessions: [],
  });
    const userInfo = getUserInfo();
    const userName = userInfo?.username || 'Psychologist';

  useEffect(() => {
    const fetchPsychologistData = async () => {
      try {
        const [assessmentsRes, sanityRes, sessionsRes] = await Promise.all([
          api.get('/assessments/total'),
          api.get('/sanity'),
          api.get('/sessions/recent'),
        ]);

        setStats({
          totalAssessments: assessmentsRes.data.totalAssessments || 0,
          averageSanityLevel: sanityRes.data.averageSanityLevel || 0,
          latestSessions: sessionsRes.data.sessions ? sessionsRes.data.sessions.slice(0, 5) : [],
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to fetch dashboard data');
      }
    };
    fetchPsychologistData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <WelcomeCard userName={userName} />

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#004080' }}>
        Psychologist Dashboard
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: '#555' }}>
        Stay updated with your assessments and sessions.
      </Typography>
      <Grid container spacing={3}>
        {/* Total Assessments */}
        <Grid item xs={12} md={4}>
          <Tooltip title="Total number of assessments completed" arrow>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ color: '#5b3586', fontWeight: 600 }}>
                Total Assessments
              </Typography>
              <Typography variant="h3" sx={{ color: '#004080', fontWeight: 700 }}>
                {stats.totalAssessments}
              </Typography>
            </Paper>
          </Tooltip>
        </Grid>

        {/* Average Sanity Level */}
        <Grid item xs={12} md={4}>
          <Tooltip title="Average sanity level of your clients" arrow>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ color: '#5b3586', fontWeight: 600 }}>
                Average Sanity Level
              </Typography>
              <Typography variant="h3" sx={{ color: '#004080', fontWeight: 700 }}>
                {stats.averageSanityLevel}%
              </Typography>
            </Paper>
          </Tooltip>
        </Grid>

        {/* Latest Sessions */}
        <Grid item xs={12} md={4}>
  <Paper elevation={3} sx={{ p: 3, borderRadius: '8px', backgroundColor: '#e0e0e0' }}> {/* Darker Background */}
    <Typography variant="h6" sx={{ color: '#5b3586', fontWeight: 600, textAlign: 'center', mb: 2 }}>
      Latest Sessions
    </Typography>
    {stats.latestSessions.length > 0 ? (
      <List dense>
        {stats.latestSessions.map((session) => (
          <ListItem key={session._id} disableGutters>
            <ListItemText  
              primary={`Session ID: ${session._id}`}
            />
          </ListItem>
        ))}
      </List>
    ) : (
      <Typography variant="body2" sx={{ textAlign: 'center', color: '#800' }}>
        No recent sessions.
      </Typography>
    )}
  </Paper>
</Grid>
      </Grid>

      {/* Additional Links */}
      <Box mt={5}>
        <Grid container spacing={3}>
          {/* View Users */}
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/psychologist/users"
              fullWidth
              sx={{ borderRadius: '30px', py: 2, '&:hover': { backgroundColor: '#003366' } }}
            >
              View Users
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PsychologistDashboard;