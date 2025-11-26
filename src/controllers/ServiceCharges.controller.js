const ServiceCharges = require('../models/ServiceCharges.model');
const ServiceCharges_type = require('../models/ServiceCharges_type.model');
const Service_Restaurant = require('../models/Service_Restaurant.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to get business_Branch_id from authenticated user
const getBusinessBranchIdByAuth = async (userIdNumber) => {
  const branch = await Business_Branch.findOne({ created_by: userIdNumber, Status: true });
  return branch ? branch.business_Branch_id : null;
};

// Helper function to ensure service charges type exists
const ensureServiceChargesTypeExists = async (ServiceCharges_type_id) => {
  const serviceChargesType = await ServiceCharges_type.findOne({ ServiceCharges_type_id, Status: true });
  return !!serviceChargesType;
};

// Helper function to ensure service restaurant exists
const ensureServiceRestaurantExists = async (Service_Restaurant_id) => {
  const serviceRestaurant = await Service_Restaurant.findOne({ Service_Restaurant_id, Status: true });
  return !!serviceRestaurant;
};

// Helper function to ensure business branch exists
const ensureBusinessBranchExists = async (business_Branch_id) => {
  const branch = await Business_Branch.findOne({ business_Branch_id, Status: true });
  return !!branch;
};

const buildFilterFromQuery = ({ search, status, ServiceCharges_type_id, Service_Restaurant_id, business_Branch_id }) => {
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

  if (ServiceCharges_type_id) {
    const typeIdNum = parseInt(ServiceCharges_type_id, 10);
    if (!isNaN(typeIdNum)) {
      filter.ServiceCharges_type_id = typeIdNum;
    }
  }

  if (Service_Restaurant_id) {
    const restaurantIdNum = parseInt(Service_Restaurant_id, 10);
    if (!isNaN(restaurantIdNum)) {
      filter.Service_Restaurant_id = restaurantIdNum;
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

const populateServiceCharges = (query) => query
  .populate('ServiceCharges_type_id', 'ServiceCharges_type_id name Description Status')
  .populate('Service_Restaurant_id', 'Service_Restaurant_id name Description Status')
  .populate('business_Branch_id', 'business_Branch_id name address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const createServiceCharges = asyncHandler(async (req, res) => {
  try {
    const { ServiceCharges_type_id, Service_Restaurant_id } = req.body;

    // Validate service charges type exists
    const serviceChargesTypeExists = await ensureServiceChargesTypeExists(ServiceCharges_type_id);
    if (!serviceChargesTypeExists) {
      return sendError(res, 'Service charges type not found or inactive', 404);
    }

    // Validate service restaurant exists
    const serviceRestaurantExists = await ensureServiceRestaurantExists(Service_Restaurant_id);
    if (!serviceRestaurantExists) {
      return sendError(res, 'Service restaurant not found or inactive', 404);
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

    const serviceCharges = await ServiceCharges.create(payload);
    console.info('Service charges created successfully', { id: serviceCharges._id, ServiceCharges_id: serviceCharges.ServiceCharges_id });

    const populated = await populateServiceCharges(ServiceCharges.findById(serviceCharges._id));
    sendSuccess(res, populated, 'Service charges created successfully', 201);
  } catch (error) {
    console.error('Error creating service charges', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllServiceCharges = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      ServiceCharges_type_id,
      Service_Restaurant_id,
      business_Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status, ServiceCharges_type_id, Service_Restaurant_id, business_Branch_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [serviceCharges, total] = await Promise.all([
      populateServiceCharges(ServiceCharges.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ServiceCharges.countDocuments(filter)
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

    console.info('Service charges retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, serviceCharges, pagination, 'Service charges retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service charges', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getServiceChargesById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let serviceCharges;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      serviceCharges = await populateServiceCharges(ServiceCharges.findById(id));
    } else {
      const serviceChargesId = parseInt(id, 10);
      if (isNaN(serviceChargesId)) {
        return sendNotFound(res, 'Invalid service charges ID format');
      }
      serviceCharges = await populateServiceCharges(ServiceCharges.findOne({ ServiceCharges_id: serviceChargesId }));
    }

    if (!serviceCharges) {
      return sendNotFound(res, 'Service charges not found');
    }

    console.info('Service charges retrieved successfully', { id: serviceCharges._id });
    sendSuccess(res, serviceCharges, 'Service charges retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service charges', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateServiceCharges = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Validate service charges type if being updated
    if (updateData.ServiceCharges_type_id !== undefined) {
      const serviceChargesTypeExists = await ensureServiceChargesTypeExists(updateData.ServiceCharges_type_id);
      if (!serviceChargesTypeExists) {
        return sendError(res, 'Service charges type not found or inactive', 400);
      }
    }

    // Validate service restaurant if being updated
    if (updateData.Service_Restaurant_id !== undefined) {
      const serviceRestaurantExists = await ensureServiceRestaurantExists(updateData.Service_Restaurant_id);
      if (!serviceRestaurantExists) {
        return sendError(res, 'Service restaurant not found or inactive', 400);
      }
    }

    // Validate business_Branch_id if being updated
    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Business branch not found', 400);
      }
    }

    let serviceCharges;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      serviceCharges = await ServiceCharges.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const serviceChargesId = parseInt(id, 10);
      if (isNaN(serviceChargesId)) {
        return sendNotFound(res, 'Invalid service charges ID format');
      }
      serviceCharges = await ServiceCharges.findOneAndUpdate({ ServiceCharges_id: serviceChargesId }, updateData, { new: true, runValidators: true });
    }

    if (!serviceCharges) {
      return sendNotFound(res, 'Service charges not found');
    }

    const populated = await populateServiceCharges(ServiceCharges.findById(serviceCharges._id));
    console.info('Service charges updated successfully', { id: serviceCharges._id });
    sendSuccess(res, populated, 'Service charges updated successfully');
  } catch (error) {
    console.error('Error updating service charges', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteServiceCharges = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let serviceCharges;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      serviceCharges = await ServiceCharges.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const serviceChargesId = parseInt(id, 10);
      if (isNaN(serviceChargesId)) {
        return sendNotFound(res, 'Invalid service charges ID format');
      }
      serviceCharges = await ServiceCharges.findOneAndUpdate({ ServiceCharges_id: serviceChargesId }, updateData, { new: true });
    }

    if (!serviceCharges) {
      return sendNotFound(res, 'Service charges not found');
    }

    console.info('Service charges deleted successfully', { id: serviceCharges._id });
    sendSuccess(res, serviceCharges, 'Service charges deleted successfully');
  } catch (error) {
    console.error('Error deleting service charges', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getServiceChargesByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      ServiceCharges_type_id,
      Service_Restaurant_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ status, ServiceCharges_type_id, Service_Restaurant_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [serviceCharges, total] = await Promise.all([
      populateServiceCharges(ServiceCharges.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ServiceCharges.countDocuments(filter)
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

    console.info('Service charges retrieved for authenticated user', { userId, total });
    sendPaginated(res, serviceCharges, pagination, 'Service charges retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service charges for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getServiceChargesByTypeId = asyncHandler(async (req, res) => {
  try {
    const { ServiceCharges_type_id } = req.params;
    const typeIdNum = parseInt(ServiceCharges_type_id, 10);

    if (isNaN(typeIdNum)) {
      return sendError(res, 'Invalid service charges type ID format', 400);
    }

    // Validate service charges type exists
    const serviceChargesTypeExists = await ensureServiceChargesTypeExists(typeIdNum);
    if (!serviceChargesTypeExists) {
      return sendNotFound(res, 'Service charges type not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      Service_Restaurant_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ search, status, Service_Restaurant_id });
    filter.ServiceCharges_type_id = typeIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [serviceCharges, total] = await Promise.all([
      populateServiceCharges(ServiceCharges.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ServiceCharges.countDocuments(filter)
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

    console.info('Service charges retrieved by type ID', { ServiceCharges_type_id: typeIdNum, total });
    sendPaginated(res, serviceCharges, pagination, 'Service charges retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service charges by type ID', { error: error.message, ServiceCharges_type_id: req.params.ServiceCharges_type_id });
    throw error;
  }
});

const getServiceChargesByServiceRestaurantId = asyncHandler(async (req, res) => {
  try {
    const { Service_Restaurant_id } = req.params;
    const restaurantIdNum = parseInt(Service_Restaurant_id, 10);

    if (isNaN(restaurantIdNum)) {
      return sendError(res, 'Invalid service restaurant ID format', 400);
    }

    // Validate service restaurant exists
    const serviceRestaurantExists = await ensureServiceRestaurantExists(restaurantIdNum);
    if (!serviceRestaurantExists) {
      return sendNotFound(res, 'Service restaurant not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      ServiceCharges_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ search, status, ServiceCharges_type_id });
    filter.Service_Restaurant_id = restaurantIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [serviceCharges, total] = await Promise.all([
      populateServiceCharges(ServiceCharges.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ServiceCharges.countDocuments(filter)
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

    console.info('Service charges retrieved by service restaurant ID', { Service_Restaurant_id: restaurantIdNum, total });
    sendPaginated(res, serviceCharges, pagination, 'Service charges retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service charges by service restaurant ID', { error: error.message, Service_Restaurant_id: req.params.Service_Restaurant_id });
    throw error;
  }
});

const getServiceChargesByBusinessBranchId = asyncHandler(async (req, res) => {
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
      ServiceCharges_type_id,
      Service_Restaurant_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ search, status, ServiceCharges_type_id, Service_Restaurant_id });
    filter.business_Branch_id = branchIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [serviceCharges, total] = await Promise.all([
      populateServiceCharges(ServiceCharges.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ServiceCharges.countDocuments(filter)
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

    console.info('Service charges retrieved by business branch ID', { business_Branch_id: branchIdNum, total });
    sendPaginated(res, serviceCharges, pagination, 'Service charges retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service charges by business branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createServiceCharges,
  getAllServiceCharges,
  getServiceChargesById,
  updateServiceCharges,
  deleteServiceCharges,
  getServiceChargesByAuth,
  getServiceChargesByTypeId,
  getServiceChargesByServiceRestaurantId,
  getServiceChargesByBusinessBranchId
};

