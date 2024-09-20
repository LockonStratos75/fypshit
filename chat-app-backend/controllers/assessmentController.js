// backend/controllers/assessmentController.js
const MentalHealthAssessment = require('../models/MentalHealthAssessment');
const User = require('../models/User');
const Log = require('../models/Log');

exports.scheduleAssessment = async (req, res) => {
  const { userId, scheduledDate } = req.body;
  try {
    const assessment = new MentalHealthAssessment({
      userId,
      assessmentType: 'Kessler-10',
      scheduledDate,
      status: 'scheduled',
    });
    await assessment.save();

    await Log.create({ userId: req.user._id, action: 'Assessment Scheduled', details: `User ID: ${userId}` });
    res.status(201).json({ message: 'Assessment scheduled successfully', assessment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitAssessment = async (req, res) => {
  const { assessmentId, responses } = req.body;
  try {
    const score = responses.reduce((total, response) => total + response, 0);
    const assessment = await MentalHealthAssessment.findByIdAndUpdate(
      assessmentId,
      { responses, score, status: 'completed' },
      { new: true }
    );

    const sanityLevel = 100 - score; // Adjust calculation as needed
    await User.findByIdAndUpdate(assessment.userId, { sanityLevel });

    await Log.create({ userId: assessment.userId, action: 'Assessment Completed', details: `Score: ${score}` });
    res.status(200).json({ message: 'Assessment submitted successfully', assessment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAssessments = async (req, res) => {
  try {
    const assessments = await MentalHealthAssessment.find({ userId: req.user._id });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generateReport = async (req, res) => {
  const { userId } = req.params;
  try {
    const assessments = await MentalHealthAssessment.find({ userId });
    res.status(200).json({ assessments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
