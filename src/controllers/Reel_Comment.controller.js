const Reel_Comment = require('../models/Reel_Comment.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


const createReelComment = asyncHandler(async (req, res) => {
  try {
    const commentData = {
      ...req.body,
      Comment_by: req.body.Comment_by || req.userIdNumber,
      created_by: req.userIdNumber || null
    };
    const comment = await Reel_Comment.create(commentData);
    console.info('Reel Comment created successfully', { commentId: comment._id, Real_Post_Comment_id: comment.Real_Post_Comment_id });
    sendSuccess(res, comment, 'Reel Comment created successfully', 201);
  } catch (error) {
    console.error('Error creating reel comment', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllReelComments = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      Reel_Comment.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reel_Comment.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Reel Comments retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, comments, pagination, 'Reel Comments retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel comments', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getReelCommentById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let comment;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      comment = await Reel_Comment.findById(id);
    } else {
      const commentId = parseInt(id, 10);
      if (isNaN(commentId)) return sendNotFound(res, 'Invalid reel comment ID format');
      comment = await Reel_Comment.findOne({ Real_Post_Comment_id: commentId });
    }
    if (!comment) return sendNotFound(res, 'Reel Comment not found');
    console.info('Reel Comment retrieved successfully', { commentId: comment._id });
    sendSuccess(res, comment, 'Reel Comment retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel comment', { error: error.message, commentId: req.params.id });
    throw error;
  }
});

const updateReelComment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let comment;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      comment = await Reel_Comment.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const commentId = parseInt(id, 10);
      if (isNaN(commentId)) return sendNotFound(res, 'Invalid reel comment ID format');
      comment = await Reel_Comment.findOneAndUpdate({ Real_Post_Comment_id: commentId }, updateData, { new: true, runValidators: true });
    }
    if (!comment) return sendNotFound(res, 'Reel Comment not found');
    console.info('Reel Comment updated successfully', { commentId: comment._id });
    sendSuccess(res, comment, 'Reel Comment updated successfully');
  } catch (error) {
    console.error('Error updating reel comment', { error: error.message, commentId: req.params.id });
    throw error;
  }
});

const deleteReelComment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let comment;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      comment = await Reel_Comment.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const commentId = parseInt(id, 10);
      if (isNaN(commentId)) return sendNotFound(res, 'Invalid reel comment ID format');
      comment = await Reel_Comment.findOneAndUpdate({ Real_Post_Comment_id: commentId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!comment) return sendNotFound(res, 'Reel Comment not found');
    console.info('Reel Comment deleted successfully', { commentId: comment._id });
    sendSuccess(res, comment, 'Reel Comment deleted successfully');
  } catch (error) {
    console.error('Error deleting reel comment', { error: error.message, commentId: req.params.id });
    throw error;
  }
});

const getReelCommentsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { Comment_by: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      Reel_Comment.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reel_Comment.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Reel Comments by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, comments, pagination, 'Reel Comments retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel comments by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getReelCommentsByReelId = asyncHandler(async (req, res) => {
  try {
    const { reelId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const postId = parseInt(reelId, 10);
    if (isNaN(postId)) return sendNotFound(res, 'Invalid reel ID format');
    const filter = { Real_Post_id: postId };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      Reel_Comment.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reel_Comment.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Reel Comments by Reel ID retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), reelId: postId });
    sendPaginated(res, comments, pagination, 'Reel Comments retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel comments by Reel ID', { error: error.message, reelId: req.params.reelId });
    throw error;
  }
});

module.exports = {
  createReelComment, getAllReelComments, getReelCommentById, updateReelComment,
  deleteReelComment, getReelCommentsByAuth, getReelCommentsByReelId
};

