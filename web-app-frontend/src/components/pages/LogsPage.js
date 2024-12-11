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
} from '@mui/material';
import { toast } from 'react-toastify';
import ApiService from '../../components/services/ApiService'; // Adjust the import path as necessary
import dayjs from 'dayjs'; // For date formatting

const LogsPage = () => {
  // State variables
  const [logs, setLogs] = useState([]); // Stores the list of logs
  const [loading, setLoading] = useState(true); // Indicates if data is being loaded

  // Fetch all logs from the backend
  const fetchLogs = async () => {
    try {
      const response = await ApiService.get('/admin/logs'); // Adjust the endpoint as necessary
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs on component mount
  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Action Logs
      </Typography>

      {/* Loading Indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        /* Logs Table */
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
        </TableContainer>
      )}
    </Container>
  );
};

export default LogsPage;
