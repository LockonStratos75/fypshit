// src/pages/LoginPage.js

import React from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const { handleSubmit, control } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await AuthService.login(data.email, data.password);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success('Login successful');
        // Decode token to get user role and redirect accordingly
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
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field, fieldState: { error } }) => (
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                {...field}
                error={!!error}
                helperText={error ? error.message : null}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            defaultValue=""
            render={({ field, fieldState: { error } }) => (
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                {...field}
                error={!!error}
                helperText={error ? error.message : null}
              />
            )}
          />
          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage;
