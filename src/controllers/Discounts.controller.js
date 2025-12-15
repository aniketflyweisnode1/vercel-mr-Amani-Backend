const Discounts = require('../models/Discounts.model');
const Discounts_type = require('../models/Discounts_type.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to get business_Branch_id from authenticated user
const getBusinessBranchIdByAuth = async (userIdNumber) => {
  const branch = await Business_Branch.findOne({ created_by: userIdNumber, Status: true });
  return branch ? branch.business_Branch_id : null;
};

// Helper function to ensure discount type exists
const ensureDiscountTypeExists = async (Discounts_type_id) => {
  const discountType = await Discounts_type.findOne({ Discounts_type_id, Status: true });
  return !!discountType;
};

// Helper function to ensure business branch exists
const ensureBusinessBranchExists = async (business_Branch_id) => {
  const branch = await Business_Branch.findOne({ business_Branch_id, Status: true });
  return !!branch;
};

const buildFilterFromQuery = ({ search, status, Discounts_type_id, business_Branch_id }) => {
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

  if (Discounts_type_id) {
    const typeIdNum = parseInt(Discounts_type_id, 10);
    if (!isNaN(typeIdNum)) {
      filter.Discounts_type_id = typeIdNum;
    }
  }

  if (business_Branch_id) {
    const branchIdNum = parseInt(business_Branch_id, 10);
    if (!isNaN(branchIdNum)) {
      filter.business_Branch_id = branchIdNum;
    }
  }

  return filter;
};

// Generate a random 10-character alphanumeric code
const generateDiscountCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate unique discount code
const generateUniqueDiscountCode = async () => {
  let code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!isUnique && attempts < maxAttempts) {
    code = generateDiscountCode();
    const existing = await Discounts.findOne({ code });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    // Fallback: use timestamp-based code if random generation fails
    code = `DISC${Date.now().toString().slice(-6)}`.toUpperCase();
  }
  
  return code;
};

const populateDiscounts = (query) => query
  .populate('Discounts_type_id', 'Discounts_type_id name Description Status')
  .populate('business_Branch_id', 'business_Branch_id name address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const createDiscount = asyncHandler(async (req, res) => {
  try {
    const { Discounts_type_id } = req.body;

    // Validate discount type exists
    const discountTypeExists = await ensureDiscountTypeExists(Discounts_type_id);
    if (!discountTypeExists) {
      return sendError(res, 'Discount type not found or inactive', 404);
    }

    // Get business_Branch_id from authenticated user
    const business_Branch_id = await getBusinessBranchIdByAuth(req.userIdNumber);
    if (!business_Branch_id) {
      return sendError(res, 'No active business branch found for authenticated user', 404);
    }

    // Auto-generate code if not provided
    let code = req.body.code;
    if (!code || code.trim() === '') {
      code = await generateUniqueDiscountCode();
    }

    const payload = {
      ...req.body,
      code: code.trim().toUpperCase(), // Ensure uppercase and trimmed
      business_Branch_id,
      created_by: req.userIdNumber || null
    };

    const discount = await Discounts.create(payload);
    console.info('Discount created successfully', { id: discount._id, Discounts_id: discount.Discounts_id });

    const populated = await populateDiscounts(Discounts.findById(discount._id));
    sendSuccess(res, populated, 'Discount created successfully', 201);
  } catch (error) {
    console.error('Error creating discount', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllDiscounts = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Discounts_type_id,
      business_Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status, Discounts_type_id, business_Branch_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [discounts, total] = await Promise.all([
      populateDiscounts(Discounts.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts.countDocuments(filter)
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

    console.info('Discounts retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, discounts, pagination, 'Discounts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getDiscountById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let discount;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      discount = await populateDiscounts(Discounts.findById(id));
    } else {
      const discountId = parseInt(id, 10);
      if (isNaN(discountId)) {
        return sendNotFound(res, 'Invalid discount ID format');
      }
      discount = await populateDiscounts(Discounts.findOne({ Discounts_id: discountId }));
    }

    if (!discount) {
      return sendNotFound(res, 'Discount not found');
    }

    console.info('Discount retrieved successfully', { id: discount._id });
    sendSuccess(res, discount, 'Discount retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discount', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateDiscount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Format code if provided (uppercase and trimmed)
    if (updateData.code !== undefined) {
      if (updateData.code && updateData.code.trim() !== '') {
        updateData.code = updateData.code.trim().toUpperCase();
      } else {
        // If code is empty, remove it from update (don't update)
        delete updateData.code;
      }
    }

    // Validate discount type if being updated
    if (updateData.Discounts_type_id !== undefined) {
      const discountTypeExists = await ensureDiscountTypeExists(updateData.Discounts_type_id);
      if (!discountTypeExists) {
        return sendError(res, 'Discount type not found or inactive', 400);
      }
    }

    // Validate business_Branch_id if being updated
    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Business branch not found', 400);
      }
    }

    let discount;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      discount = await Discounts.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const discountId = parseInt(id, 10);
      if (isNaN(discountId)) {
        return sendNotFound(res, 'Invalid discount ID format');
      }
      discount = await Discounts.findOneAndUpdate({ Discounts_id: discountId }, updateData, { new: true, runValidators: true });
    }

    if (!discount) {
      return sendNotFound(res, 'Discount not found');
    }

    const populated = await populateDiscounts(Discounts.findById(discount._id));
    console.info('Discount updated successfully', { id: discount._id });
    sendSuccess(res, populated, 'Discount updated successfully');
  } catch (error) {
    console.error('Error updating discount', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteDiscount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let discount;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      discount = await Discounts.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const discountId = parseInt(id, 10);
      if (isNaN(discountId)) {
        return sendNotFound(res, 'Invalid discount ID format');
      }
      discount = await Discounts.findOneAndUpdate({ Discounts_id: discountId }, updateData, { new: true });
    }

    if (!discount) {
      return sendNotFound(res, 'Discount not found');
    }

    console.info('Discount deleted successfully', { id: discount._id });
    sendSuccess(res, discount, 'Discount deleted successfully');
  } catch (error) {
    console.error('Error deleting discount', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getDiscountsByTypeId = asyncHandler(async (req, res) => {
  try {
    const { Discounts_type_id } = req.params;
    const typeIdNum = parseInt(Discounts_type_id, 10);

    if (isNaN(typeIdNum)) {
      return sendError(res, 'Invalid discount type ID format', 400);
    }

    // Validate discount type exists
    const discountTypeExists = await ensureDiscountTypeExists(typeIdNum);
    if (!discountTypeExists) {
      return sendNotFound(res, 'Discount type not found');
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
    filter.Discounts_type_id = typeIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [discounts, total] = await Promise.all([
      populateDiscounts(Discounts.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts.countDocuments(filter)
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

    console.info('Discounts retrieved by type ID', { Discounts_type_id: typeIdNum, total });
    sendPaginated(res, discounts, pagination, 'Discounts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts by type ID', { error: error.message, Discounts_type_id: req.params.Discounts_type_id });
    throw error;
  }
});

const getDiscountsByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      Discounts_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ status, Discounts_type_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [discounts, total] = await Promise.all([
      populateDiscounts(Discounts.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts.countDocuments(filter)
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

    console.info('Discounts retrieved for authenticated user', { userId, total });
    sendPaginated(res, discounts, pagination, 'Discounts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getDiscountsByBusinessBranchId = asyncHandler(async (req, res) => {
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
      Discounts_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ search, status, Discounts_type_id });
    filter.business_Branch_id = branchIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [discounts, total] = await Promise.all([
      populateDiscounts(Discounts.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts.countDocuments(filter)
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

    console.info('Discounts retrieved by business branch ID', { business_Branch_id: branchIdNum, total });
    sendPaginated(res, discounts, pagination, 'Discounts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts by business branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  getDiscountsByTypeId,
  getDiscountsByAuth,
  getDiscountsByBusinessBranchId
};

