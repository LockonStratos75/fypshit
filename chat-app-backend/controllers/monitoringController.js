// backend/controllers/monitoringController.js

const MonitoringAlert = require('../models/MonitoringAlert');
const User = require('../models/User');

/**
 * Psychologist or system creates an alert
 */
exports.createAlert = async (req, res) => {
  try {
    const { userId, alertType, alertMessage } = req.body;
    const triggeredBy = (req.userType === 'PsychologistProfile') ? 'psychologist' : 'system';

    const newAlert = new MonitoringAlert({
      userId,
      alertType,
      alertMessage,
      triggeredBy,
    });

    await newAlert.save();
    res.status(201).json({ message: 'Alert created successfully.', alert: newAlert });
  } catch (err) {
    console.error('Error creating alert:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Psychologist or User can view alerts related to their context
 */
exports.getAlerts = async (req, res) => {
  try {
    let query = {};

    // If userType === 'User', show user's own alerts
    if (req.userType === 'User') {
      query.userId = req.user._id;
    } 
    // If psychologist, optionally allow filtering by userId from query param
    else if (req.userType === 'PsychologistProfile') {
      if (req.query.userId) query.userId = req.query.userId;
      // Otherwise, psychologist might just see all alerts or implement domain logic as needed
    }

    const alerts = await MonitoringAlert.find(query).sort({ createdAt: -1 });
    res.json({ alerts });
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Admin: view all alerts with optional filters
 */
exports.getAllAlertsForAdmin = async (req, res) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.userId) query.userId = req.query.userId;

    const alerts = await MonitoringAlert.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'username email'); // Populate user details
    res.status(200).json({ alerts });
  } catch (err) {
    console.error('Error fetching alerts for admin:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Admin: update alert (e.g., mark as resolved, add response)
 */
exports.updateAlertByAdmin = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const alertId = req.params.id;

    const updatedAlert = await MonitoringAlert.findByIdAndUpdate(
      alertId,
      { status, adminResponse },
      { new: true, runValidators: true }
    );

    if (!updatedAlert) {
      return res.status(404).json({ message: 'Alert not found.' });
    }

    res.status(200).json({ message: 'Alert updated successfully.', updatedAlert });
  } catch (err) {
    console.error('Error updating alert:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
