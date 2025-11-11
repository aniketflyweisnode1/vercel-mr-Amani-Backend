const Reel_Add_User = require('../models/Reel_Add_User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


/**
 * Create a new reel add user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createReelAddUser = asyncHandler(async (req, res) => {
  try {
    const addUserData = {
      ...req.body,
      user_id: req.body.user_id || req.userIdNumber,
      created_by: req.userIdNumber || null
    };

    const addUser = await Reel_Add_User.create(addUserData);

    console.info('Reel Add User created successfully', { addUserId: addUser._id, Reel_Add_User_id: addUser.Reel_Add_User_id });

    sendSuccess(res, addUser, 'Reel Add User created successfully', 201);
  } catch (error) {
    console.error('Error creating reel add user', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all reel add users with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllReelAddUsers = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [addUsers, total] = await Promise.all([
      Reel_Add_User.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Reel_Add_User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };

    console.info('Reel Add Users retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, addUsers, pagination, 'Reel Add Users retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel add users', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get reel add user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReelAddUserById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a MongoDB ObjectId or Number ID
    let addUser;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      addUser = await Reel_Add_User.findById(id);
    } else {
      // Number ID (Reel_Add_User_id)
      const addUserId = parseInt(id, 10);
      if (isNaN(addUserId)) {
        return sendNotFound(res, 'Invalid reel add user ID format');
      }
      addUser = await Reel_Add_User.findOne({ Reel_Add_User_id: addUserId });
    }

    if (!addUser) {
      return sendNotFound(res, 'Reel Add User not found');
    }

    console.info('Reel Add User retrieved successfully', { addUserId: addUser._id });

    sendSuccess(res, addUser, 'Reel Add User retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel add user', { error: error.message, addUserId: req.params.id });
    throw error;
  }
});

/**
 * Update reel add user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateReelAddUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Check if id is a MongoDB ObjectId or Number ID
    let addUser;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      addUser = await Reel_Add_User.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true, 
          runValidators: true
        }
      );
    } else {
      // Number ID (Reel_Add_User_id)
      const addUserId = parseInt(id, 10);
      if (isNaN(addUserId)) {
        return sendNotFound(res, 'Invalid reel add user ID format');
      }
      addUser = await Reel_Add_User.findOneAndUpdate(
        { Reel_Add_User_id: addUserId },
        updateData,
        { 
          new: true, 
          runValidators: true
        }
      );
    }

    if (!addUser) {
      return sendNotFound(res, 'Reel Add User not found');
    }

    console.info('Reel Add User updated successfully', { addUserId: addUser._id });

    sendSuccess(res, addUser, 'Reel Add User updated successfully');
  } catch (error) {
    console.error('Error updating reel add user', { error: error.message, addUserId: req.params.id });
    throw error;
  }
});

/**
 * Delete reel add user by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteReelAddUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a MongoDB ObjectId or Number ID
    let addUser;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      addUser = await Reel_Add_User.findByIdAndUpdate(
        id,
        { 
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    } else {
      // Number ID (Reel_Add_User_id)
      const addUserId = parseInt(id, 10);
      if (isNaN(addUserId)) {
        return sendNotFound(res, 'Invalid reel add user ID format');
      }
      addUser = await Reel_Add_User.findOneAndUpdate(
        { Reel_Add_User_id: addUserId },
        { 
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    if (!addUser) {
      return sendNotFound(res, 'Reel Add User not found');
    }

    console.info('Reel Add User deleted successfully', { addUserId: addUser._id });

    sendSuccess(res, addUser, 'Reel Add User deleted successfully');
  } catch (error) {
    console.error('Error deleting reel add user', { error: error.message, addUserId: req.params.id });
    throw error;
  }
});

/**
 * Get all reel add users by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReelAddUsersByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {
      user_id: req.userIdNumber
    };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [addUsers, total] = await Promise.all([
      Reel_Add_User.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Reel_Add_User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };

    console.info('Reel Add Users by authenticated user retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit),
      userId: req.userIdNumber
    });

    sendPaginated(res, addUsers, pagination, 'Reel Add Users retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel add users by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createReelAddUser,
  getAllReelAddUsers,
  getReelAddUserById,
  updateReelAddUser,
  deleteReelAddUser,
  getReelAddUsersByAuth
};

