const MarketingReward = require('../models/Marketing_Promotions_Reward.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const getBusinessBranchIdByAuth = async (userIdNumber) => {
  if (!userIdNumber) {
    return null;
  }
  const branch = await Business_Branch.findOne({ created_by: userIdNumber, Status: true });
  return branch ? branch.business_Branch_id : null;
};

const ensureBusinessBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined || business_Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id, Status: true });
  return !!branch;
};

const normalizeBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  return defaultValue;
};

// Manual population function for Number refs
const populateReward = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate business_Branch_id
      if (recordObj.business_Branch_id) {
        const branchId = typeof recordObj.business_Branch_id === 'object' ? recordObj.business_Branch_id : recordObj.business_Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id BusinessName Address City state country');
        if (branch) {
          recordObj.business_Branch_id = branch.toObject ? branch.toObject() : branch;
        }
      }
      
      // Populate created_by
      if (recordObj.created_by) {
        const createdById = typeof recordObj.created_by === 'object' ? recordObj.created_by : recordObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          recordObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (recordObj.updated_by) {
        const updatedById = typeof recordObj.updated_by === 'object' ? recordObj.updated_by : recordObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          recordObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return recordObj;
    })
  );
  
  return Array.isArray(records) ? populatedRecords : populatedRecords[0];
};

const buildFilterFromQuery = ({ search, status, loyaltyRewords, business_Branch_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { singular: { $regex: search, $options: 'i' } },
      { plural: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (loyaltyRewords !== undefined) {
    filter.loyaltyRewords = loyaltyRewords === 'true' || loyaltyRewords === true;
  }

  if (business_Branch_id !== undefined) {
    const numericBranch = parseInt(business_Branch_id, 10);
    if (!isNaN(numericBranch)) {
      filter.business_Branch_id = numericBranch;
    }
  }

  return filter;
};

const listRewards = async ({ query, res, successMessage, filterOverrides = {} }) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status,
    loyaltyRewords,
    business_Branch_id,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = query;

  const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
  const numericPage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (numericPage - 1) * numericLimit;

  const filter = buildFilterFromQuery({ search, status, loyaltyRewords, business_Branch_id });
  Object.assign(filter, filterOverrides);

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [rewardsData, total] = await Promise.all([
    MarketingReward.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(numericLimit),
    MarketingReward.countDocuments(filter)
  ]);

  const rewards = await populateReward(rewardsData);

  const totalPages = Math.ceil(total / numericLimit) || 1;
  const pagination = {
    currentPage: numericPage,
    totalPages,
    totalItems: total,
    itemsPerPage: numericLimit,
    hasNextPage: numericPage < totalPages,
    hasPrevPage: numericPage > 1
  };

  sendPaginated(res, rewards, pagination, successMessage);
};

const findRewardByIdentifier = async (identifier) => {
  let recordData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    recordData = await MarketingReward.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      recordData = await MarketingReward.findOne({ Marketing_Promotions_Reward_id: numericId });
    }
  }

  if (!recordData) {
    return null;
  }

  return await populateReward(recordData);
};

const createReward = asyncHandler(async (req, res) => {
  try {
    let { business_Branch_id } = req.body;
    if (business_Branch_id === undefined || business_Branch_id === null) {
      business_Branch_id = await getBusinessBranchIdByAuth(req.userIdNumber);
    }

    if (!business_Branch_id) {
      return sendError(res, 'Unable to determine business branch for authenticated user', 400);
    }

    const branchExists = await ensureBusinessBranchExists(business_Branch_id);
    if (!branchExists) {
      return sendError(res, 'Business branch not found or inactive', 400);
    }

    const payload = {
      ...req.body,
      business_Branch_id,
      loyaltyRewords: normalizeBoolean(req.body.loyaltyRewords, false),
      created_by: req.userIdNumber || null
    };

    const reward = await MarketingReward.create(payload);
    const populated = await populateReward(reward);

    sendSuccess(res, populated, 'Marketing promotions reward created successfully', 201);
  } catch (error) {
    console.error('Error creating marketing reward', { error: error.message });
    throw error;
  }
});

const getAllRewards = asyncHandler(async (req, res) => {
  try {
    await listRewards({
      query: req.query,
      res,
      successMessage: 'Marketing promotions rewards retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving marketing rewards', { error: error.message });
    throw error;
  }
});

const getRewardById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await findRewardByIdentifier(id);

    if (!reward) {
      return sendNotFound(res, 'Marketing promotions reward not found');
    }

    sendSuccess(res, reward, 'Marketing promotions reward retrieved successfully');
  } catch (error) {
    console.error('Error retrieving marketing reward', { error: error.message, id: req.params.id });
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

    if (updateData.loyaltyRewords !== undefined) {
      updateData.loyaltyRewords = normalizeBoolean(updateData.loyaltyRewords, false);
    }

    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Business branch not found or inactive', 400);
      }
    }

    let reward;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reward = await MarketingReward.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendError(res, 'Invalid reward ID format', 400);
      }
      reward = await MarketingReward.findOneAndUpdate(
        { Marketing_Promotions_Reward_id: numericId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!reward) {
      return sendNotFound(res, 'Marketing promotions reward not found');
    }

    const populated = await populateReward(reward);
    sendSuccess(res, populated, 'Marketing promotions reward updated successfully');
  } catch (error) {
    console.error('Error updating marketing reward', { error: error.message, id: req.params.id });
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
      reward = await MarketingReward.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendError(res, 'Invalid reward ID format', 400);
      }
      reward = await MarketingReward.findOneAndUpdate(
        { Marketing_Promotions_Reward_id: numericId },
        updateData,
        { new: true }
      );
    }

    if (!reward) {
      return sendNotFound(res, 'Marketing promotions reward not found');
    }

    sendSuccess(res, reward, 'Marketing promotions reward deleted successfully');
  } catch (error) {
    console.error('Error deleting marketing reward', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getRewardsByAuth = asyncHandler(async (req, res) => {
  try {
    await listRewards({
      query: req.query,
      res,
      successMessage: 'Marketing promotions rewards retrieved successfully',
      filterOverrides: { created_by: req.userIdNumber }
    });
  } catch (error) {
    console.error('Error retrieving marketing rewards by auth', { error: error.message, userId: req.userIdNumber });
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

