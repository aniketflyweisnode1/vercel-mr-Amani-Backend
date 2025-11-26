const RestaurantItemCategory = require('../models/Restaurant_item_Category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateRestaurantItemCategory = (query) => query
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { CategoryName: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  return filter;
};

const findCategoryByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateRestaurantItemCategory(RestaurantItemCategory.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateRestaurantItemCategory(RestaurantItemCategory.findOne({ Restaurant_item_Category_id: numericId }));
  }

  return null;
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

const createRestaurantItemCategory = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const category = await RestaurantItemCategory.create(payload);
    const populated = await populateRestaurantItemCategory(RestaurantItemCategory.findById(category._id));

    sendSuccess(res, populated, 'Restaurant item category created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant item category', { error: error.message });
    throw error;
  }
});

const getAllRestaurantItemCategories = asyncHandler(async (req, res) => {
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

    const filter = buildFilter({ search, status });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [categories, total] = await Promise.all([
      populateRestaurantItemCategory(RestaurantItemCategory.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantItemCategory.countDocuments(filter)
    ]);

    sendPaginated(res, categories, paginateMeta(numericPage, numericLimit, total), 'Restaurant item categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item categories', { error: error.message });
    throw error;
  }
});

const getRestaurantItemCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const categoryQuery = findCategoryByIdentifier(id);

    if (!categoryQuery) {
      return sendError(res, 'Invalid category identifier', 400);
    }

    const category = await categoryQuery;

    if (!category) {
      return sendNotFound(res, 'Restaurant item category not found');
    }

    sendSuccess(res, category, 'Restaurant item category retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateRestaurantItemCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await RestaurantItemCategory.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid category ID format', 400);
      }
      category = await RestaurantItemCategory.findOneAndUpdate({ Restaurant_item_Category_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!category) {
      return sendNotFound(res, 'Restaurant item category not found');
    }

    const populated = await populateRestaurantItemCategory(RestaurantItemCategory.findById(category._id));
    sendSuccess(res, populated, 'Restaurant item category updated successfully');
  } catch (error) {
    console.error('Error updating restaurant item category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteRestaurantItemCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await RestaurantItemCategory.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid category ID format', 400);
      }
      category = await RestaurantItemCategory.findOneAndUpdate({ Restaurant_item_Category_id: numericId }, updatePayload, { new: true });
    }

    if (!category) {
      return sendNotFound(res, 'Restaurant item category not found');
    }

    sendSuccess(res, category, 'Restaurant item category deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant item category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getRestaurantItemCategoriesByAuth = asyncHandler(async (req, res) => {
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
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [categories, total] = await Promise.all([
      populateRestaurantItemCategory(RestaurantItemCategory.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantItemCategory.countDocuments(filter)
    ]);

    sendPaginated(res, categories, paginateMeta(numericPage, numericLimit, total), 'Restaurant item categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item categories by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getRestaurantItemCategoryByTypeId = asyncHandler(async (req, res) => {
  try {
    const { Restaurant_item_Category_id } = req.params;
    const numericId = parseInt(Restaurant_item_Category_id, 10);

    if (Number.isNaN(numericId)) {
      return sendError(res, 'Invalid restaurant item category ID format', 400);
    }

    const category = await populateRestaurantItemCategory(
      RestaurantItemCategory.findOne({ Restaurant_item_Category_id: numericId })
    );

    if (!category) {
      return sendNotFound(res, 'Restaurant item category not found');
    }

    sendSuccess(res, category, 'Restaurant item category retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item category by type ID', { error: error.message, Restaurant_item_Category_id: req.params.Restaurant_item_Category_id });
    throw error;
  }
});

module.exports = {
  createRestaurantItemCategory,
  getAllRestaurantItemCategories,
  getRestaurantItemCategoryById,
  updateRestaurantItemCategory,
  deleteRestaurantItemCategory,
  getRestaurantItemCategoriesByAuth,
  getRestaurantItemCategoryByTypeId
};


