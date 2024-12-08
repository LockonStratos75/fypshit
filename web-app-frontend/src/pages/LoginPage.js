// src/pages/LoginPage.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AuthService from '../services/AuthService';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import logo from '../assets/Eunoia.png'; // Import the EUNOIA logo
import '../styles/Components.css'; // Use the common CSS file

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false); // State to manage the role switch

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const role = isAdmin ? 'admin' : 'psychologist';
      const response = await AuthService.login(data.email, data.password, role);
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
      toast.error(error.response?.data?.message || 'Invalid credentials');
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
                Sign In
              </Typography>
              <Typography variant="subtitle1" className="auth-subheading">
                Access your mental health management tools.
              </Typography>

              {/* Role Switch */}
              <Box display="flex" justifyContent="center" my={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAdmin}
                      onChange={(e) => setIsAdmin(e.target.checked)}
                      name="roleSwitch"
                      color="primary"
                    />
                  }
                  label={isAdmin ? 'Admin' : 'Psychologist'}
                />
              </Box>

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
              <div className="forgot-password-container">
                <Link to="/forgot-password" className="forgot-password-text">
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                className="auth-button"
              >
                Sign In
              </Button>
              
              {/* Conditionally render the sign-up prompt */}
              {!isAdmin && (
                <Typography variant="body2" className="redirect-text">
                  Don’t have an account? <Link to="/signup">Sign up</Link>
                </Typography>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginPage;
