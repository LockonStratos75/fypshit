// file: src/components/pages/EmergencyPage.js

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  TableContainer
} from '@mui/material';
import { Search, Clear, Visibility, Send } from '@mui/icons-material';
import { toast } from 'react-toastify';
import ApiService from '../../components/services/ApiService';

const EmergencyPage = () => {
  const [sanityLevels, setSanityLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // For “Send Alert” (Twilio) 
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  // For “View Insights”
  const [insightDialogOpen, setInsightDialogOpen] = useState(false);
  const [currentInsights, setCurrentInsights] = useState([]);

  // Searching
  const [searchQuery, setSearchQuery] = useState('');

  // ===============================
  // 1) Fetch from /admin/sanity-levels
  // ===============================
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiService.get('/admin/sanity-levels');
      if (res.data && res.data.sanityLevels) {
        // Load the localStorage insights
        const localStore = localStorage.getItem('psychologistInsights') || '{}';
        const insightsObj = JSON.parse(localStore);

        // Attach them to each doc
        const updated = res.data.sanityLevels.map((sl) => {
          const userId = sl.user?._id;
          const storedInsights = insightsObj[userId] || [];
          return {
            ...sl,
            psyInsights: storedInsights, // attach an array of { text, date, ... }
          };
        });

        setSanityLevels(updated);
        setFilteredLevels(updated);
      } else {
        setSanityLevels([]);
        setFilteredLevels([]);
      }
    } catch (err) {
      console.error('Error fetching admin sanity levels:', err);
      toast.error('Failed to fetch sanity levels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===============================
  // 2) Searching (by user’s name/email)
  // ===============================
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    let updated = [...sanityLevels];
    if (val) {
      updated = updated.filter((item) => {
        const userName = item.user?.username?.toLowerCase() || '';
        const userEmail = item.user?.email?.toLowerCase() || '';
        return (
          userName.includes(val.toLowerCase()) || userEmail.includes(val.toLowerCase())
        );
      });
    }
    setFilteredLevels(updated);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredLevels(sanityLevels);
  };

  // ===============================
  // 3) “Send Alert” logic
  // ===============================
  const handleAlertClick = (level) => {
    setSelectedLevel(level);
    setAlertDialogOpen(true);
  };
  const handleAlertClose = () => {
    setSelectedLevel(null);
    setAlertDialogOpen(false);
  };
  const handleConfirmAlert = async () => {
    if (!selectedLevel || !selectedLevel.user) return;
    try {
      const userId = selectedLevel.user._id;
      const resp = await ApiService.post('/crisis/check', { userId });
      toast.success(resp.data.message);
      handleAlertClose();
      fetchData();
    } catch (err) {
      console.error('Error sending alert:', err);
      toast.error('Failed to send alert');
    }
  };

  // ===============================
  // 4) “View Insights”
  // ===============================
  const handleViewInsights = (level) => {
    if (level.psyInsights && level.psyInsights.length > 0) {
      setCurrentInsights(level.psyInsights);
    } else {
      setCurrentInsights([]);
    }
    setInsightDialogOpen(true);
  };
  const handleCloseInsights = () => {
    setInsightDialogOpen(false);
    setCurrentInsights([]);
  };

  // Color for sanity level
  const getColor = (pct) => {
    if (pct == null) return 'grey.500';
    if (pct < 20) return 'error.main';
    if (pct < 50) return 'warning.main';
    return 'success.main';
  };

  // Sort ascending
  const sorted = [...filteredLevels].sort(
    (a, b) => (a.sanityPercentage || 0) - (b.sanityPercentage || 0)
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
        Admin Alerts
      </Typography>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
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
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton onClick={clearSearch}>
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={clearSearch}
              disabled={!searchQuery}
            >
              Clear Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box textAlign="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="admin-emergency-page-table">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Sanity %</TableCell>
                <TableCell>Insights</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((level) => {
                  const user = level.user || {};
                  const color = getColor(level.sanityPercentage);
                  const hasInsights = level.psyInsights && level.psyInsights.length > 0;
                  return (
                    <TableRow key={level._id}>
                      <TableCell>
                        {user.username
                          ? `${user.username} (${user.email})`
                          : 'Unknown User'}
                      </TableCell>
                      <TableCell sx={{ color, fontWeight: 600 }}>
                        {level.sanityPercentage != null
                          ? `${level.sanityPercentage.toFixed(1)}%`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {hasInsights
                          ? `(${level.psyInsights.length} insight${
                              level.psyInsights.length === 1 ? '' : 's'
                            })`
                          : 'No insights'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="secondary"
                          onClick={() => handleAlertClick(level)}
                          disabled={
                            level.sanityPercentage == null || level.sanityPercentage >= 50
                          }
                        >
                          <Send />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleViewInsights(level)}
                          disabled={!hasInsights}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Alert Dialog */}
      <Dialog open={alertDialogOpen} onClose={handleAlertClose} fullWidth maxWidth="sm">
        <DialogTitle>Send Crisis Alert</DialogTitle>
        <DialogContent>
          {selectedLevel && selectedLevel.user && (
            <Typography>
              Send Twilio crisis alert to{' '}
              <strong>{selectedLevel.user.username || 'this user'}</strong>?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAlertClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmAlert} variant="contained" color="primary">
            Send Alert
          </Button>
        </DialogActions>
      </Dialog>

      {/* Insights Dialog */}
      <Dialog open={insightDialogOpen} onClose={handleCloseInsights} fullWidth maxWidth="sm">
        <DialogTitle>Psychologist Insights</DialogTitle>
        <DialogContent dividers>
          {currentInsights.length === 0 ? (
            <Typography>No insights for this user.</Typography>
          ) : (
            <List>
              {currentInsights.map((ins, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText
                    primary={
                      <>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: '#333' }}>
                          {new Date(ins.date).toLocaleString()}
                        </Typography>
                      </>
                    }
                    secondary={ins.text}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInsights} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmergencyPage;
