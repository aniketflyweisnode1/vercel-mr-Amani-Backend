const State = require('../models/state.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


/**
 * Create a new state
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createState = asyncHandler(async (req, res) => {
  try {
    const stateData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const state = await State.create(stateData);

    console.info('State created successfully', { stateId: state._id, state_id: state.state_id });

    sendSuccess(res, state, 'State created successfully', 201);
  } catch (error) {
    console.error('Error creating state', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all states with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllStates = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      country_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { isoCode: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    if (country_id) {
      filter.country_id = country_id;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [states, total] = await Promise.all([
      State.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      State.countDocuments(filter)
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

    console.info('States retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, states, pagination, 'States retrieved successfully');
  } catch (error) {
    console.error('Error retrieving states', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get state by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStateById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const state = await State.findById(id);

    if (!state) {
      return sendNotFound(res, 'State not found');
    }

    console.info('State retrieved successfully', { stateId: state._id });

    sendSuccess(res, state, 'State retrieved successfully');
  } catch (error) {
    console.error('Error retrieving state', { error: error.message, stateId: req.params.id });
    throw error;
  }
});

/**
 * Update state by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateState = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    const state = await State.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!state) {
      return sendNotFound(res, 'State not found');
    }

    console.info('State updated successfully', { stateId: state._id });

    sendSuccess(res, state, 'State updated successfully');
  } catch (error) {
    console.error('Error updating state', { error: error.message, stateId: req.params.id });
    throw error;
  }
});

/**
 * Delete state by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteState = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const state = await State.findByIdAndUpdate(
      id,
      { 
        status: false,
        updated_by: req.userIdNumber || null,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!state) {
      return sendNotFound(res, 'State not found');
    }

    console.info('State deleted successfully', { stateId: state._id });

    sendSuccess(res, state, 'State deleted successfully');
  } catch (error) {
    console.error('Error deleting state', { error: error.message, stateId: req.params.id });
    throw error;
  }
});

module.exports = {
  createState,
  getAllStates,
  getStateById,
  updateState,
  deleteState
};

