const VendorBank = require('../models/Vendor_Bank.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateVendorBank = (query) => query
  .populate('user_id', 'user_id firstName lastName phoneNo BusinessName Email')
  .populate('created_by', 'user_id firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'user_id firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, user_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { BankName: { $regex: search, $options: 'i' } },
      { AccountNo: { $regex: search, $options: 'i' } },
      { AccountHolderName: { $regex: search, $options: 'i' } },
      { RoutingNo: { $regex: search, $options: 'i' } }
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
    return populateVendorBank(VendorBank.findById(identifier));
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateVendorBank(VendorBank.findOne({ Vendor_Bank_id: numericId }));
  }
  return null;
};

const createVendorBank = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!(await ensureUserExists(user_id))) {
      return sendError(res, 'User not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const vendorBank = await VendorBank.create(payload);
    const populated = await populateVendorBank(VendorBank.findById(vendorBank._id));
    sendSuccess(res, populated, 'Vendor bank created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor bank', { error: error.message });
    throw error;
  }
});

const getAllVendorBanks = asyncHandler(async (req, res) => {
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
    const [vendorBanks, total] = await Promise.all([
      populateVendorBank(VendorBank.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorBank.countDocuments(filter)
    ]);
    sendPaginated(res, vendorBanks, paginateMeta(numericPage, numericLimit, total), 'Vendor banks retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor banks', { error: error.message });
    throw error;
  }
});

const getVendorBankById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const vendorBankQuery = findByIdentifier(id);
    if (!vendorBankQuery) {
      return sendError(res, 'Invalid vendor bank identifier', 400);
    }
    const vendorBank = await vendorBankQuery;
    if (!vendorBank) {
      return sendNotFound(res, 'Vendor bank not found');
    }
    sendSuccess(res, vendorBank, 'Vendor bank retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor bank', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorBank = asyncHandler(async (req, res) => {
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
    let vendorBank;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      vendorBank = await VendorBank.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor bank ID format', 400);
      }
      vendorBank = await VendorBank.findOneAndUpdate({ Vendor_Bank_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!vendorBank) {
      return sendNotFound(res, 'Vendor bank not found');
    }
    const populated = await populateVendorBank(VendorBank.findById(vendorBank._id));
    sendSuccess(res, populated, 'Vendor bank updated successfully');
  } catch (error) {
    console.error('Error updating vendor bank', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorBank = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let vendorBank;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      vendorBank = await VendorBank.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor bank ID format', 400);
      }
      vendorBank = await VendorBank.findOneAndUpdate({ Vendor_Bank_id: numericId }, updatePayload, { new: true });
    }
    if (!vendorBank) {
      return sendNotFound(res, 'Vendor bank not found');
    }
    sendSuccess(res, vendorBank, 'Vendor bank deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor bank', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorBanksByAuth = asyncHandler(async (req, res) => {
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
    const [vendorBanks, total] = await Promise.all([
      populateVendorBank(VendorBank.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorBank.countDocuments(filter)
    ]);
    sendPaginated(res, vendorBanks, paginateMeta(numericPage, numericLimit, total), 'Vendor banks retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor banks by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createVendorBank,
  getAllVendorBanks,
  getVendorBankById,
  updateVendorBank,
  deleteVendorBank,
  getVendorBanksByAuth
};

