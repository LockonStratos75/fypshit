// src/components/pages/EmergencyPage.js

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Tooltip,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { toast } from 'react-toastify';
import ApiService from '../../components/services/ApiService'; // Ensure the path is correct

const EmergencyPage = () => {
  // State variables
  const [sanityLevels, setSanityLevels] = useState([]); // Stores the list of sanity levels
  const [loading, setLoading] = useState(true); // Indicates if data is being loaded
  const [alertDialogOpen, setAlertDialogOpen] = useState(false); // Controls the visibility of the alert confirmation dialog
  const [selectedSanityLevel, setSelectedSanityLevel] = useState(null); // Stores the sanity level selected for alerting

  // Fetch all sanity levels from the backend
  const fetchSanityLevels = async () => {
    try {
      const response = await ApiService.get('/admin/sanity-levels');
      console.log('Fetched sanity levels:', response.data.sanityLevels); // For debugging
      setSanityLevels(response.data.sanityLevels);
    } catch (error) {
      console.error('Error fetching sanity levels:', error);
      toast.error('Failed to fetch sanity levels');
    } finally {
      setLoading(false);
    }
  };

  // Fetch sanity levels on component mount
  useEffect(() => {
    fetchSanityLevels();
  }, []);

  // Determine the color based on sanity percentage
  const getSanityColor = (sanityPercentage) => {
    if (sanityPercentage === undefined || sanityPercentage === null) {
      console.warn('sanityPercentage is undefined for a sanityLevel:', sanityPercentage);
      return 'grey.500'; // Default color for undefined sanityPercentage
    }

    if (sanityPercentage < 20) {
      return 'error.main'; // Red
    } else if (sanityPercentage >= 20 && sanityPercentage < 50) {
      return 'warning.main'; // Yellow
    } else {
      return 'success.main'; // Green
    }
  };

  // Handle clicking the Alert button
  const handleAlertClick = (sanityLevel) => {
    setSelectedSanityLevel(sanityLevel);
    setAlertDialogOpen(true);
  };

  // Handle closing the alert confirmation dialog
  const handleAlertClose = () => {
    setSelectedSanityLevel(null);
    setAlertDialogOpen(false);
  };

  // Handle confirming the alert action
  const handleAlertConfirm = async () => {
    try {
      const userId = selectedSanityLevel.user._id;

      // Send POST request to /crisis/check with userId
      const response = await ApiService.post('/crisis/check', { userId });

      toast.success(response.data.message);
      handleAlertClose();
      fetchSanityLevels(); // Refresh the sanity levels in case they have changed
    } catch (error) {
      console.error('Error sending alert:', error);
      toast.error(error.response?.data?.message || 'Failed to send alert');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Emergency Alerts
      </Typography>

      {/* Loading Indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        /* Sanity Levels Table */
        <TableContainer component={Paper}>
          <Table aria-label="emergency sanity levels table">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Sanity Level (%)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Display a message if no sanity levels are found */}
              {sanityLevels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No sanity levels found.
                  </TableCell>
                </TableRow>
              ) : (
                /* Map through the sanity levels and display each in a table row */
                sanityLevels.map((sanityLevel) => (
                  <TableRow key={sanityLevel._id}>
                    <TableCell>{sanityLevel.user.username}</TableCell>
                    <TableCell>{sanityLevel.user.email}</TableCell>
                    <TableCell>
                      {/* Sanity Level with color coding */}
                      <Typography
                        sx={{
                          color: getSanityColor(sanityLevel.sanityPercentage),
                          fontWeight: 600,
                        }}
                      >
                        {sanityLevel.sanityPercentage !== undefined && sanityLevel.sanityPercentage !== null
                          ? `${sanityLevel.sanityPercentage}%`
                          : 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {/* Alert Button */}
                      <Tooltip title="Send Alert" arrow>
                        <span>
                          <IconButton
                            color="secondary"
                            onClick={() => handleAlertClick(sanityLevel)}
                            disabled={
                              sanityLevel.sanityPercentage === undefined ||
                              sanityLevel.sanityPercentage === null ||
                              sanityLevel.sanityPercentage >= 50
                            }
                          >
                            <Send />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Alert Confirmation Dialog */}
      <Dialog open={alertDialogOpen} onClose={handleAlertClose} fullWidth maxWidth="xs">
        <DialogTitle>Send Alert</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to send an alert to{' '}
            <strong>{selectedSanityLevel?.user.username || 'this user'}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          {/* Cancel Button */}
          <Button onClick={handleAlertClose} color="secondary">
            Cancel
          </Button>
          {/* Send Alert Button */}
          <Button onClick={handleAlertConfirm} variant="contained" color="primary">
            Send Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmergencyPage;
