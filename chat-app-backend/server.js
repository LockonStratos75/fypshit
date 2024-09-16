
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
const serRoutes = require('./routes/serRoutes');


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
app.use('/auth', authRoutes);
app.use('/assessments', assessmentRoutes);
app.use('/monitoring', monitoringRoutes);
app.use('/sessions', chatSessionRoutes);
app.use('/sentiment', sentimentRoutes);
app.use('/profiles', profileRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/ser', serRoutes);


// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
