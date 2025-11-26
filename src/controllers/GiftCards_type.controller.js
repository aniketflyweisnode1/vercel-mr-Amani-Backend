const GiftCardsType = require('../models/GiftCards_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const buildFilterFromQuery = ({ search, status }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  return filter;
};

const createGiftCardsType = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const giftCardsType = await GiftCardsType.create(payload);
    console.info('Gift cards type created successfully', { id: giftCardsType._id, GiftCards_type_id: giftCardsType.GiftCards_type_id });

    sendSuccess(res, giftCardsType, 'Gift cards type created successfully', 201);
  } catch (error) {
    console.error('Error creating gift cards type', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllGiftCardsTypes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [giftCardsTypes, total] = await Promise.all([
      GiftCardsType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      GiftCardsType.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Gift cards types retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, giftCardsTypes, pagination, 'Gift cards types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving gift cards types', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getGiftCardsTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let giftCardsType;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      giftCardsType = await GiftCardsType.findById(id);
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid gift cards type ID format');
      }
      giftCardsType = await GiftCardsType.findOne({ GiftCards_type_id: numericId });
    }

    if (!giftCardsType) {
      return sendNotFound(res, 'Gift cards type not found');
    }

    console.info('Gift cards type retrieved successfully', { id: giftCardsType._id });
    sendSuccess(res, giftCardsType, 'Gift cards type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving gift cards type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateGiftCardsType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let giftCardsType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      giftCardsType = await GiftCardsType.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid gift cards type ID format');
      }
      giftCardsType = await GiftCardsType.findOneAndUpdate({ GiftCards_type_id: numericId }, updateData, { new: true, runValidators: true });
    }

    if (!giftCardsType) {
      return sendNotFound(res, 'Gift cards type not found');
    }

    console.info('Gift cards type updated successfully', { id: giftCardsType._id });
    sendSuccess(res, giftCardsType, 'Gift cards type updated successfully');
  } catch (error) {
    console.error('Error updating gift cards type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteGiftCardsType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let giftCardsType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      giftCardsType = await GiftCardsType.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid gift cards type ID format');
      }
      giftCardsType = await GiftCardsType.findOneAndUpdate({ GiftCards_type_id: numericId }, updateData, { new: true });
    }

    if (!giftCardsType) {
      return sendNotFound(res, 'Gift cards type not found');
    }

    console.info('Gift cards type deleted successfully', { id: giftCardsType._id });
    sendSuccess(res, giftCardsType, 'Gift cards type deleted successfully');
  } catch (error) {
    console.error('Error deleting gift cards type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getGiftCardsTypesByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = {
      created_by: userId
    };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [giftCardsTypes, total] = await Promise.all([
      GiftCardsType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      GiftCardsType.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Gift cards types retrieved for authenticated user', { total, page: numericPage, limit: numericLimit, userId });
    sendPaginated(res, giftCardsTypes, pagination, 'Gift cards types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving gift cards types for auth user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createGiftCardsType,
  getAllGiftCardsTypes,
  getGiftCardsTypeById,
  updateGiftCardsType,
  deleteGiftCardsType,
  getGiftCardsTypesByAuth
};


