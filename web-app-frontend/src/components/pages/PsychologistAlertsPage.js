// file: src/components/pages/PsychologistAlertsPage.js

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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Box,
  Grid,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { toast } from 'react-toastify';
import ApiService from '../../components/services/ApiService';

const PsychologistAlertsPage = () => {
  const [sanityLevels, setSanityLevels] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // For the “Add Insight” dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [insightText, setInsightText] = useState('');

  // For searching
  const [searchQuery, setSearchQuery] = useState('');

  // 1) Load all user+sanity combos
  const fetchData = async () => {
    setLoading(true);
    try {
      // E.g. GET /psychologist/all-sanity-levels
      const res = await ApiService.get('/psychologist/all-sanity-levels');
      if (res.data && res.data.sanityLevels) {
        setSanityLevels(res.data.sanityLevels);
        setFiltered(res.data.sanityLevels);
      }
    } catch (err) {
      console.error('Error fetching sanity levels:', err);
      toast.error('Failed to fetch sanity levels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2) Searching
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    applyFilter(val);
  };
  const applyFilter = (val) => {
    let updated = [...sanityLevels];
    if (val) {
      updated = updated.filter(
        (sl) =>
          sl.user?.username?.toLowerCase().includes(val.toLowerCase()) ||
          sl.user?.email?.toLowerCase().includes(val.toLowerCase())
      );
    }
    setFiltered(updated);
  };
  const clearSearch = () => {
    setSearchQuery('');
    setFiltered(sanityLevels);
  };

  // 3) Add Insight logic
  const handleAddInsightClick = (level) => {
    setSelectedLevel(level);
    setInsightText('');
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLevel(null);
    setInsightText('');
  };

  const handleSaveInsight = () => {
    if (!selectedLevel) return;
    try {
      const userId = selectedLevel.user._id;

      // 3a) Read existing local data
      const stored = localStorage.getItem('psychologistInsights') || '{}';
      const insightObj = JSON.parse(stored);

      // 3b) For each user, store an array of “insights”
      if (!insightObj[userId]) {
        insightObj[userId] = [];
      }

      insightObj[userId].push({
        text: insightText,
        date: new Date().toISOString(),
        // optionally store psychologist info
      });

      // 3c) Save back to localStorage
      localStorage.setItem('psychologistInsights', JSON.stringify(insightObj));

      toast.success('Insight saved (in localStorage).');
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving local insight:', err);
      toast.error('Failed to save insight locally');
    }
  };

  // For coloring the sanity%
  const getColor = (pct) => {
    if (pct == null) return 'grey.500';
    if (pct < 20) return 'error.main';
    if (pct < 50) return 'warning.main';
    return 'success.main';
  };

  // Sort ascending
  const sorted = [...filtered].sort((a, b) => (a.sanityPercentage || 0) - (b.sanityPercentage || 0));

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
        Psychologist Alerts
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
                endAdornment: !!searchQuery && (
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
          <Table aria-label="psychologist-alerts-table">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Sanity %</TableCell>
                <TableCell align="center">Add Insight</TableCell>
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
                sorted.map((sl) => {
                  const user = sl.user || {};
                  const color = getColor(sl.sanityPercentage);
                  const canAddInsight = sl.sanityPercentage < 25; // Example threshold
                  return (
                    <TableRow key={sl._id}>
                      <TableCell>{user.username || 'Unknown'}</TableCell>
                      <TableCell>{user.email || 'Unknown'}</TableCell>
                      <TableCell sx={{ color, fontWeight: 600 }}>
                        {sl.sanityPercentage != null
                          ? `${sl.sanityPercentage.toFixed(1)}%`
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          onClick={() => handleAddInsightClick(sl)}
                          disabled={!canAddInsight}
                        >
                          Add Insight
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for adding insight */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add Insight</DialogTitle>
        <DialogContent>
          <TextField
            label="Insight"
            multiline
            rows={3}
            fullWidth
            sx={{ mt: 2 }}
            value={insightText}
            onChange={(e) => setInsightText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveInsight} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PsychologistAlertsPage;
