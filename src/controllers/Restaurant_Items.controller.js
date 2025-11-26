const RestaurantItems = require('../models/Restaurant_Items.model');
const Business_Branch = require('../models/business_Branch.model');
const RestaurantItemCategory = require('../models/Restaurant_item_Category.model');
const RestaurantAlerts = require('../models/Restaurant_Alerts.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateRestaurantItems = (query) => query
  .populate('business_Branch_id', 'business_Branch_id firstName lastName BusinessName Address City state country')
  .populate('Restaurant_item_Category_id', 'Restaurant_item_Category_id CategoryName Description')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, business_Branch_id, Restaurant_item_Category_id, unit }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { SupplierName: { $regex: search, $options: 'i' } },
      { unit: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (business_Branch_id !== undefined) {
    const branchId = parseInt(business_Branch_id, 10);
    if (!Number.isNaN(branchId)) {
      filter.business_Branch_id = branchId;
    }
  }

  if (Restaurant_item_Category_id !== undefined) {
    const categoryId = parseInt(Restaurant_item_Category_id, 10);
    if (!Number.isNaN(categoryId)) {
      filter.Restaurant_item_Category_id = categoryId;
    }
  }

  if (unit) {
    filter.unit = { $regex: unit, $options: 'i' };
  }

  return filter;
};

const ensureBusinessBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined) {
    return true;
  }

  const branchId = parseInt(business_Branch_id, 10);
  if (Number.isNaN(branchId)) {
    return false;
  }

  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return Boolean(branch);
};

const ensureCategoryExists = async (Restaurant_item_Category_id) => {
  if (Restaurant_item_Category_id === undefined) {
    return true;
  }

  const categoryId = parseInt(Restaurant_item_Category_id, 10);
  if (Number.isNaN(categoryId)) {
    return false;
  }

  const category = await RestaurantItemCategory.findOne({ Restaurant_item_Category_id: categoryId, Status: true });
  return Boolean(category);
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

const findRestaurantItemByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateRestaurantItems(RestaurantItems.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateRestaurantItems(RestaurantItems.findOne({ Restaurant_Items_id: numericId }));
  }

  return null;
};

const validateNumericField = (value, fieldName) => {
  if (value === undefined || value === null) {
    return { isValid: true, parsed: undefined };
  }

  const parsedValue = Number(value);
  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return { isValid: false, message: `${fieldName} must be a non-negative number` };
  }

  return { isValid: true, parsed: parsedValue };
};

const createRestaurantItem = asyncHandler(async (req, res) => {
  try {
    const {
      business_Branch_id,
      Restaurant_item_Category_id,
      CurrentStock,
      minStock,
      unitPrice
    } = req.body;

    const [branchExists, categoryExists] = await Promise.all([
      ensureBusinessBranchExists(business_Branch_id),
      ensureCategoryExists(Restaurant_item_Category_id)
    ]);

    if (!branchExists) {
      return sendError(res, 'Business branch not found', 400);
    }

    if (!categoryExists) {
      return sendError(res, 'Restaurant item category not found', 400);
    }

    const validations = [
      validateNumericField(CurrentStock, 'Current stock'),
      validateNumericField(minStock, 'Minimum stock'),
      validateNumericField(unitPrice, 'Unit price')
    ];

    const invalidField = validations.find((v) => !v.isValid);
    if (invalidField) {
      return sendError(res, invalidField.message, 400);
    }

    const payload = {
      ...req.body,
      CurrentStock: validations[0].parsed ?? 0,
      minStock: validations[1].parsed ?? 0,
      unitPrice: validations[2].parsed,
      created_by: req.userIdNumber || null
    };

    const restaurantItem = await RestaurantItems.create(payload);
    const populated = await populateRestaurantItems(RestaurantItems.findById(restaurantItem._id));

    sendSuccess(res, populated, 'Restaurant item created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant item', { error: error.message });
    throw error;
  }
});

const getAllRestaurantItems = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      Restaurant_item_Category_id,
      unit,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Restaurant_item_Category_id, unit });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateRestaurantItems(RestaurantItems.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantItems.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant items', { error: error.message });
    throw error;
  }
});

const getRestaurantItemById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const itemQuery = findRestaurantItemByIdentifier(id);

    if (!itemQuery) {
      return sendError(res, 'Invalid restaurant item identifier', 400);
    }

    const item = await itemQuery;

    if (!item) {
      return sendNotFound(res, 'Restaurant item not found');
    }

    sendSuccess(res, item, 'Restaurant item retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateRestaurantItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      business_Branch_id,
      Restaurant_item_Category_id,
      CurrentStock,
      minStock,
      unitPrice
    } = req.body;

    const [branchExists, categoryExists] = await Promise.all([
      ensureBusinessBranchExists(business_Branch_id),
      ensureCategoryExists(Restaurant_item_Category_id)
    ]);

    if (business_Branch_id !== undefined && !branchExists) {
      return sendError(res, 'Business branch not found', 400);
    }

    if (Restaurant_item_Category_id !== undefined && !categoryExists) {
      return sendError(res, 'Restaurant item category not found', 400);
    }

    const validations = {
      CurrentStock: validateNumericField(CurrentStock, 'Current stock'),
      minStock: validateNumericField(minStock, 'Minimum stock'),
      unitPrice: validateNumericField(unitPrice, 'Unit price')
    };

    const invalidField = Object.values(validations).find((v) => !v.isValid);
    if (invalidField) {
      return sendError(res, invalidField.message, 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (validations.CurrentStock.parsed !== undefined) {
      updatePayload.CurrentStock = validations.CurrentStock.parsed;
    }

    if (validations.minStock.parsed !== undefined) {
      updatePayload.minStock = validations.minStock.parsed;
    }

    if (validations.unitPrice.parsed !== undefined) {
      updatePayload.unitPrice = validations.unitPrice.parsed;
    }

    let item;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await RestaurantItems.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant item ID format', 400);
      }
      item = await RestaurantItems.findOneAndUpdate({ Restaurant_Items_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!item) {
      return sendNotFound(res, 'Restaurant item not found');
    }

    const populated = await populateRestaurantItems(RestaurantItems.findById(item._id));
    sendSuccess(res, populated, 'Restaurant item updated successfully');
  } catch (error) {
    console.error('Error updating restaurant item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteRestaurantItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let item;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await RestaurantItems.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant item ID format', 400);
      }
      item = await RestaurantItems.findOneAndUpdate({ Restaurant_Items_id: numericId }, updatePayload, { new: true });
    }

    if (!item) {
      return sendNotFound(res, 'Restaurant item not found');
    }

    sendSuccess(res, item, 'Restaurant item deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getRestaurantItemsByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      Restaurant_item_Category_id,
      unit,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Restaurant_item_Category_id, unit });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateRestaurantItems(RestaurantItems.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantItems.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant items by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getRestaurantItemsByCategory = asyncHandler(async (req, res) => {
  try {
    const { Restaurant_item_Category_id } = req.params;
    const numericCategoryId = parseInt(Restaurant_item_Category_id, 10);

    if (Number.isNaN(numericCategoryId)) {
      return sendError(res, 'Invalid restaurant item category ID format', 400);
    }

    const categoryExists = await ensureCategoryExists(numericCategoryId);
    if (!categoryExists) {
      return sendNotFound(res, 'Restaurant item category not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status });
    filter.Restaurant_item_Category_id = numericCategoryId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

const [items, total] = await Promise.all([
      populateRestaurantItems(RestaurantItems.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantItems.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant items by category', { error: error.message, Restaurant_item_Category_id: req.params.Restaurant_item_Category_id });
    throw error;
  }
});

const getRestaurantItemDashboard = asyncHandler(async (req, res) => {
  try {
    const statusFilter = { Status: true };

    const [
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      alerts
    ] = await Promise.all([
      RestaurantItems.countDocuments(statusFilter),
      RestaurantItems.countDocuments({
        ...statusFilter,
        CurrentStock: { $gt: 5 }
      }),
      RestaurantItems.countDocuments({
        ...statusFilter,
        CurrentStock: { $gt: 0, $lt: 5 }
      }),
      RestaurantItems.countDocuments({
        ...statusFilter,
        CurrentStock: { $eq: 0 }
      }),
      RestaurantAlerts.find({ Status: true })
        .populate('Restaurant_Alerts_type_id', 'Restaurant_Alerts_type_id TypeName')
        .sort({ created_at: -1 })
    ]);

    const dashboard = {
      totalItems,
      alerts,
      inStock,
      lowStock,
      outOfStock
    };

    sendSuccess(res, dashboard, 'Restaurant item dashboard retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item dashboard', { error: error.message });
    throw error;
  }
});

module.exports = {
  createRestaurantItem,
  getAllRestaurantItems,
  getRestaurantItemById,
  updateRestaurantItem,
  deleteRestaurantItem,
  getRestaurantItemsByAuth,
  getRestaurantItemsByCategory,
  getRestaurantItemDashboard
};


