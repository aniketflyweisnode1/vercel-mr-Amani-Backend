const RestaurantItems = require('../models/Restaurant_Items.model');
const Business_Branch = require('../models/business_Branch.model');
const RestaurantItemCategory = require('../models/Restaurant_item_Category.model');
const ItemType = require('../models/Item_type.model');
const Services = require('../models/services.model');
const ItemCategory = require('../models/Item_Category.model');
const User = require('../models/User.model');
const RestaurantAlerts = require('../models/Restaurant_Alerts.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateRestaurantItems = async (items) => {
  const itemsArray = Array.isArray(items) ? items : [items];
  const populatedItems = await Promise.all(
    itemsArray.map(async (item) => {
      if (!item) return null;
      
      const itemObj = item.toObject ? item.toObject() : item;
      
      // Populate business_Branch_id
      if (itemObj.business_Branch_id) {
        const branchId = typeof itemObj.business_Branch_id === 'object' ? itemObj.business_Branch_id : itemObj.business_Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id firstName lastName BusinessName Address City state country');
        if (branch) {
          itemObj.business_Branch_id = branch.toObject ? branch.toObject() : branch;
        }
      }
      
      // Populate Restaurant_item_Category_id
      if (itemObj.Restaurant_item_Category_id) {
        const categoryId = typeof itemObj.Restaurant_item_Category_id === 'object' ? itemObj.Restaurant_item_Category_id : itemObj.Restaurant_item_Category_id;
        const category = await RestaurantItemCategory.findOne({ Restaurant_item_Category_id: categoryId })
          .select('Restaurant_item_Category_id CategoryName Description');
        if (category) {
          itemObj.Restaurant_item_Category_id = category.toObject ? category.toObject() : category;
        }
      }
      
      // Populate item_type_id
      if (itemObj.item_type_id) {
        const typeId = typeof itemObj.item_type_id === 'object' ? itemObj.item_type_id : itemObj.item_type_id;
        const itemType = await ItemType.findOne({ Item_type_id: typeId })
          .select('Item_type_id name status');
        if (itemType) {
          itemObj.item_type_id = itemType.toObject ? itemType.toObject() : itemType;
        }
      }
      
      // Populate service_id
      if (itemObj.service_id) {
        const serviceId = typeof itemObj.service_id === 'object' ? itemObj.service_id : itemObj.service_id;
        const service = await Services.findOne({ service_id: serviceId })
          .select('service_id name description');
        if (service) {
          itemObj.service_id = service.toObject ? service.toObject() : service;
        }
      }
      
      // Populate item_Category_id
      if (itemObj.item_Category_id) {
        const categoryId = typeof itemObj.item_Category_id === 'object' ? itemObj.item_Category_id : itemObj.item_Category_id;
        const category = await ItemCategory.findOne({ item_Category_id: categoryId })
          .select('item_Category_id CategoryName Description');
        if (category) {
          itemObj.item_Category_id = category.toObject ? category.toObject() : category;
        }
      }
      
      // Populate created_by
      if (itemObj.created_by) {
        const createdById = typeof itemObj.created_by === 'object' ? itemObj.created_by : itemObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          itemObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (itemObj.updated_by) {
        const updatedById = typeof itemObj.updated_by === 'object' ? itemObj.updated_by : itemObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          itemObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return itemObj;
    })
  );
  
  return Array.isArray(items) ? populatedItems : populatedItems[0];
};

const buildFilter = ({ search, status, business_Branch_id, Restaurant_item_Category_id, category, item_type_id, unit }) => {
  const filter = {};

  if (search && search.trim()) {
    const searchTerm = search.trim();
    filter.$or = [
      { SupplierName: { $regex: searchTerm, $options: 'i' } },
      { unit: { $regex: searchTerm, $options: 'i' } },
      { DeliveryTime: { $regex: searchTerm, $options: 'i' } }
    ];

    // Also search by Restaurant_Items_id if search term is numeric
    const numericSearch = Number(searchTerm);
    if (!Number.isNaN(numericSearch) && numericSearch > 0) {
      filter.$or.push({ Restaurant_Items_id: numericSearch });
    }
  }

  if (status !== undefined) {
    // Handle both string 'true'/'false' and boolean values
    if (typeof status === 'string') {
      filter.Status = status === 'true' || status === '1';
    } else {
      filter.Status = Boolean(status);
    }
  }

  if (business_Branch_id !== undefined) {
    const branchId = parseInt(business_Branch_id, 10);
    if (!Number.isNaN(branchId)) {
      filter.business_Branch_id = branchId;
    }
  }

  // Support both Restaurant_item_Category_id and category as aliases
  const categoryId = Restaurant_item_Category_id !== undefined ? Restaurant_item_Category_id : category;
  if (categoryId !== undefined) {
    const parsedCategoryId = parseInt(categoryId, 10);
    if (!Number.isNaN(parsedCategoryId)) {
      filter.Restaurant_item_Category_id = parsedCategoryId;
    }
  }

  if (item_type_id !== undefined) {
    const typeId = parseInt(item_type_id, 10);
    if (!Number.isNaN(typeId)) {
      filter.item_type_id = typeId;
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

  const category = await RestaurantItemCategory.findOne({ Restaurant_item_Category_id: categoryId });
  console.log(category, 'category\n\n\n\n\n');
  return Boolean(category);
};

const ensureItemTypeExists = async (item_type_id) => {
  if (item_type_id === undefined || item_type_id === null) {
    return true;
  }

  const typeId = parseInt(item_type_id, 10);
  if (Number.isNaN(typeId)) {
    return false;
  }

  const itemType = await ItemType.findOne({ Item_type_id: typeId, status: true });
  return Boolean(itemType);
};

const ensureServiceExists = async (service_id) => {
  if (service_id === undefined || service_id === null) {
    return true;
  }

  const serviceId = parseInt(service_id, 10);
  if (Number.isNaN(serviceId)) {
    return false;
  }

  const service = await Services.findOne({ service_id: serviceId, status: true });
  return Boolean(service);
};

const ensureItemCategoryExists = async (item_Category_id) => {
  if (item_Category_id === undefined || item_Category_id === null) {
    return true;
  }

  const categoryId = parseInt(item_Category_id, 10);
  if (Number.isNaN(categoryId)) {
    return false;
  }

  const category = await ItemCategory.findOne({ item_Category_id: categoryId, Status: true });
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

const findRestaurantItemByIdentifier = async (identifier) => {
  let item;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    item = await RestaurantItems.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      item = await RestaurantItems.findOne({ Restaurant_Items_id: numericId });
    }
  }
  
  if (!item) return null;
  return await populateRestaurantItems(item);
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
      name,
      service_id,
      item_Category_id,
      Description,
      CurrentStock,
      unit,
      minStock,
      unitPrice,
      SupplierName,
      DeliveryTime,
      item_image,
      item_type_id
    } = req.body;

    const [branchExists, categoryExists, itemTypeExists, serviceExists, itemCategoryExists] = await Promise.all([
      ensureBusinessBranchExists(business_Branch_id),
      ensureCategoryExists(Restaurant_item_Category_id),
      ensureItemTypeExists(item_type_id),
      ensureServiceExists(service_id),
      ensureItemCategoryExists(item_Category_id)
    ]);

    if (!branchExists) {
      req.body.business_Branch_id = req.userIdNumber;
    }

    if (!categoryExists) {
      return sendError(res, 'Restaurant item category not found', 400);
    }

    if (!itemTypeExists && item_type_id !== undefined && item_type_id !== null) {
      return sendError(res, 'Item type not found', 400);
    }

    if (!serviceExists && service_id !== undefined && service_id !== null) {
      return sendError(res, 'Service not found', 400);
    }

    if (!itemCategoryExists && item_Category_id !== undefined && item_Category_id !== null) {
      return sendError(res, 'Item category not found', 400);
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

    // Build payload with all fields from req.body
    const payload = {
      business_Branch_id: business_Branch_id || req.userIdNumber,
      Restaurant_item_Category_id: Restaurant_item_Category_id,
      unitPrice: validations[2].parsed,
      created_by: req.userIdNumber || null,
      Status: req.body.Status !== undefined ? req.body.Status : true
    };

    // Add optional fields only if provided in req.body
    if (req.body.name !== undefined) payload.name = req.body.name;
    if (req.body.service_id !== undefined) payload.service_id = req.body.service_id;
    if (req.body.item_Category_id !== undefined) payload.item_Category_id = req.body.item_Category_id;
    if (req.body.Description !== undefined) payload.Description = req.body.Description;
    if (req.body.unit !== undefined) payload.unit = req.body.unit;
    if (req.body.SupplierName !== undefined) payload.SupplierName = req.body.SupplierName;
    if (req.body.DeliveryTime !== undefined) payload.DeliveryTime = req.body.DeliveryTime;
    if (req.body.item_image !== undefined) payload.item_image = req.body.item_image;
    if (req.body.item_type_id !== undefined) payload.item_type_id = req.body.item_type_id;

    // Set CurrentStock
    payload.CurrentStock = validations[0].parsed ?? 0;
    
    // Set minStock
    payload.minStock = validations[1].parsed ?? 0;

    const restaurantItem = await RestaurantItems.create(payload);
    const populated = await populateRestaurantItems(restaurantItem);

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
      category,
      item_type_id,
      unit,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Restaurant_item_Category_id, category, item_type_id, unit });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      RestaurantItems.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantItems.countDocuments(filter)
    ]);

    const populatedItems = await populateRestaurantItems(items);

    console.info('Restaurant items retrieved successfully', { 
      total, 
      page: numericPage, 
      limit: numericLimit, 
      filters: { 
        search: search || null,
        status, 
        category: category || Restaurant_item_Category_id 
      } 
    });

    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Restaurant items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant items', { error: error.message });
    throw error;
  }
});

const getRestaurantItemById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const item = await findRestaurantItemByIdentifier(id);

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
      name,
      service_id,
      item_Category_id,
      Description,
      CurrentStock,
      unit,
      minStock,
      unitPrice,
      SupplierName,
      DeliveryTime,
      item_image,
      item_type_id
    } = req.body;

    const [branchExists, categoryExists, itemTypeExists, serviceExists, itemCategoryExists] = await Promise.all([
      ensureBusinessBranchExists(business_Branch_id),
      ensureCategoryExists(Restaurant_item_Category_id),
      ensureItemTypeExists(item_type_id),
      ensureServiceExists(service_id),
      ensureItemCategoryExists(item_Category_id)
    ]);

    if (business_Branch_id !== undefined && !branchExists) {
      return sendError(res, 'Business branch not found', 400);
    }

    if (Restaurant_item_Category_id !== undefined && !categoryExists) {
      return sendError(res, 'Restaurant item category not found', 400);
    }

    if (item_type_id !== undefined && item_type_id !== null && !itemTypeExists) {
      return sendError(res, 'Item type not found', 400);
    }

    if (service_id !== undefined && service_id !== null && !serviceExists) {
      return sendError(res, 'Service not found', 400);
    }

    if (item_Category_id !== undefined && item_Category_id !== null && !itemCategoryExists) {
      return sendError(res, 'Item category not found', 400);
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

    // Build update payload with all fields from req.body
    const updatePayload = {
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Add all fields from req.body if provided
    if (req.body.business_Branch_id !== undefined) updatePayload.business_Branch_id = req.body.business_Branch_id;
    if (req.body.Restaurant_item_Category_id !== undefined) updatePayload.Restaurant_item_Category_id = req.body.Restaurant_item_Category_id;
    if (req.body.name !== undefined) updatePayload.name = req.body.name;
    if (req.body.service_id !== undefined) updatePayload.service_id = req.body.service_id;
    if (req.body.item_Category_id !== undefined) updatePayload.item_Category_id = req.body.item_Category_id;
    if (req.body.Description !== undefined) updatePayload.Description = req.body.Description;
    if (req.body.unit !== undefined) updatePayload.unit = req.body.unit;
    if (req.body.SupplierName !== undefined) updatePayload.SupplierName = req.body.SupplierName;
    if (req.body.DeliveryTime !== undefined) updatePayload.DeliveryTime = req.body.DeliveryTime;
    if (req.body.item_image !== undefined) updatePayload.item_image = req.body.item_image;
    if (req.body.item_type_id !== undefined) updatePayload.item_type_id = req.body.item_type_id;
    if (req.body.Status !== undefined) updatePayload.Status = req.body.Status;

    // Handle CurrentStock
    if (validations.CurrentStock.parsed !== undefined) {
      updatePayload.CurrentStock = validations.CurrentStock.parsed;
    }

    // Handle minStock
    if (validations.minStock.parsed !== undefined) {
      updatePayload.minStock = validations.minStock.parsed;
    }

    // Handle unitPrice
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

    const populated = await populateRestaurantItems(item);
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
      category,
      item_type_id,
      unit,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Restaurant_item_Category_id, category, item_type_id, unit });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      RestaurantItems.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantItems.countDocuments(filter)
    ]);

    const populatedItems = await populateRestaurantItems(items);

    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Restaurant items retrieved successfully');
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
      RestaurantItems.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantItems.countDocuments(filter)
    ]);

    const populatedItems = await populateRestaurantItems(items);

    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Restaurant items retrieved successfully');
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


