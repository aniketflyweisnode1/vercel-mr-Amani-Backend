const Settings = require('../models/Restaurant_website_Settings.model');
const Business_Branch = require('../models/business_Branch.model');
const OurDomain = require('../models/Restaurant_website_OurDomain.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateSettings = (query) => query
  .populate('business_Branch_id', 'business_Branch_id firstName lastName BusinessName Address City state country')
  .populate('Restaurant_website_id', 'Restaurant_website_id websiteName subdomain')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, business_Branch_id, Restaurant_website_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { DeliveryType: { $regex: search, $options: 'i' } },
      { PaymentServiceStrip_AccountNo: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (business_Branch_id !== undefined) {
    const branchId = parseInt(business_Branch_id, 10);
    if (!Number.isNaN(branchId)) {
      filter.business_Branch_id = branchId;
    }
  }

  if (Restaurant_website_id !== undefined) {
    const websiteId = parseInt(Restaurant_website_id, 10);
    if (!Number.isNaN(websiteId)) {
      filter.Restaurant_website_id = websiteId;
    }
  }

  return filter;
};

const paginateMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

const ensureBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined) {
    return true;
  }

  const branchId = parseInt(business_Branch_id, 10);
  if (Number.isNaN(branchId)) {
    return false;
  }

  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return Boolean(branch);
};

const ensureWebsiteExists = async (Restaurant_website_id) => {
  if (Restaurant_website_id === undefined) {
    return true;
  }

  const websiteId = parseInt(Restaurant_website_id, 10);
  if (Number.isNaN(websiteId)) {
    return false;
  }

  const website = await OurDomain.findOne({ Restaurant_website_id: websiteId, Status: true });
  return Boolean(website);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateSettings(Settings.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateSettings(Settings.findOne({ Restaurant_website_Settings_id: numericId }));
  }

  return null;
};

const createSettings = asyncHandler(async (req, res) => {
  try {
    const {
      business_Branch_id,
      Restaurant_website_id
    } = req.body;

    const [branchExists, websiteExists] = await Promise.all([
      ensureBranchExists(business_Branch_id),
      ensureWebsiteExists(Restaurant_website_id)
    ]);

    if (!branchExists) {
      return sendError(res, 'Business branch not found', 400);
    }

    if (!websiteExists) {
      return sendError(res, 'Restaurant website not found', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const settings = await Settings.create(payload);
    const populated = await populateSettings(Settings.findById(settings._id));

    sendSuccess(res, populated, 'Restaurant website settings created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant website settings', { error: error.message });
    throw error;
  }
});

const getAllSettings = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      Restaurant_website_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Restaurant_website_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateSettings(Settings.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Settings.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant website settings retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant website settings', { error: error.message });
    throw error;
  }
});

const getSettingsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const query = findByIdentifier(id);

    if (!query) {
      return sendError(res, 'Invalid settings identifier', 400);
    }

    const settings = await query;

    if (!settings) {
      return sendNotFound(res, 'Restaurant website settings not found');
    }

    sendSuccess(res, settings, 'Restaurant website settings retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant website settings', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateSettings = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      business_Branch_id,
      Restaurant_website_id
    } = req.body;

    const [branchExists, websiteExists] = await Promise.all([
      ensureBranchExists(business_Branch_id),
      ensureWebsiteExists(Restaurant_website_id)
    ]);

    if (business_Branch_id !== undefined && !branchExists) {
      return sendError(res, 'Business branch not found', 400);
    }

    if (Restaurant_website_id !== undefined && !websiteExists) {
      return sendError(res, 'Restaurant website not found', 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let settings;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      settings = await Settings.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid settings ID format', 400);
      }
      settings = await Settings.findOneAndUpdate({ Restaurant_website_Settings_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!settings) {
      return sendNotFound(res, 'Restaurant website settings not found');
    }

    const populated = await populateSettings(Settings.findById(settings._id));
    sendSuccess(res, populated, 'Restaurant website settings updated successfully');
  } catch (error) {
    console.error('Error updating restaurant website settings', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteSettings = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let settings;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      settings = await Settings.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid settings ID format', 400);
      }
      settings = await Settings.findOneAndUpdate({ Restaurant_website_Settings_id: numericId }, updatePayload, { new: true });
    }

    if (!settings) {
      return sendNotFound(res, 'Restaurant website settings not found');
    }

    sendSuccess(res, settings, 'Restaurant website settings deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant website settings', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getSettingsByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      Restaurant_website_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Restaurant_website_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateSettings(Settings.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Settings.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant website settings retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant website settings by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createSettings,
  getAllSettings,
  getSettingsById,
  updateSettings,
  deleteSettings,
  getSettingsByAuth
};


