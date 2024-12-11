// backend/controllers/crisisController.js

const User = require('../models/User');
const SanityLevel = require('../models/SanityLevel');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID ;
const authToken = process.env.TWILIO_AUTH_TOKEN ;
const fromNumber = process.env.TWILIO_PHONE_NUMBER ;

const client = twilio(accountSid, authToken);

const DANGEROUS_SANITY_THRESHOLD = 20;

/**
 * Send Crisis Alerts via Twilio
 * This function can be called when a user's sanity level crosses a dangerous threshold
 * and an alert needs to be sent to them and their guardian.
 * 
 * @param {String} userId - MongoDB _id of the User.
 */
exports.checkAndHandleCrisis  = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for crisis alert.');
      return;
    }

    const sanityLevel = await SanityLevel.findOne({ user: userId });
    if (!sanityLevel) {
      console.error('Sanity level not found for user.');
      return;
    }
    if (sanityLevel.sanityPercentage < DANGEROUS_SANITY_THRESHOLD) {
        // Fetch user details
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }
  
        // Prepare the message
        // Example message template:
        // "Dear <username>, Your sanity level is currently <sanity>% which is critical. Please seek help immediately."
        const messageToUser = `Dear ${user.username}, Your sanity level is currently ${sanityLevel.sanityPercentage}%. This is below the safe threshold. Please seek help immediately.`;
        const messageToGuardian = `Alert: ${user.username}'s sanity level is at ${sanityLevel.sanityPercentage}%. Please consider immediate intervention.`;
  
        // Send SMS to user
        if (user.phoneNumber) {
          await client.messages.create({
            body: messageToUser,
            from: fromNumber,
            to: user.phoneNumber,
          });
        }
  
        // Send SMS to guardian if available
        if (user.guardianPhoneNumber) {
          await client.messages.create({
            body: messageToGuardian,
            from: fromNumber,
            to: user.guardianPhoneNumber,
          });
        }
  
        // Log the action
        await Log.create({
          userId: user._id,
          userType: 'User',
          action: 'Crisis Alert Sent',
          details: `Sanity at ${sanityLevel.sanityPercentage}%. SMS sent to user and guardian.`
        });
  
        return res.status(200).json({
          message: 'Crisis detected. Alerts sent successfully.',
        });
      } else {
        return res.status(200).json({
          message: 'No crisis. Sanity level is above the dangerous threshold.',
        });
      }
  
    } catch (error) {
      console.error('Error handling crisis:', error);
      next(error);
    }
  };