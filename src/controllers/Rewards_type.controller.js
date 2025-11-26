const RewardsType = require('../models/Rewards_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const buildFilterFromQuery = ({ search, status }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  return filter;
};

const createRewardsType = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const rewardsType = await RewardsType.create(payload);
    console.info('Rewards type created successfully', { id: rewardsType._id, Rewards_type_id: rewardsType.Rewards_type_id });

    sendSuccess(res, rewardsType, 'Rewards type created successfully', 201);
  } catch (error) {
    console.error('Error creating rewards type', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllRewardsTypes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [rewardsTypes, total] = await Promise.all([
      RewardsType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RewardsType.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Rewards types retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, rewardsTypes, pagination, 'Rewards types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving rewards types', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getRewardsTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let rewardsType;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      rewardsType = await RewardsType.findById(id);
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid rewards type ID format');
      }
      rewardsType = await RewardsType.findOne({ Rewards_type_id: numericId });
    }

    if (!rewardsType) {
      return sendNotFound(res, 'Rewards type not found');
    }

    console.info('Rewards type retrieved successfully', { id: rewardsType._id });
    sendSuccess(res, rewardsType, 'Rewards type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving rewards type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateRewardsType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let rewardsType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      rewardsType = await RewardsType.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid rewards type ID format');
      }
      rewardsType = await RewardsType.findOneAndUpdate({ Rewards_type_id: numericId }, updateData, { new: true, runValidators: true });
    }

    if (!rewardsType) {
      return sendNotFound(res, 'Rewards type not found');
    }

    console.info('Rewards type updated successfully', { id: rewardsType._id });
    sendSuccess(res, rewardsType, 'Rewards type updated successfully');
  } catch (error) {
    console.error('Error updating rewards type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteRewardsType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let rewardsType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      rewardsType = await RewardsType.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid rewards type ID format');
      }
      rewardsType = await RewardsType.findOneAndUpdate({ Rewards_type_id: numericId }, updateData, { new: true });
    }

    if (!rewardsType) {
      return sendNotFound(res, 'Rewards type not found');
    }

    console.info('Rewards type deleted successfully', { id: rewardsType._id });
    sendSuccess(res, rewardsType, 'Rewards type deleted successfully');
  } catch (error) {
    console.error('Error deleting rewards type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getRewardsTypesByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = {
      created_by: userId
    };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [rewardsTypes, total] = await Promise.all([
      RewardsType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RewardsType.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Rewards types retrieved for authenticated user', { total, page: numericPage, limit: numericLimit, userId });
    sendPaginated(res, rewardsTypes, pagination, 'Rewards types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving rewards types for auth user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createRewardsType,
  getAllRewardsTypes,
  getRewardsTypeById,
  updateRewardsType,
  deleteRewardsType,
  getRewardsTypesByAuth
};


