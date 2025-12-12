const RecentAcitvitys = require('../models/RecentAcitvitys.model');
const Vendor_Store = require('../models/Vendor_Store.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureVendorStoreExists = async (Vender_store_id) => {
  if (Vender_store_id === undefined || Vender_store_id === null) {
    return false;
  }
  const vendorStore = await Vendor_Store.findOne({ Vendor_Store_id: Vender_store_id, Status: true });
  return !!vendorStore;
};

// Manual population function for Number refs
const populateRecentAcitvitys = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate Vender_store_id
      if (recordObj.Vender_store_id) {
        const storeId = typeof recordObj.Vender_store_id === 'object' ? recordObj.Vender_store_id : recordObj.Vender_store_id;
        const vendorStore = await Vendor_Store.findOne({ Vendor_Store_id: storeId })
          .select('Vendor_Store_id StoreName Address Status');
        if (vendorStore) {
          recordObj.Vender_store_id = vendorStore.toObject ? vendorStore.toObject() : vendorStore;
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

const buildFilter = ({ search, status, Vender_store_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { AcitivityText: { $regex: search, $options: 'i' } },
      { emozi: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Vender_store_id !== undefined) {
    const storeId = parseInt(Vender_store_id, 10);
    if (!Number.isNaN(storeId)) {
      filter.Vender_store_id = storeId;
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

const findByIdentifier = async (identifier) => {
  let recordData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    recordData = await RecentAcitvitys.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      recordData = await RecentAcitvitys.findOne({ RecentAcitvitys_id: numericId });
    }
  }

  if (!recordData) {
    return null;
  }

  return await populateRecentAcitvitys(recordData);
};

const createRecentAcitvitys = asyncHandler(async (req, res) => {
  try {
    const { Vender_store_id } = req.body;

    if (!(await ensureVendorStoreExists(Vender_store_id))) {
      return sendError(res, 'Vendor store not found or inactive', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const record = await RecentAcitvitys.create(payload);
    const populated = await populateRecentAcitvitys(record);

    sendSuccess(res, populated, 'Recent activity created successfully', 201);
  } catch (error) {
    console.error('Error creating recent activity', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllRecentAcitvitys = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Vender_store_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Vender_store_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [itemsData, total] = await Promise.all([
      RecentAcitvitys.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RecentAcitvitys.countDocuments(filter)
    ]);
    
    const items = await populateRecentAcitvitys(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Recent activities retrieved successfully');
  } catch (error) {
    console.error('Error retrieving recent activities', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getRecentAcitvitysById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const record = await findByIdentifier(id);

    if (!record) {
      return sendNotFound(res, 'Recent activity not found');
    }

    sendSuccess(res, record, 'Recent activity retrieved successfully');
  } catch (error) {
    console.error('Error retrieving recent activity', { error: error.message, id: req.params.id, stack: error.stack });
    throw error;
  }
});

const updateRecentAcitvitys = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Vender_store_id } = req.body;

    if (Vender_store_id !== undefined && !(await ensureVendorStoreExists(Vender_store_id))) {
      return sendError(res, 'Vendor store not found or inactive', 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let record;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await RecentAcitvitys.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid recent activity ID format', 400);
      }
      record = await RecentAcitvitys.findOneAndUpdate({ RecentAcitvitys_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!record) {
      return sendNotFound(res, 'Recent activity not found');
    }

    const populated = await populateRecentAcitvitys(record);
    sendSuccess(res, populated, 'Recent activity updated successfully');
  } catch (error) {
    console.error('Error updating recent activity', { error: error.message, id: req.params.id, stack: error.stack });
    throw error;
  }
});

const deleteRecentAcitvitys = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let record;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await RecentAcitvitys.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid recent activity ID format', 400);
      }
      record = await RecentAcitvitys.findOneAndUpdate({ RecentAcitvitys_id: numericId }, updatePayload, { new: true });
    }

    if (!record) {
      return sendNotFound(res, 'Recent activity not found');
    }

    sendSuccess(res, record, 'Recent activity deleted successfully');
  } catch (error) {
    console.error('Error deleting recent activity', { error: error.message, id: req.params.id, stack: error.stack });
    throw error;
  }
});

const getRecentAcitvitysByAuth = asyncHandler(async (req, res) => {
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
      Vender_store_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Vender_store_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [itemsData, total] = await Promise.all([
      RecentAcitvitys.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RecentAcitvitys.countDocuments(filter)
    ]);
    
    const items = await populateRecentAcitvitys(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Recent activities retrieved successfully');
  } catch (error) {
    console.error('Error retrieving recent activities by auth', { error: error.message, userId: req.userIdNumber, stack: error.stack });
    throw error;
  }
});

module.exports = {
  createRecentAcitvitys,
  getAllRecentAcitvitys,
  getRecentAcitvitysById,
  updateRecentAcitvitys,
  deleteRecentAcitvitys,
  getRecentAcitvitysByAuth
};
