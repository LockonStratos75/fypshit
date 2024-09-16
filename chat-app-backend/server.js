
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const chatSessionRoutes = require('./routes/chatSessionRoutes');
const sentimentRoutes = require('./routes/sentimentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Load environment variables from .env file
require('dotenv').config();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/sessions', chatSessionRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/analytics', analyticsRoutes);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
