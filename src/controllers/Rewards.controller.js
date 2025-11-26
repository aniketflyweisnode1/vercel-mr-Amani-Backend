const Rewards = require('../models/Rewards.model');
const RewardsType = require('../models/Rewards_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const buildFilterFromQuery = ({ search, status, minPrice, maxPrice, Rewards_type_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (minPrice !== undefined) {
    const value = Number(minPrice);
    if (!Number.isNaN(value)) {
      filter.price = { ...filter.price, $gte: value };
    }
  }

  if (maxPrice !== undefined) {
    const value = Number(maxPrice);
    if (!Number.isNaN(value)) {
      filter.price = { ...filter.price, $lte: value };
    }
  }

  if (Rewards_type_id !== undefined) {
    const parsed = Number(Rewards_type_id);
    if (!Number.isNaN(parsed)) {
      filter.Rewards_type_id = parsed;
    }
  }

  return filter;
};

const populateRewards = (query) => query
  .populate('Rewards_type_id', 'Rewards_type_id name Status');

const ensureRewardsTypeExists = async (typeId) => {
  if (typeId === undefined || typeId === null) {
    return true;
  }
  const rewardsType = await RewardsType.findOne({ Rewards_type_id: typeId, Status: true });
  return Boolean(rewardsType);
};

const createReward = asyncHandler(async (req, res) => {
  try {
    const { Rewards_type_id } = req.body;

    const typeExists = await ensureRewardsTypeExists(Rewards_type_id);
    if (!typeExists) {
      return sendError(res, 'Rewards type not found or inactive', 404);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const reward = await Rewards.create(payload);
    console.info('Reward created successfully', { id: reward._id, Rewards_id: reward.Rewards_id });

    const populated = await populateRewards(Rewards.findById(reward._id));
    sendSuccess(res, populated, 'Reward created successfully', 201);
  } catch (error) {
    console.error('Error creating reward', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllRewards = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      minPrice,
      maxPrice,
      Rewards_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status, minPrice, maxPrice, Rewards_type_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [rewards, total] = await Promise.all([
      populateRewards(Rewards.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Rewards.countDocuments(filter)
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

    console.info('Rewards retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, rewards, pagination, 'Rewards retrieved successfully');
  } catch (error) {
    console.error('Error retrieving rewards', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getRewardById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let reward;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reward = await populateRewards(Rewards.findById(id));
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid rewards ID format');
      }
      reward = await populateRewards(Rewards.findOne({ Rewards_id: numericId }));
    }

    if (!reward) {
      return sendNotFound(res, 'Reward not found');
    }

    console.info('Reward retrieved successfully', { id: reward._id });
    sendSuccess(res, reward, 'Reward retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reward', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateReward = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.Rewards_type_id !== undefined) {
      const typeExists = await ensureRewardsTypeExists(updateData.Rewards_type_id);
      if (!typeExists) {
        return sendError(res, 'Rewards type not found or inactive', 404);
      }
    }

    let reward;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reward = await populateRewards(Rewards.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }));
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid rewards ID format');
      }
      reward = await populateRewards(Rewards.findOneAndUpdate({ Rewards_id: numericId }, updateData, { new: true, runValidators: true }));
    }

    if (!reward) {
      return sendNotFound(res, 'Reward not found');
    }

    console.info('Reward updated successfully', { id: reward._id });
    sendSuccess(res, reward, 'Reward updated successfully');
  } catch (error) {
    console.error('Error updating reward', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteReward = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let reward;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reward = await populateRewards(Rewards.findByIdAndUpdate(id, updateData, { new: true }));
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid rewards ID format');
      }
      reward = await populateRewards(Rewards.findOneAndUpdate({ Rewards_id: numericId }, updateData, { new: true }));
    }

    if (!reward) {
      return sendNotFound(res, 'Reward not found');
    }

    console.info('Reward deleted successfully', { id: reward._id });
    sendSuccess(res, reward, 'Reward deleted successfully');
  } catch (error) {
    console.error('Error deleting reward', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getRewardsByAuth = asyncHandler(async (req, res) => {
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

    const [rewards, total] = await Promise.all([
      populateRewards(Rewards.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Rewards.countDocuments(filter)
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

    console.info('Rewards retrieved for authenticated user', { total, page: numericPage, limit: numericLimit, userId });
    sendPaginated(res, rewards, pagination, 'Rewards retrieved successfully');
  } catch (error) {
    console.error('Error retrieving rewards for auth user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createReward,
  getAllRewards,
  getRewardById,
  updateReward,
  deleteReward,
  getRewardsByAuth
};


