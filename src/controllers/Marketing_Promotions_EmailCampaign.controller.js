const MarketingEmailCampaign = require('../models/Marketing_Promotions_EmailCampaign.model');
const CampaignType = require('../models/CampaignType.model');
const City = require('../models/city.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const TARGET_SEGMENTS = ['All customers', 'VIP', 'RequentCustomers'];

const getBusinessBranchIdByAuth = async (userIdNumber) => {
  if (!userIdNumber) {
    return null;
  }
  const branch = await Business_Branch.findOne({ created_by: userIdNumber, Status: true });
  return branch ? branch.business_Branch_id : null;
};

const ensureCampaignTypeExists = async (CampaignType_id) => {
  if (CampaignType_id === undefined || CampaignType_id === null) {
    return false;
  }
  const type = await CampaignType.findOne({ CampaignType_id, Status: true });
  return !!type;
};

const ensureCityExists = async (City_id) => {
  if (City_id === undefined || City_id === null) {
    return false;
  }
  const city = await City.findOne({ city_id: City_id, status: true });
  return !!city;
};

const ensureBranchExists = async (Branch_id) => {
  if (Branch_id === undefined || Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: Branch_id, Status: true });
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

const populateEmailCampaign = (query) => query
  .populate('CampaignType_id', 'CampaignType_id CampaignTypeName')
  .populate('City_id', 'city_id name stateCode countryCode')
  .populate('Branch_id', 'business_Branch_id BusinessName Address')
  .populate('business_Branch_id', 'business_Branch_id BusinessName Address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilterFromQuery = ({
  search,
  status,
  CampaignType_id,
  City_id,
  Branch_id,
  TargetCustomerSegment,
  ScheduleSend,
  business_Branch_id
}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Campaignname: { $regex: search, $options: 'i' } },
      { PromoCode: { $regex: search, $options: 'i' } },
      { Notes: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (CampaignType_id !== undefined) {
    const numeric = parseInt(CampaignType_id, 10);
    if (!isNaN(numeric)) {
      filter.CampaignType_id = numeric;
    }
  }

  if (City_id !== undefined) {
    const numeric = parseInt(City_id, 10);
    if (!isNaN(numeric)) {
      filter.City_id = numeric;
    }
  }

  if (Branch_id !== undefined) {
    const numeric = parseInt(Branch_id, 10);
    if (!isNaN(numeric)) {
      filter.Branch_id = numeric;
    }
  }

  if (TargetCustomerSegment && TARGET_SEGMENTS.includes(TargetCustomerSegment)) {
    filter.TargetCustomerSegment = TargetCustomerSegment;
  }

  if (ScheduleSend !== undefined) {
    filter.ScheduleSend = ScheduleSend === 'true' || ScheduleSend === true;
  }

  if (business_Branch_id !== undefined) {
    const numericBranch = parseInt(business_Branch_id, 10);
    if (!isNaN(numericBranch)) {
      filter.business_Branch_id = numericBranch;
    }
  }

  return filter;
};

const listEmailCampaigns = async ({ query, res, successMessage, filterOverrides = {} }) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status,
    CampaignType_id,
    City_id,
    Branch_id,
    TargetCustomerSegment,
    ScheduleSend,
    business_Branch_id,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = query;

  const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
  const numericPage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (numericPage - 1) * numericLimit;

  const filter = buildFilterFromQuery({
    search,
    status,
    CampaignType_id,
    City_id,
    Branch_id,
    TargetCustomerSegment,
    ScheduleSend,
    business_Branch_id
  });

  Object.assign(filter, filterOverrides);

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [campaigns, total] = await Promise.all([
    populateEmailCampaign(MarketingEmailCampaign.find(filter))
      .sort(sort)
      .skip(skip)
      .limit(numericLimit),
    MarketingEmailCampaign.countDocuments(filter)
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

const findEmailCampaignByIdentifier = async (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateEmailCampaign(MarketingEmailCampaign.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!isNaN(numericId)) {
    return populateEmailCampaign(MarketingEmailCampaign.findOne({ Marketing_Promotions_EmailCampaign_id: numericId }));
  }

  return null;
};

const createEmailCampaign = asyncHandler(async (req, res) => {
  try {
    const {
      CampaignType_id,
      City_id,
      Branch_id,
      business_Branch_id: bodyBusinessBranchId
    } = req.body;

    const [typeExists, cityExists, branchExists] = await Promise.all([
      ensureCampaignTypeExists(CampaignType_id),
      ensureCityExists(City_id),
      ensureBranchExists(Branch_id)
    ]);

    if (!typeExists) {
      return sendError(res, 'Associated campaign type not found or inactive', 400);
    }

    if (!cityExists) {
      return sendError(res, 'Associated city not found or inactive', 400);
    }

    if (!branchExists) {
      return sendError(res, 'Associated business branch not found or inactive', 400);
    }

    let business_Branch_id = bodyBusinessBranchId ?? Branch_id;
    if (business_Branch_id === undefined || business_Branch_id === null) {
      business_Branch_id = await getBusinessBranchIdByAuth(req.userIdNumber);
    }

    if (!business_Branch_id) {
      return sendError(res, 'Unable to determine business branch for authenticated user', 400);
    }

    const associatedBranchExists = await ensureBranchExists(business_Branch_id);
    if (!associatedBranchExists) {
      return sendError(res, 'Associated business branch not found or inactive', 400);
    }

    const payload = {
      ...req.body,
      business_Branch_id,
      ScheduleSend: normalizeBoolean(req.body.ScheduleSend, false),
      created_by: req.userIdNumber || null
    };

    const campaign = await MarketingEmailCampaign.create(payload);
    const populated = await populateEmailCampaign(MarketingEmailCampaign.findById(campaign._id));

    sendSuccess(res, populated, 'Marketing promotions email campaign created successfully', 201);
  } catch (error) {
    console.error('Error creating marketing email campaign', { error: error.message });
    throw error;
  }
});

const getAllEmailCampaigns = asyncHandler(async (req, res) => {
  try {
    await listEmailCampaigns({
      query: req.query,
      res,
      successMessage: 'Marketing promotions email campaigns retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving marketing email campaigns', { error: error.message });
    throw error;
  }
});

const getEmailCampaignById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const campaignQuery = await findEmailCampaignByIdentifier(id);

    if (!campaignQuery) {
      return sendNotFound(res, 'Marketing promotions email campaign not found');
    }

    const campaign = await campaignQuery;
    if (!campaign) {
      return sendNotFound(res, 'Marketing promotions email campaign not found');
    }

    sendSuccess(res, campaign, 'Marketing promotions email campaign retrieved successfully');
  } catch (error) {
    console.error('Error retrieving marketing email campaign', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateEmailCampaign = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.CampaignType_id !== undefined) {
      const typeExists = await ensureCampaignTypeExists(updateData.CampaignType_id);
      if (!typeExists) {
        return sendError(res, 'Associated campaign type not found or inactive', 400);
      }
    }

    if (updateData.City_id !== undefined) {
      const cityExists = await ensureCityExists(updateData.City_id);
      if (!cityExists) {
        return sendError(res, 'Associated city not found or inactive', 400);
      }
    }

    if (updateData.Branch_id !== undefined) {
      const branchExists = await ensureBranchExists(updateData.Branch_id);
      if (!branchExists) {
        return sendError(res, 'Associated business branch not found or inactive', 400);
      }
    }

    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Associated business branch not found or inactive', 400);
      }
    }

    if (updateData.ScheduleSend !== undefined) {
      updateData.ScheduleSend = normalizeBoolean(updateData.ScheduleSend, false);
    }

    let campaign;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      campaign = await MarketingEmailCampaign.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendError(res, 'Invalid campaign ID format', 400);
      }
      campaign = await MarketingEmailCampaign.findOneAndUpdate(
        { Marketing_Promotions_EmailCampaign_id: numericId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!campaign) {
      return sendNotFound(res, 'Marketing promotions email campaign not found');
    }

    const populated = await populateEmailCampaign(MarketingEmailCampaign.findById(campaign._id));
    sendSuccess(res, populated, 'Marketing promotions email campaign updated successfully');
  } catch (error) {
    console.error('Error updating marketing email campaign', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteEmailCampaign = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let campaign;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      campaign = await MarketingEmailCampaign.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendError(res, 'Invalid campaign ID format', 400);
      }
      campaign = await MarketingEmailCampaign.findOneAndUpdate(
        { Marketing_Promotions_EmailCampaign_id: numericId },
        updateData,
        { new: true }
      );
    }

    if (!campaign) {
      return sendNotFound(res, 'Marketing promotions email campaign not found');
    }

    sendSuccess(res, campaign, 'Marketing promotions email campaign deleted successfully');
  } catch (error) {
    console.error('Error deleting marketing email campaign', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getEmailCampaignsByAuth = asyncHandler(async (req, res) => {
  try {
    await listEmailCampaigns({
      query: req.query,
      res,
      successMessage: 'Marketing promotions email campaigns retrieved successfully',
      filterOverrides: { created_by: req.userIdNumber }
    });
  } catch (error) {
    console.error('Error retrieving marketing email campaigns by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createEmailCampaign,
  getAllEmailCampaigns,
  getEmailCampaignById,
  updateEmailCampaign,
  deleteEmailCampaign,
  getEmailCampaignsByAuth
};

