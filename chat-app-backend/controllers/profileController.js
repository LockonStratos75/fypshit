// backend/controllers/profileController.js
const PsychologistProfile = require('../models/PsychologistProfile');
const User = require('../models/User');
const { validationResult } = require('express-validator');


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

exports.completeUserProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        const { gender, age, location, phoneNumber, guardianPhoneNumber } = req.body;
        const user = req.user; // The authenticated user from authMiddleware

        if (user.profileCompleted) {
            return res.status(400).json({ message: 'Profile is already completed.' });
        }

        // Update user fields
        if (gender) user.gender = gender;
        if (age !== undefined) user.age = age;
        if (location) user.location = location;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (guardianPhoneNumber) user.guardianPhoneNumber = guardianPhoneNumber;

        user.profileCompleted = true;
        await user.save();

        return res.status(200).json({ message: 'Profile completed successfully.', user });
    } catch (err) {
        console.error('Error completing user profile:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

