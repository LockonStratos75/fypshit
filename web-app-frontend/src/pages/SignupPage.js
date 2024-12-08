// src/pages/SignupPage.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AuthService from '../services/AuthService';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import logo from '../assets/Eunoia.png'; // Import the EUNOIA logo
import '../styles/Components.css'; // Use a common CSS file for both pages

const schema = yup.object().shape({
  username: yup.string().required('Username is required').min(3, 'Minimum 3 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Minimum 6 characters'),
});

const SignupPage = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const role = 'psychologist';
      const response = await AuthService.signup(data.username, data.email, data.password, role);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success('Signup successful');
        // Decode token to get user role and redirect accordingly
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
    <>
      <section className="auth-container">
        <Loading isLoading={isLoading} />
        <div className="auth-content">
          <div className="auth-image">
            {/* Add your image here */}
            <div className="authImage"></div>
          </div>
          <div className="auth-form-container">
            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              {/* Logo and Text */}
              <Box className="auth-logo">
                <img src={logo} alt="EUNOIA Logo" className="auth-logo-image" />
                <Typography variant="h5" className="auth-logo-text">
                  EUNOIA
                </Typography>
              </Box>

              <Typography variant="h4" className="auth-heading">
                Sign Up
              </Typography>
              <Typography variant="subtitle1" className="auth-subheading">
                Create your account to access mental health management tools.
              </Typography>

              <div className="auth-input-group">
                <Controller
                  name="username"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="username"
                      label="Username"
                      placeholder="Enter username"
                      error={!!errors.username}
                      helperText={errors.username ? errors.username.message : null}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  )}
                />
              </div>
              <div className="auth-input-group">
                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="email"
                      label="Email"
                      type="email"
                      placeholder="Enter email"
                      error={!!errors.email}
                      helperText={errors.email ? errors.email.message : null}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  )}
                />
              </div>
              <div className="auth-input-group">
                <Controller
                  name="password"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="password"
                      label="Password"
                      type="password"
                      placeholder="Enter password"
                      error={!!errors.password}
                      helperText={errors.password ? errors.password.message : null}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  )}
                />
              </div>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                className="auth-button"
              >
                Sign Up
              </Button>
              <Typography variant="body2" className="redirect-text">
                Already have an account? <Link to="/login">Sign in</Link>
              </Typography>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default SignupPage;
