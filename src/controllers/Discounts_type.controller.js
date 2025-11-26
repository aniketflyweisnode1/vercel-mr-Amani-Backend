const Discounts_type = require('../models/Discounts_type.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to get business_Branch_id from authenticated user
const getBusinessBranchIdByAuth = async (userIdNumber) => {
  const branch = await Business_Branch.findOne({ created_by: userIdNumber, Status: true });
  return branch ? branch.business_Branch_id : null;
};

// Helper function to ensure business branch exists
const ensureBusinessBranchExists = async (business_Branch_id) => {
  const branch = await Business_Branch.findOne({ business_Branch_id, Status: true });
  return !!branch;
};

const buildFilterFromQuery = ({ search, status, business_Branch_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (business_Branch_id) {
    const branchIdNum = parseInt(business_Branch_id, 10);
    if (!isNaN(branchIdNum)) {
      filter.business_Branch_id = branchIdNum;
    }
  }

  return filter;
};

const populateDiscountsType = (query) => query
  .populate('business_Branch_id', 'business_Branch_id name address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const createDiscountsType = asyncHandler(async (req, res) => {
  try {
    // Get business_Branch_id from authenticated user
    const business_Branch_id = await getBusinessBranchIdByAuth(req.userIdNumber);
    if (!business_Branch_id) {
      return sendError(res, 'No active business branch found for authenticated user', 404);
    }

    const payload = {
      ...req.body,
      business_Branch_id,
      created_by: req.userIdNumber || null
    };

    const discountsType = await Discounts_type.create(payload);
    console.info('Discounts type created successfully', { id: discountsType._id, Discounts_type_id: discountsType.Discounts_type_id });

    const populated = await populateDiscountsType(Discounts_type.findById(discountsType._id));
    sendSuccess(res, populated, 'Discounts type created successfully', 201);
  } catch (error) {
    console.error('Error creating discounts type', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllDiscountsTypes = asyncHandler(async (req, res) => {
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

    const [discountsTypes, total] = await Promise.all([
      populateDiscountsType(Discounts_type.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts_type.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Discounts types retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, discountsTypes, pagination, 'Discounts types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts types', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getDiscountsTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let discountsType;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      discountsType = await populateDiscountsType(Discounts_type.findById(id));
    } else {
      const discountsTypeId = parseInt(id, 10);
      if (isNaN(discountsTypeId)) {
        return sendNotFound(res, 'Invalid discounts type ID format');
      }
      discountsType = await populateDiscountsType(Discounts_type.findOne({ Discounts_type_id: discountsTypeId }));
    }

    if (!discountsType) {
      return sendNotFound(res, 'Discounts type not found');
    }

    console.info('Discounts type retrieved successfully', { id: discountsType._id });
    sendSuccess(res, discountsType, 'Discounts type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateDiscountsType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Validate business_Branch_id if being updated
    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Business branch not found', 400);
      }
    }

    let discountsType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      discountsType = await Discounts_type.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const discountsTypeId = parseInt(id, 10);
      if (isNaN(discountsTypeId)) {
        return sendNotFound(res, 'Invalid discounts type ID format');
      }
      discountsType = await Discounts_type.findOneAndUpdate({ Discounts_type_id: discountsTypeId }, updateData, { new: true, runValidators: true });
    }

    if (!discountsType) {
      return sendNotFound(res, 'Discounts type not found');
    }

    const populated = await populateDiscountsType(Discounts_type.findById(discountsType._id));
    console.info('Discounts type updated successfully', { id: discountsType._id });
    sendSuccess(res, populated, 'Discounts type updated successfully');
  } catch (error) {
    console.error('Error updating discounts type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteDiscountsType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let discountsType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      discountsType = await Discounts_type.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const discountsTypeId = parseInt(id, 10);
      if (isNaN(discountsTypeId)) {
        return sendNotFound(res, 'Invalid discounts type ID format');
      }
      discountsType = await Discounts_type.findOneAndUpdate({ Discounts_type_id: discountsTypeId }, updateData, { new: true });
    }

    if (!discountsType) {
      return sendNotFound(res, 'Discounts type not found');
    }

    console.info('Discounts type deleted successfully', { id: discountsType._id });
    sendSuccess(res, discountsType, 'Discounts type deleted successfully');
  } catch (error) {
    console.error('Error deleting discounts type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getDiscountsTypesByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ status });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [discountsTypes, total] = await Promise.all([
      populateDiscountsType(Discounts_type.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts_type.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Discounts types retrieved for authenticated user', { userId, total });
    sendPaginated(res, discountsTypes, pagination, 'Discounts types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts types for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getDiscountsTypesByBusinessBranchId = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.params;
    const branchIdNum = parseInt(business_Branch_id, 10);

    if (isNaN(branchIdNum)) {
      return sendError(res, 'Invalid business branch ID format', 400);
    }

    // Validate branch exists
    const branchExists = await ensureBusinessBranchExists(branchIdNum);
    if (!branchExists) {
      return sendNotFound(res, 'Business branch not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ search, status });
    filter.business_Branch_id = branchIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [discountsTypes, total] = await Promise.all([
      populateDiscountsType(Discounts_type.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts_type.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Discounts types retrieved by business branch ID', { business_Branch_id: branchIdNum, total });
    sendPaginated(res, discountsTypes, pagination, 'Discounts types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts types by business branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createDiscountsType,
  getAllDiscountsTypes,
  getDiscountsTypeById,
  updateDiscountsType,
  deleteDiscountsType,
  getDiscountsTypesByAuth,
  getDiscountsTypesByBusinessBranchId
};

