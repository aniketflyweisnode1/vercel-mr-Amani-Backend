const Service_Restaurant = require('../models/Service_Restaurant.model');
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

const populateServiceRestaurant = (query) => query
  .populate('business_Branch_id', 'business_Branch_id name address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const createServiceRestaurant = asyncHandler(async (req, res) => {
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

    const serviceRestaurant = await Service_Restaurant.create(payload);
    console.info('Service restaurant created successfully', { id: serviceRestaurant._id, Service_Restaurant_id: serviceRestaurant.Service_Restaurant_id });

    const populated = await populateServiceRestaurant(Service_Restaurant.findById(serviceRestaurant._id));
    sendSuccess(res, populated, 'Service restaurant created successfully', 201);
  } catch (error) {
    console.error('Error creating service restaurant', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllServiceRestaurants = asyncHandler(async (req, res) => {
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

    const [serviceRestaurants, total] = await Promise.all([
      populateServiceRestaurant(Service_Restaurant.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Service_Restaurant.countDocuments(filter)
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

    console.info('Service restaurants retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, serviceRestaurants, pagination, 'Service restaurants retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service restaurants', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getServiceRestaurantById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let serviceRestaurant;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      serviceRestaurant = await populateServiceRestaurant(Service_Restaurant.findById(id));
    } else {
      const serviceRestaurantId = parseInt(id, 10);
      if (isNaN(serviceRestaurantId)) {
        return sendNotFound(res, 'Invalid service restaurant ID format');
      }
      serviceRestaurant = await populateServiceRestaurant(Service_Restaurant.findOne({ Service_Restaurant_id: serviceRestaurantId }));
    }

    if (!serviceRestaurant) {
      return sendNotFound(res, 'Service restaurant not found');
    }

    console.info('Service restaurant retrieved successfully', { id: serviceRestaurant._id });
    sendSuccess(res, serviceRestaurant, 'Service restaurant retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service restaurant', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateServiceRestaurant = asyncHandler(async (req, res) => {
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

    let serviceRestaurant;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      serviceRestaurant = await Service_Restaurant.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const serviceRestaurantId = parseInt(id, 10);
      if (isNaN(serviceRestaurantId)) {
        return sendNotFound(res, 'Invalid service restaurant ID format');
      }
      serviceRestaurant = await Service_Restaurant.findOneAndUpdate({ Service_Restaurant_id: serviceRestaurantId }, updateData, { new: true, runValidators: true });
    }

    if (!serviceRestaurant) {
      return sendNotFound(res, 'Service restaurant not found');
    }

    const populated = await populateServiceRestaurant(Service_Restaurant.findById(serviceRestaurant._id));
    console.info('Service restaurant updated successfully', { id: serviceRestaurant._id });
    sendSuccess(res, populated, 'Service restaurant updated successfully');
  } catch (error) {
    console.error('Error updating service restaurant', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteServiceRestaurant = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let serviceRestaurant;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      serviceRestaurant = await Service_Restaurant.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const serviceRestaurantId = parseInt(id, 10);
      if (isNaN(serviceRestaurantId)) {
        return sendNotFound(res, 'Invalid service restaurant ID format');
      }
      serviceRestaurant = await Service_Restaurant.findOneAndUpdate({ Service_Restaurant_id: serviceRestaurantId }, updateData, { new: true });
    }

    if (!serviceRestaurant) {
      return sendNotFound(res, 'Service restaurant not found');
    }

    console.info('Service restaurant deleted successfully', { id: serviceRestaurant._id });
    sendSuccess(res, serviceRestaurant, 'Service restaurant deleted successfully');
  } catch (error) {
    console.error('Error deleting service restaurant', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getServiceRestaurantsByAuth = asyncHandler(async (req, res) => {
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

    const [serviceRestaurants, total] = await Promise.all([
      populateServiceRestaurant(Service_Restaurant.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Service_Restaurant.countDocuments(filter)
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

    console.info('Service restaurants retrieved for authenticated user', { userId, total });
    sendPaginated(res, serviceRestaurants, pagination, 'Service restaurants retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service restaurants for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getServiceRestaurantsByBusinessBranchId = asyncHandler(async (req, res) => {
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

    const [serviceRestaurants, total] = await Promise.all([
      populateServiceRestaurant(Service_Restaurant.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Service_Restaurant.countDocuments(filter)
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

    console.info('Service restaurants retrieved by business branch ID', { business_Branch_id: branchIdNum, total });
    sendPaginated(res, serviceRestaurants, pagination, 'Service restaurants retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service restaurants by business branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createServiceRestaurant,
  getAllServiceRestaurants,
  getServiceRestaurantById,
  updateServiceRestaurant,
  deleteServiceRestaurant,
  getServiceRestaurantsByAuth,
  getServiceRestaurantsByBusinessBranchId
};

