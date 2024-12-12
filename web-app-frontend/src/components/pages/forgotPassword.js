// src/components/pages/ForgotPasswordPage.js

import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import AuthService from '../../components/services/AuthService'; // Your AuthService for API calls
import { toast } from 'react-toastify';

export default function ForgotPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      // Assuming you have a method to change the password
      await AuthService.changePassword(password);
      toast.success('Password changed successfully.');
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.response?.data?.message || 'Error changing password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      bgcolor="#FFFFFF"
      alignItems="center"
      justifyContent="center"
      p={2}
    >
      <Card sx={{ maxWidth: 400, width: '100%', p: 2, borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={500} gutterBottom>
            Change Password
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Enter a new password.
          </Typography>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
              required
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              variant="outlined"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Change Password'}
            </Button>
          </form>
          <Box mt={2}>
            <Link to="/" style={{ textDecoration: 'none', color: '#004080' }}>
              Back to Login
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}