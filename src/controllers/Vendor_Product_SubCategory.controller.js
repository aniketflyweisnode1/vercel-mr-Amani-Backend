const VendorProductSubCategory = require('../models/Vendor_Product_SubCategory.model');
const VendorProductCategory = require('../models/Vendor_Product_Category.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population for numeric IDs
const populateVendorProductSubCategory = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate Vendor_Product_Category_id
      if (recordObj.Vendor_Product_Category_id) {
        const category = await VendorProductCategory.findOne({ Vendor_Product_Category_id: recordObj.Vendor_Product_Category_id }).select('Vendor_Product_Category_id CategoryName');
        if (category) recordObj.Vendor_Product_Category_id = category.toObject();
      }
      
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

const buildFilter = ({ search, status, Vendor_Product_Category_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { SubCategoryName: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Vendor_Product_Category_id !== undefined) {
    const categoryId = parseInt(Vendor_Product_Category_id, 10);
    if (!Number.isNaN(categoryId)) {
      filter.Vendor_Product_Category_id = categoryId;
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

const ensureCategoryExists = async (Vendor_Product_Category_id) => {
  if (Vendor_Product_Category_id === undefined) {
    return true;
  }
  const categoryId = parseInt(Vendor_Product_Category_id, 10);
  if (Number.isNaN(categoryId)) {
    return false;
  }
  const category = await VendorProductCategory.findOne({ Vendor_Product_Category_id: categoryId, Status: true });
  return Boolean(category);
};

const findByIdentifier = async (identifier) => {
  let subCategory;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    subCategory = await VendorProductSubCategory.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      subCategory = await VendorProductSubCategory.findOne({ Vendor_Product_SubCategory_id: numericId });
    }
  }
  if (!subCategory) return null;
  return await populateVendorProductSubCategory(subCategory);
};

const createVendorProductSubCategory = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Product_Category_id } = req.body;
    if (!(await ensureCategoryExists(Vendor_Product_Category_id))) {
      return sendError(res, 'Vendor product category not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const subCategory = await VendorProductSubCategory.create(payload);
    const populated = await populateVendorProductSubCategory(subCategory);
    sendSuccess(res, populated, 'Vendor product sub category created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor product sub category', { error: error.message });
    throw error;
  }
});

const getAllVendorProductSubCategories = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Vendor_Product_Category_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Vendor_Product_Category_id });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [subCategoriesRaw, total] = await Promise.all([
      VendorProductSubCategory.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProductSubCategory.countDocuments(filter)
    ]);
    const subCategories = await populateVendorProductSubCategory(subCategoriesRaw);
    sendPaginated(res, subCategories, paginateMeta(numericPage, numericLimit, total), 'Vendor product sub categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product sub categories', { error: error.message });
    throw error;
  }
});

const getVendorProductSubCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await findByIdentifier(id);
    if (!subCategory) {
      return sendNotFound(res, 'Vendor product sub category not found');
    }
    sendSuccess(res, subCategory, 'Vendor product sub category retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product sub category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorProductSubCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Vendor_Product_Category_id } = req.body;
    if (Vendor_Product_Category_id !== undefined && !(await ensureCategoryExists(Vendor_Product_Category_id))) {
      return sendError(res, 'Vendor product category not found', 400);
    }
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let subCategory;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      subCategory = await VendorProductSubCategory.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor product sub category ID format', 400);
      }
      subCategory = await VendorProductSubCategory.findOneAndUpdate({ Vendor_Product_SubCategory_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!subCategory) {
      return sendNotFound(res, 'Vendor product sub category not found');
    }
    const populated = await populateVendorProductSubCategory(subCategory);
    sendSuccess(res, populated, 'Vendor product sub category updated successfully');
  } catch (error) {
    console.error('Error updating vendor product sub category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorProductSubCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let subCategory;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      subCategory = await VendorProductSubCategory.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor product sub category ID format', 400);
      }
      subCategory = await VendorProductSubCategory.findOneAndUpdate({ Vendor_Product_SubCategory_id: numericId }, updatePayload, { new: true });
    }
    if (!subCategory) {
      return sendNotFound(res, 'Vendor product sub category not found');
    }
    sendSuccess(res, subCategory, 'Vendor product sub category deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor product sub category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorProductSubCategoriesByCategoryId = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Product_Category_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const categoryId = parseInt(Vendor_Product_Category_id, 10);
    if (Number.isNaN(categoryId)) {
      return sendError(res, 'Invalid vendor product category ID format', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status });
    filter.Vendor_Product_Category_id = categoryId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [subCategoriesRaw, total] = await Promise.all([
      VendorProductSubCategory.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProductSubCategory.countDocuments(filter)
    ]);
    const subCategories = await populateVendorProductSubCategory(subCategoriesRaw);
    sendPaginated(res, subCategories, paginateMeta(numericPage, numericLimit, total), 'Vendor product sub categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product sub categories by category', { error: error.message, Vendor_Product_Category_id: req.params.Vendor_Product_Category_id });
    throw error;
  }
});

module.exports = {
  createVendorProductSubCategory,
  getAllVendorProductSubCategories,
  getVendorProductSubCategoryById,
  updateVendorProductSubCategory,
  deleteVendorProductSubCategory,
  getVendorProductSubCategoriesByCategoryId
};

