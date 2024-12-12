const User = require('../models/User');
const SanityLevel = require('../models/SanityLevel');
const Log = require('../models/Log');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const DANGEROUS_SANITY_THRESHOLD = 40;

exports.checkAndHandleCrisis = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const sanityLevel = await SanityLevel.findOne({ user: userId });
    if (!sanityLevel) {
      return res.status(404).json({ message: 'Sanity level not found for user.' });
    }

    if (sanityLevel.sanityPercentage < DANGEROUS_SANITY_THRESHOLD) {
      const messageToUser = `Dear ${user.username}, your sanity level is critically low at ${sanityLevel.sanityPercentage}%. Please seek immediate help.`;
      const messageToGuardian = `Alert: ${user.username}'s sanity level is at ${sanityLevel.sanityPercentage}%. Immediate intervention is advised.`;

      const sendMessage = async (to, body) => {
        try {
          await client.messages.create({
            body,
            from: fromNumber,
            to,
          });
        } catch (error) {
          console.error(`Failed to send SMS to ${to}:`, error.message);

          if (error.code === 21608) {
            // Specific handling for Twilio trial account errors
            return `Cannot send SMS to ${to}: ${error.message}`;
          }

          throw error;
        }
      };

      const results = [];

      // Send SMS to the user
      if (user.phoneNumber) {
        const userResult = await sendMessage(user.phoneNumber, messageToUser);
        results.push(userResult || `SMS sent to ${user.phoneNumber}`);
      }

      // Send SMS to the guardian
      if (user.guardianPhoneNumber) {
        const guardianResult = await sendMessage(user.guardianPhoneNumber, messageToGuardian);
        results.push(guardianResult || `SMS sent to ${user.guardianPhoneNumber}`);
      }

      // Log the action
      await Log.create({
        userId: user._id,
        userType: 'User',
        action: 'Crisis Alert Sent',
        details: `Sanity at ${sanityLevel.sanityPercentage}%. Alerts sent.`,
      });

      return res.status(200).json({
        message: 'Crisis detected. Alerts handled successfully.',
        results,
      });
    } else {
      return res.status(200).json({
        message: 'No crisis detected. Sanity level is above the dangerous threshold.',
      });
    }
  } catch (error) {
    console.error('Error handling crisis:', error);
    next(error);
  }
};
