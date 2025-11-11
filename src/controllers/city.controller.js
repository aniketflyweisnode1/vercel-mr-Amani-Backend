const City = require('../models/city.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new city
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCity = asyncHandler(async (req, res) => {
  try {
    const cityData = {
      ...req.body,
      created_by: req.userId || null
    };

    const city = await City.create(cityData);

    logger.info('City created successfully', { cityId: city._id, city_id: city.city_id });

    sendSuccess(res, city, 'City created successfully', 201);
  } catch (error) {
    logger.error('Error creating city', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all cities with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCities = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      state_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { stateCode: { $regex: search, $options: 'i' } },
        { countryCode: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    if (state_id) {
      filter.state_id = state_id;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [cities, total] = await Promise.all([
      City.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      City.countDocuments(filter)
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

    logger.info('Cities retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, cities, pagination, 'Cities retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving cities', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get city by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCityById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findById(id);

    if (!city) {
      return sendNotFound(res, 'City not found');
    }

    logger.info('City retrieved successfully', { cityId: city._id });

    sendSuccess(res, city, 'City retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving city', { error: error.message, cityId: req.params.id });
    throw error;
  }
});

/**
 * Update city by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCity = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const city = await City.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!city) {
      return sendNotFound(res, 'City not found');
    }

    logger.info('City updated successfully', { cityId: city._id });

    sendSuccess(res, city, 'City updated successfully');
  } catch (error) {
    logger.error('Error updating city', { error: error.message, cityId: req.params.id });
    throw error;
  }
});

/**
 * Delete city by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCity = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findByIdAndUpdate(
      id,
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!city) {
      return sendNotFound(res, 'City not found');
    }

    logger.info('City deleted successfully', { cityId: city._id });

    sendSuccess(res, city, 'City deleted successfully');
  } catch (error) {
    logger.error('Error deleting city', { error: error.message, cityId: req.params.id });
    throw error;
  }
});

module.exports = {
  createCity,
  getAllCities,
  getCityById,
  updateCity,
  deleteCity
};

