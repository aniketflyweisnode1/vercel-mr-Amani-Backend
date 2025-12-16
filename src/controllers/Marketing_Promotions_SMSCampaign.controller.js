const MarketingSmsCampaign = require('../models/Marketing_Promotions_SMSCampaign.model');
const CampaignType = require('../models/CampaignType.model');
const City = require('../models/city.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
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

// Manual population function for Number refs
const populateSmsCampaign = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate CampaignType_id
      if (recordObj.CampaignType_id) {
        const typeId = typeof recordObj.CampaignType_id === 'object' ? recordObj.CampaignType_id : recordObj.CampaignType_id;
        const campaignType = await CampaignType.findOne({ CampaignType_id: typeId })
          .select('CampaignType_id CampaignTypeName');
        if (campaignType) {
          recordObj.CampaignType_id = campaignType.toObject ? campaignType.toObject() : campaignType;
        }
      }
      
      // Populate City_id
      if (recordObj.City_id) {
        const cityId = typeof recordObj.City_id === 'object' ? recordObj.City_id : recordObj.City_id;
        const city = await City.findOne({ city_id: cityId })
          .select('city_id name stateCode countryCode');
        if (city) {
          recordObj.City_id = city.toObject ? city.toObject() : city;
        }
      }
      
      // Populate Branch_id
      if (recordObj.Branch_id) {
        const branchId = typeof recordObj.Branch_id === 'object' ? recordObj.Branch_id : recordObj.Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id BusinessName Address');
        if (branch) {
          recordObj.Branch_id = branch.toObject ? branch.toObject() : branch;
        }
      }
      
      // Populate business_Branch_id
      if (recordObj.business_Branch_id) {
        const branchId = typeof recordObj.business_Branch_id === 'object' ? recordObj.business_Branch_id : recordObj.business_Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id BusinessName Address');
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

const listSmsCampaigns = async ({ query, res, successMessage, filterOverrides = {} }) => {
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

  const [campaignsData, total] = await Promise.all([
    MarketingSmsCampaign.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(numericLimit),
    MarketingSmsCampaign.countDocuments(filter)
  ]);

  const campaigns = await populateSmsCampaign(campaignsData);

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

const findSmsCampaignByIdentifier = async (identifier) => {
  let recordData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    recordData = await MarketingSmsCampaign.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      recordData = await MarketingSmsCampaign.findOne({ Marketing_Promotions_SMSCampaign_id: numericId });
    }
  }

  if (!recordData) {
    return null;
  }

  return await populateSmsCampaign(recordData);
};

const createSmsCampaign = asyncHandler(async (req, res) => {
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

    const campaign = await MarketingSmsCampaign.create(payload);
    const populated = await populateSmsCampaign(campaign);

    sendSuccess(res, populated, 'Marketing promotions SMS campaign created successfully', 201);
  } catch (error) {
    console.error('Error creating marketing SMS campaign', { error: error.message });
    throw error;
  }
});

const getAllSmsCampaigns = asyncHandler(async (req, res) => {
  try {
    await listSmsCampaigns({
      query: req.query,
      res,
      successMessage: 'Marketing promotions SMS campaigns retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving marketing SMS campaigns', { error: error.message });
    throw error;
  }
});

const getSmsCampaignById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await findSmsCampaignByIdentifier(id);

    if (!campaign) {
      return sendNotFound(res, 'Marketing promotions SMS campaign not found');
    }

    sendSuccess(res, campaign, 'Marketing promotions SMS campaign retrieved successfully');
  } catch (error) {
    console.error('Error retrieving marketing SMS campaign', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateSmsCampaign = asyncHandler(async (req, res) => {
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
      campaign = await MarketingSmsCampaign.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendError(res, 'Invalid campaign ID format', 400);
      }
      campaign = await MarketingSmsCampaign.findOneAndUpdate(
        { Marketing_Promotions_SMSCampaign_id: numericId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!campaign) {
      return sendNotFound(res, 'Marketing promotions SMS campaign not found');
    }

    const populated = await populateSmsCampaign(campaign);
    sendSuccess(res, populated, 'Marketing promotions SMS campaign updated successfully');
  } catch (error) {
    console.error('Error updating marketing SMS campaign', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteSmsCampaign = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let campaign;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      campaign = await MarketingSmsCampaign.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendError(res, 'Invalid campaign ID format', 400);
      }
      campaign = await MarketingSmsCampaign.findOneAndUpdate(
        { Marketing_Promotions_SMSCampaign_id: numericId },
        updateData,
        { new: true }
      );
    }

    if (!campaign) {
      return sendNotFound(res, 'Marketing promotions SMS campaign not found');
    }

    sendSuccess(res, campaign, 'Marketing promotions SMS campaign deleted successfully');
  } catch (error) {
    console.error('Error deleting marketing SMS campaign', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getSmsCampaignsByAuth = asyncHandler(async (req, res) => {
  try {
    await listSmsCampaigns({
      query: req.query,
      res,
      successMessage: 'Marketing promotions SMS campaigns retrieved successfully',
      filterOverrides: { created_by: req.userIdNumber }
    });
  } catch (error) {
    console.error('Error retrieving marketing SMS campaigns by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createSmsCampaign,
  getAllSmsCampaigns,
  getSmsCampaignById,
  updateSmsCampaign,
  deleteSmsCampaign,
  getSmsCampaignsByAuth
};

