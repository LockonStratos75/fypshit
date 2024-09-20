// backend/controllers/sanityLevelController.js

const SanityLevel = require('../models/SanityLevel');

/**
 * @desc    Get the current sanity level of the authenticated user
 * @route   GET /sanity
 * @access  Private
 */
exports.getSanityLevel = async (req, res) => {
    try {
        const sanityLevel = await SanityLevel.findOne({ user: req.userId });

        if (!sanityLevel) {
            return res.status(404).json({ message: 'Sanity level not found. Please calculate it first.' });
        }

        res.status(200).json({ sanityPercentage: sanityLevel.sanityPercentage });
    } catch (err) {
        console.error("Error in getSanityLevel:", err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Create or Update the sanity level of the authenticated user
 * @route   POST /sanity
 * @access  Private
 */
exports.updateSanityLevel = async (req, res) => {
    const { sanityPercentage } = req.body;

    // Validate the sanityPercentage
    if (
        sanityPercentage === undefined ||
        typeof sanityPercentage !== 'number' ||
        sanityPercentage < 0 ||
        sanityPercentage > 100
    ) {
        return res.status(400).json({ message: 'Invalid sanity percentage. It must be a number between 0 and 100.' });
    }

    try {
        let sanityLevel = await SanityLevel.findOne({ user: req.userId });

        if (sanityLevel) {
            // Update existing sanity level
            sanityLevel.sanityPercentage = sanityPercentage;
            await sanityLevel.save();
            return res.status(200).json({ message: 'Sanity level updated successfully.', sanityPercentage: sanityLevel.sanityPercentage });
        } else {
            // Create new sanity level
            sanityLevel = new SanityLevel({
                user: req.userId,
                sanityPercentage,
            });
            await sanityLevel.save();
            return res.status(201).json({ message: 'Sanity level created successfully.', sanityPercentage: sanityLevel.sanityPercentage });
        }
    } catch (err) {
        console.error("Error in updateSanityLevel:", err.message);
        // Handle duplicate key error (in case of race conditions)
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Sanity level already exists for this user. Please try updating instead.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};
