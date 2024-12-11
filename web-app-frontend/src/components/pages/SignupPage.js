// src/components/pages/SignupPage.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AuthService from '../../components/services/AuthService';
import { toast } from 'react-toastify';
import logo from '../../assets/Eunoia.png';
import jwtDecode from 'jwt-decode'; // Corrected import

const schema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Minimum 3 characters'),
  email: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Minimum 6 characters'),
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
  specialization: yup
    .string()
    .required('Specialization is required')
    .max(100, 'Specialization cannot exceed 100 characters'),
  yearsOfExperience: yup
    .number()
    .typeError('Years of experience must be a number')
    .required('Years of experience is required')
    .integer('Years of experience must be an integer')
    .min(0, 'Years of experience cannot be negative')
    .max(100, 'Years of experience seems unrealistic'),
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number in E.164 format.'),
});

export default function SignupPage() {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Optionally exclude confirmPassword from the data sent to the backend
      const { confirmPassword, ...psychologistData } = data;

      const response = await AuthService.registerPsychologist(psychologistData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success(response.data.message || 'Signup successful');
        // Redirect to application status page
        navigate('/psychologist/application-status');
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          validationErrors.forEach((err) => {
            toast.error(err.msg || err.message);
          });
        } else {
          toast.error('Signup failed due to validation errors.');
        }
      } else if (error.response && error.response.status === 409) {
        // Handle duplicate email error
        toast.error(error.response.data.message || 'Email already in use.');
      } else {
        toast.error(error.response?.data?.message || 'Signup failed');
      }
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
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          p: 4,
          borderRadius: '12px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent sx={{ textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <img src={logo} alt="EUNOIA Logo" style={{ maxWidth: '120px' }} />
            <Typography
              variant="h5"
              fontWeight={700}
              color="primary"
              mt={2}
              fontFamily="Poppins"
            >
              EUNOIA
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight={500}
            gutterBottom
            fontFamily="Poppins"
          >
            Sign Up
          </Typography>
          <Typography
            variant="subtitle1"
            gutterBottom
            fontFamily="Poppins"
          >
            Create your account to access mental health management tools.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            display="flex"
            flexDirection="column"
            gap={2}
            mt={3}
          >
            {/* Username Field */}
            <Controller
              name="username"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  error={!!errors.username}
                  helperText={
                    errors.username ? errors.username.message : null
                  }
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Poppins' },
                  }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins' } }}
                />
              )}
            />

            {/* Email Field */}
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

            {/* Password Field */}
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
                  helperText={
                    errors.password ? errors.password.message : null
                  }
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Poppins' },
                  }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins' } }}
                />
              )}
            />

            {/* Confirm Password Field */}
            <Controller
              name="confirmPassword"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirm Password"
                  type="password"
                  error={!!errors.confirmPassword}
                  helperText={
                    errors.confirmPassword ? errors.confirmPassword.message : null
                  }
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Poppins' },
                  }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins' } }}
                />
              )}
            />

            {/* Specialization Field */}
            <Controller
              name="specialization"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Specialization"
                  error={!!errors.specialization}
                  helperText={
                    errors.specialization ? errors.specialization.message : null
                  }
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Poppins' },
                  }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins' } }}
                />
              )}
            />

            {/* Years of Experience Field */}
            <Controller
              name="yearsOfExperience"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Years of Experience"
                  type="number"
                  error={!!errors.yearsOfExperience}
                  helperText={
                    errors.yearsOfExperience
                      ? errors.yearsOfExperience.message
                      : null
                  }
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Poppins' },
                    min: 0,
                    max: 100,
                  }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins' } }}
                />
              )}
            />

            {/* Phone Number Field */}
            <Controller
              name="phoneNumber"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number"
                  type="tel"
                  placeholder="+12345678901"
                  error={!!errors.phoneNumber}
                  helperText={
                    errors.phoneNumber ? errors.phoneNumber.message : 'Enter in format +12345678901'
                  }
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Poppins' },
                  }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins' } }}
                />
              )}
            />

            {/* Submit Button */}
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
                fontFamily: 'Poppins',
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign Up'
              )}
            </Button>

            {/* Link to Login */}
            <Typography variant="body2" mt={2}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#004080',
                  textDecoration: 'none',
                  fontFamily: 'Poppins',
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
