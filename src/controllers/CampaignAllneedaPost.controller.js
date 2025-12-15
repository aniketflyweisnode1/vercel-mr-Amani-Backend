const CampaignAllneedaPost = require('../models/CampaignAllneedaPost.model');
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

// Manual population for numeric IDs
const populateCampaign = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate business_Branch_id
      if (recordObj.business_Branch_id) {
        const branchId = typeof recordObj.business_Branch_id === 'object' ? recordObj.business_Branch_id.business_Branch_id : recordObj.business_Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id BusinessName Address');
        if (branch) {
          recordObj.business_Branch_id = branch.toObject ? branch.toObject() : branch;
        }
      }
      
      // Populate created_by
      if (recordObj.created_by) {
        const createdById = typeof recordObj.created_by === 'object' ? recordObj.created_by.user_id : recordObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (createdBy) {
          recordObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (recordObj.updated_by) {
        const updatedById = typeof recordObj.updated_by === 'object' ? recordObj.updated_by.user_id : recordObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (updatedBy) {
          recordObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return recordObj;
    })
  );
  
  return Array.isArray(records) ? populatedRecords : populatedRecords[0];
};

const buildFilterFromQuery = ({ search, status, business_Branch_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Caption: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } },
      { Tag: { $regex: search, $options: 'i' } },
      { Music: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (business_Branch_id !== undefined) {
    const numericId = parseInt(business_Branch_id, 10);
    if (!Number.isNaN(numericId)) {
      filter.business_Branch_id = numericId;
    }
  }

  return filter;
};

const listCampaigns = async ({ query, res, successMessage, filterOverrides = {} }) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status,
    business_Branch_id,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = query;

  const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
  const numericPage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (numericPage - 1) * numericLimit;

  const filter = buildFilterFromQuery({ search, status, business_Branch_id, ...filterOverrides });

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [campaignsRaw, total] = await Promise.all([
    CampaignAllneedaPost.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(numericLimit),
    CampaignAllneedaPost.countDocuments(filter)
  ]);
  
  const campaigns = await populateCampaign(campaignsRaw);

  const totalPages = Math.ceil(total / numericLimit) || 1;
  const pagination = {
    currentPage: numericPage,
    totalPages,
    totalItems: total,
    itemsPerPage: numericLimit,
    hasNextPage: numericPage < totalPages,
    hasPrevPage: numericPage > 1
  };

  sendPaginated(res, campaigns, pagination, successMessage);
};

const findCampaignByIdentifier = async (identifier) => {
  let campaignRaw;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    campaignRaw = await CampaignAllneedaPost.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      campaignRaw = await CampaignAllneedaPost.findOne({ CampaignAllneedaPost_id: numericId });
    }
  }
  
  if (!campaignRaw) {
    return null;
  }
  
  return await populateCampaign(campaignRaw);
};

const createCampaignAllneedaPost = asyncHandler(async (req, res) => {
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
      created_by: req.userIdNumber || null
    };

    const campaign = await CampaignAllneedaPost.create(payload);
    const populated = await populateCampaign(campaign);

    sendSuccess(res, populated, 'Campaign all need a post created successfully', 201);
  } catch (error) {
    console.error('Error creating campaign all need a post', { error: error.message });
    throw error;
  }
});

const getAllCampaignAllneedaPosts = asyncHandler(async (req, res) => {
  try {
    await listCampaigns({
      query: req.query,
      res,
      successMessage: 'Campaign all need a posts retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving campaign all need a posts', { error: error.message });
    throw error;
  }
});

const getCampaignAllneedaPostById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await findCampaignByIdentifier(id);

    if (!campaign) {
      return sendNotFound(res, 'Campaign all need a post not found');
    }

    sendSuccess(res, campaign, 'Campaign all need a post retrieved successfully');
  } catch (error) {
    console.error('Error retrieving campaign all need a post', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateCampaignAllneedaPost = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Business branch not found or inactive', 400);
      }
    }

    let campaign;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      campaign = await CampaignAllneedaPost.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid campaign ID format', 400);
      }
      campaign = await CampaignAllneedaPost.findOneAndUpdate(
        { CampaignAllneedaPost_id: numericId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!campaign) {
      return sendNotFound(res, 'Campaign all need a post not found');
    }

    const populated = await populateCampaign(campaign);
    sendSuccess(res, populated, 'Campaign all need a post updated successfully');
  } catch (error) {
    console.error('Error updating campaign all need a post', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteCampaignAllneedaPost = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let campaign;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      campaign = await CampaignAllneedaPost.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid campaign ID format', 400);
      }
      campaign = await CampaignAllneedaPost.findOneAndUpdate(
        { CampaignAllneedaPost_id: numericId },
        updateData,
        { new: true }
      );
    }

    if (!campaign) {
      return sendNotFound(res, 'Campaign all need a post not found');
    }

    sendSuccess(res, campaign, 'Campaign all need a post deleted successfully');
  } catch (error) {
    console.error('Error deleting campaign all need a post', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getCampaignAllneedaPostsByAuth = asyncHandler(async (req, res) => {
  try {
    await listCampaigns({
      query: req.query,
      res,
      successMessage: 'Campaign all need a posts retrieved successfully',
      filterOverrides: { created_by: req.userIdNumber }
    });
  } catch (error) {
    console.error('Error retrieving campaign all need a posts by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createCampaignAllneedaPost,
  getAllCampaignAllneedaPosts,
  getCampaignAllneedaPostById,
  updateCampaignAllneedaPost,
  deleteCampaignAllneedaPost,
  getCampaignAllneedaPostsByAuth
};

