const User = require('../models/User');
const PsychologistProfile = require('../models/PsychologistProfile');
const SanityLevel = require('../models/SanityLevel');
const Log = require('../models/Log');
const SentimentScore = require('../models/SentimentScore');
const SERResult = require('../models/SERResult');
const ChatSession = require('../models/ChatSession');

exports.getSystemMetrics = async (req, res, next) => {
  try {
    // Only Admin can access
    if (req.userType !== 'AdminProfile') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    // Total users
    const totalUsers = await User.countDocuments({});

    // Total approved psychologists
    const totalPsychologists = await PsychologistProfile.countDocuments({ status: 'approved' });

    // Average sanity level
    const sanityLevels = await SanityLevel.find({});
    let averageSanityLevel = 'N/A';
    if (sanityLevels.length > 0) {
      const sumSanity = sanityLevels.reduce((acc, sl) => acc + sl.sanityPercentage, 0);
      averageSanityLevel = (sumSanity / sanityLevels.length).toFixed(2);
    }

    // Recent sessions in last 24 hours
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSessionsCount = await ChatSession.countDocuments({ date: { $gte: since24h.toISOString() } });

    // Average sentiment across all sentiment scores
    const sentimentScores = await SentimentScore.find({});
    let averageSentiment = 'N/A';
    if (sentimentScores.length > 0) {
      const sumSent = sentimentScores.reduce((acc, s) => acc + s.averageSentiment, 0);
      averageSentiment = (sumSent / sentimentScores.length).toFixed(2);
    }

    // Count of SER Results
    const serCount = await SERResult.countDocuments({});

    // Recent logs count in last 24 hours
    const recentLogsCount = await Log.countDocuments({ timestamp: { $gte: since24h } });

    res.status(200).json({
      totalUsers,
      totalPsychologists,
      averageSanityLevel,
      recentSessionsCount,
      averageSentiment,
      serResultsCount: serCount,
      recentLogsCount
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    next(error);
  }
};

exports.getUserBehaviorAnalytics = async (req, res, next) => {
  try {
    // Only Admin can access
    if (req.userType !== 'AdminProfile') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    // Distribution of sanity levels
    const sanityLevels = await SanityLevel.find({});
    const distribution = {
      low: 0,
      medium: 0,
      high: 0
    };

    sanityLevels.forEach(sl => {
      if (sl.sanityPercentage < 33) distribution.low++;
      else if (sl.sanityPercentage < 66) distribution.medium++;
      else distribution.high++;
    });

    // Sentiment trend in last 7 days
    const since7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSentiments = await SentimentScore.find({ date: { $gte: since7days } });

    let sentimentTrend = {};
    recentSentiments.forEach(s => {
      const day = new Date(s.date).toLocaleDateString();
      if (!sentimentTrend[day]) sentimentTrend[day] = { sum: 0, count: 0 };
      sentimentTrend[day].sum += s.averageSentiment;
      sentimentTrend[day].count += 1;
    });
    for (let day in sentimentTrend) {
      sentimentTrend[day] = (sentimentTrend[day].sum / sentimentTrend[day].count).toFixed(2);
    }

    res.status(200).json({
      sanityDistribution: distribution,
      sentimentTrend
    });
  } catch (error) {
    console.error('Error fetching user behavior analytics:', error);
    next(error);
  }
};
