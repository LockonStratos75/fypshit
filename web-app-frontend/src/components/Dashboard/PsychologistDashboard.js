// src/pages/Dashboard/PsychologistDashboard.js
import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, List, ListItem, ListItemText } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../components/services/ApiService'; // Ensure correct path to ApiService

const PsychologistDashboard = () => {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    averageSanityLevel: 0,
    latestSessions: [],
  });

  useEffect(() => {
    const fetchPsychologistData = async () => {
      try {
        const [assessmentsRes, sanityRes, sessionsRes] = await Promise.all([
          api.get('/assessments/total'),     // Endpoint for total assessments
          api.get('/sanity'),                // Endpoint for average sanity level
          api.get('/sessions/recent'),       // Endpoint for recent sessions
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
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#004080' }}>
        Psychologist Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Total Assessments */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ p: 3, borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}
          >
            <Typography variant="h6" sx={{ color: '#5b3586', fontWeight: 600 }}>
              Total Assessments
            </Typography>
            <Typography variant="h3" sx={{ color: '#004080', fontWeight: 700 }}>
              {stats.totalAssessments}
            </Typography>
          </Paper>
        </Grid>

        {/* Average Sanity Level */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ p: 3, borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}
          >
            <Typography variant="h6" sx={{ color: '#5b3586', fontWeight: 600 }}>
              Average Sanity Level
            </Typography>
            <Typography variant="h3" sx={{ color: '#004080', fontWeight: 700 }}>
              {stats.averageSanityLevel}%
            </Typography>
          </Paper>
        </Grid>

        {/* Latest Sessions */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ p: 3, borderRadius: '8px', backgroundColor: '#f9f9f9' }}
          >
            <Typography variant="h6" sx={{ color: '#5b3586', fontWeight: 600, textAlign: 'center', mb: 2 }}>
              Latest Sessions
            </Typography>
            {stats.latestSessions.length > 0 ? (
              <List dense>
                {stats.latestSessions.map((session) => (
                  <ListItem key={session._id} disableGutters>
                    <ListItemText 
                      primary={`Session ID: ${session._id}`} 
                      primaryTypographyProps={{ fontSize: '0.9rem', color: '#004080' }} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#555' }}>No recent sessions.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PsychologistDashboard;
