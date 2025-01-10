// src/components/pages/AssessmentsPage.js

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import api from '../../components/services/ApiService'; // uses your existing ApiService

const AssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssessmentType, setFilterAssessmentType] = useState('');

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        // GET /psychologist/assessments returns { assessments: [...] }
        const response = await api.get('/psychologist/assessments');
        const data = response.data.assessments || [];

        setAssessments(data);
        setFilteredAssessments(data); // Initially show all
      } catch (error) {
        console.error('Error fetching assessments:', error);
        setErrorMessage('Failed to fetch assessments.');
        setSnackbarOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  // ========================
  // Filtering Logic
  // ========================

  // Filter assessments based on searchQuery & filterAssessmentType
  const applyFilters = (query, type) => {
    let updated = [...assessments];

    // 1) Search filter (across assessmentType, userId.username, userId.email)
    if (query) {
      updated = updated.filter((asmt) => {
        const userName = asmt.userId?.username?.toLowerCase() || '';
        const userEmail = asmt.userId?.email?.toLowerCase() || '';
        const typeLower = asmt.assessmentType?.toLowerCase() || '';

        const q = query.toLowerCase();
        return (
          userName.includes(q) ||
          userEmail.includes(q) ||
          typeLower.includes(q)
        );
      });
    }

    // 2) Filter by assessmentType
    if (type) {
      updated = updated.filter(
        (asmt) => asmt.assessmentType === type
      );
    }

    setFilteredAssessments(updated);
  };

  // Called when user types in search field
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    applyFilters(q, filterAssessmentType);
  };

  // Called when user picks an assessment type in the filter
  const handleFilterTypeChange = (e) => {
    const newType = e.target.value;
    setFilterAssessmentType(newType);
    applyFilters(searchQuery, newType);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterAssessmentType('');
    setFilteredAssessments(assessments);
  };

  // ========================
  // Utility
  // ========================
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // ========================
  // Unique assessment types for dropdown
  // ========================
  const uniqueTypes = Array.from(
    new Set(assessments.map((a) => a.assessmentType).filter(Boolean))
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      {/* Header */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 700, color: '#004080' }}
      >
        All Assessments
      </Typography>

      {/* Filters & Search */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by username, email, or assessment type"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton onClick={() => {
                      setSearchQuery('');
                      applyFilters('', filterAssessmentType);
                    }}>
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>

          {/* Filter by Assessment Type */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-assessmenttype-label">Filter by Assessment</InputLabel>
              <Select
                labelId="filter-assessmenttype-label"
                label="Filter by Assessment"
                value={filterAssessmentType}
                onChange={handleFilterTypeChange}
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                {uniqueTypes.map((typeVal) => (
                  <MenuItem key={typeVal} value={typeVal}>
                    {typeVal}
                  </MenuItem>
                ))}
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
              disabled={!searchQuery && !filterAssessmentType}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content (Loading / Assessments) */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : filteredAssessments.length === 0 ? (
        <Typography>No assessments found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredAssessments.map((asmt) => (
            <Grid item xs={12} sm={6} md={4} key={asmt._id}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    {asmt.assessmentType}
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    User: {asmt.userId?.username} ({asmt.userId?.email})
                  </Typography>

                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Score: {asmt.score}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Responses: {Array.isArray(asmt.responses)
                      ? asmt.responses.join(', ')
                      : 'N/A'}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ display: 'block', mt: 1, color: 'text.secondary' }}
                  >
                    Created: {dayjs(asmt.createdAt).format('YYYY-MM-DD HH:mm')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}  

      {/* Snackbar for errors */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={errorMessage}
      />
    </Container>
  );
};

export default AssessmentsPage;
