const ReviewsDashboard = require('../models/Restaurant_Items_Reviews_Dashboard.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateDashboard = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate business_Branch_id
      if (recordObj.business_Branch_id) {
        const branchId = typeof recordObj.business_Branch_id === 'object' ? recordObj.business_Branch_id : recordObj.business_Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id firstName lastName BusinessName Address City state country');
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

const findDashboardByIdentifier = async (identifier) => {
  let recordData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    recordData = await ReviewsDashboard.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      recordData = await ReviewsDashboard.findOne({ Restaurant_Items_Reviews_Dashboard_id: numericId });
    }
  }

  if (!recordData) {
    return null;
  }

  return await populateDashboard(recordData);
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
    const populated = await populateDashboard(dashboard);

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

    // Get all dashboards matching the filter (not just paginated ones) for aggregation
    const allDashboardsForAggregation = await ReviewsDashboard.find(filter).lean();

    // Calculate aggregate counts from all matching dashboards
    const RestaurantReviews = allDashboardsForAggregation.reduce((acc, dashboard) => {
      acc.OverallRating = (acc.OverallRating || 0) + (dashboard.OverallRating || 0);
      acc.ExcellentCount = (acc.ExcellentCount || 0) + (dashboard.ExcellentCount || 0);
      acc.GoodCount = (acc.GoodCount || 0) + (dashboard.GoodCount || 0);
      acc.AverageCount = (acc.AverageCount || 0) + (dashboard.AverageCount || 0);
      acc.PoorCount = (acc.PoorCount || 0) + (dashboard.PoorCount || 0);
      return acc;
    }, {
      OverallRating: 0,
      ExcellentCount: 0,
      GoodCount: 0,
      AverageCount: 0,
      PoorCount: 0
    });

    // Get paginated dashboards
    const [itemsData, total] = await Promise.all([
      ReviewsDashboard.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ReviewsDashboard.countDocuments(filter)
    ]);
    
    const items = await populateDashboard(itemsData);

    // Prepare response with RestaurantReviews aggregate and dashboard list
    const responseData = {
      RestaurantReviews: {
        OverallRating: RestaurantReviews.OverallRating,
        ExcellentCount: RestaurantReviews.ExcellentCount,
        GoodCount: RestaurantReviews.GoodCount,
        AverageCount: RestaurantReviews.AverageCount,
        PoorCount: RestaurantReviews.PoorCount
      },
      dashboards: items
    };

    const pagination = paginateMeta(numericPage, numericLimit, total);
    
    console.info('Restaurant item reviews dashboards retrieved successfully', { 
      total, 
      page: numericPage,
      RestaurantReviews 
    });
    
    sendPaginated(res, responseData, pagination, 'Restaurant item reviews dashboards retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item reviews dashboards', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getDashboardById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const dashboard = await findDashboardByIdentifier(id);

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

    const populated = await populateDashboard(dashboard);
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

    const [itemsData, total] = await Promise.all([
      ReviewsDashboard.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ReviewsDashboard.countDocuments(filter)
    ]);
    
    const items = await populateDashboard(itemsData);

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

    const dashboardData = await ReviewsDashboard.findOne({ business_Branch_id: branchId, Status: true });
    
    if (!dashboardData) {
      return sendNotFound(res, 'Restaurant item reviews dashboard not found');
    }
    
    const dashboard = await populateDashboard(dashboardData);

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


