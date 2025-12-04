const GroceryItems = require('../models/Grocery_Items.model');
const Business_Branch = require('../models/business_Branch.model');
const Grocery_Categories = require('../models/Grocery_Categories.model');
const Grocery_Categories_type = require('../models/Grocery_Categories_type.model');
const Services = require('../models/services.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateGroceryItems = async (items) => {
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
      
      // Populate Grocery_Categories_id
      if (itemObj.Grocery_Categories_id) {
        const categoryId = typeof itemObj.Grocery_Categories_id === 'object' ? itemObj.Grocery_Categories_id : itemObj.Grocery_Categories_id;
        const category = await Grocery_Categories.findOne({ Grocery_Categories_id: categoryId })
          .select('Grocery_Categories_id Name Coverimage Status');
        if (category) {
          itemObj.Grocery_Categories_id = category.toObject ? category.toObject() : category;
        }
      }
      
      // Populate Grocery_Categories_type_id
      if (itemObj.Grocery_Categories_type_id) {
        const typeId = typeof itemObj.Grocery_Categories_type_id === 'object' ? itemObj.Grocery_Categories_type_id : itemObj.Grocery_Categories_type_id;
        const categoryType = await Grocery_Categories_type.findOne({ Grocery_Categories_type_id: typeId })
          .select('Grocery_Categories_type_id Name Coverimage Status');
        if (categoryType) {
          itemObj.Grocery_Categories_type_id = categoryType.toObject ? categoryType.toObject() : categoryType;
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

const buildFilter = ({ search, status, business_Branch_id, Grocery_Categories_id, category, Grocery_Categories_type_id, unit }) => {
  const filter = {};

  if (search && search.trim()) {
    const searchTerm = search.trim();
    filter.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { Description: { $regex: searchTerm, $options: 'i' } },
      { SupplierName: { $regex: searchTerm, $options: 'i' } },
      { unit: { $regex: searchTerm, $options: 'i' } },
      { DeliveryTime: { $regex: searchTerm, $options: 'i' } }
    ];

    // Also search by Grocery_Items_id if search term is numeric
    const numericSearch = Number(searchTerm);
    if (!Number.isNaN(numericSearch) && numericSearch > 0) {
      filter.$or.push({ Grocery_Items_id: numericSearch });
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

  // Support both Grocery_Categories_id and category as aliases
  const categoryId = Grocery_Categories_id !== undefined ? Grocery_Categories_id : category;
  if (categoryId !== undefined) {
    const parsedCategoryId = parseInt(categoryId, 10);
    if (!Number.isNaN(parsedCategoryId)) {
      filter.Grocery_Categories_id = parsedCategoryId;
    }
  }

  if (Grocery_Categories_type_id !== undefined) {
    const typeId = parseInt(Grocery_Categories_type_id, 10);
    if (!Number.isNaN(typeId)) {
      filter.Grocery_Categories_type_id = typeId;
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

const ensureGroceryCategoryExists = async (Grocery_Categories_id) => {
  if (Grocery_Categories_id === undefined) {
    return true;
  }

  const categoryId = parseInt(Grocery_Categories_id, 10);
  if (Number.isNaN(categoryId)) {
    return false;
  }

  const category = await Grocery_Categories.findOne({ Grocery_Categories_id: categoryId, Status: true });
  return Boolean(category);
};

const ensureGroceryCategoryTypeExists = async (Grocery_Categories_type_id) => {
  if (Grocery_Categories_type_id === undefined || Grocery_Categories_type_id === null) {
    return true;
  }

  const typeId = parseInt(Grocery_Categories_type_id, 10);
  if (Number.isNaN(typeId)) {
    return false;
  }

  const categoryType = await Grocery_Categories_type.findOne({ Grocery_Categories_type_id: typeId, Status: true });
  return Boolean(categoryType);
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

const findGroceryItemByIdentifier = async (identifier) => {
  let item;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    item = await GroceryItems.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      item = await GroceryItems.findOne({ Grocery_Items_id: numericId });
    }
  }

  if (!item) return null;
  return await populateGroceryItems(item);
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

const createGroceryItem = asyncHandler(async (req, res) => {
  try {
    const {
      business_Branch_id,
      Grocery_Categories_id,
      name,
      service_id,
      Description,
      CurrentStock,
      unit,
      minStock,
      unitPrice,
      SupplierName,
      DeliveryTime,
      item_image,
      Grocery_Categories_type_id
    } = req.body;

    const [branchExists, categoryExists, categoryTypeExists, serviceExists] = await Promise.all([
      ensureBusinessBranchExists(business_Branch_id),
      ensureGroceryCategoryExists(Grocery_Categories_id),
      ensureGroceryCategoryTypeExists(Grocery_Categories_type_id),
      ensureServiceExists(service_id)
    ]);

    if (!branchExists) {
      req.body.business_Branch_id = req.userIdNumber;
    }

    if (!categoryExists) {
      return sendError(res, 'Grocery category not found', 400);
    }

    if (!categoryTypeExists && Grocery_Categories_type_id !== undefined && Grocery_Categories_type_id !== null) {
      return sendError(res, 'Grocery category type not found', 400);
    }

    if (!serviceExists && service_id !== undefined && service_id !== null) {
      return sendError(res, 'Service not found', 400);
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
      Grocery_Categories_id: Grocery_Categories_id,
      unitPrice: validations[2].parsed,
      created_by: req.userIdNumber || null,
      Status: req.body.Status !== undefined ? req.body.Status : true
    };

    // Add optional fields only if provided in req.body
    if (req.body.name !== undefined) payload.name = req.body.name;
    if (req.body.service_id !== undefined) payload.service_id = req.body.service_id;
    if (req.body.Description !== undefined) payload.Description = req.body.Description;
    if (req.body.unit !== undefined) payload.unit = req.body.unit;
    if (req.body.SupplierName !== undefined) payload.SupplierName = req.body.SupplierName;
    if (req.body.DeliveryTime !== undefined) payload.DeliveryTime = req.body.DeliveryTime;
    if (req.body.item_image !== undefined) payload.item_image = req.body.item_image;
    if (req.body.Grocery_Categories_type_id !== undefined) payload.Grocery_Categories_type_id = req.body.Grocery_Categories_type_id;

    // Set CurrentStock
    payload.CurrentStock = validations[0].parsed ?? 0;
    
    // Set minStock
    payload.minStock = validations[1].parsed ?? 0;

    const groceryItem = await GroceryItems.create(payload);
    const populated = await populateGroceryItems(groceryItem);

    sendSuccess(res, populated, 'Grocery item created successfully', 201);
  } catch (error) {
    console.error('Error creating grocery item', { error: error.message });
    throw error;
  }
});

const getAllGroceryItems = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      Grocery_Categories_id,
      category,
      Grocery_Categories_type_id,
      unit,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Grocery_Categories_id, category, Grocery_Categories_type_id, unit });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      GroceryItems.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      GroceryItems.countDocuments(filter)
    ]);

    const populatedItems = await populateGroceryItems(items);

    console.info('Grocery items retrieved successfully', { 
      total, 
      page: numericPage, 
      limit: numericLimit, 
      count: populatedItems.length 
    });
    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Grocery items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving grocery items', { error: error.message });
    throw error;
  }
});

const getGroceryItemById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const item = await findGroceryItemByIdentifier(id);

    if (!item) {
      return sendNotFound(res, 'Grocery item not found');
    }

    sendSuccess(res, item, 'Grocery item retrieved successfully');
  } catch (error) {
    console.error('Error retrieving grocery item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateGroceryItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      business_Branch_id,
      Grocery_Categories_id,
      name,
      service_id,
      Description,
      CurrentStock,
      unit,
      minStock,
      unitPrice,
      SupplierName,
      DeliveryTime,
      item_image,
      Grocery_Categories_type_id
    } = req.body;

    const [branchExists, categoryExists, categoryTypeExists, serviceExists] = await Promise.all([
      ensureBusinessBranchExists(business_Branch_id),
      ensureGroceryCategoryExists(Grocery_Categories_id),
      ensureGroceryCategoryTypeExists(Grocery_Categories_type_id),
      ensureServiceExists(service_id),
    ]);

    if (business_Branch_id !== undefined && !branchExists) {
      req.body.business_Branch_id = req.userIdNumber;
    }

    if (Grocery_Categories_id !== undefined && !categoryExists) {
      return sendError(res, 'Grocery category not found', 400);
    }

    if (Grocery_Categories_type_id !== undefined && Grocery_Categories_type_id !== null && !categoryTypeExists) {
      return sendError(res, 'Grocery category type not found', 400);
    }

    if (service_id !== undefined && service_id !== null && !serviceExists) {
      return sendError(res, 'Service not found', 400);
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

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Apply validated numeric fields
    if (validations.CurrentStock.parsed !== undefined) {
      updateData.CurrentStock = validations.CurrentStock.parsed;
    }
    if (validations.minStock.parsed !== undefined) {
      updateData.minStock = validations.minStock.parsed;
    }
    if (validations.unitPrice.parsed !== undefined) {
      updateData.unitPrice = validations.unitPrice.parsed;
    }

    let groceryItem;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      groceryItem = await GroceryItems.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid grocery item ID format', 400);
      }
      groceryItem = await GroceryItems.findOneAndUpdate({ Grocery_Items_id: numId }, updateData, { new: true, runValidators: true });
    }

    if (!groceryItem) {
      return sendNotFound(res, 'Grocery item not found');
    }

    const populated = await populateGroceryItems(groceryItem);

    console.info('Grocery item updated successfully', { id: groceryItem._id });
    sendSuccess(res, populated, 'Grocery item updated successfully');
  } catch (error) {
    console.error('Error updating grocery item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteGroceryItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let groceryItem;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      groceryItem = await GroceryItems.findByIdAndUpdate(
        id,
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid grocery item ID format', 400);
      }
      groceryItem = await GroceryItems.findOneAndUpdate(
        { Grocery_Items_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    if (!groceryItem) {
      return sendNotFound(res, 'Grocery item not found');
    }

    console.info('Grocery item deleted successfully', { id: groceryItem._id });
    sendSuccess(res, groceryItem, 'Grocery item deleted successfully');
  } catch (error) {
    console.error('Error deleting grocery item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getGroceryItemsByAuth = asyncHandler(async (req, res) => {
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
      Grocery_Categories_id,
      category,
      Grocery_Categories_type_id,
      unit,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Grocery_Categories_id, category, Grocery_Categories_type_id, unit });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      GroceryItems.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      GroceryItems.countDocuments(filter)
    ]);

    const populatedItems = await populateGroceryItems(items);

    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Grocery items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving grocery items by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getGroceryItemsByTypeId = asyncHandler(async (req, res) => {
  try {
    const { Grocery_Categories_type_id } = req.params;
    const numericTypeId = parseInt(Grocery_Categories_type_id, 10);

    if (Number.isNaN(numericTypeId)) {
      return sendError(res, 'Invalid grocery categories type ID format', 400);
    }

    const categoryTypeExists = await ensureGroceryCategoryTypeExists(numericTypeId);
    if (!categoryTypeExists) {
      return sendNotFound(res, 'Grocery category type not found');
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
    filter.Grocery_Categories_type_id = numericTypeId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      GroceryItems.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      GroceryItems.countDocuments(filter)
    ]);

    const populatedItems = await populateGroceryItems(items);

    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Grocery items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving grocery items by type ID', { error: error.message, Grocery_Categories_type_id: req.params.Grocery_Categories_type_id });
    throw error;
  }
});

const getGroceryItemsByCategory = asyncHandler(async (req, res) => {
  try {
    const { Grocery_Categories_id } = req.params;
    const numericCategoryId = parseInt(Grocery_Categories_id, 10);

    if (Number.isNaN(numericCategoryId)) {
      return sendError(res, 'Invalid grocery categories ID format', 400);
    }

    const categoryExists = await ensureGroceryCategoryExists(numericCategoryId);
    if (!categoryExists) {
      return sendNotFound(res, 'Grocery category not found');
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
    filter.Grocery_Categories_id = numericCategoryId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      GroceryItems.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      GroceryItems.countDocuments(filter)
    ]);

    const populatedItems = await populateGroceryItems(items);

    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Grocery items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving grocery items by category', { error: error.message, Grocery_Categories_id: req.params.Grocery_Categories_id });
    throw error;
  }
});

module.exports = {
  createGroceryItem,
  getAllGroceryItems,
  getGroceryItemById,
  updateGroceryItem,
  deleteGroceryItem,
  getGroceryItemsByAuth,
  getGroceryItemsByTypeId,
  getGroceryItemsByCategory
};

