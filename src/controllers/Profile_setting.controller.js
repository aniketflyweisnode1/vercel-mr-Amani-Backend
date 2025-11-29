const ProfileSetting = require('../models/Profile_setting.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateProfileSettingData = async (profileSettings) => {
  const profileSettingsArray = Array.isArray(profileSettings) ? profileSettings : [profileSettings];
  const populatedProfileSettings = await Promise.all(
    profileSettingsArray.map(async (profileSetting) => {
      const profileSettingObj = profileSetting.toObject ? profileSetting.toObject() : profileSetting;
      
      // Populate User_id
      if (profileSettingObj.User_id) {
        const userId = typeof profileSettingObj.User_id === 'object' ? profileSettingObj.User_id : profileSettingObj.User_id;
        const user = await User.findOne({ user_id: userId });
        if (user) {
          profileSettingObj.User_id = user.toObject ? user.toObject() : user;
        }
      }
      
      // Populate created_by
      if (profileSettingObj.created_by) {
        const createdById = typeof profileSettingObj.created_by === 'object' ? profileSettingObj.created_by : profileSettingObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById });
        if (createdBy) {
          profileSettingObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (profileSettingObj.updated_by) {
        const updatedById = typeof profileSettingObj.updated_by === 'object' ? profileSettingObj.updated_by : profileSettingObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById });
        if (updatedBy) {
          profileSettingObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return profileSettingObj;
    })
  );
  
  return Array.isArray(profileSettings) ? populatedProfileSettings : populatedProfileSettings[0];
};

const ensureUserExists = async (userId) => {
  if (userId === undefined || userId === null) {
    return false;
  }
  const userIdNum = parseInt(userId, 10);
  if (Number.isNaN(userIdNum)) {
    return false;
  }
  const user = await User.findOne({ user_id: userIdNum, status: true });
  return Boolean(user);
};

const buildFilter = ({ status, User_id }) => {
  const filter = {};

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (User_id !== undefined) {
    const userId = parseInt(User_id, 10);
    if (!Number.isNaN(userId)) {
      filter.User_id = userId;
    }
  }

  return filter;
};

const paginateMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return ProfileSetting.findById(identifier);
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return ProfileSetting.findOne({ Profile_setting_id: numericId });
  }
  return null;
};

const createProfileSetting = asyncHandler(async (req, res) => {
  try {
    const { User_id, SmsAlerts, appTheme, TermsCondition, PrivacyPolicy, Notification } = req.body;
    
    if (!User_id) {
      return sendError(res, 'User ID is required', 400);
    }
    
    // Check if user exists
    if (!(await ensureUserExists(User_id))) {
      return sendError(res, 'User not found or inactive', 400);
    }
    
    // Check if profile setting already exists for this user
    const existingProfileSetting = await ProfileSetting.findOne({ User_id, Status: true });
    if (existingProfileSetting) {
      return sendError(res, 'Profile setting already exists for this user', 400);
    }
    
    // Validate appTheme if provided
    if (appTheme && !['Red & White', 'Blue & White'].includes(appTheme)) {
      return sendError(res, 'Invalid app theme. Must be "Red & White" or "Blue & White"', 400);
    }
    
    // Validate Notification array if provided
    if (Notification && Array.isArray(Notification)) {
      for (const notif of Notification) {
        if (!notif.Type || typeof notif.Status !== 'boolean') {
          return sendError(res, 'Invalid notification format. Each notification must have Type (string) and Status (boolean)', 400);
        }
      }
    }
    
    const payload = {
      User_id,
      SmsAlerts: SmsAlerts !== undefined ? SmsAlerts : false,
      appTheme: appTheme || 'Red & White',
      TermsCondition: TermsCondition !== undefined ? TermsCondition : false,
      PrivacyPolicy: PrivacyPolicy !== undefined ? PrivacyPolicy : false,
      Notification: Notification || [],
      Status: true,
      created_by: req.userIdNumber || null
    };
    
    const profileSetting = await ProfileSetting.create(payload);
    const populated = await populateProfileSettingData(profileSetting);
    sendSuccess(res, populated, 'Profile setting created successfully', 201);
  } catch (error) {
    console.error('Error creating profile setting', { error: error.message });
    throw error;
  }
});

const getAllProfileSettings = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      User_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const filter = buildFilter({ status, User_id });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [profileSettings, total] = await Promise.all([
      ProfileSetting.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ProfileSetting.countDocuments(filter)
    ]);
    
    const populatedProfileSettings = await populateProfileSettingData(profileSettings);
    sendPaginated(res, populatedProfileSettings, paginateMeta(numericPage, numericLimit, total), 'Profile settings retrieved successfully');
  } catch (error) {
    console.error('Error retrieving profile settings', { error: error.message });
    throw error;
  }
});

const getProfileSettingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const profileSettingQuery = findByIdentifier(id);
    if (!profileSettingQuery) {
      return sendError(res, 'Invalid profile setting identifier', 400);
    }
    const profileSetting = await profileSettingQuery;
    if (!profileSetting) {
      return sendNotFound(res, 'Profile setting not found');
    }
    const populated = await populateProfileSettingData(profileSetting);
    sendSuccess(res, populated, 'Profile setting retrieved successfully');
  } catch (error) {
    console.error('Error retrieving profile setting', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateProfileSetting = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { SmsAlerts, appTheme, TermsCondition, PrivacyPolicy, Notification } = req.body;
    
    // Validate appTheme if provided
    if (appTheme && !['Red & White', 'Blue & White'].includes(appTheme)) {
      return sendError(res, 'Invalid app theme. Must be "Red & White" or "Blue & White"', 400);
    }
    
    // Validate Notification array if provided
    if (Notification && Array.isArray(Notification)) {
      for (const notif of Notification) {
        if (!notif.Type || typeof notif.Status !== 'boolean') {
          return sendError(res, 'Invalid notification format. Each notification must have Type (string) and Status (boolean)', 400);
        }
      }
    }
    
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    
    let profileSetting;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      profileSetting = await ProfileSetting.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid profile setting ID format', 400);
      }
      profileSetting = await ProfileSetting.findOneAndUpdate({ Profile_setting_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    
    if (!profileSetting) {
      return sendNotFound(res, 'Profile setting not found');
    }
    
    const populated = await populateProfileSettingData(profileSetting);
    sendSuccess(res, populated, 'Profile setting updated successfully');
  } catch (error) {
    console.error('Error updating profile setting', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteProfileSetting = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    
    let profileSetting;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      profileSetting = await ProfileSetting.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid profile setting ID format', 400);
      }
      profileSetting = await ProfileSetting.findOneAndUpdate({ Profile_setting_id: numericId }, updatePayload, { new: true });
    }
    
    if (!profileSetting) {
      return sendNotFound(res, 'Profile setting not found');
    }
    
    sendSuccess(res, profileSetting, 'Profile setting deleted successfully');
  } catch (error) {
    console.error('Error deleting profile setting', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getProfileSettingByUserId = asyncHandler(async (req, res) => {
  try {
    const { User_id } = req.params;
    
    if (!User_id) {
      return sendError(res, 'User ID is required', 400);
    }
    
    const userId = parseInt(User_id, 10);
    if (Number.isNaN(userId)) {
      return sendError(res, 'Invalid User ID format', 400);
    }
    
    const profileSetting = await ProfileSetting.findOne({ 
      User_id: userId, 
      Status: true 
    });
    
    if (!profileSetting) {
      return sendNotFound(res, 'Profile setting not found for this user');
    }
    
    const populated = await populateProfileSettingData(profileSetting);
    sendSuccess(res, populated, 'Profile setting retrieved successfully');
  } catch (error) {
    console.error('Error retrieving profile setting by user ID', { error: error.message, User_id: req.params.User_id });
    throw error;
  }
});

const getProfileSettingByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    
    if (!userId) {
      return sendError(res, 'User ID is required', 400);
    }
    
    const profileSetting = await ProfileSetting.findOne({ 
      User_id: userId, 
      Status: true 
    });
    
    if (!profileSetting) {
      return sendNotFound(res, 'Profile setting not found for authenticated user');
    }
    
    const populated = await populateProfileSettingData(profileSetting);
    sendSuccess(res, populated, 'Profile setting retrieved successfully');
  } catch (error) {
    console.error('Error retrieving profile setting by auth', { error: error.message });
    throw error;
  }
});

module.exports = {
  createProfileSetting,
  getAllProfileSettings,
  getProfileSettingById,
  updateProfileSetting,
  deleteProfileSetting,
  getProfileSettingByUserId,
  getProfileSettingByAuth
};

