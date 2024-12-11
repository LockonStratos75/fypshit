// src/components/pages/AdminApplicationsPage.js

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
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../components/services/ApiService';
import { Link } from 'react-router-dom';

const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/admin/psychologists/pending');
        setApplications(response.data.pendingPsychologists || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to fetch applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleApprove = async (applicationId) => {
    setActionLoading(true);
    try {
      await api.post('/admin/psychologists/approve', { psychologistId: applicationId });
      toast.success('Psychologist approved successfully');
      // Remove approved application from the list
      setApplications(applications.filter(app => app._id !== applicationId));
    } catch (error) {
      console.error('Error approving psychologist:', error);
      toast.error('Failed to approve psychologist');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = (application) => {
    setSelectedApplication(application);
    setOpenDialog(true);
  };

  const confirmReject = async () => {
    setActionLoading(true);
    try {
      await api.post('/admin/psychologists/reject', { psychologistId: selectedApplication._id, rejectionReason });
      toast.success('Psychologist rejected successfully');
      // Remove rejected application from the list
      setApplications(applications.filter(app => app._id !== selectedApplication._id));
      setOpenDialog(false);
      setRejectionReason('');
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error rejecting psychologist:', error);
      toast.error('Failed to reject psychologist');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#004080' }}>
        Psychologist Applications
      </Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : applications.length > 0 ? (
        <Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Years of Experience</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>License</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell>{app.username}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.specialization || 'N/A'}</TableCell>
                  <TableCell>{app.yearsOfExperience || 'N/A'}</TableCell>
                  <TableCell>{app.phoneNumber}</TableCell>
                  <TableCell>
                    {app.licenseImageUrl ? (
                      <a href={app.licenseImageUrl} target="_blank" rel="noopener noreferrer">
                        View License
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleApprove(app._id)}
                      disabled={actionLoading}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleReject(app)}
                      disabled={actionLoading}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : (
        <Typography variant="body1" mt={3}>
          No pending applications.
        </Typography>
      )}

      {/* Rejection Reason Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Reject Psychologist Application</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            type="text"
            fullWidth
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmReject} color="error" disabled={!rejectionReason || actionLoading}>
            {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminApplicationsPage;
