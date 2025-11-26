const SupplierItems = require('../models/Supplier_Items.model');
const Business_Branch = require('../models/business_Branch.model');
const RestaurantItemCategory = require('../models/Restaurant_item_Category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateSupplierItems = (query) => query
  .populate('business_Branch_id', 'business_Branch_id firstName lastName BusinessName Address City state country')
  .populate('Restaurant_item_Category_id', 'Restaurant_item_Category_id CategoryName Description')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, business_Branch_id, Restaurant_item_Category_id, requestStatus }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { ItemName: { $regex: search, $options: 'i' } },
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

  if (requestStatus) {
    filter.requestStatus = requestStatus;
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

const findSupplierItemByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateSupplierItems(SupplierItems.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateSupplierItems(SupplierItems.findOne({ Supplier_Items_id: numericId }));
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

const createSupplierItem = asyncHandler(async (req, res) => {
  try {
    const {
      business_Branch_id,
      Restaurant_item_Category_id,
      Quantity,
      MinThreshold,
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
      validateNumericField(Quantity, 'Quantity'),
      validateNumericField(MinThreshold, 'Minimum threshold'),
      validateNumericField(unitPrice, 'Unit price')
    ];

    const invalidField = validations.find((v) => !v.isValid);
    if (invalidField) {
      return sendError(res, invalidField.message, 400);
    }

    const payload = {
      ...req.body,
      Quantity: validations[0].parsed ?? 0,
      MinThreshold: validations[1].parsed ?? 0,
      unitPrice: validations[2].parsed,
      created_by: req.userIdNumber || null
    };

    const supplierItem = await SupplierItems.create(payload);
    const populated = await populateSupplierItems(SupplierItems.findById(supplierItem._id));

    sendSuccess(res, populated, 'Supplier item created successfully', 201);
  } catch (error) {
    console.error('Error creating supplier item', { error: error.message });
    throw error;
  }
});

const getAllSupplierItems = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      Restaurant_item_Category_id,
      requestStatus,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Restaurant_item_Category_id, requestStatus });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateSupplierItems(SupplierItems.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      SupplierItems.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Supplier items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving supplier items', { error: error.message });
    throw error;
  }
});

const getSupplierItemById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const itemQuery = findSupplierItemByIdentifier(id);

    if (!itemQuery) {
      return sendError(res, 'Invalid supplier item identifier', 400);
    }

    const item = await itemQuery;

    if (!item) {
      return sendNotFound(res, 'Supplier item not found');
    }

    sendSuccess(res, item, 'Supplier item retrieved successfully');
  } catch (error) {
    console.error('Error retrieving supplier item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateSupplierItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      business_Branch_id,
      Restaurant_item_Category_id,
      Quantity,
      MinThreshold,
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
      Quantity: validateNumericField(Quantity, 'Quantity'),
      MinThreshold: validateNumericField(MinThreshold, 'Minimum threshold'),
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

    if (validations.Quantity.parsed !== undefined) {
      updatePayload.Quantity = validations.Quantity.parsed;
    }

    if (validations.MinThreshold.parsed !== undefined) {
      updatePayload.MinThreshold = validations.MinThreshold.parsed;
    }

    if (validations.unitPrice.parsed !== undefined) {
      updatePayload.unitPrice = validations.unitPrice.parsed;
    }

    let item;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await SupplierItems.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid supplier item ID format', 400);
      }
      item = await SupplierItems.findOneAndUpdate({ Supplier_Items_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!item) {
      return sendNotFound(res, 'Supplier item not found');
    }

    const populated = await populateSupplierItems(SupplierItems.findById(item._id));
    sendSuccess(res, populated, 'Supplier item updated successfully');
  } catch (error) {
    console.error('Error updating supplier item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteSupplierItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let item;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await SupplierItems.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid supplier item ID format', 400);
      }
      item = await SupplierItems.findOneAndUpdate({ Supplier_Items_id: numericId }, updatePayload, { new: true });
    }

    if (!item) {
      return sendNotFound(res, 'Supplier item not found');
    }

    sendSuccess(res, item, 'Supplier item deleted successfully');
  } catch (error) {
    console.error('Error deleting supplier item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getSupplierItemsByAuth = asyncHandler(async (req, res) => {
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
      requestStatus,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Restaurant_item_Category_id, requestStatus });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateSupplierItems(SupplierItems.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      SupplierItems.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Supplier items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving supplier items by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getSupplierItemsByCategory = asyncHandler(async (req, res) => {
  try {
    const { Restaurant_item_Category_id } = req.params;
    const categoryId = parseInt(Restaurant_item_Category_id, 10);

    if (Number.isNaN(categoryId)) {
      return sendError(res, 'Invalid restaurant item category ID format', 400);
    }

    if (!(await ensureCategoryExists(categoryId))) {
      return sendNotFound(res, 'Restaurant item category not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      requestStatus,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, requestStatus });
    filter.Restaurant_item_Category_id = categoryId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateSupplierItems(SupplierItems.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      SupplierItems.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Supplier items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving supplier items by category', { error: error.message, Restaurant_item_Category_id: req.params.Restaurant_item_Category_id });
    throw error;
  }
});

const getSupplierDashboard = asyncHandler(async (req, res) => {
  try {
    const statusFilter = { Status: true };
    const pendingFilter = { ...statusFilter, requestStatus: 'Pending' };

    const [
      totalItems,
      pendingCount,
      lowStockCount,
      pendingValueResult
    ] = await Promise.all([
      SupplierItems.countDocuments(statusFilter),
      SupplierItems.countDocuments(pendingFilter),
      SupplierItems.countDocuments({ ...statusFilter, Quantity: { $lt: 5 } }),
      SupplierItems.aggregate([
        { $match: pendingFilter },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: [
                  { $ifNull: ['$Quantity', 0] },
                  { $ifNull: ['$unitPrice', 0] }
                ]
              }
            }
          }
        }
      ])
    ]);

    const PendingValue = pendingValueResult[0]?.total || 0;

    const dashboard = {
      totalItems,
      PendingValue,
      Panding: pendingCount,
      LowStock: lowStockCount
    };

    sendSuccess(res, dashboard, 'Supplier dashboard retrieved successfully');
  } catch (error) {
    console.error('Error retrieving supplier dashboard', { error: error.message });
    throw error;
  }
});

module.exports = {
  createSupplierItem,
  getAllSupplierItems,
  getSupplierItemById,
  updateSupplierItem,
  deleteSupplierItem,
  getSupplierItemsByAuth,
  getSupplierItemsByCategory,
  getSupplierDashboard
};


