const Reel_View = require('../models/Reel_View.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


/**
 * Create a new reel view
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createReelView = asyncHandler(async (req, res) => {
  try {
    const viewData = {
      ...req.body,
      view_by: req.body.view_by || req.userIdNumber,
      created_by: req.userIdNumber || null
    };

    const view = await Reel_View.create(viewData);

    console.info('Reel View created successfully', { viewId: view._id, Real_Post_View_id: view.Real_Post_View_id });

    sendSuccess(res, view, 'Reel View created successfully', 201);
  } catch (error) {
    console.error('Error creating reel view', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all reel views with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllReelViews = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [views, total] = await Promise.all([
      Reel_View.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Reel_View.countDocuments(filter)
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

    console.info('Reel Views retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, views, pagination, 'Reel Views retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel views', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get reel view by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReelViewById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a MongoDB ObjectId or Number ID
    let view;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      view = await Reel_View.findById(id);
    } else {
      // Number ID (Real_Post_View_id)
      const viewId = parseInt(id, 10);
      if (isNaN(viewId)) {
        return sendNotFound(res, 'Invalid reel view ID format');
      }
      view = await Reel_View.findOne({ Real_Post_View_id: viewId });
    }

    if (!view) {
      return sendNotFound(res, 'Reel View not found');
    }

    console.info('Reel View retrieved successfully', { viewId: view._id });

    sendSuccess(res, view, 'Reel View retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel view', { error: error.message, viewId: req.params.id });
    throw error;
  }
});

/**
 * Update reel view by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateReelView = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Check if id is a MongoDB ObjectId or Number ID
    let view;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      view = await Reel_View.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true, 
          runValidators: true
        }
      );
    } else {
      // Number ID (Real_Post_View_id)
      const viewId = parseInt(id, 10);
      if (isNaN(viewId)) {
        return sendNotFound(res, 'Invalid reel view ID format');
      }
      view = await Reel_View.findOneAndUpdate(
        { Real_Post_View_id: viewId },
        updateData,
        { 
          new: true, 
          runValidators: true
        }
      );
    }

    if (!view) {
      return sendNotFound(res, 'Reel View not found');
    }

    console.info('Reel View updated successfully', { viewId: view._id });

    sendSuccess(res, view, 'Reel View updated successfully');
  } catch (error) {
    console.error('Error updating reel view', { error: error.message, viewId: req.params.id });
    throw error;
  }
});

/**
 * Delete reel view by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteReelView = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a MongoDB ObjectId or Number ID
    let view;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      view = await Reel_View.findByIdAndUpdate(
        id,
        { 
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    } else {
      // Number ID (Real_Post_View_id)
      const viewId = parseInt(id, 10);
      if (isNaN(viewId)) {
        return sendNotFound(res, 'Invalid reel view ID format');
      }
      view = await Reel_View.findOneAndUpdate(
        { Real_Post_View_id: viewId },
        { 
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    if (!view) {
      return sendNotFound(res, 'Reel View not found');
    }

    console.info('Reel View deleted successfully', { viewId: view._id });

    sendSuccess(res, view, 'Reel View deleted successfully');
  } catch (error) {
    console.error('Error deleting reel view', { error: error.message, viewId: req.params.id });
    throw error;
  }
});

/**
 * Get all reel views by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReelViewsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {
      view_by: req.userIdNumber
    };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [views, total] = await Promise.all([
      Reel_View.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Reel_View.countDocuments(filter)
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

    console.info('Reel Views by authenticated user retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit),
      userId: req.userIdNumber
    });

    sendPaginated(res, views, pagination, 'Reel Views retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel views by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

/**
 * Get all reel views by Reel ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReelViewsByReelId = asyncHandler(async (req, res) => {
  try {
    const { reelId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const postId = parseInt(reelId, 10);
    if (isNaN(postId)) {
      return sendNotFound(res, 'Invalid reel ID format');
    }

    const filter = {
      Real_Post_id: postId
    };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [views, total] = await Promise.all([
      Reel_View.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Reel_View.countDocuments(filter)
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

    console.info('Reel Views by Reel ID retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit),
      reelId: postId
    });

    sendPaginated(res, views, pagination, 'Reel Views retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel views by Reel ID', { error: error.message, reelId: req.params.reelId });
    throw error;
  }
});

module.exports = {
  createReelView,
  getAllReelViews,
  getReelViewById,
  updateReelView,
  deleteReelView,
  getReelViewsByAuth,
  getReelViewsByReelId
};

