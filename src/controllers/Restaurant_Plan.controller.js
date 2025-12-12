const RestaurantPlan = require('../models/Restaurant_Plan.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateRestaurantPlan = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate business_Branch_id
      if (recordObj.business_Branch_id) {
        const branchId = typeof recordObj.business_Branch_id === 'object' ? recordObj.business_Branch_id : recordObj.business_Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id firstName lastName BusinessName Address City state country');
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

const findByIdentifier = async (identifier) => {
  let planData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    planData = await RestaurantPlan.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      planData = await RestaurantPlan.findOne({ Restaurant_Plan_id: numericId });
    }
  }
  
  if (!planData) {
    return null;
  }
  
  return await populateRestaurantPlan(planData);
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
    const populated = await populateRestaurantPlan(plan);

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

    const [plansData, total] = await Promise.all([
      RestaurantPlan.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantPlan.countDocuments(filter)
    ]);
    
    const plans = await populateRestaurantPlan(plansData);

    sendPaginated(res, plans, paginateMeta(numericPage, numericLimit, total), 'Restaurant plans retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant plans', { error: error.message });
    throw error;
  }
});

const getRestaurantPlanById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await findByIdentifier(id);

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

    const populated = await populateRestaurantPlan(plan);
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

    const [plansData, total] = await Promise.all([
      RestaurantPlan.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantPlan.countDocuments(filter)
    ]);
    
    const plans = await populateRestaurantPlan(plansData);

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

