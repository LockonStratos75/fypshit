// src/components/Report/ReportGenerator.js

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Paper,
  CircularProgress,
} from '@mui/material';
import api from '../../components/services/ApiService';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

const ReportGenerator = () => {
  const { handleSubmit, control, reset } = useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users'); // Ensure this endpoint exists and returns { users: [...] }
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      }
    };

    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    const { userId, templateName } = data;
    setLoading(true);
    setReport(null);

    try {
      // Make a POST request to generate the report
      const response = await api.post('/report/generate', { userId, templateName });

      const { report: generatedReport } = response.data;

      toast.success('Report generated successfully');

      setReport(generatedReport);
      reset();
    } catch (error) {
      console.error('Error generating report:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to generate report');
      } else {
        toast.error('Failed to generate report');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;

    try {
      const response = await api.get(`/report/${report._id}/download`, {
        responseType: 'blob', // Important for handling binary data
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Create a link element
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `User_Report_${report.user.username}.pdf`; // Modify as needed

      // Append to the document and trigger the download
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
    <Container>
      <Box mt={5}>
        <Typography variant="h4" gutterBottom sx={{ color: '#004080', fontWeight: 700 }}>
          Generate User Report
        </Typography>
        <Paper elevation={3} sx={{ padding: 4, borderRadius: '12px' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Select User */}
            <Controller
              name="userId"
              control={control}
              defaultValue=""
              rules={{ required: 'Please select a user.' }}
              render={({ field, fieldState }) => (
                <TextField
                  select
                  label="Select User"
                  fullWidth
                  margin="normal"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? fieldState.error.message : null}
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.username} ({user.email})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Select Template */}
            <Controller
              name="templateName"
              control={control}
              defaultValue="default_template"
              rules={{ required: 'Please select a template.' }}
              render={({ field, fieldState }) => (
                <TextField
                  select
                  label="Template Name"
                  fullWidth
                  margin="normal"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? fieldState.error.message : null}
                >
                  <MenuItem value="default_template">Default Template</MenuItem>
                  {/* Add other templates if available */}
                </TextField>
              )}
            />

            {/* Submit Button */}
            <Box mt={3} textAlign="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{
                  borderRadius: '30px',
                  px: 5,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'background-color 0.3s, transform 0.3s',
                  '&:hover': {
                    backgroundColor: '#002f5c',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate PDF Report'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>

      {/* Download Button */}
      {report && (
        <Box mt={5} textAlign="center">
          <Typography variant="h6" gutterBottom>
            Report Generated:
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDownload}
            sx={{
              borderRadius: '30px',
              px: 5,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              transition: 'background-color 0.3s, transform 0.3s',
              '&:hover': {
                backgroundColor: '#a61e36',
                transform: 'scale(1.05)',
              },
            }}
          >
            Download Report
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ReportGenerator;
