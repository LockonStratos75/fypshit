// backend/controllers/adminController.js
const User = require('../models/User');
const PsychologistProfile = require('../models/PsychologistProfile');
const Log = require('../models/Log');
const bcrypt = require('bcrypt');

exports.manageUserAccounts = async (req, res) => {
  const { action, userId, updates } = req.body;
  try {
    let result;
    switch (action) {
      case 'create':
        const { username, email, password, role } = updates;
        const hashedPassword = await bcrypt.hash(password, 10);
        result = await User.create({ username, email, password: hashedPassword, role });
        break;
      case 'modify':
        result = await User.findByIdAndUpdate(userId, updates, { new: true });
        break;
      case 'delete':
        result = await User.findByIdAndDelete(userId);
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
    await Log.create({ userId: req.user._id, action: `User ${action}`, details: `User ID: ${userId || result._id}` });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reviewPsychologistRegistrations = async (req, res) => {
  try {
    const pendingProfiles = await PsychologistProfile.find({ status: 'pending' });
    res.status(200).json(pendingProfiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approvePsychologist = async (req, res) => {
  const { profileId } = req.body;
  try {
    const profile = await PsychologistProfile.findByIdAndUpdate(profileId, { status: 'approved' }, { new: true });
    await User.findByIdAndUpdate(profile.userId, { role: 'psychologist' });
    await Log.create({ userId: req.user._id, action: 'Psychologist Approved', details: `Profile ID: ${profileId}` });
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectPsychologist = async (req, res) => {
  const { profileId } = req.body;
  try {
    const profile = await PsychologistProfile.findByIdAndUpdate(profileId, { status: 'rejected' }, { new: true });
    await Log.create({ userId: req.user._id, action: 'Psychologist Rejected', details: `Profile ID: ${profileId}` });
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendAnnouncement = async (req, res) => {
  const { title, message, targetAudience } = req.body;
  try {
    // Implement logic to send messages
    await Log.create({ userId: req.user._id, action: 'Announcement Sent', details: `Title: ${title}` });
    res.status(200).json({ message: 'Announcement sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find().populate('userId', 'username email');
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
