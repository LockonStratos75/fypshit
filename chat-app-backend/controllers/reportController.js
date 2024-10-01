// backend/controllers/reportController.js

const SanityLevel = require('../models/SanityLevel');
const SERResult = require('../models/SERResult');
const SentimentScore = require('../models/SentimentScore');
const User = require('../models/User');

exports.generateUserReport = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch sanity levels for the user
    const sanityLevels = await SanityLevel.find({ user: userId });

    // Fetch SER results for the user
    const serResults = await SERResult.find({ userId });

    // Fetch sentiment scores for the user
    const sentimentScores = await SentimentScore.find({ userId });

    // Fetch user details
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the fetched data
    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
      },
      sanityLevels,
      serResults,
      sentimentScores,
    });
  } catch (error) {
    console.error('Error generating user report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
