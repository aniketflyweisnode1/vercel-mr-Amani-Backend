const Help_Feedback = require('../models/Help_Feedback.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


const createHelpFeedback = asyncHandler(async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const feedback = await Help_Feedback.create(feedbackData);
    console.info('Help Feedback created successfully', { feedbackId: feedback._id, Help_Feedback_id: feedback.Help_Feedback_id });
    sendSuccess(res, feedback, 'Help Feedback created successfully', 201);
  } catch (error) {
    console.error('Error creating help feedback', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllHelpFeedbacks = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { Description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [feedbacks, total] = await Promise.all([
      Help_Feedback.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Help_Feedback.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Help Feedbacks retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, feedbacks, pagination, 'Help Feedbacks retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help feedbacks', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getHelpFeedbackById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let feedback;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      feedback = await Help_Feedback.findById(id);
    } else {
      const feedbackId = parseInt(id, 10);
      if (isNaN(feedbackId)) return sendNotFound(res, 'Invalid help feedback ID format');
      feedback = await Help_Feedback.findOne({ Help_Feedback_id: feedbackId });
    }
    if (!feedback) return sendNotFound(res, 'Help Feedback not found');
    console.info('Help Feedback retrieved successfully', { feedbackId: feedback._id });
    sendSuccess(res, feedback, 'Help Feedback retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help feedback', { error: error.message, feedbackId: req.params.id });
    throw error;
  }
});

const updateHelpFeedback = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let feedback;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      feedback = await Help_Feedback.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const feedbackId = parseInt(id, 10);
      if (isNaN(feedbackId)) return sendNotFound(res, 'Invalid help feedback ID format');
      feedback = await Help_Feedback.findOneAndUpdate({ Help_Feedback_id: feedbackId }, updateData, { new: true, runValidators: true });
    }
    if (!feedback) return sendNotFound(res, 'Help Feedback not found');
    console.info('Help Feedback updated successfully', { feedbackId: feedback._id });
    sendSuccess(res, feedback, 'Help Feedback updated successfully');
  } catch (error) {
    console.error('Error updating help feedback', { error: error.message, feedbackId: req.params.id });
    throw error;
  }
});

const deleteHelpFeedback = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let feedback;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      feedback = await Help_Feedback.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const feedbackId = parseInt(id, 10);
      if (isNaN(feedbackId)) return sendNotFound(res, 'Invalid help feedback ID format');
      feedback = await Help_Feedback.findOneAndUpdate({ Help_Feedback_id: feedbackId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!feedback) return sendNotFound(res, 'Help Feedback not found');
    console.info('Help Feedback deleted successfully', { feedbackId: feedback._id });
    sendSuccess(res, feedback, 'Help Feedback deleted successfully');
  } catch (error) {
    console.error('Error deleting help feedback', { error: error.message, feedbackId: req.params.id });
    throw error;
  }
});

const getHelpFeedbacksByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { created_by: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [feedbacks, total] = await Promise.all([
      Help_Feedback.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Help_Feedback.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Help Feedbacks by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, feedbacks, pagination, 'Help Feedbacks retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help feedbacks by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createHelpFeedback, getAllHelpFeedbacks, getHelpFeedbackById, updateHelpFeedback,
  deleteHelpFeedback, getHelpFeedbacksByAuth
};

