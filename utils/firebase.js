/**
 * Firebase Cloud Messaging (FCM) notification utility
 * Handles sending push notifications via Firebase
 */

const admin = require('firebase-admin');
const logger = require('./logger');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) {
    return;
  }

  try {
    // Check if Firebase credentials are provided
    const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT || '';
    const firebaseServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '';
    
    if (!firebaseServiceAccount && !firebaseServiceAccountPath) {
      logger.warn('Firebase service account key not found. Push notifications will be disabled.');
      return;
    }

    // Parse service account key (can be JSON string or path to JSON file)
    let serviceAccount;
    try {
      // Try parsing as JSON string first
      if (firebaseServiceAccount) {
        serviceAccount = JSON.parse(firebaseServiceAccount);
      } else if (firebaseServiceAccountPath) {
        // If parsing fails, treat as file path
        const fs = require('fs');
        serviceAccount = JSON.parse(fs.readFileSync(firebaseServiceAccountPath, 'utf8'));
      }
    } catch (e) {
      logger.error('Error parsing Firebase service account', { error: e.message });
      throw new Error(`Failed to parse Firebase service account: ${e.message}`);
    }

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    firebaseInitialized = true;
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('Error initializing Firebase Admin SDK', {
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to initialize Firebase: ${error.message}`);
  }
};

// Initialize on module load
initializeFirebase();

/**
 * Send push notification to a single device
 * @param {string} token - FCM device token
 * @param {Object} notification - Notification payload
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {string} notification.imageUrl - Image URL (optional)
 * @param {Object} data - Additional data payload (optional)
 * @returns {Promise<Object>} Send result
 */
const sendNotification = async (token, notification, data = {}) => {
  try {
    if (!firebaseInitialized) {
      throw new Error('Firebase is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH in .env file.');
    }

    const message = {
      token: token,
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl })
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {})
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);

    logger.info('Push notification sent successfully', {
      token: token.substring(0, 20) + '...',
      messageId: response
    });

    return {
      success: true,
      messageId: response
    };
  } catch (error) {
    logger.error('Error sending push notification', {
      error: error.message,
      stack: error.stack,
      token: token ? token.substring(0, 20) + '...' : 'N/A'
    });

    // Handle invalid token error
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      return {
        success: false,
        error: 'Invalid or unregistered token',
        code: error.code
      };
    }

    throw new Error(`Failed to send push notification: ${error.message}`);
  }
};

/**
 * Send push notification to multiple devices
 * @param {Array<string>} tokens - Array of FCM device tokens
 * @param {Object} notification - Notification payload
 * @param {Object} data - Additional data payload (optional)
 * @returns {Promise<Object>} Send result with success and failure counts
 */
const sendMulticastNotification = async (tokens, notification, data = {}) => {
  try {
    if (!firebaseInitialized) {
      throw new Error('Firebase is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH in .env file.');
    }

    if (!Array.isArray(tokens) || tokens.length === 0) {
      throw new Error('Tokens array is required and must not be empty');
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl })
      },
      data: {
        ...data,
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {})
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendMulticast(message);

    logger.info('Multicast push notification sent', {
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalTokens: tokens.length
    });

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    logger.error('Error sending multicast push notification', {
      error: error.message,
      stack: error.stack
    });
    
    throw new Error(`Failed to send multicast push notification: ${error.message}`);
  }
};

/**
 * Send notification to a topic
 * @param {string} topic - Topic name
 * @param {Object} notification - Notification payload
 * @param {Object} data - Additional data payload (optional)
 * @returns {Promise<Object>} Send result
 */
const sendTopicNotification = async (topic, notification, data = {}) => {
  try {
    if (!firebaseInitialized) {
      throw new Error('Firebase is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH in .env file.');
    }

    const message = {
      topic: topic,
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl })
      },
      data: {
        ...data,
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {})
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);

    logger.info('Topic push notification sent successfully', {
      topic,
      messageId: response
    });

    return {
      success: true,
      messageId: response
    };
  } catch (error) {
    logger.error('Error sending topic push notification', {
      error: error.message,
      stack: error.stack,
      topic
    });
    
    throw new Error(`Failed to send topic push notification: ${error.message}`);
  }
};

/**
 * Subscribe tokens to a topic
 * @param {Array<string>} tokens - Array of FCM device tokens
 * @param {string} topic - Topic name
 * @returns {Promise<Object>} Subscribe result
 */
const subscribeToTopic = async (tokens, topic) => {
  try {
    if (!firebaseInitialized) {
      throw new Error('Firebase is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH in .env file.');
    }

    const response = await admin.messaging().subscribeToTopic(tokens, topic);

    logger.info('Tokens subscribed to topic', {
      topic,
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors: response.errors
    };
  } catch (error) {
    logger.error('Error subscribing to topic', {
      error: error.message,
      stack: error.stack,
      topic
    });
    
    throw new Error(`Failed to subscribe to topic: ${error.message}`);
  }
};

/**
 * Unsubscribe tokens from a topic
 * @param {Array<string>} tokens - Array of FCM device tokens
 * @param {string} topic - Topic name
 * @returns {Promise<Object>} Unsubscribe result
 */
const unsubscribeFromTopic = async (tokens, topic) => {
  try {
    if (!firebaseInitialized) {
      throw new Error('Firebase is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH in .env file.');
    }

    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);

    logger.info('Tokens unsubscribed from topic', {
      topic,
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors: response.errors
    };
  } catch (error) {
    logger.error('Error unsubscribing from topic', {
      error: error.message,
      stack: error.stack,
      topic
    });
    
    throw new Error(`Failed to unsubscribe from topic: ${error.message}`);
  }
};

module.exports = {
  sendNotification,
  sendMulticastNotification,
  sendTopicNotification,
  subscribeToTopic,
  unsubscribeFromTopic,
  initializeFirebase
};

