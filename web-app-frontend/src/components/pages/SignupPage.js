// src/pages/SignupPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
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
  username: yup.string().required('Username is required').min(3, 'Minimum 3 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Minimum 6 characters'),
});

export default function SignupPage() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const role = 'psychologist';
      const response = await AuthService.signup(data.username, data.email, data.password, role);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success('Signup successful');
        const decoded = JSON.parse(atob(response.data.token.split('.')[1]));
        if (decoded.role === 'psychologist') {
          navigate('/psychologist/dashboard');
        } else {
          toast.error('Unknown user role');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed');
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
            Sign Up
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Create your account to access mental health management tools.
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2} mt={2}>
            <Controller
              name="username"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  error={!!errors.username}
                  helperText={errors.username ? errors.username.message : null}
                  fullWidth
                  variant="outlined"
                />
              )}
            />
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

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{ textTransform: 'none', fontSize: '1rem', fontWeight: 500 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>
            <Typography variant="body2" mt={2}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#004080', textDecoration: 'none' }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
