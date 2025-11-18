const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createUser = asyncHandler(async (req, res) => {
  try {
    // Create user data
    const userData = {
      ...req.body,
      password: req.body.password || req.body.phoneNo.toString(),
      created_by: req.userId || null,
      created_by_object: req.userId || null
    };

    // Create user
    const user = await User.create(userData);

    // Auto-create wallet for new user with 0 amount
    const Wallet = require('../models/Wallet.model');
    try {
      await Wallet.create({
        user_id: user.user_id,
        Amount: 0,
        HoldAmount: 0,
        Status: true,
        created_by: req.userIdNumber || null,
        created_by_object: req.userId || null
      });
      console.info('Wallet auto-created for new user', { userId: user._id, user_id: user.user_id });
    } catch (walletError) {
      console.error('Error auto-creating wallet for user', { error: walletError.message, userId: user._id });
      // Don't fail user creation if wallet creation fails
    }
    
    console.info('User created successfully', { userId: user._id, user_id: user.user_id });

    sendSuccess(res, user, 'User created successfully', 201);
  } catch (error) {
    
    console.error('Error creating user', { error: error.message, stack: error.stack });

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'phoneNo';
      const friendlyField = field === 'phoneNo' ? 'Phone number' : field;
      return sendError(res, `${friendlyField} already exists`, 400);
    }

    throw error;
  }
});

/**
 * Get all users with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_on',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phoneNo: { $regex: search, $options: 'i' } },
        { Email: { $regex: search, $options: 'i' } },
        { Bio: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { personType: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;
    // Execute query
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('country_id', 'name')
        .populate('state_id', 'name')
        .populate('city_id', 'name')
        .populate('created_by', 'name email')
        .populate('updated_by', 'name email'),
      User.countDocuments(filter)
    ]);

    // Calculate pagination info
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

    console.info('Users retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, users, pagination, 'Users retrieved successfully');
  } catch (error) {
    console.error('Error retrieving users', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a MongoDB ObjectId or Number ID
    let user;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      user = await User.findById(id).select('-password');
    } else {
      // Number ID (user_id)
      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        return sendNotFound(res, 'Invalid user ID format');
      }
      user = await User.findOne({ user_id: userId }).select('-password');
    }

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    console.info('User retrieved successfully', { userId: user._id });

    sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    console.error('Error retrieving user', { error: error.message, userId: req.params.id });
    throw error;
  }
});

/**
 * Update user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Check if id is a MongoDB ObjectId or Number ID
    let user;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      user = await User.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true, 
          runValidators: true,
          select: '-password'
        }
      );
    } else {
      // Number ID (user_id)
      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        return sendNotFound(res, 'Invalid user ID format');
      }
      console.log("------------------pankaj ---------\n",userId);
      user = await User.findOneAndUpdate(
        { user_id: userId },
        updateData,
        { 
          new: true, 
          runValidators: true,
          select: '-password'
        }
      );
    }

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    console.info('User updated successfully', { userId: user._id });

    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    console.error('Error updating user', { error: error.message, userId: req.params.id });
    throw error;
  }
});

/**
 * Delete user by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { 
        status: false,
        updated_by: req.userIdNumber || null,
        updated_at: new Date()
      },
      { new: true, select: '-password' }
    );

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    console.info('User deleted successfully', { userId: user._id });

    sendSuccess(res, user, 'User deleted successfully');
  } catch (error) {
    console.error('Error deleting user', { error: error.message, userId: req.params.id });
    throw error;
  }
});


/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('country_id', 'name')
      .populate('state_id', 'name')
      .populate('city_id', 'name')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Error retrieving profile', { error: error.message, userId: req.userId });
    throw error;
  }
});

/**
 * Update current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = asyncHandler(async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Remove password from update data if present (use separate endpoint for password change)
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      req.userIdNumber,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-password'
      }
    )
    .populate('country_id', 'name')
    .populate('state_id', 'name')
    .populate('city_id', 'name')
    .populate('created_by', 'name email')
    .populate('updated_by', 'name email');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    console.info('Profile updated successfully', { userId: user._id });

    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile', { error: error.message, userId: req.userId });
    throw error;
  }
});

/**
 * Update user by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    const user = await User.findByIdAndUpdate(
      id,
      finalUpdateData,
      { 
        new: true, 
        runValidators: true,
        select: '-password'
      }
    )
    .populate('country_id', 'name')
    .populate('state_id', 'name')
    .populate('city_id', 'name')
    .populate('created_by', 'name email')
    .populate('updated_by', 'name email');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    console.info('User updated successfully by ID in body', { userId: user._id, updatedBy: req.userIdNumber });

    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    console.error('Error updating user by ID in body', { error: error.message, userId: req.body.id });
    throw error;
  }
});

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user with password
    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    user.updated_by = req.userIdNumber || null;
    user.updated_at = new Date();
    await user.save();

    console.info('Password changed successfully', { userId: user._id });

    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('Error changing password', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

/**
 * Activate device location permission for user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const activeDeviceLocation = asyncHandler(async (req, res) => {
  try {
    // Find current user and update Permissions_DeviceLocation to true
    const user = await User.findOneAndUpdate(
      { user_id: req.userIdNumber },
      { 
        Permissions_DeviceLocation: true,
        updated_by: req.userIdNumber || null,
        updated_at: new Date()
      },
      { 
        new: true, 
        runValidators: true,
        select: '-password'
      }
    );

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    console.info('Device location permission activated', { userId: user._id, user_id: user.user_id });

    sendSuccess(res, user, 'Device location permission activated successfully');
  } catch (error) {
    console.error('Error activating device location permission', { error: error.message, userId: req.userId });
    throw error;
  }
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserByIdBody,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword,
  activeDeviceLocation
};
