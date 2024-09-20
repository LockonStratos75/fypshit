// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Routes
const authRoutes = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const profileRoutes = require('./routes/profileRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const sentimentRoutes = require('./routes/sentimentRoutes');
const serRoutes = require('./routes/serRoutes');
const sanityLevelRoutes = require('./routes/sanityLevelRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatSessionRoutes');

// Middlewares
const { authenticateToken } = require('./middlewares/authMiddleware');
const errorHandler = require('./middlewares/errorHandler');
const logAction = require('./middlewares/logMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
const IP_ADDRESS = process.env.IP_ADDRESS;

// Middleware
app.use(cors({
  origin: 'http://192.168.100.92:8081',
  credentials: true,
}));


app.use(bodyParser.json());
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes that don't require authentication
app.use('/auth', authRoutes);

// Apply authentication middleware
app.use(authenticateToken);

// Apply logging middleware
app.use(logAction);

// Protected Routes
app.use('/assessments', assessmentRoutes);
app.use('/monitoring', monitoringRoutes);
app.use('/profiles', profileRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/sessions', chatRoutes)
app.use('/sentiment', sentimentRoutes);
app.use('/ser', serRoutes);
app.use('/sanity', sanityLevelRoutes);
app.use('/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, IP_ADDRESS, () => console.log(`Server running on http://${IP_ADDRESS}:${PORT}`));




