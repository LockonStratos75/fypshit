// backend/server.js

// Load environment variables from .env file
require('dotenv').config();

// Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import Routes
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

// Import Middlewares
const { authenticateToken } = require('./middlewares/authMiddleware');
const errorHandler = require('./middlewares/errorHandler');
const logAction = require('./middlewares/logMiddleware');

// Initialize Express app
const app = express();

// Define Server Port and IP Address
const PORT = process.env.PORT || 5000;
const IP_ADDRESS = process.env.IP_ADDRESS || '0.0.0.0'; // Listen on all network interfaces by default

// ========================
// CORS Configuration
// ========================

// Define allowed origins based on environment variables for flexibility
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://192.168.1.8:3000', 'http://localhost:3000','http://192.168.100.92:8081'];

// Configure CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}.`;
      return callback(new Error(msg), false);
    }
  },
  credentials: true, // Allow cookies and other credentials
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ========================
// Middleware Setup
// ========================

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded data (if needed)
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// ========================
// MongoDB Connection
// ========================

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in the environment variables.');
  process.exit(1); // Exit the application if MONGO_URI is missing
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit the application if unable to connect to MongoDB
  });

// ========================
// Routes Setup
// ========================

// Public Routes (do not require authentication)
app.use('/auth', authRoutes);

// Apply Authentication Middleware to Protect Subsequent Routes
app.use(authenticateToken);

// Apply Logging Middleware After Authentication
app.use(logAction);

// Protected Routes (require authentication)
app.use('/assessments', assessmentRoutes);
app.use('/monitoring', monitoringRoutes);
app.use('/profiles', profileRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/sessions', chatRoutes);
app.use('/sentiment', sentimentRoutes);
app.use('/ser', serRoutes);
app.use('/sanity', sanityLevelRoutes);
app.use('/admin', adminRoutes);

// ========================
// Error Handling Middleware
// ========================

// Handle CORS Errors Explicitly
app.use((err, req, res, next) => {
  if (err instanceof Error && err.message.startsWith('The CORS policy')) {
    return res.status(403).json({ message: err.message });
  }
  next(err); // Pass to the general error handler
});

// General Error Handler
app.use(errorHandler);

// ========================
// Start the Server
// ========================

app.listen(PORT, IP_ADDRESS, () => {
  console.log(`Server running on http://${IP_ADDRESS}:${PORT}`);
});
