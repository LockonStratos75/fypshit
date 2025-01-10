// src/components/pages/PsychologistRecords.js

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  InputAdornment,
  TableContainer
} from '@mui/material';
import { Search, Clear, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../components/services/ApiService';

const PsychologistRecords = () => {
  // Data State
  const [psychologists, setPsychologists] = useState([]);
  const [filteredPsychologists, setFilteredPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search/Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpec, setFilterSpec] = useState(''); // e.g. specialization or any relevant field
  const [filterYears, setFilterYears] = useState('');

  // Delete State
  const [selectedPsychologist, setSelectedPsychologist] = useState(null);

  // 1. Fetch all psychologists
  const fetchPsychologists = async () => {
    try {
      const res = await api.get('/admin/psychologists'); // from adminController.getAllPsychologists
      setPsychologists(res.data.psychologists || []);
      setFilteredPsychologists(res.data.psychologists || []);
    } catch (error) {
      console.error('Error fetching psychologists:', error);
      toast.error('Failed to fetch psychologists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPsychologists();
  }, []);

  // 2. Filter / Search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(query, filterSpec, filterYears);
  };

  const handleFilterSpecChange = (e) => {
    const spec = e.target.value;
    setFilterSpec(spec);
    applyFilters(searchQuery, spec, filterYears);
  };

  const handleFilterYearsChange = (e) => {
    const years = e.target.value;
    setFilterYears(years);
    applyFilters(searchQuery, filterSpec, years);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterSpec('');
    setFilterYears('');
    setFilteredPsychologists(psychologists);
  };

  const applyFilters = (query, spec, years) => {
    let updated = [...psychologists];
    // Search by username, email
    if (query) {
      updated = updated.filter(
        (p) =>
          p.username.toLowerCase().includes(query.toLowerCase()) ||
          p.email.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by specialization
    if (spec) {
      updated = updated.filter(
        (p) => p.specialization && p.specialization.toLowerCase() === spec.toLowerCase()
      );
    }

    // Filter by years of experience
    if (years) {
      updated = updated.filter((p) => parseInt(p.yearsOfExperience) === parseInt(years));
    }

    setFilteredPsychologists(updated);
  };

  // 3. Deletion
  const handleDelete = async (psychologist) => {
    try {
      if (!window.confirm(`Are you sure you want to delete ${psychologist.username}?`)) return;
      // Make a DELETE request
      await api.delete(`/admin/psychologists/${psychologist._id}`);
      toast.success('Psychologist deleted successfully');
      fetchPsychologists(); // Refresh the list
    } catch (error) {
      console.error('Error deleting psychologist:', error);
      toast.error(error.response?.data?.message || 'Failed to delete psychologist');
    }
  };

  // 4. Render
  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#004080' }}>
        Psychologist Records
      </Typography>

      {/* Search / Filter Section */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} md={4}>
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

          {/* Filter by Specialization */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Specialization</InputLabel>
              <Select
                label="Specialization"
                value={filterSpec}
                onChange={handleFilterSpecChange}
              >
                <MenuItem value="">
                  <em>All Specializations</em>
                </MenuItem>
                {[...new Set(psychologists.map((p) => p.specialization).filter(Boolean))]
                  .sort()
                  .map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filter by Years */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Years of Experience</InputLabel>
              <Select
                label="Years of Experience"
                value={filterYears}
                onChange={handleFilterYearsChange}
              >
                <MenuItem value="">
                  <em>All Years</em>
                </MenuItem>
                {[...new Set(psychologists.map((p) => p.yearsOfExperience).filter(Boolean))]
                  .sort((a, b) => a - b)
                  .map((yr) => (
                    <MenuItem key={yr} value={yr}>
                      {yr}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Clear Filters Button */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleClearFilters}
              disabled={!searchQuery && !filterSpec && !filterYears}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="psychologist records table">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPsychologists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No psychologists match your search/filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPsychologists.map((psych) => (
                  <TableRow key={psych._id}>
                    <TableCell>{psych.username}</TableCell>
                    <TableCell>{psych.email}</TableCell>
                    <TableCell>{psych.specialization || 'N/A'}</TableCell>
                    <TableCell>{psych.yearsOfExperience || 'N/A'}</TableCell>
                    <TableCell>{psych.phoneNumber || 'N/A'}</TableCell>
                    <TableCell align="center">
                      {/* Only Delete, no edit */}
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(psych)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default PsychologistRecords;
