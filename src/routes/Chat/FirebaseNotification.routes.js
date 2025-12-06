const express = require('express');
const router = express.Router();

const {
  sendSingleNotification,
  sendMultipleNotifications,
  sendTopicNotifications,
  subscribeTokensToTopic,
  unsubscribeTokensFromTopic
} = require('../../controllers/FirebaseNotification.controller');

// Import middleware (optional - uncomment if you want authentication)
// const { auth } = require('../../../middleware/auth.js');

/**
 * @route   POST /api/v2/firebase-notification/send
 * @desc    Send notification to a single device
 * @access  Public (add auth middleware if needed)
 * @body    { token: string, title: string, body: string, imageUrl?: string, data?: object }
 */
router.post('/send', sendSingleNotification);

/**
 * @route   POST /api/v2/firebase-notification/send-multiple
 * @desc    Send notification to multiple devices
 * @access  Public (add auth middleware if needed)
 * @body    { tokens: string[], title: string, body: string, imageUrl?: string, data?: object }
 */
router.post('/send-multiple', sendMultipleNotifications);

/**
 * @route   POST /api/v2/firebase-notification/send-topic
 * @desc    Send notification to a topic
 * @access  Public (add auth middleware if needed)
 * @body    { topic: string, title: string, body: string, imageUrl?: string, data?: object }
 */
router.post('/send-topic', sendTopicNotifications);

/**
 * @route   POST /api/v2/firebase-notification/subscribe-topic
 * @desc    Subscribe tokens to a topic
 * @access  Public (add auth middleware if needed)
 * @body    { tokens: string[], topic: string }
 */
router.post('/subscribe-topic', subscribeTokensToTopic);

/**
 * @route   POST /api/v2/firebase-notification/unsubscribe-topic
 * @desc    Unsubscribe tokens from a topic
 * @access  Public (add auth middleware if needed)
 * @body    { tokens: string[], topic: string }
 */
router.post('/unsubscribe-topic', unsubscribeTokensFromTopic);

module.exports = router;
