const SubCategory = require('../models/subcategory.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new subcategory
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createSubCategory = asyncHandler(async (req, res) => {
  try {
    const subCategoryData = {
      ...req.body,
      created_by: req.userId || null
    };

    const subCategory = await SubCategory.create(subCategoryData);

    logger.info('SubCategory created successfully', { subCategoryId: subCategory._id, subcategory_id: subCategory.subcategory_id });

    sendSuccess(res, subCategory, 'SubCategory created successfully', 201);
  } catch (error) {
    logger.error('Error creating subcategory', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all subcategories with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllSubCategories = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      category_id,
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

    if (category_id) {
      filter.category_id = category_id;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [subCategories, total] = await Promise.all([
      SubCategory.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      SubCategory.countDocuments(filter)
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

    logger.info('SubCategories retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, subCategories, pagination, 'SubCategories retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving subcategories', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get subcategory by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSubCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findById(id);

    if (!subCategory) {
      return sendNotFound(res, 'SubCategory not found');
    }

    logger.info('SubCategory retrieved successfully', { subCategoryId: subCategory._id });

    sendSuccess(res, subCategory, 'SubCategory retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving subcategory', { error: error.message, subCategoryId: req.params.id });
    throw error;
  }
});

/**
 * Update subcategory by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateSubCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const subCategory = await SubCategory.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!subCategory) {
      return sendNotFound(res, 'SubCategory not found');
    }

    logger.info('SubCategory updated successfully', { subCategoryId: subCategory._id });

    sendSuccess(res, subCategory, 'SubCategory updated successfully');
  } catch (error) {
    logger.error('Error updating subcategory', { error: error.message, subCategoryId: req.params.id });
    throw error;
  }
});

/**
 * Delete subcategory by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteSubCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findByIdAndUpdate(
      id,
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!subCategory) {
      return sendNotFound(res, 'SubCategory not found');
    }

    logger.info('SubCategory deleted successfully', { subCategoryId: subCategory._id });

    sendSuccess(res, subCategory, 'SubCategory deleted successfully');
  } catch (error) {
    logger.error('Error deleting subcategory', { error: error.message, subCategoryId: req.params.id });
    throw error;
  }
});

/**
 * Get subcategories by category ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSubCategoriesByCategoryId = asyncHandler(async (req, res) => {
  try {
    const { category_id } = req.params;

    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {
      category_id
    };

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

    const [subCategories, total] = await Promise.all([
      SubCategory.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      SubCategory.countDocuments(filter)
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

    logger.info('SubCategories retrieved by category ID successfully', { 
      category_id,
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, subCategories, pagination, 'SubCategories retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving subcategories by category ID', { error: error.message, category_id: req.params.category_id });
    throw error;
  }
});

module.exports = {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoriesByCategoryId
};

