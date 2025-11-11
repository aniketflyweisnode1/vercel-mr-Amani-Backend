const Category = require('../models/category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


/**
 * Create a new category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCategory = asyncHandler(async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      created_by: req.userId || null
    };

    const category = await Category.create(categoryData);

    console.info('Category created successfully', { categoryId: category._id, category_id: category.category_id });

    sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
    console.error('Error creating category', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all categories with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      service_id,
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

    if (service_id) {
      filter.service_id = service_id;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Category.countDocuments(filter)
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

    console.info('Categories retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, categories, pagination, 'Categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving categories', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return sendNotFound(res, 'Category not found');
    }

    console.info('Category retrieved successfully', { categoryId: category._id });

    sendSuccess(res, category, 'Category retrieved successfully');
  } catch (error) {
    console.error('Error retrieving category', { error: error.message, categoryId: req.params.id });
    throw error;
  }
});

/**
 * Update category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!category) {
      return sendNotFound(res, 'Category not found');
    }

    console.info('Category updated successfully', { categoryId: category._id });

    sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    console.error('Error updating category', { error: error.message, categoryId: req.params.id });
    throw error;
  }
});

/**
 * Delete category by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
      id,
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!category) {
      return sendNotFound(res, 'Category not found');
    }

    console.info('Category deleted successfully', { categoryId: category._id });

    sendSuccess(res, category, 'Category deleted successfully');
  } catch (error) {
    console.error('Error deleting category', { error: error.message, categoryId: req.params.id });
    throw error;
  }
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};

