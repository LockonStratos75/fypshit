// backend/server.js

// ========================
// 1. Load Environment Variables
// ========================
require('dotenv').config();

// ========================
// 2. Import Necessary Packages
// ========================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); // Security middleware
const morgan = require('morgan'); // HTTP request logger
const rateLimit = require('express-rate-limit'); // Rate limiting
const compression = require('compression'); // Compression middleware
const path = require('path'); // Path module for handling file paths

// ========================
// 3. Import Routes
// ========================
const authRoutes = require('./routes/authRoutes');
const psychologistAuthRoutes = require('./routes/psychologistAuthRoutes'); // Combined Psychologist Routes // Protected Psychologist Routes
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes'); // Public Admin Auth Routes
const adminRoutes = require('./routes/adminRoutes'); // Protected Admin Routes
const assessmentRoutes = require('./routes/assessmentRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const profileRoutes = require('./routes/profileRoutes');
const sentimentRoutes = require('./routes/sentimentRoutes');
const serRoutes = require('./routes/serRoutes');
const sanityLevelRoutes = require('./routes/sanityLevelRoutes');
const chatRoutes = require('./routes/chatSessionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const crisisRoutes = require('./routes/crisisRoutes');
const psychologistRoutes = require('./routes/psychologistRoutes');

// ========================
// 4. Import Middlewares
// ========================
const { authenticateToken } = require('./middlewares/authMiddleware');
const errorHandler = require('./middlewares/errorHandler');
const logAction = require('./middlewares/logMiddleware');

// ========================
// 5. Initialize Express App
// ========================
const app = express();

// ========================
// 6. Define Server Port and IP Address
// ========================
const PORT = process.env.PORT || 5000;
const IP_ADDRESS = process.env.IP_ADDRESS || '0.0.0.0'; // Listen on all network interfaces by default

// ========================
// 7. Security Middleware Setup
// ========================

// Use Helmet to secure HTTP headers
app.use(helmet());

// Use Morgan for HTTP request logging
app.use(morgan('combined'));

// ========================
// 8. CORS Configuration
// ========================

// Define allowed origins based on environment variables for flexibility
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://10.113.67.68:3000', 'http://localhost:3000'];

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
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow Authorization header
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ========================
// 9. Rate Limiting Setup
// ========================

// Apply rate limiting to all requests under /
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/', apiLimiter);

// ========================
// 10. Compression Middleware
// ========================

// Use compression to gzip responses
app.use(compression());

// ========================
// 11. Middleware Setup
// ========================

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded data (if needed)
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// ========================
// 12. MongoDB Connection
// ========================

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in the environment variables.');
  process.exit(1); // Exit the application if MONGO_URI is missing
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit the application if unable to connect to MongoDB
  });

// Public Routes (do not require authentication)
app.use('/auth', authRoutes);
app.use('/psychologist/auth', psychologistAuthRoutes); // Place this BEFORE authenticateToken
app.use('/admin/auth', adminAuthRoutes);

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
app.use('/report', reportRoutes);
app.use('/crisis', crisisRoutes);
app.use('/psychologist', psychologistRoutes);

// ========================
// 15. Error Handling Middleware
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
// 16. Start the Server
// ========================

app.listen(PORT, IP_ADDRESS, () => {
  console.log(`🚀 Server running on http://${IP_ADDRESS}:${PORT}`);
});