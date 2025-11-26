const Customer = require('../models/Customer.model');
const Services = require('../models/services.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureServiceExists = async (service_id) => {
  const service = await Services.findOne({ service_id });
  return !!service;
};

const ensureBranchExists = async (Branch_id) => {
  const branch = await Business_Branch.findOne({ business_Branch_id: Branch_id });
  return !!branch;
};

const createCustomer = asyncHandler(async (req, res) => {
  try {
    const customerData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    // Validate service_id exists
    const serviceExists = await ensureServiceExists(customerData.service_id);
    if (!serviceExists) {
      return sendError(res, 'Service not found', 400);
    }

    // Validate Branch_id exists
    const branchExists = await ensureBranchExists(customerData.Branch_id);
    if (!branchExists) {
      return sendError(res, 'Branch not found', 400);
    }

    const customer = await Customer.create(customerData);
    console.info('Customer created successfully', { id: customer._id, Customer_id: customer.Customer_id });
    sendSuccess(res, customer, 'Customer created successfully', 201);
  } catch (error) {
    console.error('Error creating customer', { error: error.message, stack: error.stack });
    throw error;
  }
});

const buildFilterFromQuery = (query) => {
  const {
    search,
    status,
    service_id,
    Branch_id,
    email,
    mobile
  } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      { FullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (service_id) {
    const serviceIdNum = parseInt(service_id, 10);
    if (!isNaN(serviceIdNum)) {
      filter.service_id = serviceIdNum;
    }
  }

  if (Branch_id) {
    const branchIdNum = parseInt(Branch_id, 10);
    if (!isNaN(branchIdNum)) {
      filter.Branch_id = branchIdNum;
    }
  }

  if (email) {
    filter.email = email.toLowerCase().trim();
  }

  if (mobile) {
    filter.mobile = mobile.trim();
  }

  return filter;
};

const getAllCustomers = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      service_id,
      Branch_id,
      email,
      mobile,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ search, status, service_id, Branch_id, email, mobile });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .populate('service_id', 'name description emozji')
        .populate('Branch_id', 'name address City state country')
        .populate('created_by', 'firstName lastName phoneNo BusinessName')
        .populate('updated_by', 'firstName lastName phoneNo BusinessName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Customer.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: parseInt(page, 10) < totalPages,
      hasPrevPage: parseInt(page, 10) > 1
    };

    console.info('Customers retrieved successfully', { total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
    sendPaginated(res, customers, pagination, 'Customers retrieved successfully');
  } catch (error) {
    console.error('Error retrieving customers', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getCustomerById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let customer;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findById(id)
        .populate('service_id', 'name description emozji')
        .populate('Branch_id', 'name address City state country')
        .populate('created_by', 'firstName lastName phoneNo BusinessName')
        .populate('updated_by', 'firstName lastName phoneNo BusinessName');
    } else {
      const customerId = parseInt(id, 10);
      if (isNaN(customerId)) {
        return sendNotFound(res, 'Invalid customer ID format');
      }
      customer = await Customer.findOne({ Customer_id: customerId })
        .populate('service_id', 'name description emozji')
        .populate('Branch_id', 'name address City state country')
        .populate('created_by', 'firstName lastName phoneNo BusinessName')
        .populate('updated_by', 'firstName lastName phoneNo BusinessName');
    }

    if (!customer) {
      return sendNotFound(res, 'Customer not found');
    }

    console.info('Customer retrieved successfully', { id: customer._id });
    sendSuccess(res, customer, 'Customer retrieved successfully');
  } catch (error) {
    console.error('Error retrieving customer', { error: error.message, customerId: req.params.id });
    throw error;
  }
});

const updateCustomer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Validate service_id if being updated
    if (updateData.service_id !== undefined) {
      const serviceExists = await ensureServiceExists(updateData.service_id);
      if (!serviceExists) {
        return sendError(res, 'Service not found', 400);
      }
    }

    // Validate Branch_id if being updated
    if (updateData.Branch_id !== undefined) {
      const branchExists = await ensureBranchExists(updateData.Branch_id);
      if (!branchExists) {
        return sendError(res, 'Branch not found', 400);
      }
    }

    let customer;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .populate('service_id', 'name description emozji')
        .populate('Branch_id', 'name address City state country')
        .populate('created_by', 'firstName lastName phoneNo BusinessName')
        .populate('updated_by', 'firstName lastName phoneNo BusinessName');
    } else {
      const customerId = parseInt(id, 10);
      if (isNaN(customerId)) {
        return sendNotFound(res, 'Invalid customer ID format');
      }
      customer = await Customer.findOneAndUpdate({ Customer_id: customerId }, updateData, { new: true, runValidators: true })
        .populate('service_id', 'name description emozji')
        .populate('Branch_id', 'name address City state country')
        .populate('created_by', 'firstName lastName phoneNo BusinessName')
        .populate('updated_by', 'firstName lastName phoneNo BusinessName');
    }

    if (!customer) {
      return sendNotFound(res, 'Customer not found');
    }

    console.info('Customer updated successfully', { id: customer._id });
    sendSuccess(res, customer, 'Customer updated successfully');
  } catch (error) {
    console.error('Error updating customer', { error: error.message, customerId: req.params.id });
    throw error;
  }
});

const deleteCustomer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let customer;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const customerId = parseInt(id, 10);
      if (isNaN(customerId)) {
        return sendNotFound(res, 'Invalid customer ID format');
      }
      customer = await Customer.findOneAndUpdate({ Customer_id: customerId }, updateData, { new: true });
    }

    if (!customer) {
      return sendNotFound(res, 'Customer not found');
    }

    console.info('Customer deleted successfully', { id: customer._id });
    sendSuccess(res, customer, 'Customer deleted successfully');
  } catch (error) {
    console.error('Error deleting customer', { error: error.message, customerId: req.params.id });
    throw error;
  }
});

const getCustomersByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      service_id,
      Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ status, service_id, Branch_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .populate('service_id', 'name description emozji')
        .populate('Branch_id', 'name address City state country')
        .populate('created_by', 'firstName lastName phoneNo BusinessName')
        .populate('updated_by', 'firstName lastName phoneNo BusinessName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Customer.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: parseInt(page, 10) < totalPages,
      hasPrevPage: parseInt(page, 10) > 1
    };

    console.info('Customers retrieved for authenticated user', { userId, total });
    sendPaginated(res, customers, pagination, 'Customers retrieved successfully');
  } catch (error) {
    console.error('Error retrieving customers for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getCustomersByServiceId = asyncHandler(async (req, res) => {
  try {
    const { service_id } = req.params;
    const serviceIdNum = parseInt(service_id, 10);
    
    if (isNaN(serviceIdNum)) {
      return sendError(res, 'Invalid service ID format', 400);
    }

    // Validate service exists
    const serviceExists = await ensureServiceExists(serviceIdNum);
    if (!serviceExists) {
      return sendNotFound(res, 'Service not found');
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
    filter.service_id = serviceIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .populate('service_id', 'name description emozji')
        .populate('Branch_id', 'name address City state country')
        .populate('created_by', 'firstName lastName phoneNo BusinessName')
        .populate('updated_by', 'firstName lastName phoneNo BusinessName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Customer.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: parseInt(page, 10) < totalPages,
      hasPrevPage: parseInt(page, 10) > 1
    };

    console.info('Customers retrieved by service ID', { service_id: serviceIdNum, total });
    sendPaginated(res, customers, pagination, 'Customers retrieved successfully');
  } catch (error) {
    console.error('Error retrieving customers by service ID', { error: error.message, service_id: req.params.service_id });
    throw error;
  }
});

const getCustomersByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.params;
    const branchIdNum = parseInt(Branch_id, 10);
    
    if (isNaN(branchIdNum)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }

    // Validate branch exists
    const branchExists = await ensureBranchExists(branchIdNum);
    if (!branchExists) {
      return sendNotFound(res, 'Branch not found');
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
    filter.Branch_id = branchIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .populate('service_id', 'name description emozji')
        .populate('Branch_id', 'name address City state country')
        .populate('created_by', 'firstName lastName phoneNo BusinessName')
        .populate('updated_by', 'firstName lastName phoneNo BusinessName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Customer.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: parseInt(page, 10) < totalPages,
      hasPrevPage: parseInt(page, 10) > 1
    };

    console.info('Customers retrieved by branch ID', { Branch_id: branchIdNum, total });
    sendPaginated(res, customers, pagination, 'Customers retrieved successfully');
  } catch (error) {
    console.error('Error retrieving customers by branch ID', { error: error.message, Branch_id: req.params.Branch_id });
    throw error;
  }
});

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomersByAuth,
  getCustomersByServiceId,
  getCustomersByBranchId
};

