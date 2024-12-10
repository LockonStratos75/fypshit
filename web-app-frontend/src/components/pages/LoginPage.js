// src/pages/LoginPage.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AuthService from '../../components/services/AuthService';
import { toast } from 'react-toastify';
import logo from '../../assets/Eunoia.png';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function LoginPage() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Switch for selecting role

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      let response;
      if (isAdmin) {
        // Admin Login
        response = await AuthService.loginAdmin(data.email, data.password);
      } else {
        // Psychologist Login
        response = await AuthService.loginPsychologist(data.email, data.password);
      }

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success('Login successful');

        const decoded = JSON.parse(atob(response.data.token.split('.')[1]));
        const userType = decoded.userType;

        // Determine redirect based on userType
        if (userType === 'AdminProfile') {
          navigate('/admin/dashboard');
        } else if (userType === 'PsychologistProfile') {
          navigate('/psychologist/dashboard');
        } else {
          // If any other type comes up, it's unexpected since we no longer handle User here
          toast.error('Unknown user type');
          localStorage.removeItem('token'); // Remove invalid token
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Invalid credentials');
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
          <Box sx={{ mb: 2 }}>
            <img src={logo} alt="EUNOIA Logo" style={{ maxWidth: '100px' }} />
            <Typography variant="h5" fontWeight={700} color="primary" mt={1} fontFamily="Poppins">
              EUNOIA
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={500} gutterBottom fontFamily="Poppins">
            Sign In
          </Typography>
          <Typography variant="subtitle1" gutterBottom fontFamily="Poppins">
            Access your mental health management tools.
          </Typography>

          <Box my={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  color="primary"
                />
              }
              label={isAdmin ? 'Admin' : 'Psychologist'}
              sx={{ fontFamily: 'Poppins' }}
            />
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2}>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email ? errors.email.message : null}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Poppins' },
                  }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins' } }}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type="password"
                  error={!!errors.password}
                  helperText={errors.password ? errors.password.message : null}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Poppins' },
                  }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins' } }}
                />
              )}
            />
            <Box textAlign="right">
              <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#004080', fontSize: '0.9rem', fontFamily: 'Poppins' }}>
                Forgot password?
              </Link>
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{
                textTransform: 'none', 
                fontSize: '1rem', 
                fontWeight: 500, 
                borderRadius: '30px', 
                py: 1.5,
                fontFamily: 'Poppins'
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            {!isAdmin && (
              <Typography variant="body2" mt={2} fontFamily="Poppins">
                Don't have an account?{' '}
                <Link to="/signup" style={{ color: '#004080', textDecoration: 'none', fontFamily: 'Poppins' }}>
                  Sign up
                </Link>
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
