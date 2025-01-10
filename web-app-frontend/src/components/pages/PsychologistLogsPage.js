// src/components/pages/PsychologistLogsPage.jsx

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
import ApiService from '../../components/services/ApiService'; // Adjust path if needed
import dayjs from 'dayjs'; // For date formatting

const PsychologistLogsPage = () => {
  // State for logs, loading, pagination, etc.
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(0);          // 0-based index
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [totalLogs, setTotalLogs] = useState(0); 

  // Fetch logs from backend with pagination
  const fetchLogs = async (currentPage, limit) => {
    setLoading(true);
    try {
      // The server expects a 1-based page index
      const response = await ApiService.get('/psychologist/logs', {
        params: {
          page: currentPage + 1,
          limit: limit,
        },
      });

      // Expecting response like: { logs: [...], totalLogs: number }
      setLogs(response.data.logs || []);
      setTotalLogs(response.data.totalLogs || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch psychologist logs.');
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch logs initially and when page/rows change
  useEffect(() => {
    fetchLogs(page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0); // reset to first page
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 700, color: 'primary.main' }}
      >
        Activity Logs
      </Typography>

      {loading ? (
        // Loading indicator
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="psychologist logs table">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No logs available.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      {log.userId?.username || 'Unknown User'}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* TablePagination component */}
          <TablePagination
            component="div"
            count={totalLogs}           // total logs in DB
            page={page}                // current page index
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}  // logs per page
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

export default PsychologistLogsPage;
