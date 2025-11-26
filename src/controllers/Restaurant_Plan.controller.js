const RestaurantPlan = require('../models/Restaurant_Plan.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateRestaurantPlan = (query) => query
  .populate('business_Branch_id', 'business_Branch_id firstName lastName BusinessName Address City state country')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, business_Branch_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (business_Branch_id !== undefined) {
    const branchId = parseInt(business_Branch_id, 10);
    if (!Number.isNaN(branchId)) {
      filter.business_Branch_id = branchId;
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

const ensureBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined) {
    return true;
  }
  const branchId = parseInt(business_Branch_id, 10);
  if (Number.isNaN(branchId)) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return Boolean(branch);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateRestaurantPlan(RestaurantPlan.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateRestaurantPlan(RestaurantPlan.findOne({ Restaurant_Plan_id: numericId }));
  }

  return null;
};

const createRestaurantPlan = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.body;

    if (!(await ensureBranchExists(business_Branch_id))) {
      return sendError(res, 'Business branch not found', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const plan = await RestaurantPlan.create(payload);
    const populated = await populateRestaurantPlan(RestaurantPlan.findById(plan._id));

    sendSuccess(res, populated, 'Restaurant plan created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant plan', { error: error.message });
    throw error;
  }
});

const getAllRestaurantPlans = asyncHandler(async (req, res) => {
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

    const filter = buildFilter({ search, status, business_Branch_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [plans, total] = await Promise.all([
      populateRestaurantPlan(RestaurantPlan.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantPlan.countDocuments(filter)
    ]);

    sendPaginated(res, plans, paginateMeta(numericPage, numericLimit, total), 'Restaurant plans retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant plans', { error: error.message });
    throw error;
  }
});

const getRestaurantPlanById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const planQuery = findByIdentifier(id);

    if (!planQuery) {
      return sendError(res, 'Invalid restaurant plan identifier', 400);
    }

    const plan = await planQuery;

    if (!plan) {
      return sendNotFound(res, 'Restaurant plan not found');
    }

    sendSuccess(res, plan, 'Restaurant plan retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant plan', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateRestaurantPlan = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { business_Branch_id } = req.body;

    if (business_Branch_id !== undefined && !(await ensureBranchExists(business_Branch_id))) {
      return sendError(res, 'Business branch not found', 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let plan;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      plan = await RestaurantPlan.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant plan ID format', 400);
      }
      plan = await RestaurantPlan.findOneAndUpdate({ Restaurant_Plan_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!plan) {
      return sendNotFound(res, 'Restaurant plan not found');
    }

    const populated = await populateRestaurantPlan(RestaurantPlan.findById(plan._id));
    sendSuccess(res, populated, 'Restaurant plan updated successfully');
  } catch (error) {
    console.error('Error updating restaurant plan', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteRestaurantPlan = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let plan;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      plan = await RestaurantPlan.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant plan ID format', 400);
      }
      plan = await RestaurantPlan.findOneAndUpdate({ Restaurant_Plan_id: numericId }, updatePayload, { new: true });
    }

    if (!plan) {
      return sendNotFound(res, 'Restaurant plan not found');
    }

    sendSuccess(res, plan, 'Restaurant plan deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant plan', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getRestaurantPlansByAuth = asyncHandler(async (req, res) => {
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
      business_Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [plans, total] = await Promise.all([
      populateRestaurantPlan(RestaurantPlan.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantPlan.countDocuments(filter)
    ]);

    sendPaginated(res, plans, paginateMeta(numericPage, numericLimit, total), 'Restaurant plans retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant plans by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createRestaurantPlan,
  getAllRestaurantPlans,
  getRestaurantPlanById,
  updateRestaurantPlan,
  deleteRestaurantPlan,
  getRestaurantPlansByAuth
};

