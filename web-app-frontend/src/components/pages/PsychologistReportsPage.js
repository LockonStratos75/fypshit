// src/components/pages/PsychologistReportsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';
import { Search, Clear, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../components/services/ApiService';

const PsychologistReportsPage = () => {
  const [reports, setReports] = useState([]);
  
  // For search/filter
  const [search, setSearch] = useState('');
  const [template, setTemplate] = useState('');
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10); 
  const [totalPages, setTotalPages] = useState(1);

  // --------------------------------------------------
  // 1) Fetch Reports with Pagination, Search, Filter
  // --------------------------------------------------
  const fetchReports = async (pageParam = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageParam.toString(),
        limit: limit.toString(),
      });

      // Append search/template if they exist
      if (search) queryParams.set('search', search);
      if (template) queryParams.set('template', template);

      const res = await api.get(`/psychologist/reports?${queryParams.toString()}`);
      const { reports, totalCount, currentPage, totalPages } = res.data;

      setReports(reports);
      setPage(currentPage);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  // Initially load page 1 of reports
  useEffect(() => {
    fetchReports(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------
  // 2) Search & Filter Handlers
  // --------------------------------------------------
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleTemplateChange = (e) => {
    setTemplate(e.target.value);
  };

  const handleSearchSubmit = () => {
    // reset to page 1
    fetchReports(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setTemplate('');
    fetchReports(1);
  };

  // --------------------------------------------------
  // 3) Pagination Handlers
  // --------------------------------------------------
  const handleNextPage = () => {
    if (page < totalPages) {
      fetchReports(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      fetchReports(page - 1);
    }
  };

  // --------------------------------------------------
  // 4) Handle Download PDF
  // --------------------------------------------------
  const handleDownload = async (reportId) => {
    try {
      const response = await api.get(`/report/${reportId}/download`, {
        responseType: 'blob', // Important to receive binary data
      });
      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `report_${reportId}.pdf`;
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      // Clean up
      link.parentNode.removeChild(link);

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#004080', mb: 3 }}>
        All Reports
      </Typography>

      {/* Search & Filter Section */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search by Username/Email"
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1 }} />,
                endAdornment: search && (
                  <IconButton onClick={() => setSearch('')}>
                    <Clear />
                  </IconButton>
                ),
              }}
            />
          </Grid>

          {/* Template Filter */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Template</InputLabel>
              <Select
                label="Template"
                value={template}
                onChange={handleTemplateChange}
              >
                <MenuItem value="">All Templates</MenuItem>
                <MenuItem value="default_template">Default Template</MenuItem>
                {/* Add more template options if you have them */}
              </Select>
            </FormControl>
          </Grid>

          {/* Buttons */}
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearchSubmit}
                sx={{ minWidth: '100px' }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClearFilters}
                disabled={!search && !template}
                sx={{ minWidth: '100px' }}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Reports Table */}
          {reports.length === 0 ? (
            <Typography>No reports found.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report ID</TableCell>
                  <TableCell>Template</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Created On</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((rep) => (
                  <TableRow key={rep._id}>
                    <TableCell>{rep._id}</TableCell>
                    <TableCell>{rep.templateName}</TableCell>
                    <TableCell>
                      {rep.user ? `${rep.user.username} (${rep.user.email})` : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {new Date(rep.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {/* Download PDF */}
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => handleDownload(rep._id)}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination Controls */}
          <Box mt={3} display="flex" justifyContent="center" gap={2}>
            <Button variant="outlined" disabled={page <= 1} onClick={handlePrevPage}>
              Previous
            </Button>
            <Typography variant="body1" align="center" sx={{ lineHeight: '2.5rem' }}>
              Page {page} of {totalPages}
            </Typography>
            <Button variant="outlined" disabled={page >= totalPages} onClick={handleNextPage}>
              Next
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default PsychologistReportsPage;
