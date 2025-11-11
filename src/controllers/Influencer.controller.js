const Influencer = require('../models/Influencer.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

const createInfluencer = asyncHandler(async (req, res) => {
  try {
    const influencerData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const existingInfluencer = await Influencer.findOne({ User_id: influencerData.User_id });
    if (existingInfluencer) {
      return sendError(res, 'Influencer profile already exists for this user', 400);
    }

    const influencer = await Influencer.create(influencerData);
    logger.info('Influencer created successfully', { influencerId: influencer._id, Influencer_id: influencer.Influencer_id });
    sendSuccess(res, influencer, 'Influencer created successfully', 201);
  } catch (error) {
    logger.error('Error creating influencer', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllInfluencers = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, user_id, bank_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { IdVerfication_type: { $regex: search, $options: 'i' } },
        { TaxInformationType: { $regex: search, $options: 'i' } },
        { emozi: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    if (user_id) filter.User_id = parseInt(user_id, 10);
    if (bank_id) filter.Bank_id = parseInt(bank_id, 10);

    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const [influencers, total] = await Promise.all([
      Influencer.find(filter).sort(sort).skip(skip).limit(parseInt(limit, 10)),
      Influencer.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: parseInt(page, 10) < totalPages,
      hasPrevPage: parseInt(page, 10) > 1
    };

    logger.info('Influencers retrieved successfully', { total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
    sendPaginated(res, influencers, pagination, 'Influencers retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving influencers', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getInfluencerById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let influencer;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      influencer = await Influencer.findById(id);
    } else {
      const influencerId = parseInt(id, 10);
      if (isNaN(influencerId)) return sendNotFound(res, 'Invalid influencer ID format');
      influencer = await Influencer.findOne({ Influencer_id: influencerId });
    }

    if (!influencer) return sendNotFound(res, 'Influencer not found');

    logger.info('Influencer retrieved successfully', { influencerId: influencer._id });
    sendSuccess(res, influencer, 'Influencer retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving influencer', { error: error.message, influencerId: req.params.id });
    throw error;
  }
});

const updateInfluencer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let influencer;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      influencer = await Influencer.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const influencerId = parseInt(id, 10);
      if (isNaN(influencerId)) return sendNotFound(res, 'Invalid influencer ID format');
      influencer = await Influencer.findOneAndUpdate({ Influencer_id: influencerId }, updateData, { new: true, runValidators: true });
    }

    if (!influencer) return sendNotFound(res, 'Influencer not found');

    logger.info('Influencer updated successfully', { influencerId: influencer._id });
    sendSuccess(res, influencer, 'Influencer updated successfully');
  } catch (error) {
    logger.error('Error updating influencer', { error: error.message, influencerId: req.params.id });
    throw error;
  }
});

const deleteInfluencer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let influencer;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      influencer = await Influencer.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const influencerId = parseInt(id, 10);
      if (isNaN(influencerId)) return sendNotFound(res, 'Invalid influencer ID format');
      influencer = await Influencer.findOneAndUpdate({ Influencer_id: influencerId }, updateData, { new: true });
    }

    if (!influencer) return sendNotFound(res, 'Influencer not found');

    logger.info('Influencer deleted successfully', { influencerId: influencer._id });
    sendSuccess(res, influencer, 'Influencer deleted successfully');
  } catch (error) {
    logger.error('Error deleting influencer', { error: error.message, influencerId: req.params.id });
    throw error;
  }
});

const getInfluencersByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const influencers = await Influencer.find({ User_id: userId });
    if (!influencers.length) {
      return sendNotFound(res, 'No influencer profiles found for the authenticated user');
    }

    logger.info('Influencers retrieved by auth user successfully', { userId, count: influencers.length });
    sendSuccess(res, influencers, 'Influencers retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving influencer by auth user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createInfluencer,
  getAllInfluencers,
  getInfluencerById,
  updateInfluencer,
  deleteInfluencer,
  getInfluencersByAuth
};
