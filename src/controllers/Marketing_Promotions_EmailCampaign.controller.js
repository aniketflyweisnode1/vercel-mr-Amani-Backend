const MarketingEmailCampaign = require('../models/Marketing_Promotions_EmailCampaign.model');
const CampaignType = require('../models/CampaignType.model');
const City = require('../models/city.model');
const Business_Branch = require('../models/business_Branch.model');
const Vendor_Store = require('../models/Vendor_Store.model');
const User = require('../models/User.model');
const Role = require('../models/Role.model');
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

const getVendorStoreIdByAuth = async (userIdNumber) => {
  if (!userIdNumber) {
    return null;
  }
  const store = await Vendor_Store.findOne({ created_by: userIdNumber, Status: true });
  return store ? store.Vendor_Store_id : null;
};

const getUserRole = async (userIdNumber) => {
  if (!userIdNumber) {
    return null;
  }
  const user = await User.findOne({ user_id: userIdNumber }).select('role_id');
  if (!user || !user.role_id) {
    return null;
  }
  const role = await Role.findOne({ role_id: user.role_id, status: true }).select('name');
  return role ? role.name : null;
};

const ensureVendorStoreExists = async (Vendor_Store_id) => {
  if (Vendor_Store_id === undefined || Vendor_Store_id === null) {
    return false;
  }
  const store = await Vendor_Store.findOne({ Vendor_Store_id, Status: true });
  return !!store;
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
const populateEmailCampaign = async (records) => {
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
      
      // Populate Vendor_Store_id
      if (recordObj.Vendor_Store_id) {
        const storeId = typeof recordObj.Vendor_Store_id === 'object' ? recordObj.Vendor_Store_id : recordObj.Vendor_Store_id;
        const store = await Vendor_Store.findOne({ Vendor_Store_id: storeId })
          .select('Vendor_Store_id StoreName StoreAddress');
        if (store) {
          recordObj.Vendor_Store_id = store.toObject ? store.toObject() : store;
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
  business_Branch_id,
  Vendor_Store_id,
  store_id
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

  const storeIdValue = Vendor_Store_id ?? store_id;
  if (storeIdValue !== undefined) {
    const numericStore = parseInt(storeIdValue, 10);
    if (!isNaN(numericStore)) {
      filter.Vendor_Store_id = numericStore;
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
    Vendor_Store_id,
    store_id,
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
    business_Branch_id,
    Vendor_Store_id,
    store_id
  });

  Object.assign(filter, filterOverrides);

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [campaignsData, total] = await Promise.all([
    MarketingEmailCampaign.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(numericLimit),
    MarketingEmailCampaign.countDocuments(filter)
  ]);

  const campaigns = await populateEmailCampaign(campaignsData);

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
  let recordData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    recordData = await MarketingEmailCampaign.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      recordData = await MarketingEmailCampaign.findOne({ Marketing_Promotions_EmailCampaign_id: numericId });
    }
  }

  if (!recordData) {
    return null;
  }

  return await populateEmailCampaign(recordData);
};

const createEmailCampaign = asyncHandler(async (req, res) => {
  try {
    const {
      CampaignType_id,
      City_id,
      Branch_id,
      business_Branch_id: bodyBusinessBranchId,
      store_id,
      Vendor_Store_id: bodyVendorStoreId
    } = req.body;

    // Validate campaign type and city
    const [typeExists, cityExists] = await Promise.all([
      ensureCampaignTypeExists(CampaignType_id),
      ensureCityExists(City_id)
    ]);

    if (!typeExists) {
      return sendError(res, 'Associated campaign type not found or inactive', 400);
    }

    if (!cityExists) {
      return sendError(res, 'Associated city not found or inactive', 400);
    }

    // Get user role to determine if Vendor or Restaurant
    const userRole = await getUserRole(req.userIdNumber);
    const isVendor = userRole && (userRole.toLowerCase() === 'vendor' || userRole.toLowerCase().includes('vendor'));
    const isRestaurant = userRole && (userRole.toLowerCase() === 'restaurant' || userRole.toLowerCase().includes('restaurant'));

    let business_Branch_id = null;
    let Vendor_Store_id = null;

    if (isVendor) {
      // Vendor: Use store_id or Vendor_Store_id
      Vendor_Store_id = bodyVendorStoreId ?? store_id;
      
      if (Vendor_Store_id === undefined || Vendor_Store_id === null) {
        Vendor_Store_id = await getVendorStoreIdByAuth(req.userIdNumber);
      }

      if (!Vendor_Store_id) {
        return sendError(res, 'Unable to determine vendor store for authenticated user. Please provide store_id.', 400);
      }

      const storeExists = await ensureVendorStoreExists(Vendor_Store_id);
      if (!storeExists) {
        return sendError(res, 'Associated vendor store not found or inactive', 400);
      }
    } else if (isRestaurant) {
      // Restaurant: Use Branch_id or business_Branch_id
      business_Branch_id = bodyBusinessBranchId ?? Branch_id;
      
      if (business_Branch_id === undefined || business_Branch_id === null) {
        business_Branch_id = await getBusinessBranchIdByAuth(req.userIdNumber);
      }

      if (!business_Branch_id) {
        return sendError(res, 'Unable to determine business branch for authenticated user. Please provide Branch_id.', 400);
      }

      const branchExists = await ensureBranchExists(business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Associated business branch not found or inactive', 400);
      }
    } else {
      // If role is not determined, try to auto-detect from provided fields
      if (bodyVendorStoreId || store_id) {
        Vendor_Store_id = bodyVendorStoreId ?? store_id;
        const storeExists = await ensureVendorStoreExists(Vendor_Store_id);
        if (!storeExists) {
          return sendError(res, 'Associated vendor store not found or inactive', 400);
        }
      } else if (bodyBusinessBranchId || Branch_id) {
        business_Branch_id = bodyBusinessBranchId ?? Branch_id;
        const branchExists = await ensureBranchExists(business_Branch_id);
        if (!branchExists) {
          return sendError(res, 'Associated business branch not found or inactive', 400);
        }
      } else {
        // Try to auto-detect from auth
        const autoBranchId = await getBusinessBranchIdByAuth(req.userIdNumber);
        const autoStoreId = await getVendorStoreIdByAuth(req.userIdNumber);
        
        if (autoStoreId) {
          Vendor_Store_id = autoStoreId;
        } else if (autoBranchId) {
          business_Branch_id = autoBranchId;
        } else {
          return sendError(res, 'Unable to determine store or branch. Please provide store_id (for Vendor) or Branch_id (for Restaurant).', 400);
        }
      }
    }

    const payload = {
      ...req.body,
      business_Branch_id: business_Branch_id || undefined,
      Branch_id: business_Branch_id || Branch_id || undefined,
      Vendor_Store_id: Vendor_Store_id || undefined,
      ScheduleSend: normalizeBoolean(req.body.ScheduleSend, false),
      created_by: req.userIdNumber || null
    };

    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    const campaign = await MarketingEmailCampaign.create(payload);
    const populated = await populateEmailCampaign(campaign);

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
    const campaign = await findEmailCampaignByIdentifier(id);

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

    const populated = await populateEmailCampaign(campaign);
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

