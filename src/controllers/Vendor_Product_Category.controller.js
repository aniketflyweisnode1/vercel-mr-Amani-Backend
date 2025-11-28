const VendorProductCategory = require('../models/Vendor_Product_Category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateVendorProductCategory = (query) => query
  .populate('created_by', 'user_id firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'user_id firstName lastName phoneNo BusinessName');

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
    const populated = await populateVendorProductCategory(VendorProductCategory.findById(category._id));
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
    const [categories, total] = await Promise.all([
      populateVendorProductCategory(VendorProductCategory.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProductCategory.countDocuments(filter)
    ]);
    sendPaginated(res, categories, paginateMeta(numericPage, numericLimit, total), 'Vendor product categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product categories', { error: error.message });
    throw error;
  }
});

const getVendorProductCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const categoryQuery = findByIdentifier(id);
    if (!categoryQuery) {
      return sendError(res, 'Invalid vendor product category identifier', 400);
    }
    const category = await categoryQuery;
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
    const populated = await populateVendorProductCategory(VendorProductCategory.findById(category._id));
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

