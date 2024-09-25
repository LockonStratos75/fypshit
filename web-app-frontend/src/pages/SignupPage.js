// src/pages/SignupPage.js

import React from 'react';
import { Container, Typography, TextField, Button, Box, MenuItem } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  username: yup.string().required('Username is required').min(3, 'Minimum 3 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Minimum 6 characters'),
  role: yup.string().oneOf(['admin', 'psychologist'], 'Select a valid role').required('Role is required'),
});

const SignupPage = () => {
  const { handleSubmit, control } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await AuthService.signup(data.username, data.email, data.password, data.role);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success('Signup successful');
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
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" align="center" gutterBottom>
          Signup
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="username"
            control={control}
            defaultValue=""
            render={({ field, fieldState: { error } }) => (
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                {...field}
                error={!!error}
                helperText={error ? error.message : null}
              />
            )}
          />
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
          <Controller
            name="role"
            control={control}
            defaultValue=""
            render={({ field, fieldState: { error } }) => (
              <TextField
                select
                label="Role"
                fullWidth
                margin="normal"
                {...field}
                error={!!error}
                helperText={error ? error.message : null}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="psychologist">Psychologist</MenuItem>
              </TextField>
            )}
          />
          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Signup
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default SignupPage;
