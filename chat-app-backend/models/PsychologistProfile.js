// backend/models/PsychologistProfile.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const psychologistProfileSchema = new mongoose.Schema({
  psychologistId: {
    type: mongoose.Schema.Types.ObjectId,
    default: mongoose.Types.ObjectId,
    unique: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required.'],
    trim: true,
    maxlength: [50, 'Username cannot exceed 50 characters'],
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
    minlength: [6, 'Password must be at least 6 characters'],
  },
  // Additional Profile Data
  specialization: {
    type: String,
    required: [true, 'Specialization is required.'],
    trim: true,
    maxlength: [100, 'Specialization cannot exceed 100 characters'],
  },
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years of experience cannot be negative.'],
    max: [100, 'Years of experience seems unrealistic.'],
  },
  // Contact Information
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required.'],
    trim: true,
    match: [
      /^\+?[1-9]\d{1,14}$/,
      'Please enter a valid phone number in E.164 format.',
    ],
  },

  // Application Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Password encryption before saving
psychologistProfileSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
psychologistProfileSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('PsychologistProfile', psychologistProfileSchema);
