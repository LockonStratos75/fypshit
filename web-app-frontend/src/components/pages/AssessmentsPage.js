// src/components/pages/AssessmentsPage.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, CircularProgress, Grid, Snackbar } from '@mui/material';

const AssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/psychologist/assessments'); // Adjust the URL as needed
        setAssessments(response.data.assessments);
      } catch (error) {
        console.error('Error fetching assessments:', error);
        setError('Failed to fetch assessments.');
        setOpenSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box p={3} bgcolor="#f5f5f5" minHeight="100vh">
      <Typography variant="h4" gutterBottom>
        All Assessments
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : assessments.length === 0 ? (
        <Typography>No assessments found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {assessments.map((assessment) => (
            <Grid item xs={12} sm={6} md={4} key={assessment._id}>
              <Card sx={{ mb: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>
                    {assessment.assessmentType}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    User: {assessment.userId.username} ({assessment.userId.email})
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Score: {assessment.score}
                  </Typography>
                  <Typography variant="body2">
                    Responses: {assessment.responses.join(', ')}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Created at: {new Date(assessment.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error}
      />
    </Box>
  );
};

export default AssessmentsPage;