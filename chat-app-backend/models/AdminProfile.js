// backend/models/AdminProfile.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminProfileSchema = new mongoose.Schema({
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
}, { timestamps: true });

// Indexes for performance
adminProfileSchema.index({ email: 1 });
adminProfileSchema.index({ username: 1 });

// Pre-save middleware to hash password
adminProfileSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
adminProfileSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('AdminProfile', adminProfileSchema);
