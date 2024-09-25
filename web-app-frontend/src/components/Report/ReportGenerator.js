// src/components/Report/ReportGenerator.js

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, MenuItem } from '@mui/material';
import api from '../../services/ApiService';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';


const ReportGenerator = () => {
  const { handleSubmit, control } = useForm();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch all users (Admins and Psychologists)
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users'); // Ensure this endpoint exists
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      }
    };

    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    const { userId } = data;

    try {
      // Fetch user's sanity levels and assessments
      const [sanityRes, assessmentsRes] = await Promise.all([
        api.get(`/sanity/user/${userId}`), // Ensure this endpoint exists
        api.get(`/assessments/user/${userId}`), // Ensure this endpoint exists
      ]);

      const sanityLevel = sanityRes.data.sanityPercentage;
      const assessments = assessmentsRes.data.assessments;

      // Fetch user details
      const userRes = await api.get(`/admin/users/${userId}`); // Ensure this endpoint exists
      const user = userRes.data.user;

      // Prepare the report content
      // We'll render the report content invisibly and capture it using html2canvas
      // To do this, we'll dynamically insert the report content into the DOM

      // Create a temporary div to hold the report content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 size width
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = '#fff'; // Ensure background is white
      tempDiv.innerHTML = `
        <h1>Sanity Report</h1>
        <h2>User Information</h2>
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Sanity Level:</strong> ${sanityLevel}%</p>
        <h2>Assessments</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%;">
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${assessments.map((assessment, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${assessment.assessmentType}</td>
                <td>${assessment.score}</td>
                <td>${new Date(assessment.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      document.body.appendChild(tempDiv);

      // Capture the report content
      const canvas = await html2canvas(tempDiv, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      // Remove the temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Sanity_Report_${user.username}.pdf`);

      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  return (
    <Container>
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Generate User Report
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="userId"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                select
                label="Select User"
                fullWidth
                margin="normal"
                {...field}
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.username} ({user.email})
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Generate PDF Report
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default ReportGenerator;
