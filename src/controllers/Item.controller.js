const Item = require('../models/Item.model');
const Services = require('../models/services.model');
const ItemType = require('../models/Item_type.model');
const ItemCategory = require('../models/Item_Category.model');
const Business_Branch = require('../models/business_Branch.model');
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

const ensureItemCategoryExists = async (itemCategoryId) => {
  if (itemCategoryId === undefined) {
    return true;
  }

  const itemCategory = await ItemCategory.findOne({ item_Category_id: itemCategoryId });
  return Boolean(itemCategory);
};

const ensureBusinessBranchExists = async (businessBranchId) => {
  if (businessBranchId === undefined) {
    return true;
  }

  const businessBranch = await Business_Branch.findOne({ business_Branch_id: businessBranchId });
  return Boolean(businessBranch);
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
    const { service_id, item_type_id, item_Category_id, business_Branch_id, Stock_count } = req.body;

    if (Stock_count !== undefined && Number(Stock_count) < 0) {
      return sendError(res, 'Stock count cannot be negative', 400);
    }

    const [serviceExists, itemTypeExists, itemCategoryExists, businessBranchExists] = await Promise.all([
      ensureServiceExists(service_id),
      ensureItemTypeExists(item_type_id),
      ensureItemCategoryExists(item_Category_id),
      ensureBusinessBranchExists(business_Branch_id)
    ]);

    if (!serviceExists) {
      return sendError(res, 'Associated service not found', 400);
    }

    if (!itemTypeExists) {
      return sendError(res, 'Associated item type not found', 400);
    }

    if (!itemCategoryExists) {
      return sendError(res, 'Associated item category not found', 400);
    }

    if (!businessBranchExists) {
      return sendError(res, 'Associated business branch not found', 400);
    }

    const payload = {
      ...req.body,
      Stock_count: Stock_count ?? 0,
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

const buildItemFilter = ({ search, status, service_id, item_type_id, item_Category_id, category, business_Branch_id, Stock_count }) => {
  const filter = {};

  if (search && search.trim()) {
    const searchTerm = search.trim();
    const searchConditions = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { Description: { $regex: searchTerm, $options: 'i' } }
    ];

    // Also search by Item_id if search term is numeric
    const numericSearch = Number(searchTerm);
    if (!Number.isNaN(numericSearch) && numericSearch > 0) {
      searchConditions.push({ Item_id: numericSearch });
    }

    filter.$or = searchConditions;
  }

  if (status !== undefined) {
    // Handle both string 'true'/'false' and boolean values
    if (typeof status === 'string') {
      filter.status = status === 'true' || status === '1';
    } else {
      filter.status = Boolean(status);
    }
  }

  if (service_id !== undefined) {
    const serviceIdNum = Number(service_id);
    if (!Number.isNaN(serviceIdNum)) {
      filter.service_id = serviceIdNum;
    }
  }

  if (item_type_id !== undefined) {
    const typeIdNum = Number(item_type_id);
    if (!Number.isNaN(typeIdNum)) {
      filter.item_type_id = typeIdNum;
    }
  }

  // Support both item_Category_id and category as aliases
  const categoryId = item_Category_id !== undefined ? item_Category_id : category;
  if (categoryId !== undefined) {
    const categoryIdNum = Number(categoryId);
    if (!Number.isNaN(categoryIdNum)) {
      filter.item_Category_id = categoryIdNum;
    }
  }

  if (business_Branch_id !== undefined) {
    const branchIdNum = Number(business_Branch_id);
    if (!Number.isNaN(branchIdNum)) {
      filter.business_Branch_id = branchIdNum;
    }
  }

  if (Stock_count !== undefined) {
    const stockCountNum = Number(Stock_count);
    if (!Number.isNaN(stockCountNum)) {
      filter.Stock_count = stockCountNum;
    }
  }

  return filter;
};

const applyItemSort = (sortBy, sortOrder) => {
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  return sort;
};

const listItemQuery = (filter = {}) =>
  Item.find(filter)
    .populate('service_id', 'name')
    .populate('item_type_id', 'name')
    .populate('item_Category_id', 'CategoryName')
    .populate('business_Branch_id', 'name address City state country');

const findItemByIdQuery = (id) =>
  Item.findById(id)
    .populate('service_id', 'name')
    .populate('item_type_id', 'name')
    .populate('item_Category_id', 'CategoryName')
    .populate('business_Branch_id', 'name address City state country');

const updateItemByIdQuery = (id, update, options) =>
  Item.findByIdAndUpdate(id, update, options)
    .populate('service_id', 'name')
    .populate('item_type_id', 'name')
    .populate('item_Category_id', 'CategoryName')
    .populate('business_Branch_id', 'name address City state country');

const getAllItems = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      service_id,
      item_type_id,
      item_Category_id,
      category,
      business_Branch_id,
      Stock_count,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);

    const filter = buildItemFilter({ search, status, service_id, item_type_id, item_Category_id, category, business_Branch_id, Stock_count });

    const sort = applyItemSort(sortBy, sortOrder);
    const skip = (numericPage - 1) * numericLimit;

    const [items, total] = await Promise.all([
      listItemQuery(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Item.countDocuments(filter)
    ]);

    console.info('Items retrieved successfully', { 
      total, 
      page: numericPage, 
      limit: numericLimit, 
      filters: { 
        search: search || null,
        status, 
        category: category || item_Category_id 
      } 
    });

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
      item_Category_id,
      category,
      business_Branch_id,
      Stock_count,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);

    const filter = buildItemFilter({ search, status, service_id, item_type_id, item_Category_id, category, business_Branch_id, Stock_count });
    filter.created_by = req.userIdNumber;

    const sort = applyItemSort(sortBy, sortOrder);
    const skip = (numericPage - 1) * numericLimit;

    const [items, total] = await Promise.all([
      listItemQuery(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Item.countDocuments(filter)
    ]);

    console.info('Items retrieved for auth user', { 
      total, 
      page: numericPage, 
      limit: numericLimit, 
      user_id: req.userIdNumber, 
      filters: { 
        search: search || null,
        status, 
        category: category || item_Category_id 
      } 
    });

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving items for auth user', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getItemById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const item = await findItemByIdQuery(id);

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
    const { service_id, item_type_id, item_Category_id, business_Branch_id, Stock_count } = req.body;

    if (Stock_count !== undefined && Number(Stock_count) < 0) {
      return sendError(res, 'Stock count cannot be negative', 400);
    }

    const [serviceExists, itemTypeExists, itemCategoryExists, businessBranchExists] = await Promise.all([
      ensureServiceExists(service_id),
      ensureItemTypeExists(item_type_id),
      ensureItemCategoryExists(item_Category_id),
      ensureBusinessBranchExists(business_Branch_id)
    ]);

    if (!serviceExists) {
      return sendError(res, 'Associated service not found', 400);
    }

    if (!itemTypeExists) {
      return sendError(res, 'Associated item type not found', 400);
    }

    if (!itemCategoryExists) {
      return sendError(res, 'Associated item category not found', 400);
    }

    if (!businessBranchExists) {
      return sendError(res, 'Associated business branch not found', 400);
    }

    const update = {
      ...req.body,
      updated_by: req.userIdNumber ?? null,
      updated_at: new Date()
    };

    if (Stock_count !== undefined) {
      update.Stock_count = Number(Stock_count);
    }

    const item = await updateItemByIdQuery(id, update, {
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

    const item = await updateItemByIdQuery(
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

const updateStockCount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Stock_count } = req.body;

    const numericStock = Number(Stock_count);
    if (Number.isNaN(numericStock)) {
      return sendError(res, 'Stock count must be a number', 400);
    }

    if (numericStock < 0) {
      return sendError(res, 'Stock count cannot be negative', 400);
    }

    const item = await updateItemByIdQuery(
      id,
      {
        Stock_count: numericStock,
        updated_by: req.userIdNumber ?? null,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    console.info('Item stock count updated successfully', { id: item._id, Stock_count: numericStock });

    sendSuccess(res, item, 'Stock count updated successfully');
  } catch (error) {
    console.error('Error updating stock count', { error: error.message, id: req.params.id });
    throw error;
  }
});

module.exports = {
  createItem,
  getAllItems,
  getItemsByAuthUser,
  getItemById,
  updateItem,
  deleteItem,
  updateStockCount
};

