const ProfilePage = require('../models/ProfilePage.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

const createProfilePage = asyncHandler(async (req, res) => {
  try {
    const profilePageData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const profilePage = await ProfilePage.create(profilePageData);
    logger.info('Profile Page created successfully', { profilePageId: profilePage._id, ProfilePage_id: profilePage.ProfilePage_id });
    sendSuccess(res, profilePage, 'Profile Page created successfully', 201);
  } catch (error) {
    logger.error('Error creating profile page', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllProfilePages = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, PageType, user_id, Category_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { Name: { $regex: search, $options: 'i' } },
        { 'ProfileInfo.Title': { $regex: search, $options: 'i' } },
        { 'ProfileInfo.Description': { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    if (PageType) filter.PageType = PageType;
    if (user_id) filter.user_id = parseInt(user_id, 10);
    if (Category_id) filter.Category_id = parseInt(Category_id, 10);
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [profilePages, total] = await Promise.all([
      ProfilePage.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      ProfilePage.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Profile Pages retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, profilePages, pagination, 'Profile Pages retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving profile pages', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getProfilePageById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let profilePage;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      profilePage = await ProfilePage.findById(id);
    } else {
      const profilePageId = parseInt(id, 10);
      if (isNaN(profilePageId)) return sendNotFound(res, 'Invalid profile page ID format');
      profilePage = await ProfilePage.findOne({ ProfilePage_id: profilePageId });
    }
    if (!profilePage) return sendNotFound(res, 'Profile Page not found');
    logger.info('Profile Page retrieved successfully', { profilePageId: profilePage._id });
    sendSuccess(res, profilePage, 'Profile Page retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving profile page', { error: error.message, profilePageId: req.params.id });
    throw error;
  }
});

const updateProfilePage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let profilePage;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      profilePage = await ProfilePage.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const profilePageId = parseInt(id, 10);
      if (isNaN(profilePageId)) return sendNotFound(res, 'Invalid profile page ID format');
      profilePage = await ProfilePage.findOneAndUpdate({ ProfilePage_id: profilePageId }, updateData, { new: true, runValidators: true });
    }
    if (!profilePage) return sendNotFound(res, 'Profile Page not found');
    logger.info('Profile Page updated successfully', { profilePageId: profilePage._id });
    sendSuccess(res, profilePage, 'Profile Page updated successfully');
  } catch (error) {
    logger.error('Error updating profile page', { error: error.message, profilePageId: req.params.id });
    throw error;
  }
});

const deleteProfilePage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let profilePage;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      profilePage = await ProfilePage.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const profilePageId = parseInt(id, 10);
      if (isNaN(profilePageId)) return sendNotFound(res, 'Invalid profile page ID format');
      profilePage = await ProfilePage.findOneAndUpdate({ ProfilePage_id: profilePageId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!profilePage) return sendNotFound(res, 'Profile Page not found');
    logger.info('Profile Page deleted successfully', { profilePageId: profilePage._id });
    sendSuccess(res, profilePage, 'Profile Page deleted successfully');
  } catch (error) {
    logger.error('Error deleting profile page', { error: error.message, profilePageId: req.params.id });
    throw error;
  }
});

module.exports = {
  createProfilePage, getAllProfilePages, getProfilePageById, updateProfilePage, deleteProfilePage
};

