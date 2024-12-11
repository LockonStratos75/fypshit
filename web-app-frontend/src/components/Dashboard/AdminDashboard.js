// src/components/Dashboard/AdminDashboard.js

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { toast } from 'react-toastify';
import AuthService from '../../components/services/AuthService';
import { Link } from 'react-router-dom';
import { Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [behaviorAnalytics, setBehaviorAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme(); // Utilize MUI's theme for consistent styling

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const systemMetricsRes = await AuthService.getSystemMetrics();
        const userBehaviorRes = await AuthService.getUserBehaviorAnalytics();

        console.log('System Metrics:', systemMetricsRes.data); // Debugging
        console.log('User Behavior Analytics:', userBehaviorRes.data); // Debugging

        setMetrics(systemMetricsRes.data);
        setBehaviorAnalytics(userBehaviorRes.data);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        toast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 10, textAlign: 'center' }}>
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dashboard data...
        </Typography>
      </Container>
    );
  }

  if (!metrics || !behaviorAnalytics) {
    return (
      <Container maxWidth="lg" sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Failed to load dashboard data. Please try again later.
        </Typography>
      </Container>
    );
  }

  // Check if sanityDistribution exists and has the necessary fields
  const sanityDistributionExists =
    metrics.sanityDistribution &&
    typeof metrics.sanityDistribution.low === 'number' &&
    typeof metrics.sanityDistribution.medium === 'number' &&
    typeof metrics.sanityDistribution.high === 'number';

  // Prepare data for Sanity Distribution Pie Chart
  const sanityDistributionData = sanityDistributionExists
    ? {
        labels: ['Low', 'Medium', 'High'],
        datasets: [
          {
            data: [
              metrics.sanityDistribution.low,
              metrics.sanityDistribution.medium,
              metrics.sanityDistribution.high,
            ],
            backgroundColor: [
              theme.palette.error.main,
              theme.palette.warning.main,
              theme.palette.success.main,
            ],
            hoverBackgroundColor: [
              theme.palette.error.light,
              theme.palette.warning.light,
              theme.palette.success.light,
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Prepare data for Sentiment Trend Line Chart
  // Assuming behaviorAnalytics.sentimentTrend is an object with dates as keys
  // e.g., { "2024-12-05": 0.2, "2024-12-06": -0.1, ... }
  const sentimentTrendLabels = behaviorAnalytics.sentimentTrend
    ? Object.keys(behaviorAnalytics.sentimentTrend).sort(
        (a, b) => new Date(a) - new Date(b)
      )
    : [];

  const sentimentTrendData = {
    labels: sentimentTrendLabels,
    datasets: [
      {
        label: 'Average Sentiment',
        data: sentimentTrendLabels.map((day) =>
          parseFloat(behaviorAnalytics.sentimentTrend[day])
        ),
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: theme.palette.primary.main,
        tension: 0.4,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: theme.palette.primary.main,
      },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 700, color: theme.palette.primary.main }}
        align="center"
      >
        Admin Dashboard
      </Typography>

      {/* Metrics Overview */}
      <Grid container spacing={4}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: '12px',
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}
            >
              Total Users
            </Typography>
            <Typography
              variant="h3"
              sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
            >
              {metrics.totalUsers}
            </Typography>
          </Paper>
        </Grid>

        {/* Total Approved Psychologists */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: '12px',
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}
            >
              Approved Psychologists
            </Typography>
            <Typography
              variant="h3"
              sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
            >
              {metrics.totalPsychologists}
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Sessions */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: '12px',
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}
            >
              Sessions (Last 24h)
            </Typography>
            <Typography
              variant="h3"
              sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
            >
              {metrics.recentSessionsCount}
            </Typography>
          </Paper>
        </Grid>

        {/* Average Sanity Level */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: '12px',
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}
            >
              Avg. Sanity Level
            </Typography>
            <Typography
              variant="h3"
              sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
            >
              {metrics.averageSanityLevel}%
            </Typography>
          </Paper>
        </Grid>

        {/* Average Sentiment */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: '12px',
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}
            >
              Avg. Sentiment
            </Typography>
            <Typography
              variant="h3"
              sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
            >
              {metrics.averageSentiment}
            </Typography>
          </Paper>
        </Grid>

        {/* SER Results */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: '12px',
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}
            >
              SER Results
            </Typography>
            <Typography
              variant="h3"
              sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
            >
              {metrics.serResultsCount}
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Logs */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: '12px',
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}
            >
              Recent Logs
            </Typography>
            <Typography
              variant="h3"
              sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
            >
              {metrics.recentLogsCount}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Box mt={8}>
        <Grid container spacing={4}>
          {/* Sanity Distribution Pie Chart */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: '12px',
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Sanity Level Distribution
              </Typography>
              {sanityDistributionData ? (
                <Pie
                  data={sanityDistributionData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: { size: 14 },
                          color: theme.palette.text.primary,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${value}`;
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Typography variant="body1" color="error">
                  Sanity Distribution data is unavailable.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Sentiment Trend Line Chart */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: '12px',
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Sentiment Trend (Last 7 Days)
              </Typography>
              {sentimentTrendData.labels.length > 0 ? (
                <Line
                  data={sentimentTrendData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                      },
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false,
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Sentiment Score',
                          color: theme.palette.text.primary,
                          font: { weight: 'bold' },
                        },
                        ticks: {
                          color: theme.palette.text.secondary,
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Date',
                          color: theme.palette.text.primary,
                          font: { weight: 'bold' },
                        },
                        ticks: {
                          color: theme.palette.text.secondary,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Typography variant="body1" color="error">
                  Sentiment Trend data is unavailable.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Applications Management Button */}
      <Box mt={8} textAlign="right">
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/admin/applications"
          sx={{
            borderRadius: '30px',
            px: 5,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'background-color 0.3s, transform 0.3s',
            '&:hover': {
              backgroundColor: theme.palette.secondary.dark,
              transform: 'scale(1.05)',
            },
          }}
        >
          Manage Applications
        </Button>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
