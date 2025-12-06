const SocketChat = require('../models/SocketChat.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { uploadBufferToS3, generateUniqueFilename } = require('../../utils/s3.js');  

// Manual population function for Number refs
const populateSocketChat = async (socketChat) => {
  const socketChatArray = Array.isArray(socketChat) ? socketChat : [socketChat];
  const populatedSocketChats = await Promise.all(
    socketChatArray.map(async (chat) => {
      if (!chat) return null;
      
      const chatObj = chat.toObject ? chat.toObject() : chat;
      
      // Populate User_id
      if (chatObj.User_id) {
        const userId = typeof chatObj.User_id === 'object' ? chatObj.User_id : chatObj.User_id;
        const user = await User.findOne({ user_id: userId })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (user) {
          chatObj.User_id = user.toObject ? user.toObject() : user;
        }
      }
      
      // Populate created_by
      if (chatObj.created_by) {
        const createdById = typeof chatObj.created_by === 'object' ? chatObj.created_by : chatObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          chatObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (chatObj.updated_by) {
        const updatedById = typeof chatObj.updated_by === 'object' ? chatObj.updated_by : chatObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          chatObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return chatObj;
    })
  );
  
  return Array.isArray(socketChat) ? populatedSocketChats : populatedSocketChats[0];
};

const ensureUserExists = async (userId) => {
  if (!userId) return false;
  const user = await User.findOne({ user_id: userId, status: true });
  return !!user;
};

const createSocketChat = asyncHandler(async (req, res) => {
  try {
    const { User_id } = req.body;

    // Validate user exists
    if (!(await ensureUserExists(User_id))) {
      return sendError(res, 'User not found or inactive', 400);
    }

    const socketChatData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const socketChat = await SocketChat.create(socketChatData);
    console.info('Socket Chat created successfully', { id: socketChat._id, Chat_id: socketChat.Chat_id });

    const populated = await populateSocketChat(socketChat);
    sendSuccess(res, populated, 'Socket Chat created successfully', 201);
  } catch (error) {
    console.error('Error creating socket chat', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllSocketChats = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      Status,
      User_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { TextMessage: { $regex: search, $options: 'i' } },
        { UserName: { $regex: search, $options: 'i' } }
      ];
    }

    if (Status !== undefined) {
      filter.Status = Status === 'true';
    }

    if (User_id) {
      filter.User_id = parseInt(User_id, 10);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [socketChats, total] = await Promise.all([
      SocketChat.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      SocketChat.countDocuments(filter)
    ]);

    const populatedSocketChats = await populateSocketChat(socketChats);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Socket Chats retrieved successfully', { count: populatedSocketChats.length, total });
    sendPaginated(res, populatedSocketChats, paginationMeta, 'Socket Chats retrieved successfully');
  } catch (error) {
    console.error('Error retrieving socket chats', { error: error.message });
    throw error;
  }
});

const getSocketChatById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let socketChat;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      socketChat = await SocketChat.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid socket chat ID format', 400);
      }
      socketChat = await SocketChat.findOne({ Chat_id: numId });
    }

    if (!socketChat) {
      return sendNotFound(res, 'Socket Chat not found');
    }

    const populatedSocketChat = await populateSocketChat(socketChat);

    console.info('Socket Chat retrieved successfully', { id: socketChat._id });
    sendSuccess(res, populatedSocketChat, 'Socket Chat retrieved successfully');
  } catch (error) {
    console.error('Error retrieving socket chat', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateSocketChat = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // If User_id is being updated, validate it exists
    if (req.body.User_id) {
      if (!(await ensureUserExists(req.body.User_id))) {
        return sendError(res, 'User not found or inactive', 400);
      }
    }

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let socketChat;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      socketChat = await SocketChat.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid socket chat ID format', 400);
      }
      socketChat = await SocketChat.findOneAndUpdate({ Chat_id: numId }, updateData, { new: true, runValidators: true });
    }

    if (!socketChat) {
      return sendNotFound(res, 'Socket Chat not found');
    }

    const populatedSocketChat = await populateSocketChat(socketChat);

    console.info('Socket Chat updated successfully', { id: socketChat._id });
    sendSuccess(res, populatedSocketChat, 'Socket Chat updated successfully');
  } catch (error) {
    console.error('Error updating socket chat', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteSocketChat = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let socketChat;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      socketChat = await SocketChat.findByIdAndUpdate(
        id,
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid socket chat ID format', 400);
      }
      socketChat = await SocketChat.findOneAndUpdate(
        { Chat_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    if (!socketChat) {
      return sendNotFound(res, 'Socket Chat not found');
    }

    console.info('Socket Chat deleted successfully', { id: socketChat._id });
    sendSuccess(res, socketChat, 'Socket Chat deleted successfully');
  } catch (error) {
    console.error('Error deleting socket chat', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getSocketChatsByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      Status,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { User_id: userId };

    if (Status !== undefined) {
      filter.Status = Status === 'true';
    }

    if (search) {
      filter.$or = [
        { TextMessage: { $regex: search, $options: 'i' } },
        { UserName: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [socketChats, total] = await Promise.all([
      SocketChat.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      SocketChat.countDocuments(filter)
    ]);

    const populatedSocketChats = await populateSocketChat(socketChats);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Socket Chats retrieved for authenticated user', { userId, total });
    sendPaginated(res, populatedSocketChats, paginationMeta, 'Socket Chats retrieved successfully');
  } catch (error) {
    console.error('Error retrieving socket chats for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getSocketChatsByUserId = asyncHandler(async (req, res) => {
  try {
    const { User_id } = req.params;

    if (!User_id) {
      return sendError(res, 'User ID is required', 400);
    }

    const userId = parseInt(User_id, 10);
    if (isNaN(userId)) {
      return sendError(res, 'Invalid User ID format', 400);
    }

    // Validate user exists
    if (!(await ensureUserExists(userId))) {
      return sendError(res, 'User not found or inactive', 400);
    }

    const {
      page = 1,
      limit = 10,
      Status,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { User_id: userId };

    if (Status !== undefined) {
      filter.Status = Status === 'true';
    }

    if (search) {
      filter.$or = [
        { TextMessage: { $regex: search, $options: 'i' } },
        { UserName: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [socketChats, total] = await Promise.all([
      SocketChat.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      SocketChat.countDocuments(filter)
    ]);

    const populatedSocketChats = await populateSocketChat(socketChats);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Socket Chats retrieved for user', { User_id: userId, total });
    sendPaginated(res, populatedSocketChats, paginationMeta, 'Socket Chats retrieved successfully');
  } catch (error) {
    console.error('Error retrieving socket chats for user', { error: error.message, User_id: req.params.User_id });
    throw error;
  }
});

const uploadChatFile = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const { User_id, TextMessage, emozi } = req.body;

    // Validate user exists if User_id is provided
    if (User_id && !(await ensureUserExists(parseInt(User_id, 10)))) {
      return sendError(res, 'User not found or inactive', 400);
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(req.file.originalname);
    const folder = 'chat/files'; // S3 folder path

    // Upload file to S3
    const uploadResult = await uploadBufferToS3(
      req.file.buffer,
      uniqueFilename,
      folder,
      req.file.mimetype
    );

    // Create socket chat record with file URL
    const socketChatData = {
      User_id: User_id ? parseInt(User_id, 10) : req.userIdNumber,
      UserName: req.body.UserName || null,
      TextMessage: TextMessage || '',
      fileImage: uploadResult.url,
      emozi: emozi || null,
      Status: true,
      created_by: req.userIdNumber || null
    };

    const socketChat = await SocketChat.create(socketChatData);
    console.info('Chat file uploaded successfully', { 
      id: socketChat._id, 
      Chat_id: socketChat.Chat_id,
      fileUrl: uploadResult.url 
    });

    const populated = await populateSocketChat(socketChat);
    sendSuccess(res, populated, 'Chat file uploaded successfully', 201);
  } catch (error) {
    console.error('Error uploading chat file', { error: error.message, stack: error.stack });
    throw error;
  }
});

const uploadMultipleChatFiles = asyncHandler(async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded', 400);
    }

    const { User_id, UserName, TextMessage, emozi } = req.body;

    // Validate user exists if User_id is provided
    if (User_id && !(await ensureUserExists(parseInt(User_id, 10)))) {
      return sendError(res, 'User not found or inactive', 400);
    }

    const uploadedChats = [];
    const folder = 'chat/files';

    // Process each file
    for (const file of req.files) {
      // Generate unique filename
      const uniqueFilename = generateUniqueFilename(file.originalname);

      // Upload file to S3
      const uploadResult = await uploadBufferToS3(
        file.buffer,
        uniqueFilename,
        folder,
        file.mimetype
      );

      // Create socket chat record with file URL
      const socketChatData = {
        User_id: User_id ? parseInt(User_id, 10) : req.userIdNumber,
        UserName: UserName || null,
        TextMessage: TextMessage || '',
        fileImage: uploadResult.url,
        emozi: emozi || null,
        Status: true,
        created_by: req.userIdNumber || null
      };

      const socketChat = await SocketChat.create(socketChatData);
      const populated = await populateSocketChat(socketChat);
      uploadedChats.push(populated);
    }

    console.info('Multiple chat files uploaded successfully', { 
      count: uploadedChats.length 
    });

    sendSuccess(res, uploadedChats, 'Chat files uploaded successfully', 201);
  } catch (error) {
    console.error('Error uploading multiple chat files', { error: error.message, stack: error.stack });
    throw error;
  }
});

module.exports = {
  createSocketChat,
  getAllSocketChats,
  getSocketChatById,
  updateSocketChat,
  deleteSocketChat,
  getSocketChatsByAuth,
  getSocketChatsByUserId,
  uploadChatFile,
  uploadMultipleChatFiles
};

