// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
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
  // Demographic Data
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    default: 'Prefer not to say',
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative.'],
    max: [120, 'Age seems unrealistic.'],
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters'],
  },
  // Contact Information
  phoneNumber: {
    type: String,
    trim: true,
    match: [
      /^\+?[1-9]\d{1,14}$/,
      'Please enter a valid phone number in E.164 format.',
    ],
  },
  guardianPhoneNumber: {
    type: String,
    trim: true,
    match: [
      /^\+?[1-9]\d{1,14}$/,
      'Please enter a valid guardian phone number in E.164 format.',
    ],
    // Optional field; uncomment the following line if required
    // required: [true, 'Guardian phone number is required for minors.'],
  },
  // Profile Completion Flag
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Password encryption before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
      return next(); // Important to return here to prevent proceeding further
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
