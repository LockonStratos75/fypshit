// backend/controllers/profileController.js
const PsychologistProfile = require('../models/PsychologistProfile');
const User = require('../models/User');

// Manage User and Psychologist Profiles
exports.manageProfiles = async (req, res) => {
    try {
        const userProfiles = await User.find({});
        const psychologistProfiles = await PsychologistProfile.find({});
        res.status(200).json({ userProfiles, psychologistProfiles });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
    const { userId, updates } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update Psychologist Profile
exports.updatePsychologistProfile = async (req, res) => {
    const { profileId, updates } = req.body;
    try {
        const updatedProfile = await PsychologistProfile.findByIdAndUpdate(profileId, updates, { new: true });
        res.status(200).json(updatedProfile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Review Psychologist Application
exports.reviewPsychologistApplication = async (req, res) => {
    const { profileId, status } = req.body;
    try {
        const updatedProfile = await PsychologistProfile.findByIdAndUpdate(profileId, { status }, { new: true });
        res.status(200).json(updatedProfile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
