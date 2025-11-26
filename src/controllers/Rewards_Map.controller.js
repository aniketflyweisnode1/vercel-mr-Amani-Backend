const RewardsMap = require('../models/Rewards_Map.model');
const Rewards = require('../models/Rewards.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureRewardExists = async (rewardId) => {
  if (rewardId === undefined || rewardId === null) {
    return true;
  }
  const reward = await Rewards.findOne({ Rewards_id: rewardId, Status: true });
  return Boolean(reward);
};

const ensureUserExists = async (userId) => {
  if (userId === undefined || userId === null) {
    return true;
  }
  const user = await User.findOne({ user_id: userId, status: true });
  return Boolean(user);
};

const buildFilterFromQuery = ({ search, status, ExpiryStatus, Rewards_id, user_id, fromExpiryDate, toExpiryDate }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (ExpiryStatus !== undefined) {
    filter.ExpiryStatus = ExpiryStatus === 'true';
  }

  if (Rewards_id !== undefined) {
    const parsed = Number(Rewards_id);
    if (!Number.isNaN(parsed)) {
      filter.Rewards_id = parsed;
    }
  }

  if (user_id !== undefined) {
    const parsed = Number(user_id);
    if (!Number.isNaN(parsed)) {
      filter.user_id = parsed;
    }
  }

  if (fromExpiryDate || toExpiryDate) {
    filter.ExpiryDate = {};
    if (fromExpiryDate) {
      filter.ExpiryDate.$gte = new Date(fromExpiryDate);
    }
    if (toExpiryDate) {
      filter.ExpiryDate.$lte = new Date(toExpiryDate);
    }
  }

  return filter;
};

const populateRewardsMap = (query) => query
  .populate('Rewards_id', 'Rewards_id name price expiryDays Status')
  .populate('user_id', 'user_id firstName lastName phoneNo Email status');

const createRewardsMap = asyncHandler(async (req, res) => {
  try {
    const { Rewards_id, user_id } = req.body;

    const [rewardExists, userExists] = await Promise.all([
      ensureRewardExists(Rewards_id),
      ensureUserExists(user_id)
    ]);

    if (!rewardExists) {
      return sendError(res, 'Reward not found or inactive', 404);
    }

    if (!userExists) {
      return sendError(res, 'User not found or inactive', 404);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const rewardsMap = await RewardsMap.create(payload);
    console.info('Rewards map created successfully', { id: rewardsMap._id, Rewards_Map_id: rewardsMap.Rewards_Map_id });

    const populated = await populateRewardsMap(RewardsMap.findById(rewardsMap._id));
    sendSuccess(res, populated, 'Rewards map created successfully', 201);
  } catch (error) {
    console.error('Error creating rewards map', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllRewardsMaps = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      ExpiryStatus,
      Rewards_id,
      user_id,
      fromExpiryDate,
      toExpiryDate,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status, ExpiryStatus, Rewards_id, user_id, fromExpiryDate, toExpiryDate });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [rewardsMaps, total] = await Promise.all([
      populateRewardsMap(RewardsMap.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RewardsMap.countDocuments(filter)
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

    console.info('Rewards maps retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, rewardsMaps, pagination, 'Rewards maps retrieved successfully');
  } catch (error) {
    console.error('Error retrieving rewards maps', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getRewardsMapById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let rewardsMap;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      rewardsMap = await populateRewardsMap(RewardsMap.findById(id));
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid rewards map ID format');
      }
      rewardsMap = await populateRewardsMap(RewardsMap.findOne({ Rewards_Map_id: numericId }));
    }

    if (!rewardsMap) {
      return sendNotFound(res, 'Rewards map not found');
    }

    console.info('Rewards map retrieved successfully', { id: rewardsMap._id });
    sendSuccess(res, rewardsMap, 'Rewards map retrieved successfully');
  } catch (error) {
    console.error('Error retrieving rewards map', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateRewardsMap = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.Rewards_id !== undefined) {
      const rewardExists = await ensureRewardExists(updateData.Rewards_id);
      if (!rewardExists) {
        return sendError(res, 'Reward not found or inactive', 404);
      }
    }

    if (updateData.user_id !== undefined) {
      const userExists = await ensureUserExists(updateData.user_id);
      if (!userExists) {
        return sendError(res, 'User not found or inactive', 404);
      }
    }

    let rewardsMap;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      rewardsMap = await populateRewardsMap(RewardsMap.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }));
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid rewards map ID format');
      }
      rewardsMap = await populateRewardsMap(RewardsMap.findOneAndUpdate({ Rewards_Map_id: numericId }, updateData, { new: true, runValidators: true }));
    }

    if (!rewardsMap) {
      return sendNotFound(res, 'Rewards map not found');
    }

    console.info('Rewards map updated successfully', { id: rewardsMap._id });
    sendSuccess(res, rewardsMap, 'Rewards map updated successfully');
  } catch (error) {
    console.error('Error updating rewards map', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteRewardsMap = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let rewardsMap;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      rewardsMap = await populateRewardsMap(RewardsMap.findByIdAndUpdate(id, updateData, { new: true }));
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid rewards map ID format');
      }
      rewardsMap = await populateRewardsMap(RewardsMap.findOneAndUpdate({ Rewards_Map_id: numericId }, updateData, { new: true }));
    }

    if (!rewardsMap) {
      return sendNotFound(res, 'Rewards map not found');
    }

    console.info('Rewards map deleted successfully', { id: rewardsMap._id });
    sendSuccess(res, rewardsMap, 'Rewards map deleted successfully');
  } catch (error) {
    console.error('Error deleting rewards map', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getRewardsMapByUserId = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const numericUserId = parseInt(userId, 10);

    if (Number.isNaN(numericUserId)) {
      return sendError(res, 'Invalid user ID format', 400);
    }

    const { status, ExpiryStatus } = req.query;
    const filter = {
      user_id: numericUserId
    };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (ExpiryStatus !== undefined) {
      filter.ExpiryStatus = ExpiryStatus === 'true';
    }

    const rewardsMaps = await populateRewardsMap(RewardsMap.find(filter));

    console.info('Rewards maps retrieved by user ID', { userId: numericUserId, total: rewardsMaps.length });
    sendSuccess(res, rewardsMaps, 'Rewards maps retrieved successfully');
  } catch (error) {
    console.error('Error retrieving rewards maps by user ID', { error: error.message, userId: req.params.userId });
    throw error;
  }
});

const getRewardsMapByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const { status, ExpiryStatus } = req.query;
    const filter = {
      user_id: userId
    };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (ExpiryStatus !== undefined) {
      filter.ExpiryStatus = ExpiryStatus === 'true';
    }

    const rewardsMaps = await populateRewardsMap(RewardsMap.find(filter));

    console.info('Rewards maps retrieved for authenticated user', { userId, total: rewardsMaps.length });
    sendSuccess(res, rewardsMaps, 'Rewards maps retrieved successfully');
  } catch (error) {
    console.error('Error retrieving rewards maps for auth user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createRewardsMap,
  getAllRewardsMaps,
  getRewardsMapById,
  updateRewardsMap,
  deleteRewardsMap,
  getRewardsMapByUserId,
  getRewardsMapByAuth
};


