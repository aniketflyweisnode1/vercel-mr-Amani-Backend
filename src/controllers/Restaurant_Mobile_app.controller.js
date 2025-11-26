const MobileApp = require('../models/Restaurant_Mobile_app.model');
const Business_Branch = require('../models/business_Branch.model');
const Country = require('../models/country.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateMobileApp = (query) => query
  .populate('business_Branch_id', 'business_Branch_id firstName lastName BusinessName Address City state country')
  .populate('user_id', 'firstName lastName phoneNo BusinessName Email')
  .populate('Country_id', 'country_id name isoCode code2 code3')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, business_Branch_id, user_id, Country_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { WantMobileApp: { $regex: search, $options: 'i' } }
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

  if (user_id !== undefined) {
    const userId = parseInt(user_id, 10);
    if (!Number.isNaN(userId)) {
      filter.user_id = userId;
    }
  }

  if (Country_id !== undefined) {
    const countryId = parseInt(Country_id, 10);
    if (!Number.isNaN(countryId)) {
      filter.Country_id = countryId;
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

const ensureCountryExists = async (Country_id) => {
  if (Country_id === undefined || Country_id === null) {
    return true;
  }
  const countryId = parseInt(Country_id, 10);
  if (Number.isNaN(countryId)) {
    return false;
  }
  const country = await Country.findOne({ country_id: countryId });
  return Boolean(country);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateMobileApp(MobileApp.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateMobileApp(MobileApp.findOne({ Restaurant_Mobile_app_id: numericId }));
  }

  return null;
};

const createMobileApp = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id, Country_id } = req.body;

    const [branchExists, countryExists] = await Promise.all([
      ensureBranchExists(business_Branch_id),
      ensureCountryExists(Country_id)
    ]);

    if (!branchExists) {
      return sendError(res, 'Business branch not found', 400);
    }

    if (!countryExists) {
      return sendError(res, 'Country not found', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const mobileApp = await MobileApp.create(payload);
    const populated = await populateMobileApp(MobileApp.findById(mobileApp._id));

    sendSuccess(res, populated, 'Restaurant mobile app created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant mobile app', { error: error.message });
    throw error;
  }
});

const getAllMobileApps = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      user_id,
      Country_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, user_id, Country_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [mobileApps, total] = await Promise.all([
      populateMobileApp(MobileApp.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      MobileApp.countDocuments(filter)
    ]);

    sendPaginated(res, mobileApps, paginateMeta(numericPage, numericLimit, total), 'Restaurant mobile apps retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant mobile apps', { error: error.message });
    throw error;
  }
});

const getMobileAppById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const mobileAppQuery = findByIdentifier(id);

    if (!mobileAppQuery) {
      return sendError(res, 'Invalid mobile app identifier', 400);
    }

    const mobileApp = await mobileAppQuery;

    if (!mobileApp) {
      return sendNotFound(res, 'Restaurant mobile app not found');
    }

    sendSuccess(res, mobileApp, 'Restaurant mobile app retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant mobile app', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateMobileApp = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { business_Branch_id, Country_id } = req.body;

    const [branchExists, countryExists] = await Promise.all([
      ensureBranchExists(business_Branch_id),
      ensureCountryExists(Country_id)
    ]);

    if (business_Branch_id !== undefined && !branchExists) {
      return sendError(res, 'Business branch not found', 400);
    }

    if (Country_id !== undefined && !countryExists) {
      return sendError(res, 'Country not found', 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let mobileApp;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      mobileApp = await MobileApp.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid mobile app ID format', 400);
      }
      mobileApp = await MobileApp.findOneAndUpdate({ Restaurant_Mobile_app_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!mobileApp) {
      return sendNotFound(res, 'Restaurant mobile app not found');
    }

    const populated = await populateMobileApp(MobileApp.findById(mobileApp._id));
    sendSuccess(res, populated, 'Restaurant mobile app updated successfully');
  } catch (error) {
    console.error('Error updating restaurant mobile app', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteMobileApp = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let mobileApp;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      mobileApp = await MobileApp.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid mobile app ID format', 400);
      }
      mobileApp = await MobileApp.findOneAndUpdate({ Restaurant_Mobile_app_id: numericId }, updatePayload, { new: true });
    }

    if (!mobileApp) {
      return sendNotFound(res, 'Restaurant mobile app not found');
    }

    sendSuccess(res, mobileApp, 'Restaurant mobile app deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant mobile app', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getMobileAppsByAuth = asyncHandler(async (req, res) => {
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
      Country_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Country_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [mobileApps, total] = await Promise.all([
      populateMobileApp(MobileApp.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      MobileApp.countDocuments(filter)
    ]);

    sendPaginated(res, mobileApps, paginateMeta(numericPage, numericLimit, total), 'Restaurant mobile apps retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant mobile apps by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getMobileAppsByBranchId = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.params;
    const branchId = parseInt(business_Branch_id, 10);

    if (Number.isNaN(branchId)) {
      return sendError(res, 'Invalid business branch ID format', 400);
    }

    if (!(await ensureBranchExists(branchId))) {
      return sendNotFound(res, 'Business branch not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status });
    filter.business_Branch_id = branchId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [mobileApps, total] = await Promise.all([
      populateMobileApp(MobileApp.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      MobileApp.countDocuments(filter)
    ]);

    sendPaginated(res, mobileApps, paginateMeta(numericPage, numericLimit, total), 'Restaurant mobile apps retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant mobile apps by branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createMobileApp,
  getAllMobileApps,
  getMobileAppById,
  updateMobileApp,
  deleteMobileApp,
  getMobileAppsByAuth,
  getMobileAppsByBranchId
};

