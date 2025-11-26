const AdminPlanSubscription = require('../models/Admin_Plan_Subscripiton.model');
const AdminPlan = require('../models/Admin_Plan.model');
const User = require('../models/user.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateAdminPlanSubscription = (query) => query
  .populate('Admin_Plan_id', 'Admin_Plan_id name fee duration Description')
  .populate('Subscribe_By', 'firstName lastName phoneNo email BusinessName')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, Admin_Plan_id, Subscribe_By, PaymentStatus }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { PaymentStatus: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Admin_Plan_id !== undefined) {
    const planId = parseInt(Admin_Plan_id, 10);
    if (!Number.isNaN(planId)) {
      filter.Admin_Plan_id = planId;
    }
  }

  if (Subscribe_By !== undefined) {
    const userId = parseInt(Subscribe_By, 10);
    if (!Number.isNaN(userId)) {
      filter.Subscribe_By = userId;
    }
  }

  if (PaymentStatus) {
    filter.PaymentStatus = PaymentStatus;
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

const ensurePlanExists = async (Admin_Plan_id) => {
  if (Admin_Plan_id === undefined) {
    return true;
  }
  const planId = parseInt(Admin_Plan_id, 10);
  if (Number.isNaN(planId)) {
    return false;
  }
  const plan = await AdminPlan.findOne({ Admin_Plan_id: planId, Status: true });
  return Boolean(plan);
};

const ensureUserExists = async (Subscribe_By) => {
  if (Subscribe_By === undefined) {
    return true;
  }
  const userId = parseInt(Subscribe_By, 10);
  if (Number.isNaN(userId)) {
    return false;
  }
  const user = await User.findOne({ user_id: userId, Status: true });
  return Boolean(user);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateAdminPlanSubscription(AdminPlanSubscription.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateAdminPlanSubscription(AdminPlanSubscription.findOne({ Admin_Plan_Subscripiton_id: numericId }));
  }

  return null;
};

const createAdminPlanSubscription = asyncHandler(async (req, res) => {
  try {
    const { Admin_Plan_id, Subscribe_By } = req.body;

    const [planExists, userExists] = await Promise.all([
      ensurePlanExists(Admin_Plan_id),
      ensureUserExists(Subscribe_By)
    ]);

    if (!planExists) {
      return sendError(res, 'Admin plan not found', 400);
    }
    if (!userExists) {
      return sendError(res, 'User not found', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const subscription = await AdminPlanSubscription.create(payload);
    const populated = await populateAdminPlanSubscription(AdminPlanSubscription.findById(subscription._id));

    sendSuccess(res, populated, 'Admin plan subscription created successfully', 201);
  } catch (error) {
    console.error('Error creating admin plan subscription', { error: error.message });
    throw error;
  }
});

const getAllAdminPlanSubscriptions = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Admin_Plan_id,
      Subscribe_By,
      PaymentStatus,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Admin_Plan_id, Subscribe_By, PaymentStatus });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [subscriptions, total] = await Promise.all([
      populateAdminPlanSubscription(AdminPlanSubscription.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      AdminPlanSubscription.countDocuments(filter)
    ]);

    sendPaginated(res, subscriptions, paginateMeta(numericPage, numericLimit, total), 'Admin plan subscriptions retrieved successfully');
  } catch (error) {
    console.error('Error retrieving admin plan subscriptions', { error: error.message });
    throw error;
  }
});

const getAdminPlanSubscriptionById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const subscriptionQuery = findByIdentifier(id);

    if (!subscriptionQuery) {
      return sendError(res, 'Invalid admin plan subscription identifier', 400);
    }

    const subscription = await subscriptionQuery;

    if (!subscription) {
      return sendNotFound(res, 'Admin plan subscription not found');
    }

    sendSuccess(res, subscription, 'Admin plan subscription retrieved successfully');
  } catch (error) {
    console.error('Error retrieving admin plan subscription', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateAdminPlanSubscription = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Admin_Plan_id, Subscribe_By } = req.body;

    const [planExists, userExists] = await Promise.all([
      ensurePlanExists(Admin_Plan_id),
      ensureUserExists(Subscribe_By)
    ]);

    if (Admin_Plan_id !== undefined && !planExists) {
      return sendError(res, 'Admin plan not found', 400);
    }
    if (Subscribe_By !== undefined && !userExists) {
      return sendError(res, 'User not found', 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let subscription;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      subscription = await AdminPlanSubscription.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid admin plan subscription ID format', 400);
      }
      subscription = await AdminPlanSubscription.findOneAndUpdate({ Admin_Plan_Subscripiton_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!subscription) {
      return sendNotFound(res, 'Admin plan subscription not found');
    }

    const populated = await populateAdminPlanSubscription(AdminPlanSubscription.findById(subscription._id));
    sendSuccess(res, populated, 'Admin plan subscription updated successfully');
  } catch (error) {
    console.error('Error updating admin plan subscription', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteAdminPlanSubscription = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let subscription;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      subscription = await AdminPlanSubscription.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid admin plan subscription ID format', 400);
      }
      subscription = await AdminPlanSubscription.findOneAndUpdate({ Admin_Plan_Subscripiton_id: numericId }, updatePayload, { new: true });
    }

    if (!subscription) {
      return sendNotFound(res, 'Admin plan subscription not found');
    }

    sendSuccess(res, subscription, 'Admin plan subscription deleted successfully');
  } catch (error) {
    console.error('Error deleting admin plan subscription', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getAdminPlanSubscriptionsByPlanId = asyncHandler(async (req, res) => {
  try {
    const { Admin_Plan_id } = req.params;
    const planId = parseInt(Admin_Plan_id, 10);

    if (Number.isNaN(planId)) {
      return sendError(res, 'Invalid admin plan ID format', 400);
    }

    if (!(await ensurePlanExists(planId))) {
      return sendNotFound(res, 'Admin plan not found');
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Subscribe_By,
      PaymentStatus,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Subscribe_By, PaymentStatus });
    filter.Admin_Plan_id = planId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [subscriptions, total] = await Promise.all([
      populateAdminPlanSubscription(AdminPlanSubscription.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      AdminPlanSubscription.countDocuments(filter)
    ]);

    sendPaginated(res, subscriptions, paginateMeta(numericPage, numericLimit, total), 'Admin plan subscriptions retrieved successfully');
  } catch (error) {
    console.error('Error retrieving admin plan subscriptions by plan ID', { error: error.message, Admin_Plan_id: req.params.Admin_Plan_id });
    throw error;
  }
});

const getAdminPlanSubscriptionsByAuth = asyncHandler(async (req, res) => {
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
      Admin_Plan_id,
      Subscribe_By,
      PaymentStatus,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Admin_Plan_id, Subscribe_By, PaymentStatus });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [subscriptions, total] = await Promise.all([
      populateAdminPlanSubscription(AdminPlanSubscription.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      AdminPlanSubscription.countDocuments(filter)
    ]);

    sendPaginated(res, subscriptions, paginateMeta(numericPage, numericLimit, total), 'Admin plan subscriptions retrieved successfully');
  } catch (error) {
    console.error('Error retrieving admin plan subscriptions by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createAdminPlanSubscription,
  getAllAdminPlanSubscriptions,
  getAdminPlanSubscriptionById,
  updateAdminPlanSubscription,
  deleteAdminPlanSubscription,
  getAdminPlanSubscriptionsByPlanId,
  getAdminPlanSubscriptionsByAuth
};

