const SERResult = require('../models/SERResult');

// Get all SER results for the authenticated user
exports.getSERResults = async (req, res) => {
    try {
        const serResults = await SERResult.find({ userId: req.userId });
        res.json(serResults);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Save a new SER result for the authenticated user
exports.saveSERResult = async (req, res) => {
    const { highestEmotion, emotions } = req.body;  // Get data from request body

    try {
        // Create a new SER result entry
        const serResult = new SERResult({
            userId: req.userId,  // From the authenticated token
            highestEmotion,
            emotions,
            date: new Date()
        });

        await serResult.save();  // Save to the database
        res.status(201).json(serResult);  // Return the saved SER result
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};