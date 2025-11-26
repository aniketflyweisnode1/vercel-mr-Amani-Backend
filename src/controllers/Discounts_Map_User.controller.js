const Discounts_Map_User = require('../models/Discounts_Map_User.model');
const User = require('../models/User.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to get business_Branch_id from authenticated user
const getBusinessBranchIdByAuth = async (userIdNumber) => {
  const branch = await Business_Branch.findOne({ created_by: userIdNumber, Status: true });
  return branch ? branch.business_Branch_id : null;
};

// Helper function to ensure user exists
const ensureUserExists = async (user_id) => {
  const user = await User.findOne({ user_id, status: true });
  return !!user;
};

// Helper function to ensure business branch exists
const ensureBusinessBranchExists = async (business_Branch_id) => {
  const branch = await Business_Branch.findOne({ business_Branch_id, Status: true });
  return !!branch;
};

const buildFilterFromQuery = ({ search, status, User_id, business_Branch_id }) => {
  const filter = {};

  if (search) {
    filter.Description = { $regex: search, $options: 'i' };
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (User_id) {
    const userIdNum = parseInt(User_id, 10);
    if (!isNaN(userIdNum)) {
      filter.User_id = userIdNum;
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

const populateDiscountsMapUser = (query) => query
  .populate('User_id', 'user_id firstName lastName phoneNo BusinessName')
  .populate('business_Branch_id', 'business_Branch_id name address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const createDiscountsMapUser = asyncHandler(async (req, res) => {
  try {
    const { User_id } = req.body;

    // Validate user exists
    const userExists = await ensureUserExists(User_id);
    if (!userExists) {
      return sendError(res, 'User not found or inactive', 404);
    }

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

    const discountsMapUser = await Discounts_Map_User.create(payload);
    console.info('Discounts map user created successfully', { id: discountsMapUser._id, Discounts_Map_User_id: discountsMapUser.Discounts_Map_User_id });

    const populated = await populateDiscountsMapUser(Discounts_Map_User.findById(discountsMapUser._id));
    sendSuccess(res, populated, 'Discounts map user created successfully', 201);
  } catch (error) {
    console.error('Error creating discounts map user', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllDiscountsMapUsers = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      User_id,
      business_Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status, User_id, business_Branch_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [discountsMapUsers, total] = await Promise.all([
      populateDiscountsMapUser(Discounts_Map_User.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts_Map_User.countDocuments(filter)
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

    console.info('Discounts map users retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, discountsMapUsers, pagination, 'Discounts map users retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts map users', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getDiscountsMapUserById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let discountsMapUser;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      discountsMapUser = await populateDiscountsMapUser(Discounts_Map_User.findById(id));
    } else {
      const discountsMapUserId = parseInt(id, 10);
      if (isNaN(discountsMapUserId)) {
        return sendNotFound(res, 'Invalid discounts map user ID format');
      }
      discountsMapUser = await populateDiscountsMapUser(Discounts_Map_User.findOne({ Discounts_Map_User_id: discountsMapUserId }));
    }

    if (!discountsMapUser) {
      return sendNotFound(res, 'Discounts map user not found');
    }

    console.info('Discounts map user retrieved successfully', { id: discountsMapUser._id });
    sendSuccess(res, discountsMapUser, 'Discounts map user retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts map user', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateDiscountsMapUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Validate user if being updated
    if (updateData.User_id !== undefined) {
      const userExists = await ensureUserExists(updateData.User_id);
      if (!userExists) {
        return sendError(res, 'User not found or inactive', 400);
      }
    }

    // Validate business_Branch_id if being updated
    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Business branch not found', 400);
      }
    }

    let discountsMapUser;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      discountsMapUser = await Discounts_Map_User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const discountsMapUserId = parseInt(id, 10);
      if (isNaN(discountsMapUserId)) {
        return sendNotFound(res, 'Invalid discounts map user ID format');
      }
      discountsMapUser = await Discounts_Map_User.findOneAndUpdate({ Discounts_Map_User_id: discountsMapUserId }, updateData, { new: true, runValidators: true });
    }

    if (!discountsMapUser) {
      return sendNotFound(res, 'Discounts map user not found');
    }

    const populated = await populateDiscountsMapUser(Discounts_Map_User.findById(discountsMapUser._id));
    console.info('Discounts map user updated successfully', { id: discountsMapUser._id });
    sendSuccess(res, populated, 'Discounts map user updated successfully');
  } catch (error) {
    console.error('Error updating discounts map user', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteDiscountsMapUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let discountsMapUser;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      discountsMapUser = await Discounts_Map_User.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const discountsMapUserId = parseInt(id, 10);
      if (isNaN(discountsMapUserId)) {
        return sendNotFound(res, 'Invalid discounts map user ID format');
      }
      discountsMapUser = await Discounts_Map_User.findOneAndUpdate({ Discounts_Map_User_id: discountsMapUserId }, updateData, { new: true });
    }

    if (!discountsMapUser) {
      return sendNotFound(res, 'Discounts map user not found');
    }

    console.info('Discounts map user deleted successfully', { id: discountsMapUser._id });
    sendSuccess(res, discountsMapUser, 'Discounts map user deleted successfully');
  } catch (error) {
    console.error('Error deleting discounts map user', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getDiscountsMapUsersByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      User_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ status, User_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [discountsMapUsers, total] = await Promise.all([
      populateDiscountsMapUser(Discounts_Map_User.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts_Map_User.countDocuments(filter)
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

    console.info('Discounts map users retrieved for authenticated user', { userId, total });
    sendPaginated(res, discountsMapUsers, pagination, 'Discounts map users retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts map users for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getDiscountsMapUsersByUserId = asyncHandler(async (req, res) => {
  try {
    const { User_id } = req.params;
    const userIdNum = parseInt(User_id, 10);

    if (isNaN(userIdNum)) {
      return sendError(res, 'Invalid user ID format', 400);
    }

    // Validate user exists
    const userExists = await ensureUserExists(userIdNum);
    if (!userExists) {
      return sendNotFound(res, 'User not found');
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
    filter.User_id = userIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [discountsMapUsers, total] = await Promise.all([
      populateDiscountsMapUser(Discounts_Map_User.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts_Map_User.countDocuments(filter)
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

    console.info('Discounts map users retrieved by user ID', { User_id: userIdNum, total });
    sendPaginated(res, discountsMapUsers, pagination, 'Discounts map users retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts map users by user ID', { error: error.message, User_id: req.params.User_id });
    throw error;
  }
});

const getDiscountsMapUsersByBusinessBranchId = asyncHandler(async (req, res) => {
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
      User_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ search, status, User_id });
    filter.business_Branch_id = branchIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [discountsMapUsers, total] = await Promise.all([
      populateDiscountsMapUser(Discounts_Map_User.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts_Map_User.countDocuments(filter)
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

    console.info('Discounts map users retrieved by business branch ID', { business_Branch_id: branchIdNum, total });
    sendPaginated(res, discountsMapUsers, pagination, 'Discounts map users retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts map users by business branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createDiscountsMapUser,
  getAllDiscountsMapUsers,
  getDiscountsMapUserById,
  updateDiscountsMapUser,
  deleteDiscountsMapUser,
  getDiscountsMapUsersByAuth,
  getDiscountsMapUsersByUserId,
  getDiscountsMapUsersByBusinessBranchId
};

