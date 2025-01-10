// src/components/pages/LogsPage.js

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
  CircularProgress,
  Box,
  TablePagination,
} from '@mui/material';
import { toast } from 'react-toastify';
import ApiService from '../../components/services/ApiService'; // Adjust the import path as necessary
import dayjs from 'dayjs'; // For date formatting

const LogsPage = () => {
  // State variables
  const [logs, setLogs] = useState([]); // Stores the list of logs
  const [loading, setLoading] = useState(true); // Indicates if data is being loaded
  const [page, setPage] = useState(0); // Current page number (0-based index)
  const [rowsPerPage, setRowsPerPage] = useState(10); // Logs per page
  const [totalLogs, setTotalLogs] = useState(0); // Total number of logs

  // Fetch logs from the backend with pagination
  const fetchLogs = async (currentPage, limit) => {
    setLoading(true);
    try {
      const response = await ApiService.get('/admin/logs', {
        params: {
          page: currentPage + 1, // Backend expects 1-based page index
          limit: limit,
        },
      });
      setLogs(response.data.logs || []);
      setTotalLogs(response.data.totalLogs || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs on component mount and when page or rowsPerPage changes
  useEffect(() => {
    fetchLogs(page, rowsPerPage);
  }, [page, rowsPerPage]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Action Logs
      </Typography>

      {/* Loading Indicator */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress color="primary" />
        </Box>
      ) : (
        /* Logs Table with Pagination */
        <TableContainer component={Paper}>
          <Table aria-label="action logs table">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Display a message if no logs are found */}
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No logs found.
                  </TableCell>
                </TableRow>
              ) : (
                /* Map through the logs and display each in a table row */
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      {/* Format timestamp using dayjs */}
                      {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      {/* Display username; fallback to 'Unknown User' if not available */}
                      {log.userId?.username || 'Unknown User'}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <TablePagination
            component="div"
            count={totalLogs}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Logs per page"
            sx={{
              '& .MuiTablePagination-toolbar': {
                display: 'flex',
                justifyContent: 'flex-end',
              },
            }}
          />
        </TableContainer>
      )}
    </Container>
  );
};

export default LogsPage;
