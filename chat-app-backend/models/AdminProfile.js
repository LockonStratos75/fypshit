  // backend/models/AdminProfile.js

  const mongoose = require('mongoose');
  const { v4: uuidv4 } = require('uuid');

  const adminProfileSchema = new mongoose.Schema({
    adminId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      select: false, // Exclude password field by default
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  module.exports = mongoose.model('AdminProfile', adminProfileSchema);
