// backend/controllers/monitoringController.js
const MonitoringAlert = require('../models/MonitoringAlert');

exports.createAlert = async (req, res) => {
  try {
    const { alertType, alertMessage } = req.body;
    const newAlert = new MonitoringAlert({
      userId: req.user._id,
      alertType,
      alertMessage,
    });
    await newAlert.save();
    res.status(201).json(newAlert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await MonitoringAlert.find({ userId: req.user._id });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
