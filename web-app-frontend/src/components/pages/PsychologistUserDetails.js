// src/components/pages/PsychologistUserDetails.js

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../components/services/ApiService';

const PsychologistUserDetails = () => {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/psychologist/user/${id}`); // Ensure this endpoint exists
        setUserDetails(response.data.user || null);
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Failed to fetch user details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!userDetails) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h6">User not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#004080' }}>
        User Details
      </Typography>

      <Box>
        <Typography variant="h6">Basic Information</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Field</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>{userDetails.username}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>{userDetails.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Age</TableCell>
              <TableCell>{userDetails.age || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Location</TableCell>
              <TableCell>{userDetails.location || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Sanity Level</TableCell>
              <TableCell>{userDetails.sanityPercentage || 'N/A'}%</TableCell>
            </TableRow>
            {/* Add more fields as necessary */}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
};

export default PsychologistUserDetails;
