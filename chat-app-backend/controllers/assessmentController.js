const MentalHealthAssessment = require('../models/MentalHealthAssessment');  // Ensure this import is correct

// Create an assessment
exports.createAssessment = async (req, res) => {
  try {
    const { assessmentType, responses, score } = req.body;
    const newAssessment = new MentalHealthAssessment({
      userId: req.user._id, 
      assessmentType,
      responses,
      score,
    });
    await newAssessment.save();
    res.status(201).json(newAssessment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get assessments by user ID
exports.getAssessmentsByUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    // Replace 'Assessment' with 'MentalHealthAssessment'
    const assessments = await MentalHealthAssessment.find({ userId: userId });
    if (!assessments || assessments.length === 0) {
      return res.status(404).json({ message: 'No assessments found.' });
    }
    res.status(200).json({ assessments });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all assessments for the logged-in user
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await MentalHealthAssessment.find({ userId: req.user._id });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get total number of assessments
exports.getTotalAssessments = async (req, res) => {
  try {
    const totalAssessments = await MentalHealthAssessment.countDocuments(); // Fetch total number of assessments
    res.status(200).json({ totalAssessments });
  } catch (err) {
    console.error('Error fetching total assessments:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
