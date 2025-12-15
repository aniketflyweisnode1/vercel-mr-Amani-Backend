const VendorProductCategory = require('../models/Vendor_Product_Category.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population for numeric IDs
const populateVendorProductCategory = async (records) => {
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
      { CategoryName: { $regex: search, $options: 'i' } }
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

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateVendorProductCategory(VendorProductCategory.findById(identifier));
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateVendorProductCategory(VendorProductCategory.findOne({ Vendor_Product_Category_id: numericId }));
  }
  return null;
};

const createVendorProductCategory = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const category = await VendorProductCategory.create(payload);
    const populated = await populateVendorProductCategory(category);
    sendSuccess(res, populated, 'Vendor product category created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor product category', { error: error.message });
    throw error;
  }
});

const getAllVendorProductCategories = asyncHandler(async (req, res) => {
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
    const [categoriesRaw, total] = await Promise.all([
      VendorProductCategory.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProductCategory.countDocuments(filter)
    ]);
    const categories = await populateVendorProductCategory(categoriesRaw);
    sendPaginated(res, categories, paginateMeta(numericPage, numericLimit, total), 'Vendor product categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product categories', { error: error.message });
    throw error;
  }
});

const getVendorProductCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const category = await findByIdentifier(id);
    if (!category) {
      return sendNotFound(res, 'Vendor product category not found');
    }
    sendSuccess(res, category, 'Vendor product category retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorProductCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await VendorProductCategory.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor product category ID format', 400);
      }
      category = await VendorProductCategory.findOneAndUpdate({ Vendor_Product_Category_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!category) {
      return sendNotFound(res, 'Vendor product category not found');
    }
    const populated = await populateVendorProductCategory(category);
    sendSuccess(res, populated, 'Vendor product category updated successfully');
  } catch (error) {
    console.error('Error updating vendor product category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorProductCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await VendorProductCategory.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor product category ID format', 400);
      }
      category = await VendorProductCategory.findOneAndUpdate({ Vendor_Product_Category_id: numericId }, updatePayload, { new: true });
    }
    if (!category) {
      return sendNotFound(res, 'Vendor product category not found');
    }
    sendSuccess(res, category, 'Vendor product category deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor product category', { error: error.message, id: req.params.id });
    throw error;
  }
});

module.exports = {
  createVendorProductCategory,
  getAllVendorProductCategories,
  getVendorProductCategoryById,
  updateVendorProductCategory,
  deleteVendorProductCategory
};

