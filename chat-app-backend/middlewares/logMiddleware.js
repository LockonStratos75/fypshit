// backend/middlewares/logMiddleware.js
const Log = require('../models/Log');

const logAction = async (req, res, next) => {
  const { method, originalUrl } = req;
  const userId = req.user ? req.user._id : null;
  const action = `${method} ${originalUrl}`;

  await Log.create({ userId, action, details: 'API Request' });
  next();
};

module.exports = logAction;
