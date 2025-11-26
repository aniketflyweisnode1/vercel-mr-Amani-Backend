const CampaignAllneedaPost = require('../models/CampaignAllneedaPost.model');
const Business_Branch = require('../models/business_Branch.model');
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

const populateCampaign = (query) => query
  .populate('business_Branch_id', 'business_Branch_id BusinessName Address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

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

  const [campaigns, total] = await Promise.all([
    populateCampaign(CampaignAllneedaPost.find(filter))
      .sort(sort)
      .skip(skip)
      .limit(numericLimit),
    CampaignAllneedaPost.countDocuments(filter)
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

  sendPaginated(res, campaigns, pagination, successMessage);
};

const findCampaignByIdentifier = async (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateCampaign(CampaignAllneedaPost.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateCampaign(CampaignAllneedaPost.findOne({ CampaignAllneedaPost_id: numericId }));
  }

  return null;
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
    const populated = await populateCampaign(CampaignAllneedaPost.findById(campaign._id));

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
    const campaignQuery = await findCampaignByIdentifier(id);

    if (!campaignQuery) {
      return sendNotFound(res, 'Campaign all need a post not found');
    }

    const campaign = await campaignQuery;
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

    const populated = await populateCampaign(CampaignAllneedaPost.findById(campaign._id));
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

