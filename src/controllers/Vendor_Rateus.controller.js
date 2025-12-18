const VendorRateus = require('../models/Vendor_Rateus.model');
const VendorStore = require('../models/Vendor_Store.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateVendorRateus = async (records) => {
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

const buildFilter = ({ search, status, Vendor_Store_id, YourFeel }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Feedback: { $regex: search, $options: 'i' } }
    ];
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

  if (YourFeel && YourFeel.status) {
    filter['YourFeel.status'] = YourFeel.status;
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

const findByIdentifier = async (identifier) => {
  let rateusData;

  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    rateusData = await VendorRateus.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      rateusData = await VendorRateus.findOne({ Vendor_Rateus_id: numericId });
    }
  }

  if (!rateusData) {
    return null;
  }

  return await populateVendorRateus(rateusData);
};

const createVendorRateus = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Store_id } = req.body;
    if (!(await ensureStoreExists(Vendor_Store_id))) {
      return sendError(res, 'Vendor store not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const rateus = await VendorRateus.create(payload);
    const populated = await populateVendorRateus(rateus);
    sendSuccess(res, populated, 'Vendor rate us created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor rate us', { error: error.message });
    throw error;
  }
});

const getAllVendorRateuses = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Vendor_Store_id,
      YourFeel,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Vendor_Store_id, YourFeel });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [rateusesData, total] = await Promise.all([
      VendorRateus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorRateus.countDocuments(filter)
    ]);

    const rateuses = await populateVendorRateus(rateusesData);
    sendPaginated(res, rateuses, paginateMeta(numericPage, numericLimit, total), 'Vendor rate us records retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor rate us records', { error: error.message });
    throw error;
  }
});

const getVendorRateusById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const rateus = await findByIdentifier(id);
    if (!rateus) {
      return sendNotFound(res, 'Vendor rate us not found');
    }
    sendSuccess(res, rateus, 'Vendor rate us retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor rate us', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorRateus = asyncHandler(async (req, res) => {
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
    let rateus;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      rateus = await VendorRateus.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor rate us ID format', 400);
      }
      rateus = await VendorRateus.findOneAndUpdate({ Vendor_Rateus_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!rateus) {
      return sendNotFound(res, 'Vendor rate us not found');
    }
    const populated = await populateVendorRateus(rateus);
    sendSuccess(res, populated, 'Vendor rate us updated successfully');
  } catch (error) {
    console.error('Error updating vendor rate us', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorRateus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let rateus;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      rateus = await VendorRateus.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor rate us ID format', 400);
      }
      rateus = await VendorRateus.findOneAndUpdate({ Vendor_Rateus_id: numericId }, updatePayload, { new: true });
    }
    if (!rateus) {
      return sendNotFound(res, 'Vendor rate us not found');
    }
    sendSuccess(res, rateus, 'Vendor rate us deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor rate us', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorRateusesByFeel = asyncHandler(async (req, res) => {
  try {
    const { feel } = req.params;
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

    const filter = buildFilter({
      search,
      status,
      Vendor_Store_id,
      YourFeel: { status: feel }
    });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [rateusesData, total] = await Promise.all([
      VendorRateus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorRateus.countDocuments(filter)
    ]);

    const rateuses = await populateVendorRateus(rateusesData);
    sendPaginated(res, rateuses, paginateMeta(numericPage, numericLimit, total), 'Vendor rate us records retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor rate us records by feel', { error: error.message, feel: req.params.feel });
    throw error;
  }
});

const getVendorRateusesByStoreId = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Store_id } = req.params;
    const storeId = parseInt(Vendor_Store_id, 10);

    if (Number.isNaN(storeId)) {
      return sendError(res, 'Invalid vendor store ID format', 400);
    }

    if (!(await ensureStoreExists(storeId))) {
      return sendNotFound(res, 'Vendor store not found');
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({
      search,
      status,
      Vendor_Store_id: storeId
    });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [rateusesData, total] = await Promise.all([
      VendorRateus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorRateus.countDocuments(filter)
    ]);

    const rateuses = await populateVendorRateus(rateusesData);
    sendPaginated(res, rateuses, paginateMeta(numericPage, numericLimit, total), 'Vendor rate us records retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor rate us records by store ID', { error: error.message, Vendor_Store_id: req.params.Vendor_Store_id });
    throw error;
  }
});

const getVendorRateusesByAuth = asyncHandler(async (req, res) => {
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

    const filter = buildFilter({
      search,
      status,
      Vendor_Store_id
    });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [rateusesData, total] = await Promise.all([
      VendorRateus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorRateus.countDocuments(filter)
    ]);

    const rateuses = await populateVendorRateus(rateusesData);
    sendPaginated(res, rateuses, paginateMeta(numericPage, numericLimit, total), 'Vendor rate us records retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor rate us records by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createVendorRateus,
  getAllVendorRateuses,
  getVendorRateusById,
  updateVendorRateus,
  deleteVendorRateus,
  getVendorRateusesByFeel,
  getVendorRateusesByStoreId,
  getVendorRateusesByAuth
};


