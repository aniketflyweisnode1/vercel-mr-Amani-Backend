const ReviewsDashboard = require('../models/Vendor_Items_Reviews_Dashboard.model');
const VendorStore = require('../models/Vendor_Store.model');
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
      
      // Populate Vendor_Store_id
      if (recordObj.Vendor_Store_id) {
        const storeId = typeof recordObj.Vendor_Store_id === 'object' ? recordObj.Vendor_Store_id : recordObj.Vendor_Store_id;
        const store = await VendorStore.findOne({ Vendor_Store_id: storeId })
          .select('Vendor_Store_id StoreName StoreAddress City State Country EmailAddress mobileno');
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

const buildFilter = ({ search, status, Vendor_Store_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { OverallRating: Number(search) || undefined },
      { Vendor_Store_id: Number(search) || undefined }
    ].filter(Boolean);
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Vendor_Store_id !== undefined) {
    const storeId = parseInt(Vendor_Store_id, 10);
    if (!Number.isNaN(storeId)) {
      filter.Vendor_Store_id = storeId;
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

const ensureStoreExists = async (Vendor_Store_id) => {
  if (Vendor_Store_id === undefined) {
    return true;
  }

  const storeId = parseInt(Vendor_Store_id, 10);
  if (Number.isNaN(storeId)) {
    return false;
  }

  const store = await VendorStore.findOne({ Vendor_Store_id: storeId, Status: true });
  return Boolean(store);
};

const findDashboardByIdentifier = async (identifier) => {
  let recordData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    recordData = await ReviewsDashboard.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      recordData = await ReviewsDashboard.findOne({ Vendor_Items_Reviews_Dashboard_id: numericId });
    }
  }

  if (!recordData) {
    return null;
  }

  return await populateDashboard(recordData);
};

const createDashboard = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Store_id } = req.body;

    if (!(await ensureStoreExists(Vendor_Store_id))) {
      return sendError(res, 'Vendor store not found', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const dashboard = await ReviewsDashboard.create(payload);
    const populated = await populateDashboard(dashboard);

    sendSuccess(res, populated, 'Vendor item reviews dashboard created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor item reviews dashboard', { error: error.message });
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
      Vendor_Store_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Vendor_Store_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get all dashboards matching the filter (not just paginated ones) for aggregation
    const allDashboardsForAggregation = await ReviewsDashboard.find(filter).lean();

    // Calculate aggregate counts from all matching dashboards
    const VendorReviews = allDashboardsForAggregation.reduce((acc, dashboard) => {
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

    // Prepare response with VendorReviews aggregate and dashboard list
    const responseData = {
      VendorReviews: {
        OverallRating: VendorReviews.OverallRating,
        ExcellentCount: VendorReviews.ExcellentCount,
        GoodCount: VendorReviews.GoodCount,
        AverageCount: VendorReviews.AverageCount,
        PoorCount: VendorReviews.PoorCount
      },
      dashboards: items
    };

    const pagination = paginateMeta(numericPage, numericLimit, total);
    
    console.info('Vendor item reviews dashboards retrieved successfully', { 
      total, 
      page: numericPage,
      VendorReviews 
    });
    
    sendPaginated(res, responseData, pagination, 'Vendor item reviews dashboards retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor item reviews dashboards', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getDashboardById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const dashboard = await findDashboardByIdentifier(id);

    if (!dashboard) {
      return sendNotFound(res, 'Vendor item reviews dashboard not found');
    }

    sendSuccess(res, dashboard, 'Vendor item reviews dashboard retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor item reviews dashboard', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateDashboard = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Vendor_Store_id } = req.body;

    if (Vendor_Store_id !== undefined && !(await ensureStoreExists(Vendor_Store_id))) {
      return sendError(res, 'Vendor store not found', 400);
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
      dashboard = await ReviewsDashboard.findOneAndUpdate({ Vendor_Items_Reviews_Dashboard_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!dashboard) {
      return sendNotFound(res, 'Vendor item reviews dashboard not found');
    }

    const populated = await populateDashboard(dashboard);
    sendSuccess(res, populated, 'Vendor item reviews dashboard updated successfully');
  } catch (error) {
    console.error('Error updating vendor item reviews dashboard', { error: error.message, id: req.params.id });
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
      dashboard = await ReviewsDashboard.findOneAndUpdate({ Vendor_Items_Reviews_Dashboard_id: numericId }, updatePayload, { new: true });
    }

    if (!dashboard) {
      return sendNotFound(res, 'Vendor item reviews dashboard not found');
    }

    sendSuccess(res, dashboard, 'Vendor item reviews dashboard deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor item reviews dashboard', { error: error.message, id: req.params.id });
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
      Vendor_Store_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Vendor_Store_id });
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

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Vendor item reviews dashboards retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor item reviews dashboards by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getDashboardByStoreId = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Store_id } = req.params;
    const storeId = parseInt(Vendor_Store_id, 10);

    if (Number.isNaN(storeId)) {
      return sendError(res, 'Invalid vendor store ID format', 400);
    }

    if (!(await ensureStoreExists(storeId))) {
      return sendNotFound(res, 'Vendor store not found');
    }

    const dashboardData = await ReviewsDashboard.findOne({ Vendor_Store_id: storeId, Status: true });
    
    if (!dashboardData) {
      return sendNotFound(res, 'Vendor item reviews dashboard not found');
    }
    
    const dashboard = await populateDashboard(dashboardData);

    sendSuccess(res, dashboard, 'Vendor item reviews dashboard retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor item reviews dashboard by store ID', { error: error.message, Vendor_Store_id: req.params.Vendor_Store_id });
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
  getDashboardByStoreId
};

