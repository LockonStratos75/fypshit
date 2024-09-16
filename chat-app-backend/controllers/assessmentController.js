// backend/controllers/assessmentController.js
const MentalHealthAssessment = require('../models/MentalHealthAssessment');

exports.createAssessment = async (req, res) => {
    try {
        const { assessmentType, responses, score } = req.body;
        const newAssessment = new MentalHealthAssessment({
            userId: req.userId,
            assessmentType,
            responses,
            score
        });
        await newAssessment.save();
        res.status(201).json(newAssessment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAssessments = async (req, res) => {
    try {
        const assessments = await MentalHealthAssessment.find({ userId: req.userId });
        res.json(assessments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
