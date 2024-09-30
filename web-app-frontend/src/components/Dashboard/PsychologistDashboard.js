import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import api from '../../services/ApiService';
import { toast } from 'react-toastify';

const PsychologistDashboard = () => {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    averageSanityLevel: 0,
    latestSessions: [],
  });

  useEffect(() => {
    const fetchPsychologistData = async () => {
      try {
        // API calls
        const [assessmentsRes, sanityRes, sessionsRes] = await Promise.all([
          api.get('/assessments/total'),
          api.get('/sanity'),
          api.get('/sessions'),
        ]);
  
        // Log responses to check the data
        console.log('Assessments Response:', assessmentsRes.data);
        console.log('Sanity Response:', sanityRes.data);
        console.log('Sessions Response:', sessionsRes.data);
  
        // Update state with the fetched data
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
    <Container>
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Psychologist Dashboard
        </Typography>
        <Grid container spacing={3}>
          {/* Total Assessments */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">Total Assessments</Typography>
              <Typography variant="h4">{stats.totalAssessments}</Typography>
            </Paper>
          </Grid>

          {/* Average Sanity Level */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">Average Sanity Level</Typography>
              <Typography variant="h4">{stats.averageSanityLevel}%</Typography>
            </Paper>
          </Grid>

          {/* Latest Sessions */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">Latest Sessions</Typography>
              {stats.latestSessions.length > 0 ? (
                stats.latestSessions.map((session) => (
                  <Box key={session._id} mt={1}>
                    <Typography variant="body1">Session ID: {session._id}</Typography>
                    <Typography variant="body2">Date: {new Date(session.date).toLocaleString()}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No recent sessions.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PsychologistDashboard;
