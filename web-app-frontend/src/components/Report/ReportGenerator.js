import React from 'react';
import { Container, Typography, Box, TextField, Button, MenuItem } from '@mui/material';
import api from '../../services/ApiService';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportGenerator = () => {
  const { handleSubmit, control } = useForm();
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
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
      // Fetch user's report data
      const reportRes = await api.get(`/report/user/${userId}`);

      const { user, sanityLevels, serResults, sentimentScores } = reportRes.data;

      // Prepare the report content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm';
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = '#fff';

      tempDiv.innerHTML = `
        <h1>User Report</h1>
        <h2>User Information</h2>
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>

        <h2>Sanity Levels</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%;">
          <thead>
            <tr>
              <th>#</th>
              <th>Sanity Level</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${sanityLevels.map((level, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${level.sanityPercentage}%</td>
                <td>${new Date(level.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>SER Results</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%;">
          <thead>
            <tr>
              <th>#</th>
              <th>Highest Emotion</th>
              <th>Emotion Scores</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${serResults.map((result, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${result.highestEmotion.label} (${result.highestEmotion.score})</td>
                <td>${result.emotions.map(emotion => `${emotion.label}: ${emotion.score}`).join(', ')}</td>
                <td>${new Date(result.date).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Sentiment Scores</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%;">
          <thead>
            <tr>
              <th>#</th>
              <th>Session Name</th>
              <th>Average Sentiment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${sentimentScores.map((score, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${score.sessionName}</td>
                <td>${score.averageSentiment}</td>
                <td>${new Date(score.date).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      document.body.removeChild(tempDiv);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`User_Report_${user.username}.pdf`);

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
