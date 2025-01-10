import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import api from '../../components/services/ApiService';
import { Link } from 'react-router-dom';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // For filtered results
  const [isLoading, setIsLoading] = useState(false);

  // For user detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAge, setFilterAge] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // =========================
  // Fetch all users (Admin side)
  // =========================
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  // On mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================
  // Searching & Filtering
  // =========================
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(query, filterAge, filterLocation);
  };

  const handleFilterAgeChange = (e) => {
    const age = e.target.value;
    setFilterAge(age);
    applyFilters(searchQuery, age, filterLocation);
  };

  const handleFilterLocationChange = (e) => {
    const location = e.target.value;
    setFilterLocation(location);
    applyFilters(searchQuery, filterAge, location);
  };

  const applyFilters = (query, age, location) => {
    let updatedUsers = [...users];

    // Search Filter
    if (query) {
      updatedUsers = updatedUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Age Filter
    if (age) {
      updatedUsers = updatedUsers.filter((user) => user.age === parseInt(age));
    }

    // Location Filter
    if (location) {
      updatedUsers = updatedUsers.filter(
        (user) => user.location?.toLowerCase() === location.toLowerCase()
      );
    }

    setFilteredUsers(updatedUsers);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterAge('');
    setFilterLocation('');
    setFilteredUsers(users);
  };

  const uniqueLocations = [...new Set(users.map((u) => u.location).filter(Boolean))];

  // =========================
  // "View" button logic
  // -> calls psychologist route: /psychologist/users/:id/complete
  // =========================
  const handleViewUser = async (userId) => {
    try {
      setIsLoading(true);
      // Important: Make sure your backend route is accessible to Admin or 
      // Psychologist as needed. If only psychologists can do it,
      // either ensure your token is from a Psychologist OR adjust the route.
      const response = await api.get(`/psychologist/users/${userId}/complete`);
      setSelectedUserData(response.data); // store all of user’s data
      setDetailOpen(true); // open the dialog
    } catch (error) {
      console.error('Error fetching user complete data:', error);
      toast.error('Failed to fetch user details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedUserData(null);
  };

  // For downloading a report (if the user has any)
  const handleDownloadReport = async (reportId, username) => {
    try {
      const response = await api.get(`/report/${reportId}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `User_Report_${username}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#004080' }}>
        Users List
      </Typography>

      {/* Search and Filter Section */}
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
                      <IconButton onClick={() => handleSearchChange({ target: { value: '' } })}>
                        <Clear />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Age Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-age-label">Filter by Age</InputLabel>
              <Select
                labelId="filter-age-label"
                label="Filter by Age"
                value={filterAge}
                onChange={handleFilterAgeChange}
              >
                <MenuItem value="">
                  <em>All Ages</em>
                </MenuItem>
                {[...new Set(users.map((u) => u.age).filter(Boolean))]
                  .sort((a, b) => a - b)
                  .map((age) => (
                    <MenuItem key={age} value={age}>
                      {age}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Location Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-location-label">Filter by Location</InputLabel>
              <Select
                labelId="filter-location-label"
                label="Filter by Location"
                value={filterLocation}
                onChange={handleFilterLocationChange}
              >
                <MenuItem value="">
                  <em>All Locations</em>
                </MenuItem>
                {uniqueLocations.sort().map((loc) => (
                  <MenuItem key={loc} value={loc}>
                    {loc}
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
              disabled={!searchQuery && !filterAge && !filterLocation}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Loading Indicator */}
      {isLoading && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      )}

      {/* Users Table */}
      {!isLoading && users.length > 0 && (
        <Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.age || 'N/A'}</TableCell>
                    <TableCell>{user.location || 'N/A'}</TableCell>
                    <TableCell align="center">
                      {/* 
                        "View" => fetch single user detail 
                        Calls the psychologist endpoint to get "complete" user data
                      */}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewUser(user._id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No users match your search/filter criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      {!isLoading && users.length === 0 && (
        <Typography variant="body1" mt={3}>
          No users found.
        </Typography>
      )}

      {/* =======================
          Detail Dialog
       ======================= */}
      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="lg" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {selectedUserData ? (
            <Box>
              {/* BASIC INFO */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                      <TableCell>{selectedUserData.user?.username}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell>{selectedUserData.user?.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Age</TableCell>
                      <TableCell>{selectedUserData.user?.age ?? 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                      <TableCell>{selectedUserData.user?.location ?? 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              {/* SANITY LEVEL */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Sanity Level</Typography>
                {selectedUserData.sanityLevel ? (
                  <Typography>
                    Current: {selectedUserData.sanityLevel.sanityPercentage}%
                  </Typography>
                ) : (
                  <Typography>No sanity level found.</Typography>
                )}
              </Paper>

              {/* ASSESSMENTS */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Assessments</Typography>
                {selectedUserData.assessments?.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Created At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedUserData.assessments.map((asmt) => (
                        <TableRow key={asmt._id}>
                          <TableCell>{asmt.assessmentType}</TableCell>
                          <TableCell>{asmt.score}</TableCell>
                          <TableCell>{dayjs(asmt.createdAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography>No assessments found.</Typography>
                )}
              </Paper>

              {/* SER RESULTS */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>SER Results</Typography>
                {selectedUserData.serResults?.length > 0 ? (
                  <List dense>
                    {selectedUserData.serResults.map((ser) => (
                      <ListItem key={ser._id}>
                        <ListItemText
                          primary={`Dominant Emotion: ${ser?.highestEmotion?.label ?? 'N/A'}`}
                          secondary={`Date: ${dayjs(ser.date).format('YYYY-MM-DD HH:mm')}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>No SER results found.</Typography>
                )}
              </Paper>

              {/* SENTIMENT SCORES */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Sentiment Scores</Typography>
                {selectedUserData.sentimentScores?.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Session Name</TableCell>
                        <TableCell>Avg Sentiment</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedUserData.sentimentScores.map((s) => (
                        <TableRow key={s._id}>
                          <TableCell>{s.sessionName}</TableCell>
                          <TableCell>{s.averageSentiment}</TableCell>
                          <TableCell>{dayjs(s.date).format('YYYY-MM-DD HH:mm')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography>No sentiment scores found.</Typography>
                )}
              </Paper>

              {/* CHAT SESSIONS */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Chat Sessions</Typography>
                {selectedUserData.chatSessions?.length > 0 ? (
                  <List dense>
                    {selectedUserData.chatSessions.map((sess) => (
                      <ListItem key={sess._id}>
                        <ListItemText
                          primary={`Session ID: ${sess._id}`}
                          secondary={`Date: ${sess.date}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>No chat sessions found.</Typography>
                )}
              </Paper>

              {/* REPORTS */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Reports</Typography>
                {selectedUserData.reports?.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Report ID</TableCell>
                        <TableCell>Template</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Download</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedUserData.reports.map((rep) => (
                        <TableRow key={rep._id}>
                          <TableCell>{rep._id}</TableCell>
                          <TableCell>{rep.templateName}</TableCell>
                          <TableCell>{dayjs(rep.createdAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              onClick={() =>
                                handleDownloadReport(rep._id, selectedUserData.user?.username)
                              }
                            >
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography>No reports found.</Typography>
                )}
              </Paper>
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersList;
