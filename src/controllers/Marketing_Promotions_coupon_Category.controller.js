const MarketingCouponCategory = require('../models/Marketing_Promotions_coupon_Category.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const getBusinessBranchIdByAuth = async (userIdNumber) => {
  if (!userIdNumber) {
    return null;
  }
  const branch = await Business_Branch.findOne({ created_by: userIdNumber, Status: true });
  return branch ? branch.business_Branch_id : null;
};

const ensureBusinessBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined || business_Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id, Status: true });
  return !!branch;
};

// Manual population function for Number refs
const populateCategory = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate business_Branch_id
      if (recordObj.business_Branch_id) {
        const branchId = typeof recordObj.business_Branch_id === 'object' ? recordObj.business_Branch_id : recordObj.business_Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id BusinessName Address');
        if (branch) {
          recordObj.business_Branch_id = branch.toObject ? branch.toObject() : branch;
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

const buildFilterFromQuery = ({ search, status, business_Branch_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { CategoryName: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (business_Branch_id !== undefined) {
    const numericId = parseInt(business_Branch_id, 10);
    if (!isNaN(numericId)) {
      filter.business_Branch_id = numericId;
    }
  }

  return filter;
};

const findCategoryByIdentifier = async (identifier) => {
  let recordData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    recordData = await MarketingCouponCategory.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      recordData = await MarketingCouponCategory.findOne({ Marketing_Promotions_coupon_Category_id: numericId });
    }
  }

  if (!recordData) {
    return null;
  }

  return await populateCategory(recordData);
};

const createMarketingCouponCategory = asyncHandler(async (req, res) => {
  try {
    let { business_Branch_id } = req.body;

    if (business_Branch_id === undefined || business_Branch_id === null) {
      business_Branch_id = await getBusinessBranchIdByAuth(req.userIdNumber);
    }

    if (!business_Branch_id) {
      return sendError(res, 'Unable to determine business branch for authenticated user', 400);
    }

    const branchExists = await ensureBusinessBranchExists(business_Branch_id);
    if (!branchExists) {
      return sendError(res, 'Business branch not found or inactive', 400);
    }

    const payload = {
      ...req.body,
      business_Branch_id,
      created_by: req.userIdNumber || null
    };

    const category = await MarketingCouponCategory.create(payload);
    const populated = await populateCategory(category);

    sendSuccess(res, populated, 'Marketing promotion coupon category created successfully', 201);
  } catch (error) {
    console.error('Error creating marketing coupon category', { error: error.message });
    throw error;
  }
});

const getAllMarketingCouponCategories = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status, business_Branch_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [categoriesData, total] = await Promise.all([
      MarketingCouponCategory.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      MarketingCouponCategory.countDocuments(filter)
    ]);
    
    const categories = await populateCategory(categoriesData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    sendPaginated(res, categories, pagination, 'Marketing promotion coupon categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving marketing coupon categories', { error: error.message });
    throw error;
  }
});

const getMarketingCouponCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const category = await findCategoryByIdentifier(id);

    if (!category) {
      return sendNotFound(res, 'Marketing promotion coupon category not found');
    }

    sendSuccess(res, category, 'Marketing promotion coupon category retrieved successfully');
  } catch (error) {
    console.error('Error retrieving marketing coupon category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateMarketingCouponCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Business branch not found or inactive', 400);
      }
    }

    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await MarketingCouponCategory.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendError(res, 'Invalid category ID format', 400);
      }
      category = await MarketingCouponCategory.findOneAndUpdate(
        { Marketing_Promotions_coupon_Category_id: numericId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!category) {
      return sendNotFound(res, 'Marketing promotion coupon category not found');
    }

    const populated = await populateCategory(category);
    sendSuccess(res, populated, 'Marketing promotion coupon category updated successfully');
  } catch (error) {
    console.error('Error updating marketing coupon category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteMarketingCouponCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await MarketingCouponCategory.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendError(res, 'Invalid category ID format', 400);
      }
      category = await MarketingCouponCategory.findOneAndUpdate(
        { Marketing_Promotions_coupon_Category_id: numericId },
        updateData,
        { new: true }
      );
    }

    if (!category) {
      return sendNotFound(res, 'Marketing promotion coupon category not found');
    }

    sendSuccess(res, category, 'Marketing promotion coupon category deleted successfully');
  } catch (error) {
    console.error('Error deleting marketing coupon category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getMarketingCouponCategoriesByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status, business_Branch_id });
    filter.created_by = req.userIdNumber;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [categoriesData, total] = await Promise.all([
      MarketingCouponCategory.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      MarketingCouponCategory.countDocuments(filter)
    ]);
    
    const categories = await populateCategory(categoriesData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    sendPaginated(res, categories, pagination, 'Marketing promotion coupon categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving marketing coupon categories by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createMarketingCouponCategory,
  getAllMarketingCouponCategories,
  getMarketingCouponCategoryById,
  updateMarketingCouponCategory,
  deleteMarketingCouponCategory,
  getMarketingCouponCategoriesByAuth
};

