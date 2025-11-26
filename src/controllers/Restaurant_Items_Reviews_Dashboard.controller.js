const ReviewsDashboard = require('../models/Restaurant_Items_Reviews_Dashboard.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateDashboard = (query) => query
  .populate('business_Branch_id', 'business_Branch_id firstName lastName BusinessName Address City state country')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, business_Branch_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { OverallRating: Number(search) || undefined },
      { business_Branch_id: Number(search) || undefined }
    ].filter(Boolean);
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

const findDashboardByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateDashboard(ReviewsDashboard.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateDashboard(ReviewsDashboard.findOne({ Restaurant_Items_Reviews_Dashboard_id: numericId }));
  }

  return null;
};

const createDashboard = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.body;

    if (!(await ensureBranchExists(business_Branch_id))) {
      return sendError(res, 'Business branch not found', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const dashboard = await ReviewsDashboard.create(payload);
    const populated = await populateDashboard(ReviewsDashboard.findById(dashboard._id));

    sendSuccess(res, populated, 'Restaurant item reviews dashboard created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant item reviews dashboard', { error: error.message });
    throw error;
  }
});

const getAllDashboards = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateDashboard(ReviewsDashboard.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ReviewsDashboard.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant item reviews dashboards retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item reviews dashboards', { error: error.message });
    throw error;
  }
});

const getDashboardById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const query = findDashboardByIdentifier(id);

    if (!query) {
      return sendError(res, 'Invalid dashboard identifier', 400);
    }

    const dashboard = await query;

    if (!dashboard) {
      return sendNotFound(res, 'Restaurant item reviews dashboard not found');
    }

    sendSuccess(res, dashboard, 'Restaurant item reviews dashboard retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item reviews dashboard', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateDashboard = asyncHandler(async (req, res) => {
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

    let dashboard;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      dashboard = await ReviewsDashboard.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid dashboard ID format', 400);
      }
      dashboard = await ReviewsDashboard.findOneAndUpdate({ Restaurant_Items_Reviews_Dashboard_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!dashboard) {
      return sendNotFound(res, 'Restaurant item reviews dashboard not found');
    }

    const populated = await populateDashboard(ReviewsDashboard.findById(dashboard._id));
    sendSuccess(res, populated, 'Restaurant item reviews dashboard updated successfully');
  } catch (error) {
    console.error('Error updating restaurant item reviews dashboard', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteDashboard = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let dashboard;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      dashboard = await ReviewsDashboard.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid dashboard ID format', 400);
      }
      dashboard = await ReviewsDashboard.findOneAndUpdate({ Restaurant_Items_Reviews_Dashboard_id: numericId }, updatePayload, { new: true });
    }

    if (!dashboard) {
      return sendNotFound(res, 'Restaurant item reviews dashboard not found');
    }

    sendSuccess(res, dashboard, 'Restaurant item reviews dashboard deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant item reviews dashboard', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getDashboardsByAuth = asyncHandler(async (req, res) => {
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
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateDashboard(ReviewsDashboard.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ReviewsDashboard.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant item reviews dashboards retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item reviews dashboards by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getDashboardByBranchId = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.params;
    const branchId = parseInt(business_Branch_id, 10);

    if (Number.isNaN(branchId)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }

    if (!(await ensureBranchExists(branchId))) {
      return sendNotFound(res, 'Business branch not found');
    }

    const dashboard = await populateDashboard(ReviewsDashboard.findOne({ business_Branch_id: branchId, Status: true }));

    if (!dashboard) {
      return sendNotFound(res, 'Restaurant item reviews dashboard not found');
    }

    sendSuccess(res, dashboard, 'Restaurant item reviews dashboard retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item reviews dashboard by branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createDashboard,
  getAllDashboards,
  getDashboardById,
  updateDashboard,
  deleteDashboard,
  getDashboardsByAuth,
  getDashboardByBranchId
};


