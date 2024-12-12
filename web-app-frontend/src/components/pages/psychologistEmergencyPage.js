// src/components/pages/PsychologistEmergencyPage.js

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Tooltip,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { toast } from 'react-toastify';
import ApiService from '../../components/services/ApiService'; // Ensure the path is correct

const PsychologistEmergencyPage = () => {
  const [patients, setPatients] = useState([]); // Stores the list of patients
  const [loading, setLoading] = useState(true);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchPatients = async () => {
    try {
      const response = await ApiService.get('/psychologist/users');
      setPatients(response.data.patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const getSanityColor = (sanityPercentage) => {
    if (sanityPercentage < 20) {
      return 'error.main';
    } else if (sanityPercentage < 50) {
      return 'warning.main';
    } else {
      return 'success.main';
    }
  };

  const handleAlertClick = (patient) => {
    setSelectedPatient(patient);
    setAlertDialogOpen(true);
  };

  const handleAlertClose = () => {
    setSelectedPatient(null);
    setAlertDialogOpen(false);
  };

  const handleAlertConfirm = async () => {
    try {
      const response = await ApiService.post('/crisis/check', { userId: selectedPatient.user._id });
      toast.success(response.data.message);
      handleAlertClose();
      fetchPatients(); // Refresh the patients list
    } catch (error) {
      console.error('Error sending alert:', error);
      toast.error(error.response?.data?.message || 'Failed to send alert');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Patient Alerts
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="patient alert table">
            <TableHead>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Sanity Level (%)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient._id}>
                    <TableCell>{patient.user.username}</TableCell>
                    <TableCell>{patient.user.email}</TableCell>
                    <TableCell>
                      <Typography sx={{ color: getSanityColor(patient.sanityPercentage), fontWeight: 600 }}>
                        {patient.sanityPercentage !== undefined ? `${patient.sanityPercentage}%` : 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Send Alert" arrow>
                        <span>
                          <IconButton
                            color="secondary"
                            onClick={() => handleAlertClick(patient)}
                            disabled={patient.sanityPercentage === undefined || patient.sanityPercentage >= 50}
                          >
                            <Send />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={alertDialogOpen} onClose={handleAlertClose} fullWidth maxWidth="xs">
        <DialogTitle>Send Alert</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to send an alert to <strong>{selectedPatient?.user.username || 'this patient'}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAlertClose} color="secondary">Cancel</Button>
          <Button onClick={handleAlertConfirm} variant="contained" color="primary">Send Alert</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PsychologistEmergencyPage;