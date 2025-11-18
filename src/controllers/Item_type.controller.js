const ItemType = require('../models/Item_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const buildPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

const createItemType = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber ?? null
    };

    const itemType = await ItemType.create(payload);

    console.info('Item type created successfully', { id: itemType._id, Item_type_id: itemType.Item_type_id });

    sendSuccess(res, itemType, 'Item type created successfully', 201);
  } catch (error) {
    console.error('Error creating item type', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllItemTypes = asyncHandler(async (req, res) => {
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

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (numericPage - 1) * numericLimit;

    const [items, total] = await Promise.all([
      ItemType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ItemType.countDocuments(filter)
    ]);

    console.info('Item types retrieved successfully', { total, page: numericPage, limit: numericLimit });

    sendPaginated(res, items, buildPagination(numericPage, numericLimit, total), 'Item types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving item types', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getItemTypesByAuthUser = asyncHandler(async (req, res) => {
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

    const filter = {
      created_by: req.userIdNumber
    };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (numericPage - 1) * numericLimit;

    const [items, total] = await Promise.all([
      ItemType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ItemType.countDocuments(filter)
    ]);

    console.info('Item types retrieved for auth user', { total, page: numericPage, limit: numericLimit, user_id: req.userIdNumber });

    sendPaginated(res, items, buildPagination(numericPage, numericLimit, total), 'Item types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving item types for auth user', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getItemTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const itemType = await ItemType.findById(id);

    if (!itemType) {
      return sendNotFound(res, 'Item type not found');
    }

    console.info('Item type retrieved successfully', { id: itemType._id });

    sendSuccess(res, itemType, 'Item type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving item type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateItemType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const update = {
      ...req.body,
      updated_by: req.userIdNumber ?? null,
      updated_at: new Date()
    };

    const itemType = await ItemType.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    });

    if (!itemType) {
      return sendNotFound(res, 'Item type not found');
    }

    console.info('Item type updated successfully', { id: itemType._id });

    sendSuccess(res, itemType, 'Item type updated successfully');
  } catch (error) {
    console.error('Error updating item type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteItemType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const itemType = await ItemType.findByIdAndUpdate(
      id,
      {
        status: false,
        updated_by: req.userIdNumber ?? null,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!itemType) {
      return sendNotFound(res, 'Item type not found');
    }

    console.info('Item type deleted successfully', { id: itemType._id });

    sendSuccess(res, itemType, 'Item type deleted successfully');
  } catch (error) {
    console.error('Error deleting item type', { error: error.message, id: req.params.id });
    throw error;
  }
});

module.exports = {
  createItemType,
  getAllItemTypes,
  getItemTypesByAuthUser,
  getItemTypeById,
  updateItemType,
  deleteItemType
};

