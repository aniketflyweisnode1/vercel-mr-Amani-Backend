const VendorProductsTypes = require('../models/Vendor_Products_types.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population for numeric IDs
const populateVendorProductsTypes = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate created_by
      if (recordObj.created_by) {
        const user = await User.findOne({ user_id: recordObj.created_by }).select('user_id firstName lastName phoneNo BusinessName Email');
        if (user) recordObj.created_by = user.toObject();
      }
      
      // Populate updated_by
      if (recordObj.updated_by) {
        const user = await User.findOne({ user_id: recordObj.updated_by }).select('user_id firstName lastName phoneNo BusinessName Email');
        if (user) recordObj.updated_by = user.toObject();
      }
      
      return recordObj;
    })
  );
  return Array.isArray(records) ? populatedRecords : populatedRecords[0];
};

const buildFilter = ({ search, status }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
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
  let type;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    type = await VendorProductsTypes.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      type = await VendorProductsTypes.findOne({ Vendor_Products_types_id: numericId });
    }
  }
  if (!type) return null;
  return await populateVendorProductsTypes(type);
};

const createVendorProductsTypes = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const type = await VendorProductsTypes.create(payload);
    const populated = await populateVendorProductsTypes(type);
    sendSuccess(res, populated, 'Vendor product type created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor product type', { error: error.message });
    throw error;
  }
});

const getAllVendorProductsTypes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Vendor_Products_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [typesRaw, total] = await Promise.all([
      VendorProductsTypes.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProductsTypes.countDocuments(filter)
    ]);
    const types = await populateVendorProductsTypes(typesRaw);
    sendPaginated(res, types, paginateMeta(numericPage, numericLimit, total), 'Vendor product types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product types', { error: error.message });
    throw error;
  }
});

const getVendorProductsTypesById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const type = await findByIdentifier(id);
    if (!type) {
      return sendNotFound(res, 'Vendor product type not found');
    }
    sendSuccess(res, type, 'Vendor product type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorProductsTypes = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let type;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      type = await VendorProductsTypes.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor product type ID format', 400);
      }
      type = await VendorProductsTypes.findOneAndUpdate({ Vendor_Products_types_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!type) {
      return sendNotFound(res, 'Vendor product type not found');
    }
    const populated = await populateVendorProductsTypes(type);
    sendSuccess(res, populated, 'Vendor product type updated successfully');
  } catch (error) {
    console.error('Error updating vendor product type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorProductsTypes = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let type;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      type = await VendorProductsTypes.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor product type ID format', 400);
      }
      type = await VendorProductsTypes.findOneAndUpdate({ Vendor_Products_types_id: numericId }, updatePayload, { new: true });
    }
    if (!type) {
      return sendNotFound(res, 'Vendor product type not found');
    }
    sendSuccess(res, type, 'Vendor product type deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor product type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorProductsTypesByAuth = asyncHandler(async (req, res) => {
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
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status });
    filter.created_by = userId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [typesRaw, total] = await Promise.all([
      VendorProductsTypes.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProductsTypes.countDocuments(filter)
    ]);
    const types = await populateVendorProductsTypes(typesRaw);
    sendPaginated(res, types, paginateMeta(numericPage, numericLimit, total), 'Vendor product types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product types by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createVendorProductsTypes,
  getAllVendorProductsTypes,
  getVendorProductsTypesById,
  updateVendorProductsTypes,
  deleteVendorProductsTypes,
  getVendorProductsTypesByAuth
};
