const VendorProductsFeatures = require('../models/Vendor_Products_features.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population for numeric IDs
const populateVendorProductsFeatures = async (records) => {
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
  let feature;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    feature = await VendorProductsFeatures.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      feature = await VendorProductsFeatures.findOne({ Vendor_Products_features_id: numericId });
    }
  }
  if (!feature) return null;
  return await populateVendorProductsFeatures(feature);
};

const createVendorProductsFeatures = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const feature = await VendorProductsFeatures.create(payload);
    const populated = await populateVendorProductsFeatures(feature);
    sendSuccess(res, populated, 'Vendor product feature created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor product feature', { error: error.message });
    throw error;
  }
});

const getAllVendorProductsFeatures = asyncHandler(async (req, res) => {
  try {
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
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [featuresRaw, total] = await Promise.all([
      VendorProductsFeatures.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProductsFeatures.countDocuments(filter)
    ]);
    const features = await populateVendorProductsFeatures(featuresRaw);
    sendPaginated(res, features, paginateMeta(numericPage, numericLimit, total), 'Vendor product features retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product features', { error: error.message });
    throw error;
  }
});

const getVendorProductsFeaturesById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const feature = await findByIdentifier(id);
    if (!feature) {
      return sendNotFound(res, 'Vendor product feature not found');
    }
    sendSuccess(res, feature, 'Vendor product feature retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product feature', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorProductsFeatures = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let feature;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      feature = await VendorProductsFeatures.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor product feature ID format', 400);
      }
      feature = await VendorProductsFeatures.findOneAndUpdate({ Vendor_Products_features_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!feature) {
      return sendNotFound(res, 'Vendor product feature not found');
    }
    const populated = await populateVendorProductsFeatures(feature);
    sendSuccess(res, populated, 'Vendor product feature updated successfully');
  } catch (error) {
    console.error('Error updating vendor product feature', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorProductsFeatures = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let feature;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      feature = await VendorProductsFeatures.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor product feature ID format', 400);
      }
      feature = await VendorProductsFeatures.findOneAndUpdate({ Vendor_Products_features_id: numericId }, updatePayload, { new: true });
    }
    if (!feature) {
      return sendNotFound(res, 'Vendor product feature not found');
    }
    sendSuccess(res, feature, 'Vendor product feature deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor product feature', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorProductsFeaturesByAuth = asyncHandler(async (req, res) => {
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
    const [featuresRaw, total] = await Promise.all([
      VendorProductsFeatures.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProductsFeatures.countDocuments(filter)
    ]);
    const features = await populateVendorProductsFeatures(featuresRaw);
    sendPaginated(res, features, paginateMeta(numericPage, numericLimit, total), 'Vendor product features retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product features by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createVendorProductsFeatures,
  getAllVendorProductsFeatures,
  getVendorProductsFeaturesById,
  updateVendorProductsFeatures,
  deleteVendorProductsFeatures,
  getVendorProductsFeaturesByAuth
};
