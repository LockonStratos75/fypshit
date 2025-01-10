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
  TextField,
  InputAdornment,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Send, Search, Clear } from '@mui/icons-material';
import { toast } from 'react-toastify';
import ApiService from '../../components/services/ApiService';

const EmergencyPage = () => {
  // State variables
  const [sanityLevels, setSanityLevels] = useState([]); // Stores the list of sanity levels
  const [filteredSanityLevels, setFilteredSanityLevels] = useState([]); // For filtered results
  const [loading, setLoading] = useState(true); // Indicates if data is being loaded
  const [alertDialogOpen, setAlertDialogOpen] = useState(false); // Controls the visibility of the alert confirmation dialog
  const [selectedSanityLevel, setSelectedSanityLevel] = useState(null); // Stores the sanity level selected for alerting

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch all sanity levels from the backend
  const fetchSanityLevels = async () => {
    try {
      const response = await ApiService.get('/admin/sanity-levels');
      console.log('Fetched sanity levels:', response.data.sanityLevels); // For debugging
      setSanityLevels(response.data.sanityLevels);
      setFilteredSanityLevels(response.data.sanityLevels);
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

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(query, filterStatus);
  };

  // Handle Filter Status Change
  const handleFilterStatusChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    applyFilters(searchQuery, status);
  };

  // Apply Search and Filter
  const applyFilters = (query, status) => {
    let updatedSanityLevels = [...sanityLevels];

    // Search Filter
    if (query) {
      updatedSanityLevels = updatedSanityLevels.filter(
        (sanityLevel) =>
          sanityLevel.user.username.toLowerCase().includes(query.toLowerCase()) ||
          sanityLevel.user.email.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Status Filter (e.g., Active, Inactive)
    if (status) {
      updatedSanityLevels = updatedSanityLevels.filter((sanityLevel) => sanityLevel.status === status);
    }

    setFilteredSanityLevels(updatedSanityLevels);
  };

  // Handle Clearing Filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
    setFilteredSanityLevels(sanityLevels);
  };

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
      if (!selectedSanityLevel || !selectedSanityLevel.user) {
        toast.error('Invalid user data.');
        handleAlertClose();
        return;
      }

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

  // Sort the sanity levels by lowest sanity percentage first
  const sortedSanityLevels = [...filteredSanityLevels].sort((a, b) => a.sanityPercentage - b.sanityPercentage);

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Emergency Alerts
      </Typography>

      {/* Search and Filter Section */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by username or email"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {searchQuery && (
                      <IconButton onClick={() => setSearchQuery('')}>
                        <Clear />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-status-label">Filter by Status</InputLabel>
              <Select
                labelId="filter-status-label"
                label="Filter by Status"
                value={filterStatus}
                onChange={handleFilterStatusChange}
              >
                <MenuItem value="">
                  <em>All Statuses</em>
                </MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                {/* Add more status options if applicable */}
              </Select>
            </FormControl>
          </Grid>

          {/* Clear Filters Button */}
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleClearFilters}
              disabled={!searchQuery && !filterStatus}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Loading Indicator */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
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
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Display a message if no sanity levels are found */}
              {sortedSanityLevels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No sanity levels found.
                  </TableCell>
                </TableRow>
              ) : (
                /* Map through the sanity levels and display each in a table row */
                sortedSanityLevels.map((sanityLevel) => (
                  <TableRow key={sanityLevel._id}>
                    <TableCell>{sanityLevel.user ? sanityLevel.user.username : 'Unknown'}</TableCell>
                    <TableCell>{sanityLevel.user ? sanityLevel.user.email : 'Unknown'}</TableCell>
                    <TableCell>
                      {/* Round to 1 decimal place */}
                      <Typography
                        sx={{
                          color: getSanityColor(sanityLevel.sanityPercentage),
                          fontWeight: 600,
                        }}
                      >
                        {sanityLevel.sanityPercentage !== undefined && sanityLevel.sanityPercentage !== null
                          ? `${sanityLevel.sanityPercentage.toFixed(1)}%`
                          : 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>{sanityLevel.status}</TableCell>
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
                              sanityLevel.sanityPercentage >= 50 ||
                              !sanityLevel.user
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
            <strong>{selectedSanityLevel?.user?.username || 'this user'}</strong>?
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
