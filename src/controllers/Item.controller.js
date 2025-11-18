const Item = require('../models/Item.model');
const Services = require('../models/services.model');
const ItemType = require('../models/Item_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureServiceExists = async (serviceId) => {
  if (serviceId === undefined) {
    return true;
  }

  const service = await Services.findOne({ service_id: serviceId });
  return Boolean(service);
};

const ensureItemTypeExists = async (itemTypeId) => {
  if (itemTypeId === undefined) {
    return true;
  }

  const itemType = await ItemType.findOne({ Item_type_id: itemTypeId });
  return Boolean(itemType);
};

const paginateMeta = (page, limit, total) => {
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

const createItem = asyncHandler(async (req, res) => {
  try {
    const { service_id, item_type_id } = req.body;

    const [serviceExists, itemTypeExists] = await Promise.all([
      ensureServiceExists(service_id),
      ensureItemTypeExists(item_type_id)
    ]);

    if (!serviceExists) {
      return sendError(res, 'Associated service not found', 400);
    }

    if (!itemTypeExists) {
      return sendError(res, 'Associated item type not found', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber ?? null
    };

    const item = await Item.create(payload);

    console.info('Item created successfully', { id: item._id, Item_id: item.Item_id });

    sendSuccess(res, item, 'Item created successfully', 201);
  } catch (error) {
    console.error('Error creating item', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllItems = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      service_id,
      item_type_id,
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

    if (service_id !== undefined) {
      filter.service_id = Number(service_id);
    }

    if (item_type_id !== undefined) {
      filter.item_type_id = Number(item_type_id);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (numericPage - 1) * numericLimit;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Item.countDocuments(filter)
    ]);

    console.info('Items retrieved successfully', { total, page: numericPage, limit: numericLimit });

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving items', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getItemsByAuthUser = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      service_id,
      item_type_id,
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

    if (service_id !== undefined) {
      filter.service_id = Number(service_id);
    }

    if (item_type_id !== undefined) {
      filter.item_type_id = Number(item_type_id);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (numericPage - 1) * numericLimit;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Item.countDocuments(filter)
    ]);

    console.info('Items retrieved for auth user', { total, page: numericPage, limit: numericLimit, user_id: req.userIdNumber });

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving items for auth user', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getItemById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);

    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    console.info('Item retrieved successfully', { id: item._id });

    sendSuccess(res, item, 'Item retrieved successfully');
  } catch (error) {
    console.error('Error retrieving item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { service_id, item_type_id } = req.body;

    if (service_id !== undefined) {
      const exists = await ensureServiceExists(service_id);
      if (!exists) {
        return sendError(res, 'Associated service not found', 400);
      }
    }

    if (item_type_id !== undefined) {
      const exists = await ensureItemTypeExists(item_type_id);
      if (!exists) {
        return sendError(res, 'Associated item type not found', 400);
      }
    }

    const update = {
      ...req.body,
      updated_by: req.userIdNumber ?? null,
      updated_at: new Date()
    };

    const item = await Item.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    });

    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    console.info('Item updated successfully', { id: item._id });

    sendSuccess(res, item, 'Item updated successfully');
  } catch (error) {
    console.error('Error updating item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByIdAndUpdate(
      id,
      {
        status: false,
        updated_by: req.userIdNumber ?? null,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    console.info('Item deleted successfully', { id: item._id });

    sendSuccess(res, item, 'Item deleted successfully');
  } catch (error) {
    console.error('Error deleting item', { error: error.message, id: req.params.id });
    throw error;
  }
});

module.exports = {
  createItem,
  getAllItems,
  getItemsByAuthUser,
  getItemById,
  updateItem,
  deleteItem
};

