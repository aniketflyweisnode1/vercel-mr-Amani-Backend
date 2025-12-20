const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const SocketChat = require('../../models/SocketChat.model');
const logger = require('../../../utils/logger');

const activeUsers = new Map();
// Store socket tokens: { socketId: { userId, token } }
const socketTokens = new Map();

let io = null;

/**
 * Initialize Socket.io directly with server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.io instance
 */
const setupSocket = (server) => {
  if (io) {
    return io; // Return existing instance if already initialized
  }

  // Initialize Socket.io directly - connect at root path
  io = socketIo(server, {
    path: '/',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      try {
        const decoded = jwt.verify(token, 'newuserToken');
        const user = await User.findOne({ user_id: decoded.userId || decoded.user_id, status: true });

        if (!user) {
          return next(new Error('User not found or inactive'));
        }

        // Attach user info to socket
        socket.userId = user.user_id;
        socket.userName = user.firstName || user.BusinessName || 'User';
        socket.token = token;

        // Store socket token
        socketTokens.set(socket.id, {
          userId: user.user_id,
          token: token
        });

        next();
      } catch (error) {
        logger.error('Socket authentication error', { error: error.message });
        return next(new Error('Invalid authentication token'));
      }
    } catch (error) {
      logger.error('Socket middleware error', { error: error.message });
      next(new Error('Authentication failed'));
    }
  });

  // Handle connection
  io.on('connection', (socket) => {
    const userId = socket.userId;
    const userName = socket.userName;

    logger.info('User connected to socket', { userId, socketId: socket.id, userName });

    // Store active user
    activeUsers.set(userId, socket.id);

    // Join user's personal room
    socket.join(`user_${userId}`);

    // Emit connection success
    socket.emit('connected', {
      success: true,
      message: 'Connected to chat server',
      userId,
      userName,
      socketId: socket.id
    });

    // Notify other users about new connection (optional)
    socket.broadcast.emit('user_connected', {
      userId,
      userName,
      socketId: socket.id
    });

    /**
     * Handle sending message (one-to-one chat)
     * @event send_message
     * @param {Object} data - Message data
     * @param {number} data.receiverId - Receiver user ID
     * @param {string} data.message - Message text
     * @param {string} data.fileImage - Image file URL (optional)
     * @param {string} data.emozi - Emoji (optional)
     */
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, message, fileImage, emozi } = data;

        if (!receiverId) {
          socket.emit('error', { message: 'Receiver ID is required' });
          return;
        }

        if (!message && !fileImage) {
          socket.emit('error', { message: 'Message or file image is required' });
          return;
        }

        // Validate receiver exists
        const receiver = await User.findOne({ user_id: receiverId, status: true });
        if (!receiver) {
          socket.emit('error', { message: 'Receiver not found or inactive' });
          return;
        }

        // Create chat record in database
        const chatData = {
          UserName: userName,
          User_id: userId,
          TextMessage: message || '',
          fileImage: fileImage || null,
          emozi: emozi || null,
          Status: true,
          created_by: userId
        };

        const chatRecord = await SocketChat.create(chatData);

        // Prepare message payload
        const messagePayload = {
          Chat_id: chatRecord.Chat_id,
          UserName: userName,
          User_id: userId,
          TextMessage: message || '',
          fileImage: fileImage || null,
          emozi: emozi || null,
          created_at: chatRecord.created_at,
          timestamp: new Date().toISOString()
        };

        // Send to receiver if online
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', messagePayload);
        }

        // Confirm to sender
        socket.emit('message_sent', {
          success: true,
          message: 'Message sent successfully',
          data: messagePayload
        });

        logger.info('Message sent via socket', {
          senderId: userId,
          receiverId,
          chatId: chatRecord.Chat_id
        });
      } catch (error) {
        logger.error('Error sending message via socket', {
          error: error.message,
          stack: error.stack,
          userId
        });
        socket.emit('error', { message: 'Failed to send message', error: error.message });
      }
    });

    /**
     * Handle typing indicator
     * @event typing
     * @param {Object} data - Typing data
     * @param {number} data.receiverId - Receiver user ID
     * @param {boolean} data.isTyping - Is typing status
     */
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      if (receiverId) {
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user_typing', {
            userId,
            userName,
            isTyping
          });
        }
      }
    });

    /**
     * Handle getting chat history
     * @event get_chat_history
     * @param {Object} data - Request data
     * @param {number} data.otherUserId - Other user ID
     * @param {number} data.page - Page number (optional)
     * @param {number} data.limit - Limit per page (optional)
     */
    socket.on('get_chat_history', async (data) => {
      try {
        const { otherUserId, page = 1, limit = 50 } = data;

        if (!otherUserId) {
          socket.emit('error', { message: 'Other user ID is required' });
          return;
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Get messages where current user is sender or receiver
        const chats = await SocketChat.find({
          $or: [
            { User_id: userId },
            { User_id: otherUserId }
          ],
          Status: true
        })
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limitNum);

        socket.emit('chat_history', {
          success: true,
          data: chats,
          page: pageNum,
          limit: limitNum
        });
      } catch (error) {
        logger.error('Error getting chat history', {
          error: error.message,
          userId
        });
        socket.emit('error', { message: 'Failed to get chat history', error: error.message });
      }
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
      logger.info('User disconnected from socket', { userId, socketId: socket.id });

      // Remove from active users
      activeUsers.delete(userId);
      socketTokens.delete(socket.id);

      // Notify other users about disconnection
      socket.broadcast.emit('user_disconnected', {
        userId,
        userName
      });
    });

    /**
     * Handle error
     */
    socket.on('error', (error) => {
      logger.error('Socket error', { error: error.message, userId, socketId: socket.id });
    });
  });

  return io;
};

/**
 * Get active users count
 * @returns {number} Active users count
 */
const getActiveUsersCount = () => {
  return activeUsers.size;
};

/**
 * Check if user is online
 * @param {number} userId - User ID
 * @returns {boolean} Is user online
 */
const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

/**
 * Get socket ID for user
 * @param {number} userId - User ID
 * @returns {string|null} Socket ID or null
 */
const getUserSocketId = (userId) => {
  return activeUsers.get(userId) || null;
};

/**
 * Get Socket.io instance
 * @returns {Object|null} Socket.io instance or null
 */
const getIO = () => {
  return io;
};

// Export Socket.io functions and instance
// Socket.io only - no REST API endpoints
module.exports = {
  setupSocket,
  getIO,
  getActiveUsersCount,
  isUserOnline,
  getUserSocketId
};
