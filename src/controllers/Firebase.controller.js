const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const {
  sendNotification,
  sendMulticastNotification,
  sendTopicNotification,
  subscribeToTopic,
  unsubscribeFromTopic
} = require('../../utils/firebase');

/**
 * Send test notification to a single device
 * @route   POST /api/v2/firebase/send-test
 * @access  Public
 */
const sendTestNotificationHandler = asyncHandler(async (req, res) => {
  try {
    const { token, title, body, imageUrl, data } = req.body;

    if (!token) {
      return sendError(res, 'FCM device token is required', 400);
    }

    const notification = {
      title: title || 'Test Notification',
      body: body || 'This is a test notification from the API',
      ...(imageUrl && { imageUrl })
    };

    const result = await sendNotification(token, notification, data || {});

    if (result.success) {
      return sendSuccess(res, result, 'Test notification sent successfully', 200);
    } else {
      return sendError(res, result.error || 'Failed to send test notification', 400);
    }
  } catch (error) {
    console.error('Error sending test notification', { error: error.message });
    return sendError(res, error.message || 'Failed to send test notification', 500);
  }
});

/**
 * Send notification to a single device
 * @route   POST /api/v2/firebase/send
 * @access  Public
 */
const sendNotificationHandler = asyncHandler(async (req, res) => {
  try {
    const { token, title, body, imageUrl, data } = req.body;

    if (!token) {
      return sendError(res, 'FCM device token is required', 400);
    }

    if (!title) {
      return sendError(res, 'Notification title is required', 400);
    }

    if (!body) {
      return sendError(res, 'Notification body is required', 400);
    }

    const notification = {
      title,
      body,
      ...(imageUrl && { imageUrl })
    };

    const result = await sendNotification(token, notification, data || {});

    if (result.success) {
      return sendSuccess(res, result, 'Notification sent successfully', 200);
    } else {
      return sendError(res, result.error || 'Failed to send notification', 400);
    }
  } catch (error) {
    console.error('Error sending notification', { error: error.message });
    return sendError(res, error.message || 'Failed to send notification', 500);
  }
});

/**
 * Send notification to multiple devices
 * @route   POST /api/v2/firebase/send-multicast
 * @access  Public
 */
const sendMulticastNotificationHandler = asyncHandler(async (req, res) => {
  try {
    const { tokens, title, body, imageUrl, data } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return sendError(res, 'Tokens array is required and must not be empty', 400);
    }

    if (!title) {
      return sendError(res, 'Notification title is required', 400);
    }

    if (!body) {
      return sendError(res, 'Notification body is required', 400);
    }

    const notification = {
      title,
      body,
      ...(imageUrl && { imageUrl })
    };

    const result = await sendMulticastNotification(tokens, notification, data || {});
    return sendSuccess(res, result, 'Multicast notification sent successfully', 200);
  } catch (error) {
    console.error('Error sending multicast notification', { error: error.message });
    return sendError(res, error.message || 'Failed to send multicast notification', 500);
  }
});

/**
 * Send notification to a topic
 * @route   POST /api/v2/firebase/send-topic
 * @access  Public
 */
const sendTopicNotificationHandler = asyncHandler(async (req, res) => {
  try {
    const { topic, title, body, imageUrl, data } = req.body;

    if (!topic) {
      return sendError(res, 'Topic name is required', 400);
    }

    if (!title) {
      return sendError(res, 'Notification title is required', 400);
    }

    if (!body) {
      return sendError(res, 'Notification body is required', 400);
    }

    const notification = {
      title,
      body,
      ...(imageUrl && { imageUrl })
    };

    const result = await sendTopicNotification(topic, notification, data || {});
    return sendSuccess(res, result, 'Topic notification sent successfully', 200);
  } catch (error) {
    console.error('Error sending topic notification', { error: error.message });
    return sendError(res, error.message || 'Failed to send topic notification', 500);
  }
});

/**
 * Subscribe tokens to a topic
 * @route   POST /api/v2/firebase/subscribe-topic
 * @access  Public
 */
const subscribeToTopicHandler = asyncHandler(async (req, res) => {
  try {
    const { tokens, topic } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return sendError(res, 'Tokens array is required and must not be empty', 400);
    }

    if (!topic) {
      return sendError(res, 'Topic name is required', 400);
    }

    const result = await subscribeToTopic(tokens, topic);
    return sendSuccess(res, result, 'Tokens subscribed to topic successfully', 200);
  } catch (error) {
    console.error('Error subscribing to topic', { error: error.message });
    return sendError(res, error.message || 'Failed to subscribe to topic', 500);
  }
});

/**
 * Unsubscribe tokens from a topic
 * @route   POST /api/v2/firebase/unsubscribe-topic
 * @access  Public
 */
const unsubscribeFromTopicHandler = asyncHandler(async (req, res) => {
  try {
    const { tokens, topic } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return sendError(res, 'Tokens array is required and must not be empty', 400);
    }

    if (!topic) {
      return sendError(res, 'Topic name is required', 400);
    }

    const result = await unsubscribeFromTopic(tokens, topic);
    return sendSuccess(res, result, 'Tokens unsubscribed from topic successfully', 200);
  } catch (error) {
    console.error('Error unsubscribing from topic', { error: error.message });
    return sendError(res, error.message || 'Failed to unsubscribe from topic', 500);
  }
});

module.exports = {
  sendTestNotificationHandler,
  sendNotificationHandler,
  sendMulticastNotificationHandler,
  sendTopicNotificationHandler,
  subscribeToTopicHandler,
  unsubscribeFromTopicHandler
};
