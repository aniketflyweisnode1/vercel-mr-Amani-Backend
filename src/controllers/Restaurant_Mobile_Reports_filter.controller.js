const ReportsFilter = require('../models/Restaurant_Mobile_Reports_filter.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateReportsFilter = (query) => query
  .populate('business_Branch_id', 'business_Branch_id firstName lastName BusinessName Address City state country')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, business_Branch_id, ReportsFor, ReportsType, StartDate, EndDate, DayofWeek, providers, BrackdownbyBrand, BrackownByBranches }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { ReportsFor: { $regex: search, $options: 'i' } },
      { ReportsType: { $regex: search, $options: 'i' } },
      { providers: { $regex: search, $options: 'i' } }
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

  if (ReportsFor) {
    filter.ReportsFor = { $regex: ReportsFor, $options: 'i' };
  }

  if (ReportsType) {
    filter.ReportsType = { $regex: ReportsType, $options: 'i' };
  }

  if (StartDate) {
    filter.StartDate = { $gte: new Date(StartDate) };
  }

  if (EndDate) {
    filter.EndDate = { $lte: new Date(EndDate) };
  }

  if (DayofWeek) {
    filter.DayofWeek = { $regex: DayofWeek, $options: 'i' };
  }

  if (providers) {
    filter.providers = { $regex: providers, $options: 'i' };
  }

  if (BrackdownbyBrand !== undefined) {
    filter.BrackdownbyBrand = BrackdownbyBrand === 'true' || BrackdownbyBrand === true;
  }

  if (BrackownByBranches !== undefined) {
    filter.BrackownByBranches = BrackownByBranches === 'true' || BrackownByBranches === true;
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

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateReportsFilter(ReportsFilter.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateReportsFilter(ReportsFilter.findOne({ Restaurant_Mobile_Reports_id: numericId }));
  }

  return null;
};

const createReportsFilter = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.body;

    if (!(await ensureBranchExists(business_Branch_id))) {
      return sendError(res, 'Business branch not found', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const reportsFilter = await ReportsFilter.create(payload);
    const populated = await populateReportsFilter(ReportsFilter.findById(reportsFilter._id));

    sendSuccess(res, populated, 'Restaurant mobile reports filter created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant mobile reports filter', { error: error.message });
    throw error;
  }
});

const getAllReportsFilters = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      ReportsFor,
      ReportsType,
      StartDate,
      EndDate,
      DayofWeek,
      providers,
      BrackdownbyBrand,
      BrackownByBranches,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, ReportsFor, ReportsType, StartDate, EndDate, DayofWeek, providers, BrackdownbyBrand, BrackownByBranches });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reportsFilters, total] = await Promise.all([
      populateReportsFilter(ReportsFilter.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ReportsFilter.countDocuments(filter)
    ]);

    sendPaginated(res, reportsFilters, paginateMeta(numericPage, numericLimit, total), 'Restaurant mobile reports filters retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant mobile reports filters', { error: error.message });
    throw error;
  }
});

const getReportsFilterById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const reportsFilterQuery = findByIdentifier(id);

    if (!reportsFilterQuery) {
      return sendError(res, 'Invalid reports filter identifier', 400);
    }

    const reportsFilter = await reportsFilterQuery;

    if (!reportsFilter) {
      return sendNotFound(res, 'Restaurant mobile reports filter not found');
    }

    sendSuccess(res, reportsFilter, 'Restaurant mobile reports filter retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant mobile reports filter', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateReportsFilter = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { business_Branch_id } = req.body;

    if (business_Branch_id !== undefined && !(await ensureBranchExists(business_Branch_id))) {
      return sendError(res, 'Business branch not found', 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let reportsFilter;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reportsFilter = await ReportsFilter.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid reports filter ID format', 400);
      }
      reportsFilter = await ReportsFilter.findOneAndUpdate({ Restaurant_Mobile_Reports_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!reportsFilter) {
      return sendNotFound(res, 'Restaurant mobile reports filter not found');
    }

    const populated = await populateReportsFilter(ReportsFilter.findById(reportsFilter._id));
    sendSuccess(res, populated, 'Restaurant mobile reports filter updated successfully');
  } catch (error) {
    console.error('Error updating restaurant mobile reports filter', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteReportsFilter = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let reportsFilter;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reportsFilter = await ReportsFilter.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid reports filter ID format', 400);
      }
      reportsFilter = await ReportsFilter.findOneAndUpdate({ Restaurant_Mobile_Reports_id: numericId }, updatePayload, { new: true });
    }

    if (!reportsFilter) {
      return sendNotFound(res, 'Restaurant mobile reports filter not found');
    }

    sendSuccess(res, reportsFilter, 'Restaurant mobile reports filter deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant mobile reports filter', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getReportsFiltersByAuth = asyncHandler(async (req, res) => {
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
      ReportsFor,
      ReportsType,
      StartDate,
      EndDate,
      DayofWeek,
      providers,
      BrackdownbyBrand,
      BrackownByBranches,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, ReportsFor, ReportsType, StartDate, EndDate, DayofWeek, providers, BrackdownbyBrand, BrackownByBranches });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reportsFilters, total] = await Promise.all([
      populateReportsFilter(ReportsFilter.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ReportsFilter.countDocuments(filter)
    ]);

    sendPaginated(res, reportsFilters, paginateMeta(numericPage, numericLimit, total), 'Restaurant mobile reports filters retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant mobile reports filters by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getAllReportsFiltersByFilter = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      ReportsFor,
      ReportsType,
      StartDate,
      EndDate,
      DayofWeek,
      providers,
      BrackdownbyBrand,
      BrackownByBranches,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, ReportsFor, ReportsType, StartDate, EndDate, DayofWeek, providers, BrackdownbyBrand, BrackownByBranches });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reportsFilters, total] = await Promise.all([
      populateReportsFilter(ReportsFilter.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ReportsFilter.countDocuments(filter)
    ]);

    sendPaginated(res, reportsFilters, paginateMeta(numericPage, numericLimit, total), 'Restaurant mobile reports filters retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant mobile reports filters by filter', { error: error.message });
    throw error;
  }
});

module.exports = {
  createReportsFilter,
  getAllReportsFilters,
  getReportsFilterById,
  updateReportsFilter,
  deleteReportsFilter,
  getReportsFiltersByAuth,
  getAllReportsFiltersByFilter
};

