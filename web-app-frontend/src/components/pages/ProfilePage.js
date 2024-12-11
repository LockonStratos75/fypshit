// src/components/pages/ProfilePage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  InputLabel,
  FormControl,
  Select
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import AuthService from '../../components/services/AuthService';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  specialization: yup.string().required('Specialization is required').max(100, 'Max 100 characters'),
  yearsOfExperience: yup.number().min(0, 'Min 0').max(100, 'Max 100').required('Years of experience is required'),
  phoneNumber: yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number in E.164 format.').required('Phone number is required'),
  licenseImage: yup.mixed().required('License image is required').test('fileType', 'Unsupported File Format', value => {
    return value && ['image/jpeg', 'image/png', 'image/gif'].includes(value.type);
  }),
});

const ProfilePage = () => {
  const { handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append('specialization', data.specialization);
      formData.append('yearsOfExperience', data.yearsOfExperience);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('licenseImage', data.licenseImage[0]); // Assuming single file upload

      const response = await AuthService.completePsychologistProfile(formData);

      if (response.status === 200) {
        toast.success('Profile submitted successfully. Awaiting approval.');
        navigate('/psychologist/application-pending');
      }
    } catch (error) {
      console.error('Profile submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit profile');
    } finally {
      setIsLoading(false);
      reset();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#004080' }}>
        Complete Your Profile
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 3 }}>
        {/* Specialization */}
        <Controller
          name="specialization"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Specialization"
              fullWidth
              margin="normal"
              variant="outlined"
              error={!!errors.specialization}
              helperText={errors.specialization ? errors.specialization.message : ''}
            />
          )}
        />

        {/* Years of Experience */}
        <Controller
          name="yearsOfExperience"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Years of Experience"
              type="number"
              fullWidth
              margin="normal"
              variant="outlined"
              error={!!errors.yearsOfExperience}
              helperText={errors.yearsOfExperience ? errors.yearsOfExperience.message : ''}
            />
          )}
        />

        {/* Phone Number */}
        <Controller
          name="phoneNumber"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Phone Number"
              type="tel"
              fullWidth
              margin="normal"
              variant="outlined"
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber ? errors.phoneNumber.message : ''}
            />
          )}
        />

        {/* License Image Upload */}
        <Controller
          name="licenseImage"
          control={control}
          defaultValue={null}
          render={({ field }) => (
            <>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="license-image-upload"
                type="file"
                onChange={(e) => field.onChange(e.target.files)}
              />
              <label htmlFor="license-image-upload">
                <Button variant="contained" component="span" sx={{ mt: 2 }}>
                  Upload License Image
                </Button>
              </label>
              {errors.licenseImage && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {errors.licenseImage.message}
                </Typography>
              )}
            </>
          )}
        />

        <Box sx={{ mt: 3 }}>
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
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit Profile'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ProfilePage;
