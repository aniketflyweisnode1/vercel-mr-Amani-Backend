const Country = require('../models/country.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new country
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCountry = asyncHandler(async (req, res) => {
  try {
    const countryData = {
      ...req.body,
      created_by: req.userId || null
    };

    const country = await Country.create(countryData);

    logger.info('Country created successfully', { countryId: country._id, country_id: country.country_id });

    sendSuccess(res, country, 'Country created successfully', 201);
  } catch (error) {
    logger.error('Error creating country', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all countries with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCountries = asyncHandler(async (req, res) => {
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
        { isoCode: { $regex: search, $options: 'i' } },
        { code2: { $regex: search, $options: 'i' } },
        { code3: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [countries, total] = await Promise.all([
      Country.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Country.countDocuments(filter)
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

    logger.info('Countries retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, countries, pagination, 'Countries retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving countries', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get country by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCountryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const country = await Country.findById(id);

    if (!country) {
      return sendNotFound(res, 'Country not found');
    }

    logger.info('Country retrieved successfully', { countryId: country._id });

    sendSuccess(res, country, 'Country retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving country', { error: error.message, countryId: req.params.id });
    throw error;
  }
});

/**
 * Update country by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCountry = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const country = await Country.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!country) {
      return sendNotFound(res, 'Country not found');
    }

    logger.info('Country updated successfully', { countryId: country._id });

    sendSuccess(res, country, 'Country updated successfully');
  } catch (error) {
    logger.error('Error updating country', { error: error.message, countryId: req.params.id });
    throw error;
  }
});

/**
 * Delete country by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCountry = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const country = await Country.findByIdAndUpdate(
      id,
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!country) {
      return sendNotFound(res, 'Country not found');
    }

    logger.info('Country deleted successfully', { countryId: country._id });

    sendSuccess(res, country, 'Country deleted successfully');
  } catch (error) {
    logger.error('Error deleting country', { error: error.message, countryId: req.params.id });
    throw error;
  }
});

module.exports = {
  createCountry,
  getAllCountries,
  getCountryById,
  updateCountry,
  deleteCountry
};

