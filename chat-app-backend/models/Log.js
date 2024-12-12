// backend/models/Log.js

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType', // Dynamic reference based on userType
  },
  userType: {
    type: String,
    required: true,
    enum: ['AdminProfile', 'PsychologistProfile', 'User'], // Added 'User'
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  details: {
    type: String,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries on userId and userType
logSchema.index({ userId: 1, userType: 1 });
logSchema.index({ timestamp: -1 });
logSchema.index({ action: 1 });

module.exports = mongoose.model('Log', logSchema);
