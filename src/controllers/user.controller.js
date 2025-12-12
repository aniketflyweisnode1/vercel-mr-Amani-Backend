const User = require('../models/User.model');
const User_Address = require('../models/User_Address.model');
const City = require('../models/city.model');
const State = require('../models/state.model');
const Country = require('../models/country.model');
const Role = require('../models/role.model');
const Language = require('../models/Language.model');
const Wallet = require('../models/Wallet.model');
const Business_Details = require('../models/Business_Details.model');
const BusinessType = require('../models/businessType.model');
const Subscription = require('../models/subscription.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated, sendUnauthorized } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to populate user location fields
const populateUserLocation = async (userObj) => {
  if (!userObj) return userObj;
  
  const user = userObj.toObject ? userObj.toObject() : userObj;
  
  // Populate country_id
  if (user.country_id) {
    const countryId = typeof user.country_id === 'object' ? user.country_id : user.country_id;
    const country = await Country.findOne({ country_id: countryId });
    if (country) {
      user.country_id = country.toObject ? country.toObject() : country;
    }
  }
  
  // Populate state_id
  if (user.state_id) {
    const stateId = typeof user.state_id === 'object' ? user.state_id : user.state_id;
    const state = await State.findOne({ state_id: stateId });
    if (state) {
      user.state_id = state.toObject ? state.toObject() : state;
    }
  }
  
  // Populate city_id
  if (user.city_id) {
    const cityId = typeof user.city_id === 'object' ? user.city_id : user.city_id;
    const city = await City.findOne({ city_id: cityId });
    if (city) {
      user.city_id = city.toObject ? city.toObject() : city;
    }
  }
  
  return user;
};

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
      created_by: req.userIdNumber || null
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
        created_by: req.userIdNumber || null
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
        { BusinessName: { $regex: search, $options: 'i' } },
        { BusinessRegistrationNo: { $regex: search, $options: 'i' } },
        { phoneNo: { $regex: search, $options: 'i' } },
        { Email: { $regex: search, $options: 'i' } },
        { Bio: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { personType: { $regex: search, $options: 'i' } },
        { RegistrationType: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Add RegistrationType filter
    if (req.query.RegistrationType) {
      filter.RegistrationType = req.query.RegistrationType;
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

    // Populate location fields
    const populatedUser = await populateUserLocation(user);

    console.info('User retrieved successfully', { userId: user._id });

    sendSuccess(res, populatedUser, 'User retrieved successfully');
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
console.log("---------------------------\n",req.body, req.userIdNumber);
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
      .select('-password');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Populate location fields manually
    const populatedUser = await populateUserLocation(user);

    sendSuccess(res, populatedUser, 'Profile retrieved successfully');
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
    );

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Populate location fields manually
    const populatedUser = await populateUserLocation(user);

    console.info('Profile updated successfully', { userId: user._id });

    sendSuccess(res, populatedUser, 'Profile updated successfully');
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

/**
 * Manual population function for Wallet Number refs
 */
const populateWalletData = async (wallet) => {
  if (!wallet) return null;
  
  const walletObj = wallet.toObject ? wallet.toObject() : wallet;
  
  // Populate created_by
  if (walletObj.created_by) {
    const createdById = typeof walletObj.created_by === 'object' ? walletObj.created_by : walletObj.created_by;
    const createdBy = await User.findOne({ user_id: createdById })
      .select('user_id firstName lastName phoneNo BusinessName Email');
    if (createdBy) {
      walletObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
    }
  }
  
  // Populate updated_by
  if (walletObj.updated_by) {
    const updatedById = typeof walletObj.updated_by === 'object' ? walletObj.updated_by : walletObj.updated_by;
    const updatedBy = await User.findOne({ user_id: updatedById })
      .select('user_id firstName lastName phoneNo BusinessName Email');
    if (updatedBy) {
      walletObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
    }
  }
  
  return walletObj;
};

/**
 * Manual population function for Business Details Number refs
 */
const populateBusinessDetailsData = async (businessDetails) => {
  if (!businessDetails) return null;
  
  const businessObj = businessDetails.toObject ? businessDetails.toObject() : businessDetails;
  
  // Populate BusinessType_id
  if (businessObj.BusinessType_id) {
    const businessType = await BusinessType.findOne({ businessType_id: businessObj.BusinessType_id });
    if (businessType) {
      businessObj.BusinessType_id = businessType.toObject ? businessType.toObject() : businessType;
    }
  }
  
  // Populate subscription_Id
  if (businessObj.subscription_Id) {
    const subscription = await Subscription.findOne({ subscription_id: businessObj.subscription_Id });
    if (subscription) {
      const subscriptionObj = subscription.toObject ? subscription.toObject() : subscription;
      // Also populate Plan_id in subscription if it exists
      if (subscriptionObj.Plan_id) {
        const Plan = require('../models/Plan.model');
        const plan = await Plan.findOne({ Plan_id: subscriptionObj.Plan_id });
        if (plan) {
          subscriptionObj.Plan_id = plan.toObject ? plan.toObject() : plan;
        }
      }
      // Populate transaction_id in subscription if it exists
      if (subscriptionObj.transaction_id) {
        const Transaction = require('../models/transaction.model');
        const transaction = await Transaction.findOne({ transaction_id: subscriptionObj.transaction_id });
        if (transaction) {
          subscriptionObj.transaction_id = transaction.toObject ? transaction.toObject() : transaction;
        }
      }
      // Populate created_by and updated_by in subscription
      if (subscriptionObj.created_by) {
        const createdById = typeof subscriptionObj.created_by === 'object' ? subscriptionObj.created_by : subscriptionObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (createdBy) {
          subscriptionObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      if (subscriptionObj.updated_by) {
        const updatedById = typeof subscriptionObj.updated_by === 'object' ? subscriptionObj.updated_by : subscriptionObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (updatedBy) {
          subscriptionObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      businessObj.subscription_Id = subscriptionObj;
    }
  }
  
  // Populate created_by
  if (businessObj.created_by) {
    const createdById = typeof businessObj.created_by === 'object' ? businessObj.created_by : businessObj.created_by;
    const createdBy = await User.findOne({ user_id: createdById })
      .select('user_id firstName lastName phoneNo BusinessName Email');
    if (createdBy) {
      businessObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
    }
  }
  
  // Populate updated_by
  if (businessObj.updated_by) {
    const updatedById = typeof businessObj.updated_by === 'object' ? businessObj.updated_by : businessObj.updated_by;
    const updatedBy = await User.findOne({ user_id: updatedById })
      .select('user_id firstName lastName phoneNo BusinessName Email');
    if (updatedBy) {
      businessObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
    }
  }
  
  return businessObj;
};

/**
 * Manual population function for User Address Number refs
 */
const populateUserAddressData = async (addresses) => {
  const addressesArray = Array.isArray(addresses) ? addresses : [addresses];
  const populatedAddresses = await Promise.all(
    addressesArray.map(async (address) => {
      const addressObj = address.toObject ? address.toObject() : address;
      
      // Populate City
      if (addressObj.City) {
        const city = await City.findOne({ city_id: addressObj.City });
        if (city) {
          addressObj.City = city.toObject ? city.toObject() : city;
        }
      }
      
      // Populate State
      if (addressObj.State) {
        const state = await State.findOne({ state_id: addressObj.State });
        if (state) {
          addressObj.State = state.toObject ? state.toObject() : state;
        }
      }
      
      // Populate Country
      if (addressObj.Country) {
        const country = await Country.findOne({ country_id: addressObj.Country });
        if (country) {
          addressObj.Country = country.toObject ? country.toObject() : country;
        }
      }
      
      // Populate created_by
      if (addressObj.created_by) {
        const createdById = typeof addressObj.created_by === 'object' ? addressObj.created_by : addressObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById });
        if (createdBy) {
          addressObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (addressObj.updated_by) {
        const updatedById = typeof addressObj.updated_by === 'object' ? addressObj.updated_by : addressObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById });
        if (updatedBy) {
          addressObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return addressObj;
    })
  );
  
  return Array.isArray(addresses) ? populatedAddresses : populatedAddresses[0];
};

/**
 * Get authenticated user profile with full details, multiple addresses, and all ID populates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getbyAuthProfile = asyncHandler(async (req, res) => {
  try {
    if (!req.userIdNumber) {
      return sendUnauthorized(res, 'Authentication required');
    }

    // Get user
    const user = await User.findOne({ user_id: req.userIdNumber })
      .select('-password');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Convert user to object for manipulation
    const userProfile = user.toObject ? user.toObject() : user;

    // Manually populate role_id
    if (userProfile.role_id) {
      const role = await Role.findOne({ role_id: userProfile.role_id });
      if (role) {
        userProfile.role_id = role.toObject ? role.toObject() : role;
      }
    }

    // Manually populate language_id
    if (userProfile.language_id) {
      const language = await Language.findOne({ Language_id: userProfile.language_id });
      if (language) {
        userProfile.language_id = language.toObject ? language.toObject() : language;
      }
    }

    // Manually populate country_id
    if (userProfile.country_id) {
      const country = await Country.findOne({ country_id: userProfile.country_id });
      if (country) {
        userProfile.country_id = country.toObject ? country.toObject() : country;
      }
    }

    // Manually populate state_id
    if (userProfile.state_id) {
      const state = await State.findOne({ state_id: userProfile.state_id });
      if (state) {
        userProfile.state_id = state.toObject ? state.toObject() : state;
      }
    }

    // Manually populate city_id
    if (userProfile.city_id) {
      const city = await City.findOne({ city_id: userProfile.city_id });
      if (city) {
        userProfile.city_id = city.toObject ? city.toObject() : city;
      }
    }

    // Manually populate created_by
    if (userProfile.created_by) {
      const createdById = typeof userProfile.created_by === 'object' ? userProfile.created_by : userProfile.created_by;
      const createdBy = await User.findOne({ user_id: createdById })
        .select('user_id firstName lastName phoneNo BusinessName Email');
      if (createdBy) {
        userProfile.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
      }
    }

    // Manually populate updated_by
    if (userProfile.updated_by) {
      const updatedById = typeof userProfile.updated_by === 'object' ? userProfile.updated_by : userProfile.updated_by;
      const updatedBy = await User.findOne({ user_id: updatedById })
        .select('user_id firstName lastName phoneNo BusinessName Email');
      if (updatedBy) {
        userProfile.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
      }
    }

    // Get all addresses for the user
    const addresses = await User_Address.find({ 
      user_id: req.userIdNumber,
      Status: true 
    })
      .sort({ setDefult: -1, created_at: -1 }); // Default address first, then by creation date

    // Populate addresses with all references
    const populatedAddresses = await populateUserAddressData(addresses);
    userProfile.addresses = Array.isArray(populatedAddresses) ? populatedAddresses : [populatedAddresses];

    // Get and populate Wallet
    const wallet = await Wallet.findOne({ user_id: req.userIdNumber, Status: true });
    if (wallet) {
      userProfile.wallet = await populateWalletData(wallet);
    }

    // Get and populate Business_Details
    const businessDetails = await Business_Details.findOne({ user_id: req.userIdNumber, Status: true });
    if (businessDetails) {
      userProfile.businessDetails = await populateBusinessDetailsData(businessDetails);
    }

    console.info('User profile retrieved successfully', { 
      userId: user._id, 
      user_id: user.user_id, 
      addressCount: userProfile.addresses.length,
      hasWallet: !!userProfile.wallet,
      hasBusinessDetails: !!userProfile.businessDetails
    });

    sendSuccess(res, userProfile, 'User profile retrieved successfully');
  } catch (error) {
    console.error('Error retrieving user profile', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

/**
 * Update Language for authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateLanguage = asyncHandler(async (req, res) => {
  try {
    const { language_id } = req.body;

    if (!req.userIdNumber) {
      return sendUnauthorized(res, 'Authentication required');
    }

    if (language_id === undefined || language_id === null) {
      return sendError(res, 'Language ID is required', 400);
    }

    // Verify language exists if provided
    if (language_id !== null) {
      const languageId = parseInt(language_id, 10);
      if (Number.isNaN(languageId)) {
        return sendError(res, 'Invalid language ID format', 400);
      }

      const language = await Language.findOne({ Language_id: languageId, Status: true });
      if (!language) {
        return sendError(res, 'Language not found or inactive', 404);
      }
    }

    // Update user language
    const user = await User.findOneAndUpdate(
      { user_id: req.userIdNumber },
      {
        language_id: language_id !== null ? parseInt(language_id, 10) : null,
        updated_by: req.userIdNumber,
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

    // Populate language_id and location fields
    let userObj = user.toObject ? user.toObject() : user;
    if (userObj.language_id) {
      const language = await Language.findOne({ Language_id: userObj.language_id })
        .select('Language_id name Status');
      if (language) {
        userObj.language_id = language.toObject ? language.toObject() : language;
      }
    }

    // Populate location fields
    userObj = await populateUserLocation(userObj);

    console.info('User language updated successfully', { userId: user._id, user_id: user.user_id, language_id });

    sendSuccess(res, userObj, 'Language updated successfully');
  } catch (error) {
    console.error('Error updating language', { error: error.message, userId: req.userIdNumber, stack: error.stack });
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
  activeDeviceLocation,
  getbyAuthProfile,
  updateLanguage
};
