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
import AuthService from '../../services/AuthService';
import { toast } from 'react-toastify';
import logo from '../assets/Eunoia.png';

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
  const [isAdmin, setIsAdmin] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const role = isAdmin ? 'admin' : 'psychologist';
      const response = await AuthService.login(data.email, data.password, role);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success('Login successful');
        const decoded = JSON.parse(atob(response.data.token.split('.')[1]));
        if (decoded.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (decoded.role === 'psychologist') {
          navigate('/psychologist/dashboard');
        } else {
          toast.error('Unknown user role');
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
      <Card sx={{ maxWidth: 400, width: '100%', p: 2 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Box sx={{ mb: 2 }}>
            <img src={logo} alt="EUNOIA Logo" style={{ maxWidth: '100px' }} />
            <Typography variant="h5" fontWeight={700} color="primary" mt={1}>
              EUNOIA
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={500} gutterBottom>
            Sign In
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
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
                />
              )}
            />
            <Box textAlign="right">
              <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#004080', fontSize: '0.9rem' }}>
                Forgot password?
              </Link>
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{ textTransform: 'none', fontSize: '1rem', fontWeight: 500 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            {!isAdmin && (
              <Typography variant="body2" mt={2}>
                Don't have an account?{' '}
                <Link to="/signup" style={{ color: '#004080', textDecoration: 'none' }}>
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
