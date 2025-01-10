// src/components/pages/RecordsPage.js

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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Box,
  Tooltip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Edit, Delete, Search, Clear } from '@mui/icons-material';
import { toast } from 'react-toastify';
import ApiService from '../../components/services/ApiService'; // Adjust the import path as necessary

const RecordsPage = () => {
  // Core Data States
  const [users, setUsers] = useState([]); // Stores the full list of users
  const [filteredUsers, setFilteredUsers] = useState([]); // Stores filtered subset
  const [loading, setLoading] = useState(true); 

  // Dialog & Form States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAge, setFilterAge] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // ===========================
  // 1. Fetch All Users
  // ===========================
  const fetchUsers = async () => {
    try {
      const response = await ApiService.get('/admin/users'); // Adjust the endpoint as necessary
      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []); // Initialize filtered list
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // ===========================
  // 2. Filter & Search Handlers
  // ===========================
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

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterAge('');
    setFilterLocation('');
    setFilteredUsers(users); // Reset to the full list
  };

  // The main function that filters users based on search and selected filters
  const applyFilters = (query, age, location) => {
    let updatedList = [...users];

    // Search filter (by username or email)
    if (query) {
      updatedList = updatedList.filter(
        (user) =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Age filter
    if (age) {
      updatedList = updatedList.filter((user) => user.age === parseInt(age));
    }

    // Location filter
    if (location) {
      updatedList = updatedList.filter(
        (user) => user.location && user.location.toLowerCase() === location.toLowerCase()
      );
    }

    setFilteredUsers(updatedList);
  };

  // Extract unique locations for the filter dropdown
  const uniqueLocations = [...new Set(users.map((user) => user.location).filter(Boolean))];

  // ===========================
  // 3. Edit Dialog Handlers
  // ===========================
  const handleEditClick = (user) => {
    setCurrentUser(user);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setCurrentUser(null);
    setEditDialogOpen(false);
  };

  const handleEditSubmit = async () => {
    if (!currentUser) return;
    try {
      await ApiService.put(`/admin/users/${currentUser._id}`, currentUser);
      toast.success('User updated successfully');
      fetchUsers(); // Refresh user list
      handleEditClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  // Handle Input Changes in the Edit Form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===========================
  // 4. Delete Dialog Handlers
  // ===========================
  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setCurrentUser(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!currentUser) return;
    try {
      await ApiService.delete(`/admin/users/${currentUser._id}`);
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh user list
      handleDeleteClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // ===========================
  // Render
  // ===========================
  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        User Records
      </Typography>

      {/* Search & Filter Section */}
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
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="user records table">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Display a message if no users are found */}
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users match your search/filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.gender}</TableCell>
                    <TableCell>{user.age}</TableCell>
                    <TableCell>{user.location}</TableCell>
                    <TableCell align="center">
                      {/* Edit Button */}
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEditClick(user)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      {/* Delete Button */}
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDeleteClick(user)}>
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {currentUser && (
            <Box component="form" sx={{ mt: 2 }}>
              {/* Username Field */}
              <TextField
                margin="normal"
                fullWidth
                label="Username"
                name="username"
                value={currentUser.username || ''}
                onChange={handleInputChange}
              />
              {/* Email Field */}
              <TextField
                margin="normal"
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={currentUser.email || ''}
                onChange={handleInputChange}
              />
              {/* Gender Field */}
              <TextField
                margin="normal"
                fullWidth
                select
                label="Gender"
                name="gender"
                value={currentUser.gender || ''}
                onChange={handleInputChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </TextField>
              {/* Age Field */}
              <TextField
                margin="normal"
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={currentUser.age || ''}
                onChange={handleInputChange}
                inputProps={{ min: 0, max: 120 }}
              />
              {/* Location Field */}
              <TextField
                margin="normal"
                fullWidth
                label="Location"
                name="location"
                value={currentUser.location || ''}
                onChange={handleInputChange}
              />
              {/* Add more fields as necessary */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {/* Cancel Button */}
          <Button onClick={handleEditClose} color="secondary">
            Cancel
          </Button>
          {/* Save Button */}
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose} fullWidth maxWidth="xs">
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user{' '}
            <strong>{currentUser?.username}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          {/* Cancel Button */}
          <Button onClick={handleDeleteClose} color="secondary">
            Cancel
          </Button>
          {/* Delete Button */}
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RecordsPage;
