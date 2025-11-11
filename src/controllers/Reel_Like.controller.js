const Reel_Like = require('../models/Reel_Like.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


const createReelLike = asyncHandler(async (req, res) => {
  try {
    const likeData = {
      ...req.body,
      Like_by: req.body.Like_by || req.userIdNumber,
      created_by: req.userIdNumber || null
    };
    const like = await Reel_Like.create(likeData);
    console.info('Reel Like created successfully', { likeId: like._id, Real_Post_Like_id: like.Real_Post_Like_id });
    sendSuccess(res, like, 'Reel Like created successfully', 201);
  } catch (error) {
    console.error('Error creating reel like', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllReelLikes = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [likes, total] = await Promise.all([
      Reel_Like.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reel_Like.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Reel Likes retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, likes, pagination, 'Reel Likes retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel likes', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getReelLikeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let like;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      like = await Reel_Like.findById(id);
    } else {
      const likeId = parseInt(id, 10);
      if (isNaN(likeId)) return sendNotFound(res, 'Invalid reel like ID format');
      like = await Reel_Like.findOne({ Real_Post_Like_id: likeId });
    }
    if (!like) return sendNotFound(res, 'Reel Like not found');
    console.info('Reel Like retrieved successfully', { likeId: like._id });
    sendSuccess(res, like, 'Reel Like retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel like', { error: error.message, likeId: req.params.id });
    throw error;
  }
});

const updateReelLike = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let like;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      like = await Reel_Like.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const likeId = parseInt(id, 10);
      if (isNaN(likeId)) return sendNotFound(res, 'Invalid reel like ID format');
      like = await Reel_Like.findOneAndUpdate({ Real_Post_Like_id: likeId }, updateData, { new: true, runValidators: true });
    }
    if (!like) return sendNotFound(res, 'Reel Like not found');
    console.info('Reel Like updated successfully', { likeId: like._id });
    sendSuccess(res, like, 'Reel Like updated successfully');
  } catch (error) {
    console.error('Error updating reel like', { error: error.message, likeId: req.params.id });
    throw error;
  }
});

const deleteReelLike = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let like;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      like = await Reel_Like.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const likeId = parseInt(id, 10);
      if (isNaN(likeId)) return sendNotFound(res, 'Invalid reel like ID format');
      like = await Reel_Like.findOneAndUpdate({ Real_Post_Like_id: likeId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!like) return sendNotFound(res, 'Reel Like not found');
    console.info('Reel Like deleted successfully', { likeId: like._id });
    sendSuccess(res, like, 'Reel Like deleted successfully');
  } catch (error) {
    console.error('Error deleting reel like', { error: error.message, likeId: req.params.id });
    throw error;
  }
});

const getReelLikesByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { Like_by: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [likes, total] = await Promise.all([
      Reel_Like.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reel_Like.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Reel Likes by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, likes, pagination, 'Reel Likes retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel likes by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getReelLikesByReelId = asyncHandler(async (req, res) => {
  try {
    const { reelId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const postId = parseInt(reelId, 10);
    if (isNaN(postId)) return sendNotFound(res, 'Invalid reel ID format');
    const filter = { Real_Post_id: postId };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [likes, total] = await Promise.all([
      Reel_Like.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reel_Like.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Reel Likes by Reel ID retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), reelId: postId });
    sendPaginated(res, likes, pagination, 'Reel Likes retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel likes by Reel ID', { error: error.message, reelId: req.params.reelId });
    throw error;
  }
});

module.exports = {
  createReelLike, getAllReelLikes, getReelLikeById, updateReelLike,
  deleteReelLike, getReelLikesByAuth, getReelLikesByReelId
};

