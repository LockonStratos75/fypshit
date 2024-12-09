// backend/controllers/reportController.js
const Report = require('../models/Report');
const User = require('../models/User');
const SERResult = require('../models/SERResult');
const SentimentScore = require('../models/SentimentScore');
const SanityLevel = require('../models/SanityLevel');
const { generatePDF } = require('../utils/pdfGenerator');
const { generateChartBase64 } = require('../utils/chartGenerator');
const path = require('path');
const fs = require('fs');

exports.generateUserReport = async (req, res) => {
  const { userId, templateName } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sanityLevels = await SanityLevel.find({ user: userId }).sort({ createdAt: -1 }).limit(10);
    const serResults = await SERResult.find({ userId }).sort({ date: -1 }).limit(5);
    const sentimentScores = await SentimentScore.find({ userId }).sort({ date: -1 }).limit(5);

    // Generate chart
    const chartBase64 = await generateChartBase64(sanityLevels, sentimentScores, serResults);

    const userData = {
      user: {
        username: user.username,
        email: user.email,
        gender: user.gender,
        age: user.age,
        location: user.location,
      },
      sanityLevels,
      serResults,
      sentimentScores,
      chartBase64
    };

    const pdfPath = await generatePDF(templateName, userData);
    if (!pdfPath) {
      return res.status(500).json({ message: 'PDF generation failed.' });
    }

    const newReport = await Report.create({
      user: userId,
      templateName,
      pdfPath,
    });

    res.status(201).json({ message: 'Report generated successfully', report: newReport });
  } catch (error) {
    console.error('Error generating user report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserReports = async (req, res) => {
  try {
    const { userId } = req.params;
    const reports = await Report.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const pdfPath = path.join(__dirname, '..', 'public', report.pdfPath);
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: 'PDF file not found on server' });
    }

    res.download(pdfPath, `report_${reportId}.pdf`);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
