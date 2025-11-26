const ServiceCharges_type = require('../models/ServiceCharges_type.model');
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

const populateServiceChargesType = (query) => query
  .populate('business_Branch_id', 'business_Branch_id name address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const createServiceChargesType = asyncHandler(async (req, res) => {
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

    const serviceChargesType = await ServiceCharges_type.create(payload);
    console.info('Service charges type created successfully', { id: serviceChargesType._id, ServiceCharges_type_id: serviceChargesType.ServiceCharges_type_id });

    const populated = await populateServiceChargesType(ServiceCharges_type.findById(serviceChargesType._id));
    sendSuccess(res, populated, 'Service charges type created successfully', 201);
  } catch (error) {
    console.error('Error creating service charges type', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllServiceChargesTypes = asyncHandler(async (req, res) => {
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

    const [serviceChargesTypes, total] = await Promise.all([
      populateServiceChargesType(ServiceCharges_type.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ServiceCharges_type.countDocuments(filter)
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

    console.info('Service charges types retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, serviceChargesTypes, pagination, 'Service charges types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service charges types', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getServiceChargesTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let serviceChargesType;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      serviceChargesType = await populateServiceChargesType(ServiceCharges_type.findById(id));
    } else {
      const serviceChargesTypeId = parseInt(id, 10);
      if (isNaN(serviceChargesTypeId)) {
        return sendNotFound(res, 'Invalid service charges type ID format');
      }
      serviceChargesType = await populateServiceChargesType(ServiceCharges_type.findOne({ ServiceCharges_type_id: serviceChargesTypeId }));
    }

    if (!serviceChargesType) {
      return sendNotFound(res, 'Service charges type not found');
    }

    console.info('Service charges type retrieved successfully', { id: serviceChargesType._id });
    sendSuccess(res, serviceChargesType, 'Service charges type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service charges type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateServiceChargesType = asyncHandler(async (req, res) => {
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

    let serviceChargesType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      serviceChargesType = await ServiceCharges_type.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const serviceChargesTypeId = parseInt(id, 10);
      if (isNaN(serviceChargesTypeId)) {
        return sendNotFound(res, 'Invalid service charges type ID format');
      }
      serviceChargesType = await ServiceCharges_type.findOneAndUpdate({ ServiceCharges_type_id: serviceChargesTypeId }, updateData, { new: true, runValidators: true });
    }

    if (!serviceChargesType) {
      return sendNotFound(res, 'Service charges type not found');
    }

    const populated = await populateServiceChargesType(ServiceCharges_type.findById(serviceChargesType._id));
    console.info('Service charges type updated successfully', { id: serviceChargesType._id });
    sendSuccess(res, populated, 'Service charges type updated successfully');
  } catch (error) {
    console.error('Error updating service charges type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteServiceChargesType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let serviceChargesType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      serviceChargesType = await ServiceCharges_type.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const serviceChargesTypeId = parseInt(id, 10);
      if (isNaN(serviceChargesTypeId)) {
        return sendNotFound(res, 'Invalid service charges type ID format');
      }
      serviceChargesType = await ServiceCharges_type.findOneAndUpdate({ ServiceCharges_type_id: serviceChargesTypeId }, updateData, { new: true });
    }

    if (!serviceChargesType) {
      return sendNotFound(res, 'Service charges type not found');
    }

    console.info('Service charges type deleted successfully', { id: serviceChargesType._id });
    sendSuccess(res, serviceChargesType, 'Service charges type deleted successfully');
  } catch (error) {
    console.error('Error deleting service charges type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getServiceChargesTypesByAuth = asyncHandler(async (req, res) => {
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

    const [serviceChargesTypes, total] = await Promise.all([
      populateServiceChargesType(ServiceCharges_type.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ServiceCharges_type.countDocuments(filter)
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

    console.info('Service charges types retrieved for authenticated user', { userId, total });
    sendPaginated(res, serviceChargesTypes, pagination, 'Service charges types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service charges types for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getServiceChargesTypesByBusinessBranchId = asyncHandler(async (req, res) => {
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

    const [serviceChargesTypes, total] = await Promise.all([
      populateServiceChargesType(ServiceCharges_type.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ServiceCharges_type.countDocuments(filter)
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

    console.info('Service charges types retrieved by business branch ID', { business_Branch_id: branchIdNum, total });
    sendPaginated(res, serviceChargesTypes, pagination, 'Service charges types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service charges types by business branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createServiceChargesType,
  getAllServiceChargesTypes,
  getServiceChargesTypeById,
  updateServiceChargesType,
  deleteServiceChargesType,
  getServiceChargesTypesByAuth,
  getServiceChargesTypesByBusinessBranchId
};

