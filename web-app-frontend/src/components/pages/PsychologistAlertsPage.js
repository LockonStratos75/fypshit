// src/components/pages/PsychologistAlertsPage.jsx

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ApiService from '../../components/services/ApiService';
import { toast } from 'react-toastify';

const PsychologistAlertsPage = () => {
  const theme = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const response = await ApiService.get('/psychologist/alerts');
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Optionally, display a toast notification
      toast.error('Failed to fetch alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 700, color: theme.palette.primary.main }}
        align="center"
      >
        Alerts
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          {alerts.length === 0 ? (
            <Typography variant="h6" align="center">
              No alerts available.
            </Typography>
          ) : (
            <List>
              {alerts.map((alert) => (
                <ListItem key={alert._id} divider>
                  <ListItemText
                    primary={alert.alertType}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {alert.alertMessage}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {new Date(alert.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                  <Chip
                    label={alert.status}
                    color={
                      alert.status === 'active'
                        ? 'error'
                        : alert.status === 'resolved'
                        ? 'success'
                        : 'default'
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default PsychologistAlertsPage;
  