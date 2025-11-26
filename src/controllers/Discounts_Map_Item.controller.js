const Discounts_Map_Item = require('../models/Discounts_Map_Item.model');
const Item = require('../models/Item.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to get business_Branch_id from authenticated user
const getBusinessBranchIdByAuth = async (userIdNumber) => {
  const branch = await Business_Branch.findOne({ created_by: userIdNumber, Status: true });
  return branch ? branch.business_Branch_id : null;
};

// Helper function to ensure item exists
const ensureItemExists = async (item_id) => {
  const item = await Item.findOne({ Item_id: item_id, Status: true });
  return !!item;
};

// Helper function to ensure business branch exists
const ensureBusinessBranchExists = async (business_Branch_id) => {
  const branch = await Business_Branch.findOne({ business_Branch_id, Status: true });
  return !!branch;
};

const buildFilterFromQuery = ({ search, status, item_id, business_Branch_id }) => {
  const filter = {};

  if (search) {
    filter.Description = { $regex: search, $options: 'i' };
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (item_id) {
    const itemIdNum = parseInt(item_id, 10);
    if (!isNaN(itemIdNum)) {
      filter.item_id = itemIdNum;
    }
  }

  if (business_Branch_id) {
    const branchIdNum = parseInt(business_Branch_id, 10);
    if (!isNaN(branchIdNum)) {
      filter.business_Branch_id = branchIdNum;
    }
  }

  return filter;
};

const populateDiscountsMapItem = (query) => query
  .populate('item_id', 'Item_id name item_price item_image Description')
  .populate('business_Branch_id', 'business_Branch_id name address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const createDiscountsMapItem = asyncHandler(async (req, res) => {
  try {
    const { item_id } = req.body;

    // Validate item exists
    const itemExists = await ensureItemExists(item_id);
    if (!itemExists) {
      return sendError(res, 'Item not found or inactive', 404);
    }

    // Get business_Branch_id from authenticated user
    const business_Branch_id = await getBusinessBranchIdByAuth(req.userIdNumber);
    if (!business_Branch_id) {
      return sendError(res, 'No active business branch found for authenticated user', 404);
    }

    const payload = {
      ...req.body,
      business_Branch_id,
      created_by: req.userIdNumber || null
    };

    const discountsMapItem = await Discounts_Map_Item.create(payload);
    console.info('Discounts map item created successfully', { id: discountsMapItem._id, Discounts_Map_Item_id: discountsMapItem.Discounts_Map_Item_id });

    const populated = await populateDiscountsMapItem(Discounts_Map_Item.findById(discountsMapItem._id));
    sendSuccess(res, populated, 'Discounts map item created successfully', 201);
  } catch (error) {
    console.error('Error creating discounts map item', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllDiscountsMapItems = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      item_id,
      business_Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status, item_id, business_Branch_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [discountsMapItems, total] = await Promise.all([
      populateDiscountsMapItem(Discounts_Map_Item.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts_Map_Item.countDocuments(filter)
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

    console.info('Discounts map items retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, discountsMapItems, pagination, 'Discounts map items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts map items', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getDiscountsMapItemById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let discountsMapItem;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      discountsMapItem = await populateDiscountsMapItem(Discounts_Map_Item.findById(id));
    } else {
      const discountsMapItemId = parseInt(id, 10);
      if (isNaN(discountsMapItemId)) {
        return sendNotFound(res, 'Invalid discounts map item ID format');
      }
      discountsMapItem = await populateDiscountsMapItem(Discounts_Map_Item.findOne({ Discounts_Map_Item_id: discountsMapItemId }));
    }

    if (!discountsMapItem) {
      return sendNotFound(res, 'Discounts map item not found');
    }

    console.info('Discounts map item retrieved successfully', { id: discountsMapItem._id });
    sendSuccess(res, discountsMapItem, 'Discounts map item retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts map item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateDiscountsMapItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Validate item if being updated
    if (updateData.item_id !== undefined) {
      const itemExists = await ensureItemExists(updateData.item_id);
      if (!itemExists) {
        return sendError(res, 'Item not found or inactive', 400);
      }
    }

    // Validate business_Branch_id if being updated
    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Business branch not found', 400);
      }
    }

    let discountsMapItem;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      discountsMapItem = await Discounts_Map_Item.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const discountsMapItemId = parseInt(id, 10);
      if (isNaN(discountsMapItemId)) {
        return sendNotFound(res, 'Invalid discounts map item ID format');
      }
      discountsMapItem = await Discounts_Map_Item.findOneAndUpdate({ Discounts_Map_Item_id: discountsMapItemId }, updateData, { new: true, runValidators: true });
    }

    if (!discountsMapItem) {
      return sendNotFound(res, 'Discounts map item not found');
    }

    const populated = await populateDiscountsMapItem(Discounts_Map_Item.findById(discountsMapItem._id));
    console.info('Discounts map item updated successfully', { id: discountsMapItem._id });
    sendSuccess(res, populated, 'Discounts map item updated successfully');
  } catch (error) {
    console.error('Error updating discounts map item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteDiscountsMapItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let discountsMapItem;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      discountsMapItem = await Discounts_Map_Item.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const discountsMapItemId = parseInt(id, 10);
      if (isNaN(discountsMapItemId)) {
        return sendNotFound(res, 'Invalid discounts map item ID format');
      }
      discountsMapItem = await Discounts_Map_Item.findOneAndUpdate({ Discounts_Map_Item_id: discountsMapItemId }, updateData, { new: true });
    }

    if (!discountsMapItem) {
      return sendNotFound(res, 'Discounts map item not found');
    }

    console.info('Discounts map item deleted successfully', { id: discountsMapItem._id });
    sendSuccess(res, discountsMapItem, 'Discounts map item deleted successfully');
  } catch (error) {
    console.error('Error deleting discounts map item', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getDiscountsMapItemsByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      item_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ status, item_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [discountsMapItems, total] = await Promise.all([
      populateDiscountsMapItem(Discounts_Map_Item.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts_Map_Item.countDocuments(filter)
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

    console.info('Discounts map items retrieved for authenticated user', { userId, total });
    sendPaginated(res, discountsMapItems, pagination, 'Discounts map items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts map items for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getDiscountsMapItemsByItemId = asyncHandler(async (req, res) => {
  try {
    const { item_id } = req.params;
    const itemIdNum = parseInt(item_id, 10);

    if (isNaN(itemIdNum)) {
      return sendError(res, 'Invalid item ID format', 400);
    }

    // Validate item exists
    const itemExists = await ensureItemExists(itemIdNum);
    if (!itemExists) {
      return sendNotFound(res, 'Item not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ search, status });
    filter.item_id = itemIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [discountsMapItems, total] = await Promise.all([
      populateDiscountsMapItem(Discounts_Map_Item.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts_Map_Item.countDocuments(filter)
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

    console.info('Discounts map items retrieved by item ID', { item_id: itemIdNum, total });
    sendPaginated(res, discountsMapItems, pagination, 'Discounts map items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts map items by item ID', { error: error.message, item_id: req.params.item_id });
    throw error;
  }
});

const getDiscountsMapItemsByBusinessBranchId = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.params;
    const branchIdNum = parseInt(business_Branch_id, 10);

    if (isNaN(branchIdNum)) {
      return sendError(res, 'Invalid business branch ID format', 400);
    }

    // Validate branch exists
    const branchExists = await ensureBusinessBranchExists(branchIdNum);
    if (!branchExists) {
      return sendNotFound(res, 'Business branch not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      item_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ search, status, item_id });
    filter.business_Branch_id = branchIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [discountsMapItems, total] = await Promise.all([
      populateDiscountsMapItem(Discounts_Map_Item.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Discounts_Map_Item.countDocuments(filter)
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

    console.info('Discounts map items retrieved by business branch ID', { business_Branch_id: branchIdNum, total });
    sendPaginated(res, discountsMapItems, pagination, 'Discounts map items retrieved successfully');
  } catch (error) {
    console.error('Error retrieving discounts map items by business branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createDiscountsMapItem,
  getAllDiscountsMapItems,
  getDiscountsMapItemById,
  updateDiscountsMapItem,
  deleteDiscountsMapItem,
  getDiscountsMapItemsByAuth,
  getDiscountsMapItemsByItemId,
  getDiscountsMapItemsByBusinessBranchId
};

