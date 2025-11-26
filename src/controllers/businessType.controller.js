const BusinessType = require('../models/businessType.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const createBusinessType = asyncHandler(async (req, res) => {
  try {
    const businessTypeData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const businessType = await BusinessType.create(businessTypeData);
    console.info('Business Type created successfully', { businessTypeId: businessType._id, businessType_id: businessType.businessType_id });
    sendSuccess(res, businessType, 'Business Type created successfully', 201);
  } catch (error) {
    console.error('Error creating business type', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllBusinessTypes = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [businessTypes, total] = await Promise.all([
      BusinessType.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      BusinessType.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Business Types retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, businessTypes, pagination, 'Business Types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving business types', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getBusinessTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let businessType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      businessType = await BusinessType.findById(id);
    } else {
      const businessTypeId = parseInt(id, 10);
      if (isNaN(businessTypeId)) return sendNotFound(res, 'Invalid business type ID format');
      businessType = await BusinessType.findOne({ businessType_id: businessTypeId });
    }
    if (!businessType) return sendNotFound(res, 'Business Type not found');
    console.info('Business Type retrieved successfully', { businessTypeId: businessType._id });
    sendSuccess(res, businessType, 'Business Type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving business type', { error: error.message, businessTypeId: req.params.id });
    throw error;
  }
});

const updateBusinessType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let businessType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      businessType = await BusinessType.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const businessTypeId = parseInt(id, 10);
      if (isNaN(businessTypeId)) return sendNotFound(res, 'Invalid business type ID format');
      businessType = await BusinessType.findOneAndUpdate({ businessType_id: businessTypeId }, updateData, { new: true, runValidators: true });
    }
    if (!businessType) return sendNotFound(res, 'Business Type not found');
    console.info('Business Type updated successfully', { businessTypeId: businessType._id });
    sendSuccess(res, businessType, 'Business Type updated successfully');
  } catch (error) {
    console.error('Error updating business type', { error: error.message, businessTypeId: req.params.id });
    throw error;
  }
});

const deleteBusinessType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let businessType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      businessType = await BusinessType.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const businessTypeId = parseInt(id, 10);
      if (isNaN(businessTypeId)) return sendNotFound(res, 'Invalid business type ID format');
      businessType = await BusinessType.findOneAndUpdate({ businessType_id: businessTypeId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!businessType) return sendNotFound(res, 'Business Type not found');
    console.info('Business Type deleted successfully', { businessTypeId: businessType._id });
    sendSuccess(res, businessType, 'Business Type deleted successfully');
  } catch (error) {
    console.error('Error deleting business type', { error: error.message, businessTypeId: req.params.id });
    throw error;
  }
});

const getBusinessTypesByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { created_by: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [businessTypes, total] = await Promise.all([
      BusinessType.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      BusinessType.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Business Types by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, businessTypes, pagination, 'Business Types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving business types by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createBusinessType, getAllBusinessTypes, getBusinessTypeById, updateBusinessType, deleteBusinessType, getBusinessTypesByAuth
};

