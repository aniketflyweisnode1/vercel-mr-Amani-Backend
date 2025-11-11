const Reel_share = require('../models/Reel_share.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

const createReelShare = asyncHandler(async (req, res) => {
  try {
    const shareData = {
      ...req.body,
      share_by: req.body.share_by || req.userIdNumber,
      created_by: req.userIdNumber || null
    };
    const share = await Reel_share.create(shareData);
    logger.info('Reel Share created successfully', { shareId: share._id, Real_Post_share_id: share.Real_Post_share_id });
    sendSuccess(res, share, 'Reel Share created successfully', 201);
  } catch (error) {
    logger.error('Error creating reel share', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllReelShares = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [shares, total] = await Promise.all([
      Reel_share.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reel_share.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Reel Shares retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, shares, pagination, 'Reel Shares retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving reel shares', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getReelShareById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let share;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      share = await Reel_share.findById(id);
    } else {
      const shareId = parseInt(id, 10);
      if (isNaN(shareId)) return sendNotFound(res, 'Invalid reel share ID format');
      share = await Reel_share.findOne({ Real_Post_share_id: shareId });
    }
    if (!share) return sendNotFound(res, 'Reel Share not found');
    logger.info('Reel Share retrieved successfully', { shareId: share._id });
    sendSuccess(res, share, 'Reel Share retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving reel share', { error: error.message, shareId: req.params.id });
    throw error;
  }
});

const updateReelShare = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let share;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      share = await Reel_share.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const shareId = parseInt(id, 10);
      if (isNaN(shareId)) return sendNotFound(res, 'Invalid reel share ID format');
      share = await Reel_share.findOneAndUpdate({ Real_Post_share_id: shareId }, updateData, { new: true, runValidators: true });
    }
    if (!share) return sendNotFound(res, 'Reel Share not found');
    logger.info('Reel Share updated successfully', { shareId: share._id });
    sendSuccess(res, share, 'Reel Share updated successfully');
  } catch (error) {
    logger.error('Error updating reel share', { error: error.message, shareId: req.params.id });
    throw error;
  }
});

const deleteReelShare = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let share;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      share = await Reel_share.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const shareId = parseInt(id, 10);
      if (isNaN(shareId)) return sendNotFound(res, 'Invalid reel share ID format');
      share = await Reel_share.findOneAndUpdate({ Real_Post_share_id: shareId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!share) return sendNotFound(res, 'Reel Share not found');
    logger.info('Reel Share deleted successfully', { shareId: share._id });
    sendSuccess(res, share, 'Reel Share deleted successfully');
  } catch (error) {
    logger.error('Error deleting reel share', { error: error.message, shareId: req.params.id });
    throw error;
  }
});

const getReelSharesByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { share_by: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [shares, total] = await Promise.all([
      Reel_share.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reel_share.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Reel Shares by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, shares, pagination, 'Reel Shares retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving reel shares by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getReelSharesByReelId = asyncHandler(async (req, res) => {
  try {
    const { reelId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const postId = parseInt(reelId, 10);
    if (isNaN(postId)) return sendNotFound(res, 'Invalid reel ID format');
    const filter = { Real_Post_id: postId };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [shares, total] = await Promise.all([
      Reel_share.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reel_share.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Reel Shares by Reel ID retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), reelId: postId });
    sendPaginated(res, shares, pagination, 'Reel Shares retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving reel shares by Reel ID', { error: error.message, reelId: req.params.reelId });
    throw error;
  }
});

module.exports = {
  createReelShare, getAllReelShares, getReelShareById, updateReelShare,
  deleteReelShare, getReelSharesByAuth, getReelSharesByReelId
};

