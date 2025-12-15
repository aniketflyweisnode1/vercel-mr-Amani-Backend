const VendorProductsBrand = require('../models/Vendor_Products_brand.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population for numeric IDs
const populateVendorProductsBrand = async (records) => {
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
  let brand;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    brand = await VendorProductsBrand.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      brand = await VendorProductsBrand.findOne({ Vendor_Products_brand_id: numericId });
    }
  }
  if (!brand) return null;
  return await populateVendorProductsBrand(brand);
};

const createVendorProductsBrand = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const brand = await VendorProductsBrand.create(payload);
    const populated = await populateVendorProductsBrand(brand);
    sendSuccess(res, populated, 'Vendor product brand created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor product brand', { error: error.message });
    throw error;
  }
});

const getAllVendorProductsBrands = asyncHandler(async (req, res) => {
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
    const [brandsRaw, total] = await Promise.all([
      VendorProductsBrand.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProductsBrand.countDocuments(filter)
    ]);
    const brands = await populateVendorProductsBrand(brandsRaw);
    sendPaginated(res, brands, paginateMeta(numericPage, numericLimit, total), 'Vendor product brands retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product brands', { error: error.message });
    throw error;
  }
});

const getVendorProductsBrandById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await findByIdentifier(id);
    if (!brand) {
      return sendNotFound(res, 'Vendor product brand not found');
    }
    sendSuccess(res, brand, 'Vendor product brand retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product brand', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorProductsBrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let brand;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      brand = await VendorProductsBrand.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor product brand ID format', 400);
      }
      brand = await VendorProductsBrand.findOneAndUpdate({ Vendor_Products_brand_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!brand) {
      return sendNotFound(res, 'Vendor product brand not found');
    }
    const populated = await populateVendorProductsBrand(brand);
    sendSuccess(res, populated, 'Vendor product brand updated successfully');
  } catch (error) {
    console.error('Error updating vendor product brand', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorProductsBrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let brand;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      brand = await VendorProductsBrand.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor product brand ID format', 400);
      }
      brand = await VendorProductsBrand.findOneAndUpdate({ Vendor_Products_brand_id: numericId }, updatePayload, { new: true });
    }
    if (!brand) {
      return sendNotFound(res, 'Vendor product brand not found');
    }
    sendSuccess(res, brand, 'Vendor product brand deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor product brand', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorProductsBrandsByAuth = asyncHandler(async (req, res) => {
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
    const [brandsRaw, total] = await Promise.all([
      VendorProductsBrand.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProductsBrand.countDocuments(filter)
    ]);
    const brands = await populateVendorProductsBrand(brandsRaw);
    sendPaginated(res, brands, paginateMeta(numericPage, numericLimit, total), 'Vendor product brands retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product brands by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createVendorProductsBrand,
  getAllVendorProductsBrands,
  getVendorProductsBrandById,
  updateVendorProductsBrand,
  deleteVendorProductsBrand,
  getVendorProductsBrandsByAuth
};
