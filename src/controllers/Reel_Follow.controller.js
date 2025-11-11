const Reel_Follow = require('../models/Reel_Follow.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

const createReelFollow = asyncHandler(async (req, res) => {
  try {
    const followData = {
      ...req.body,
      Follow_by: req.body.Follow_by || req.userIdNumber,
      created_by: req.userIdNumber || null
    };
    const follow = await Reel_Follow.create(followData);
    logger.info('Reel Follow created successfully', { followId: follow._id, Real_Post_Follow_id: follow.Real_Post_Follow_id });
    sendSuccess(res, follow, 'Reel Follow created successfully', 201);
  } catch (error) {
    logger.error('Error creating reel follow', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllReelFollows = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [follows, total] = await Promise.all([
      Reel_Follow.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reel_Follow.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Reel Follows retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, follows, pagination, 'Reel Follows retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving reel follows', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getReelFollowById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let follow;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      follow = await Reel_Follow.findById(id);
    } else {
      const followId = parseInt(id, 10);
      if (isNaN(followId)) return sendNotFound(res, 'Invalid reel follow ID format');
      follow = await Reel_Follow.findOne({ Real_Post_Follow_id: followId });
    }
    if (!follow) return sendNotFound(res, 'Reel Follow not found');
    logger.info('Reel Follow retrieved successfully', { followId: follow._id });
    sendSuccess(res, follow, 'Reel Follow retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving reel follow', { error: error.message, followId: req.params.id });
    throw error;
  }
});

const updateReelFollow = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let follow;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      follow = await Reel_Follow.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const followId = parseInt(id, 10);
      if (isNaN(followId)) return sendNotFound(res, 'Invalid reel follow ID format');
      follow = await Reel_Follow.findOneAndUpdate({ Real_Post_Follow_id: followId }, updateData, { new: true, runValidators: true });
    }
    if (!follow) return sendNotFound(res, 'Reel Follow not found');
    logger.info('Reel Follow updated successfully', { followId: follow._id });
    sendSuccess(res, follow, 'Reel Follow updated successfully');
  } catch (error) {
    logger.error('Error updating reel follow', { error: error.message, followId: req.params.id });
    throw error;
  }
});

const deleteReelFollow = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let follow;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      follow = await Reel_Follow.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const followId = parseInt(id, 10);
      if (isNaN(followId)) return sendNotFound(res, 'Invalid reel follow ID format');
      follow = await Reel_Follow.findOneAndUpdate({ Real_Post_Follow_id: followId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!follow) return sendNotFound(res, 'Reel Follow not found');
    logger.info('Reel Follow deleted successfully', { followId: follow._id });
    sendSuccess(res, follow, 'Reel Follow deleted successfully');
  } catch (error) {
    logger.error('Error deleting reel follow', { error: error.message, followId: req.params.id });
    throw error;
  }
});

const getReelFollowsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { Follow_by: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [follows, total] = await Promise.all([
      Reel_Follow.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reel_Follow.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Reel Follows by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, follows, pagination, 'Reel Follows retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving reel follows by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getReelFollowsByReelId = asyncHandler(async (req, res) => {
  try {
    const { reelId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const postId = parseInt(reelId, 10);
    if (isNaN(postId)) return sendNotFound(res, 'Invalid reel ID format');
    const filter = { Real_Post_id: postId };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [follows, total] = await Promise.all([
      Reel_Follow.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reel_Follow.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Reel Follows by Reel ID retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), reelId: postId });
    sendPaginated(res, follows, pagination, 'Reel Follows retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving reel follows by Reel ID', { error: error.message, reelId: req.params.reelId });
    throw error;
  }
});

module.exports = {
  createReelFollow, getAllReelFollows, getReelFollowById, updateReelFollow,
  deleteReelFollow, getReelFollowsByAuth, getReelFollowsByReelId
};

