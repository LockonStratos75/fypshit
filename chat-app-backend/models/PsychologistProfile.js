// backend/models/PsychologistProfile.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const psychologistProfileSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    //unique: true, // Unique index
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    //unique: true, // Unique index
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Exclude from queries by default
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    max: 100,
  },
  phoneNumber: {
    type: String,
    match: /^\+?[1-9]\d{1,14}$/, // E.164 format
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

// Indexes for performance
psychologistProfileSchema.index({ email: 1 });
psychologistProfileSchema.index({ username: 1 });
psychologistProfileSchema.index({ specialization: 1 });

// Pre-save middleware to hash password
psychologistProfileSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
psychologistProfileSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('PsychologistProfile', psychologistProfileSchema);
