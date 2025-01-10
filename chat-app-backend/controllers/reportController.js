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
      chartBase64,
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

/**
 * @desc   Fetch paginated reports for the psychologist's assigned patients
 * @route  GET /psychologist/reports
 * @access Private (Psychologist)
 */

exports.getAllReportsForPsychologist = async (req, res) => {
  try {
    // 1) Grab query params for search/filter
    const { page = 1, limit = 10, search = '', template = '' } = req.query;

    // 2) Build base query object
    let queryObj = {};

    // If the user wants to filter by a certain templateName
    if (template) {
      queryObj.templateName = template;
    }

    // 3) If the user wants to search by user’s name or email
    // We'll do a two-step approach:
    //   - find userIds that match the search
    //   - limit the reports to those userIds
    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const matchingIds = matchingUsers.map(u => u._id);
      // Restrict the reports to these user IDs
      queryObj.user = { $in: matchingIds };
    }

    // 4) Handle pagination
    const pageNum = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);
    const skip = (pageNum - 1) * pageLimit;

    // 5) Execute the query
    const [reports, totalCount] = await Promise.all([
      Report.find(queryObj)
        .populate('user', 'username email') // Show user info
        .sort({ createdAt: -1 })           // Newest first
        .skip(skip)
        .limit(pageLimit),
      Report.countDocuments(queryObj),
    ]);

    // 6) Return data
    return res.status(200).json({
      reports,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / pageLimit),
    });
  } catch (error) {
    console.error('Error fetching all reports for psychologist:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
