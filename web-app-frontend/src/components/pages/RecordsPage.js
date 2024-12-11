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
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import ApiService from '../../components/services/ApiService'; // Adjust the import path as necessary

const RecordsPage = () => {
  // State variables
  const [users, setUsers] = useState([]); // Stores the list of users
  const [loading, setLoading] = useState(true); // Indicates if data is being loaded
  const [editDialogOpen, setEditDialogOpen] = useState(false); // Controls the visibility of the edit dialog
  const [currentUser, setCurrentUser] = useState(null); // Stores the user being edited
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Controls the visibility of the delete confirmation dialog

  // Fetch all users from the backend
  const fetchUsers = async () => {
    try {
      const response = await ApiService.get('/admin/users'); // Adjust the endpoint as necessary
      setUsers(response.data.users);
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

  // Handle opening the edit dialog
  const handleEditClick = (user) => {
    setCurrentUser(user);
    setEditDialogOpen(true);
  };

  // Handle closing the edit dialog
  const handleEditClose = () => {
    setCurrentUser(null);
    setEditDialogOpen(false);
  };

  // Handle submitting the edited user details
  const handleEditSubmit = async () => {
    try {
      await ApiService.put(`/admin/users/${currentUser._id}`, currentUser); // Update user details
      toast.success('User updated successfully');
      fetchUsers(); // Refresh the user list
      handleEditClose(); // Close the dialog
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  // Handle opening the delete confirmation dialog
  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setDeleteDialogOpen(true);
  };

  // Handle closing the delete confirmation dialog
  const handleDeleteClose = () => {
    setCurrentUser(null);
    setDeleteDialogOpen(false);
  };

  // Handle confirming the deletion of a user
  const handleDeleteConfirm = async () => {
    try {
      await ApiService.delete(`/admin/users/${currentUser._id}`); // Delete user
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the user list
      handleDeleteClose(); // Close the dialog
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Handle input changes in the edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        User Records
      </Typography>

      {/* Loading Indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        /* Users Table */
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
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                /* Map through the users and display each in a table row */
                users.map((user) => (
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
