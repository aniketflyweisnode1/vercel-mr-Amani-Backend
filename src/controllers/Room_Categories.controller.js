const Room_Categories = require('../models/Room_Categories.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

const createRoomCategory = asyncHandler(async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const category = await Room_Categories.create(categoryData);
    logger.info('Room Category created successfully', { categoryId: category._id, Room_Categories_id: category.Room_Categories_id });
    sendSuccess(res, category, 'Room Category created successfully', 201);
  } catch (error) {
    logger.error('Error creating room category', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllRoomCategories = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { Discription: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      Room_Categories.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Room_Categories.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Room Categories retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, categories, pagination, 'Room Categories retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving room categories', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getRoomCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Room_Categories.findById(id);
    } else {
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) return sendNotFound(res, 'Invalid room category ID format');
      category = await Room_Categories.findOne({ Room_Categories_id: categoryId });
    }
    if (!category) return sendNotFound(res, 'Room Category not found');
    logger.info('Room Category retrieved successfully', { categoryId: category._id });
    sendSuccess(res, category, 'Room Category retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving room category', { error: error.message, categoryId: req.params.id });
    throw error;
  }
});

const updateRoomCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Room_Categories.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) return sendNotFound(res, 'Invalid room category ID format');
      category = await Room_Categories.findOneAndUpdate({ Room_Categories_id: categoryId }, updateData, { new: true, runValidators: true });
    }
    if (!category) return sendNotFound(res, 'Room Category not found');
    logger.info('Room Category updated successfully', { categoryId: category._id });
    sendSuccess(res, category, 'Room Category updated successfully');
  } catch (error) {
    logger.error('Error updating room category', { error: error.message, categoryId: req.params.id });
    throw error;
  }
});

const deleteRoomCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Room_Categories.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) return sendNotFound(res, 'Invalid room category ID format');
      category = await Room_Categories.findOneAndUpdate({ Room_Categories_id: categoryId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!category) return sendNotFound(res, 'Room Category not found');
    logger.info('Room Category deleted successfully', { categoryId: category._id });
    sendSuccess(res, category, 'Room Category deleted successfully');
  } catch (error) {
    logger.error('Error deleting room category', { error: error.message, categoryId: req.params.id });
    throw error;
  }
});

const getRoomCategoriesByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { created_by: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      Room_Categories.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Room_Categories.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Room Categories by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, categories, pagination, 'Room Categories retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving room categories by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createRoomCategory,
  getAllRoomCategories,
  getRoomCategoryById,
  updateRoomCategory,
  deleteRoomCategory,
  getRoomCategoriesByAuth
};

