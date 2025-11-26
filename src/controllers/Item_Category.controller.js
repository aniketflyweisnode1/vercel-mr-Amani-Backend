const ItemCategory = require('../models/Item_Category.model');
const ItemType = require('../models/Item_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureItemTypeExists = async (itemTypeId) => {
  if (itemTypeId === undefined) {
    return true;
  }

  const itemType = await ItemType.findOne({ Item_type_id: itemTypeId });
  return Boolean(itemType);
};

const buildFilterFromQuery = ({ search, status, item_type_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { CategoryName: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (item_type_id !== undefined) {
    const typeId = parseInt(item_type_id, 10);
    if (!Number.isNaN(typeId)) {
      filter.item_type_id = typeId;
    }
  }

  return filter;
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

const createItemCategory = asyncHandler(async (req, res) => {
  try {
    const { item_type_id } = req.body;

    const typeExists = await ensureItemTypeExists(item_type_id);
    if (!typeExists) {
      return sendError(res, 'Associated item type not found', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber ?? null
    };

    const itemCategory = await ItemCategory.create(payload);

    console.info('Item category created successfully', { id: itemCategory._id, item_Category_id: itemCategory.item_Category_id });

    sendSuccess(res, itemCategory, 'Item category created successfully', 201);
  } catch (error) {
    console.error('Error creating item category', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllItemCategories = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      item_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);

    const filter = buildFilterFromQuery({ search, status, item_type_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (numericPage - 1) * numericLimit;

    const [categories, total] = await Promise.all([
      ItemCategory.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit)
        .populate('item_type_id', 'name'),
      ItemCategory.countDocuments(filter)
    ]);

    console.info('Item categories retrieved successfully', { total, page: numericPage, limit: numericLimit });

    sendPaginated(res, categories, paginateMeta(numericPage, numericLimit, total), 'Item categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving item categories', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getItemCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let itemCategory;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      itemCategory = await ItemCategory.findById(id).populate('item_type_id', 'name');
    } else {
      const categoryId = parseInt(id, 10);
      if (Number.isNaN(categoryId)) {
        return sendNotFound(res, 'Invalid item category ID format');
      }
      itemCategory = await ItemCategory.findOne({ item_Category_id: categoryId }).populate('item_type_id', 'name');
    }

    if (!itemCategory) {
      return sendNotFound(res, 'Item category not found');
    }

    console.info('Item category retrieved successfully', { id: itemCategory._id });

    sendSuccess(res, itemCategory, 'Item category retrieved successfully');
  } catch (error) {
    console.error('Error retrieving item category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateItemCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { item_type_id } = req.body;

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

    let itemCategory;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      itemCategory = await ItemCategory.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true
      }).populate('item_type_id', 'name');
    } else {
      const categoryId = parseInt(id, 10);
      if (Number.isNaN(categoryId)) {
        return sendNotFound(res, 'Invalid item category ID format');
      }
      itemCategory = await ItemCategory.findOneAndUpdate({ item_Category_id: categoryId }, update, {
        new: true,
        runValidators: true
      }).populate('item_type_id', 'name');
    }

    if (!itemCategory) {
      return sendNotFound(res, 'Item category not found');
    }

    console.info('Item category updated successfully', { id: itemCategory._id });

    sendSuccess(res, itemCategory, 'Item category updated successfully');
  } catch (error) {
    console.error('Error updating item category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteItemCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const update = {
      Status: false,
      updated_by: req.userIdNumber ?? null,
      updated_at: new Date()
    };

    let itemCategory;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      itemCategory = await ItemCategory.findByIdAndUpdate(id, update, { new: true });
    } else {
      const categoryId = parseInt(id, 10);
      if (Number.isNaN(categoryId)) {
        return sendNotFound(res, 'Invalid item category ID format');
      }
      itemCategory = await ItemCategory.findOneAndUpdate({ item_Category_id: categoryId }, update, { new: true });
    }

    if (!itemCategory) {
      return sendNotFound(res, 'Item category not found');
    }

    console.info('Item category deleted successfully', { id: itemCategory._id });

    sendSuccess(res, itemCategory, 'Item category deleted successfully');
  } catch (error) {
    console.error('Error deleting item category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getItemCategoriesByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      item_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);

    const filter = buildFilterFromQuery({ search, status, item_type_id });
    filter.created_by = req.userIdNumber;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (numericPage - 1) * numericLimit;

    const [categories, total] = await Promise.all([
      ItemCategory.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit)
        .populate('item_type_id', 'name'),
      ItemCategory.countDocuments(filter)
    ]);

    console.info('Item categories retrieved for auth user', { total, page: numericPage, limit: numericLimit, user_id: req.userIdNumber });

    sendPaginated(res, categories, paginateMeta(numericPage, numericLimit, total), 'Item categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving item categories for auth user', { error: error.message, user_id: req.userIdNumber });
    throw error;
  }
});

const getItemCategoriesByTypeId = asyncHandler(async (req, res) => {
  try {
    const { item_type_id } = req.params;
    const typeId = parseInt(item_type_id, 10);

    if (Number.isNaN(typeId)) {
      return sendError(res, 'Invalid item type ID format', 400);
    }

    const typeExists = await ensureItemTypeExists(typeId);
    if (!typeExists) {
      return sendNotFound(res, 'Item type not found');
    }

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

    const filter = buildFilterFromQuery({ search, status, item_type_id: typeId });
    filter.item_type_id = typeId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (numericPage - 1) * numericLimit;

    const [categories, total] = await Promise.all([
      ItemCategory.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit)
        .populate('item_type_id', 'name'),
      ItemCategory.countDocuments(filter)
    ]);

    console.info('Item categories retrieved by item type', { item_type_id: typeId, total, page: numericPage, limit: numericLimit });

    sendPaginated(res, categories, paginateMeta(numericPage, numericLimit, total), 'Item categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving item categories by item type', { error: error.message, item_type_id: req.params.item_type_id });
    throw error;
  }
});

module.exports = {
  createItemCategory,
  getAllItemCategories,
  getItemCategoryById,
  updateItemCategory,
  deleteItemCategory,
  getItemCategoriesByAuth,
  getItemCategoriesByTypeId
};
