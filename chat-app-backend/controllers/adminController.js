// backend/controllers/adminController.js

const mongoose = require('mongoose');
const User = require('../models/User');
const PsychologistProfile = require('../models/PsychologistProfile');
const AdminProfile = require('../models/AdminProfile');
const SanityLevel = require('../models/SanityLevel');
const Log = require('../models/Log');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * =======================
 * Controller Methods
 * =======================
 */

/**
 * Admin Login
 */
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Check if admin exists
    const admin = await AdminProfile.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token with correct payload
    const token = jwt.sign(
      { id: admin._id.toString(), userType: 'AdminProfile' }, // Use _id instead of adminId
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Log the action using admin._id (ObjectId)
    await Log.create({
      userId: admin._id, // Use admin._id which is an ObjectId
      userType: 'AdminProfile',
      action: 'Login',
      details: `Admin ${admin.username} logged in.`,
    });

    // Respond with token
    res.status(200).json({ token });
  } catch (err) {
    console.error('Error during admin login:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
/**
 * Fetch all regular users.
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Modify User Profile
 * Admins can update any user's details.
 */
exports.modifyUser = async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter
  const updates = req.body;

  try {
    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password'); // Exclude password

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Log the action
    await Log.create({
      userId: req.user.id, // Corrected field
      userType: 'AdminProfile',
      action: 'Modify User',
      details: `Modified user with ID: ${userId}`,
    });

    res.status(200).json({ message: 'User updated successfully.', user: updatedUser });
  } catch (err) {
    console.error('Error modifying user:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Modify Psychologist Profile
 * Admins can update any psychologist's details.
 */
exports.modifyPsychologistProfile = async (req, res) => {
  const { psychologistId } = req.params; // Assuming psychologistId is passed as a URL parameter
  const updates = req.body;

  try {
    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Update psychologist profile
    const updatedProfile = await PsychologistProfile.findByIdAndUpdate(psychologistId, updates, {
      new: true,
      runValidators: true,
    }).select('-password'); // Exclude password

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Psychologist profile not found.' });
    }

    // Log the action
    await Log.create({
      userId: req.user.id, // Corrected field
      userType: 'AdminProfile',
      action: 'Modify Psychologist Profile',
      details: `Modified psychologist profile with ID: ${psychologistId}`,
    });

    res.status(200).json({ message: 'Psychologist profile updated successfully.', profile: updatedProfile });
  } catch (err) {
    console.error('Error modifying psychologist profile:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Delete a user.
 * Admins can delete any user.
 */
exports.deleteUser = async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter

  try {
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const deletedUser = await User.findByIdAndDelete(userId).select('-password'); // Exclude password

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Log the action
    await Log.create({
      userId: req.user.id, // Corrected field
      userType: 'AdminProfile',
      action: 'Delete User',
      details: `Deleted user with ID: ${userId}`,
    });

    res.status(200).json({ message: 'User deleted successfully.', user: deletedUser });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Fetch all psychologists.
 * Psychologists are separate entities and not linked to Users.
 */
exports.getAllPsychologists = async (req, res) => {
  try {
    const psychologists = await PsychologistProfile.find().select('-password'); // Exclude passwords
    res.status(200).json({ psychologists });
  } catch (err) {
    console.error('Error fetching psychologists:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Review pending psychologist applications.
 */
exports.reviewPsychologistRegistrations = async (req, res) => {
  try {
    const pendingProfiles = await PsychologistProfile.find({ status: 'pending' });
    res.status(200).json({ pendingProfiles });
  } catch (err) {
    console.error('Error fetching pending psychologist profiles:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Approve a psychologist application.
 */
exports.approvePsychologist = async (req, res) => {
  const { psychologistId } = req.body; // Assuming psychologistId is provided in the request body

  if (!psychologistId) {
    return res.status(400).json({ message: 'Psychologist ID is required.' });
  }

  // Validate psychologistId as a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(psychologistId)) {
    return res.status(400).json({ message: 'Invalid Psychologist ID format.' });
  }

  try {
    const profile = await PsychologistProfile.findById(psychologistId);

    if (!profile) {
      return res.status(404).json({ message: 'Psychologist profile not found.' });
    }

    if (profile.status !== 'pending') {
      return res.status(400).json({ message: `Cannot approve a profile with status '${profile.status}'.` });
    }

    // Update profile status
    profile.status = 'approved';
    await profile.save();

    // Log the action
    await Log.create({
      userId: req.user.id, // Corrected field
      userType: 'AdminProfile',
      action: 'Approve Psychologist',
      details: `Approved psychologist with ID: ${psychologistId}`,
    });

    res.status(200).json({ message: 'Psychologist approved successfully.', profile });
  } catch (err) {
    console.error('Error approving psychologist:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Reject a psychologist application.
 */
exports.rejectPsychologist = async (req, res) => {
  const { psychologistId } = req.body; // Assuming psychologistId is provided in the request body

  if (!psychologistId) {
    return res.status(400).json({ message: 'Psychologist ID is required.' });
  }

  // Validate psychologistId as a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(psychologistId)) {
    return res.status(400).json({ message: 'Invalid Psychologist ID format.' });
  }

  try {
    const profile = await PsychologistProfile.findById(psychologistId);

    if (!profile) {
      return res.status(404).json({ message: 'Psychologist profile not found.' });
    }

    if (profile.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject a profile with status '${profile.status}'.` });
    }

    // Update profile status
    profile.status = 'rejected';
    await profile.save();

    // Log the action
    await Log.create({
      userId: req.user.id, // Corrected field
      userType: 'AdminProfile',
      action: 'Reject Psychologist',
      details: `Rejected psychologist with ID: ${psychologistId}`,
    });

    res.status(200).json({ message: 'Psychologist rejected successfully.', profile });
  } catch (err) {
    console.error('Error rejecting psychologist:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Fetch all logs.
 */
exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .populate('userId', 'username email') // Populate user/admin details
      .sort({ timestamp: -1 }); // Latest logs first
    res.status(200).json({ logs });
  } catch (err) {
    console.error('Error fetching logs:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getAllSanityLevels = async (req, res, next) => {
  try {
    // Fetch all SanityLevel documents and populate the associated user information
    const sanityLevels = await SanityLevel.find()
      .populate('user', 'username email') // Populate user with selected fields
      .exec();

    res.status(200).json({ sanityLevels });
  } catch (error) {
    console.error('Error fetching sanity levels:', error);
    next(error);
  }
};