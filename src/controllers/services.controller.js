const Services = require('../models/services.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


/**
 * Create a new service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createService = asyncHandler(async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const service = await Services.create(serviceData);

    console.info('Service created successfully', { serviceId: service._id, service_id: service.service_id });

    sendSuccess(res, service, 'Service created successfully', 201);
  } catch (error) {
    console.error('Error creating service', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all services with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllServices = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      Services.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Services.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };

    console.info('Services retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, services, pagination, 'Services retrieved successfully');
  } catch (error) {
    console.error('Error retrieving services', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get service by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getServiceById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Services.findById(id);

    if (!service) {
      return sendNotFound(res, 'Service not found');
    }

    console.info('Service retrieved successfully', { serviceId: service._id });

    sendSuccess(res, service, 'Service retrieved successfully');
  } catch (error) {
    console.error('Error retrieving service', { error: error.message, serviceId: req.params.id });
    throw error;
  }
});

/**
 * Update service by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateService = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    const service = await Services.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!service) {
      return sendNotFound(res, 'Service not found');
    }

    console.info('Service updated successfully', { serviceId: service._id });

    sendSuccess(res, service, 'Service updated successfully');
  } catch (error) {
    console.error('Error updating service', { error: error.message, serviceId: req.params.id });
    throw error;
  }
});

/**
 * Delete service by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteService = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Services.findByIdAndUpdate(
      id,
      { 
        status: false,
        updated_by: req.userIdNumber || null,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!service) {
      return sendNotFound(res, 'Service not found');
    }

    console.info('Service deleted successfully', { serviceId: service._id });

    sendSuccess(res, service, 'Service deleted successfully');
  } catch (error) {
    console.error('Error deleting service', { error: error.message, serviceId: req.params.id });
    throw error;
  }
});

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
};

