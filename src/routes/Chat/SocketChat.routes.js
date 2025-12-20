const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const SocketChat = require('../../models/SocketChat.model');
const logger = require('../../../utils/logger');

const activeUsers = new Map(); // Map<userId, socketId>
const socketTokens = new Map(); // Map<socketId, { userId, token }>

let io = null;

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
const setupSocket = (server) => {
  // console.log('Setting up socket');
  if (io) {
    return io; // Return existing instance if already initialized
  }

  // Initialize Socket.IO with root path
  io = socketIo(server, {
    path: '/',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      // Get token from multiple sources (auth object, Authorization header, or query parameter)
      const token = socket.handshake.auth.token || 
                   socket.handshake.headers.authorization?.replace('Bearer ', '') ||
                   socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'newuserToken');
        
        // Find user by user_id
        const user = await User.findOne({ 
          user_id: decoded.userId || decoded.user_id, 
          status: true 
        });

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
    // console.log('User connected to socket', socket);
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
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });

    // Notify other users about new connection (optional)
    socket.broadcast.emit('user_connected', {
      userId,
      userName,
      socketId: socket.id,
      timestamp: new Date().toISOString()
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

        // Validation
        if (!receiverId) {
          socket.emit('error', { message: 'Receiver ID is required' });
          return;
        }

        if (!message && !fileImage && !emozi) {
          socket.emit('error', { message: 'Message, file image, or emoji is required' });
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
          receiverId: receiverId,
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
      try {
        const { receiverId, isTyping } = data;
        
        if (!receiverId) {
          socket.emit('error', { message: 'Receiver ID is required' });
          return;
        }

        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user_typing', {
            userId,
            userName,
            isTyping: isTyping !== false,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        logger.error('Error handling typing indicator', { error: error.message, userId });
        socket.emit('error', { message: 'Failed to send typing indicator' });
      }
    });

    /**
     * Handle getting chat history between two users
     * @event get_chat_history
     * @param {Object} data - Request data
     * @param {number} data.otherUserId - Other user ID
     * @param {number} data.page - Page number (optional, default: 1)
     * @param {number} data.limit - Limit per page (optional, default: 50)
     */
    socket.on('get_chat_history', async (data) => {
      try {
        const { otherUserId, page = 1, limit = 50 } = data;

        if (!otherUserId) {
          socket.emit('error', { message: 'Other user ID is required' });
          return;
        }

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
        const skip = (pageNum - 1) * limitNum;

        // Get messages where current user is sender
        // Note: In your current model, User_id is the sender
        // For a proper chat system, you might want to add a receiverId field
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
          data: chats.reverse(), // Reverse to show oldest first
          page: pageNum,
          limit: limitNum,
          total: chats.length
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
     * Handle getting online users
     * @event get_online_users
     */
    socket.on('get_online_users', async () => {
      try {
        const onlineUserIds = Array.from(activeUsers.keys());
        
        // Get user details for online users
        const onlineUsers = await User.find({
          user_id: { $in: onlineUserIds },
          status: true
        }).select('user_id firstName lastName BusinessName');

        socket.emit('online_users', {
          success: true,
          data: onlineUsers,
          count: onlineUsers.length
        });
      } catch (error) {
        logger.error('Error getting online users', { error: error.message, userId });
        socket.emit('error', { message: 'Failed to get online users' });
      }
    });

    /**
     * Handle checking if user is online
     * @event check_user_online
     * @param {Object} data - Request data
     * @param {number} data.userId - User ID to check
     */
    socket.on('check_user_online', (data) => {
      try {
        const { userId: checkUserId } = data;
        
        if (!checkUserId) {
          socket.emit('error', { message: 'User ID is required' });
          return;
        }

        const isOnline = activeUsers.has(checkUserId);
        socket.emit('user_online_status', {
          userId: checkUserId,
          isOnline,
          socketId: isOnline ? activeUsers.get(checkUserId) : null
        });
      } catch (error) {
        logger.error('Error checking user online status', { error: error.message });
        socket.emit('error', { message: 'Failed to check user online status' });
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
        userName,
        timestamp: new Date().toISOString()
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
 * Send message to specific user (server-side)
 * @param {number} userId - Target user ID
 * @param {string} event - Event name
 * @param {Object} data - Message data
 */
const sendToUser = (userId, event, data) => {
  if (!io) {
    logger.warn('Socket.IO not initialized');
    return false;
  }

  const socketId = activeUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

/**
 * Broadcast message to all connected users
 * @param {string} event - Event name
 * @param {Object} data - Message data
 */
const broadcast = (event, data) => {
  if (!io) {
    logger.warn('Socket.IO not initialized');
    return;
  }
  io.emit(event, data);
};

/**
 * Get Socket.IO instance
 * @returns {Object|null} Socket.IO instance or null
 */
const getIO = () => {
  return io;
};

module.exports = {
  setupSocket,
  getIO,
  getActiveUsersCount,
  isUserOnline,
  getUserSocketId,
  sendToUser,
  broadcast
};

