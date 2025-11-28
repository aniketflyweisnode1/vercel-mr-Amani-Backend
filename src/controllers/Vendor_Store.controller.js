const VendorStore = require('../models/Vendor_Store.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateVendorStore = (query) => query
  .populate('user_id', 'user_id firstName lastName phoneNo BusinessName Email')
  .populate('created_by', 'user_id firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'user_id firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, user_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { StoreName: { $regex: search, $options: 'i' } },
      { StoreAddress: { $regex: search, $options: 'i' } },
      { EmailAddress: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } },
      { mobileno: { $regex: search, $options: 'i' } },
      { StoreNumber: { $regex: search, $options: 'i' } },
      { KYC_BusinessLicenceNo: { $regex: search, $options: 'i' } },
      { KYC_EINNo: { $regex: search, $options: 'i' } },
      { LocationName: { $regex: search, $options: 'i' } },
      { StreetNo: { $regex: search, $options: 'i' } },
      { StreetName: { $regex: search, $options: 'i' } },
      { City: { $regex: search, $options: 'i' } },
      { Country: { $regex: search, $options: 'i' } },
      { State: { $regex: search, $options: 'i' } },
      { ZipCode: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (user_id !== undefined) {
    const userId = parseInt(user_id, 10);
    if (!Number.isNaN(userId)) {
      filter.user_id = userId;
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

const ensureUserExists = async (user_id) => {
  if (user_id === undefined) {
    return true;
  }
  const userId = parseInt(user_id, 10);
  if (Number.isNaN(userId)) {
    return false;
  }
  const user = await User.findOne({ user_id: userId, status: true });
  return Boolean(user);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateVendorStore(VendorStore.findById(identifier));
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateVendorStore(VendorStore.findOne({ Vendor_Store_id: numericId }));
  }
  return null;
};

const createVendorStore = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!(await ensureUserExists(user_id))) {
      return sendError(res, 'User not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const vendorStore = await VendorStore.create(payload);
    const populated = await populateVendorStore(VendorStore.findById(vendorStore._id));
    sendSuccess(res, populated, 'Vendor store created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor store', { error: error.message });
    throw error;
  }
});

const getAllVendorStores = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [vendorStores, total] = await Promise.all([
      populateVendorStore(VendorStore.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorStore.countDocuments(filter)
    ]);
    sendPaginated(res, vendorStores, paginateMeta(numericPage, numericLimit, total), 'Vendor stores retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor stores', { error: error.message });
    throw error;
  }
});

const getVendorStoreById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const vendorStoreQuery = findByIdentifier(id);
    if (!vendorStoreQuery) {
      return sendError(res, 'Invalid vendor store identifier', 400);
    }
    const vendorStore = await vendorStoreQuery;
    if (!vendorStore) {
      return sendNotFound(res, 'Vendor store not found');
    }
    sendSuccess(res, vendorStore, 'Vendor store retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor store', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorStore = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    if (user_id !== undefined && !(await ensureUserExists(user_id))) {
      return sendError(res, 'User not found', 400);
    }
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let vendorStore;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      vendorStore = await VendorStore.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor store ID format', 400);
      }
      vendorStore = await VendorStore.findOneAndUpdate({ Vendor_Store_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!vendorStore) {
      return sendNotFound(res, 'Vendor store not found');
    }
    const populated = await populateVendorStore(VendorStore.findById(vendorStore._id));
    sendSuccess(res, populated, 'Vendor store updated successfully');
  } catch (error) {
    console.error('Error updating vendor store', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorStore = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let vendorStore;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      vendorStore = await VendorStore.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor store ID format', 400);
      }
      vendorStore = await VendorStore.findOneAndUpdate({ Vendor_Store_id: numericId }, updatePayload, { new: true });
    }
    if (!vendorStore) {
      return sendNotFound(res, 'Vendor store not found');
    }
    sendSuccess(res, vendorStore, 'Vendor store deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor store', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorStoresByAuth = asyncHandler(async (req, res) => {
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
      user_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id });
    filter.created_by = userId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [vendorStores, total] = await Promise.all([
      populateVendorStore(VendorStore.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorStore.countDocuments(filter)
    ]);
    sendPaginated(res, vendorStores, paginateMeta(numericPage, numericLimit, total), 'Vendor stores retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor stores by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createVendorStore,
  getAllVendorStores,
  getVendorStoreById,
  updateVendorStore,
  deleteVendorStore,
  getVendorStoresByAuth
};

