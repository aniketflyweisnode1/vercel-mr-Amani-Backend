const MyFavorites = require('../models/myFavorites.model');
const Services = require('../models/services.model');
const Item = require('../models/Item.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureServiceExists = async (serviceId) => {
  if (serviceId === undefined) {
    return true;
  }

  const service = await Services.findOne({ service_id: serviceId });
  return Boolean(service);
};

const ensureItemExists = async (itemId) => {
  if (itemId === undefined) {
    return true;
  }

  const item = await Item.findOne({ Item_id: itemId });
  return Boolean(item);
};

const paginationMeta = (page, limit, total) => {
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

const createFavorite = asyncHandler(async (req, res) => {
  try {
    const { service_id, Item_id, user_id } = req.body;

    const [serviceExists, itemExists] = await Promise.all([
      ensureServiceExists(service_id),
      ensureItemExists(Item_id)
    ]);

    if (!serviceExists) {
      return sendError(res, 'Associated service not found', 400);
    }

    if (!itemExists) {
      return sendError(res, 'Associated item not found', 400);
    }

    const payload = {
      ...req.body,
      user_id: user_id ?? req.userIdNumber ?? null,
      created_by: req.userIdNumber ?? null
    };

    if (!payload.user_id) {
      return sendError(res, 'User ID is required', 400);
    }

    const favorite = await MyFavorites.create(payload);

    console.info('Favorite created successfully', { id: favorite._id, myFavorites_id: favorite.myFavorites_id });

    sendSuccess(res, favorite, 'Favorite created successfully', 201);
  } catch (error) {
    console.error('Error creating favorite', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllFavorites = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      user_id,
      service_id,
      Item_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);

    const filter = {};

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    if (user_id !== undefined) {
      filter.user_id = Number(user_id);
    }

    if (service_id !== undefined) {
      filter.service_id = Number(service_id);
    }

    if (Item_id !== undefined) {
      filter.Item_id = Number(Item_id);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (numericPage - 1) * numericLimit;

    const [favorites, total] = await Promise.all([
      MyFavorites.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      MyFavorites.countDocuments(filter)
    ]);

    console.info('Favorites retrieved successfully', { total, page: numericPage, limit: numericLimit });

    sendPaginated(res, favorites, paginationMeta(numericPage, numericLimit, total), 'Favorites retrieved successfully');
  } catch (error) {
    console.error('Error retrieving favorites', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getFavoritesByAuthUser = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      service_id,
      Item_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);

    const filter = {
      user_id: req.userIdNumber
    };

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    if (service_id !== undefined) {
      filter.service_id = Number(service_id);
    }

    if (Item_id !== undefined) {
      filter.Item_id = Number(Item_id);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (numericPage - 1) * numericLimit;

    const [favorites, total] = await Promise.all([
      MyFavorites.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      MyFavorites.countDocuments(filter)
    ]);

    console.info('Favorites retrieved for auth user', { total, page: numericPage, limit: numericLimit, user_id: req.userIdNumber });

    sendPaginated(res, favorites, paginationMeta(numericPage, numericLimit, total), 'Favorites retrieved successfully');
  } catch (error) {
    console.error('Error retriving favorites for auth user', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getFavoriteById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const favorite = await MyFavorites.findById(id);

    if (!favorite) {
      return sendNotFound(res, 'Favorite not found');
    }

    console.info('Favorite retrieved successfully', { id: favorite._id });

    sendSuccess(res, favorite, 'Favorite retrieved successfully');
  } catch (error) {
    console.error('Error retrieving favorite', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateFavorite = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { service_id, Item_id } = req.body;

    if (service_id !== undefined) {
      const exists = await ensureServiceExists(service_id);
      if (!exists) {
        return sendError(res, 'Associated service not found', 400);
      }
    }

    if (Item_id !== undefined) {
      const exists = await ensureItemExists(Item_id);
      if (!exists) {
        return sendError(res, 'Associated item not found', 400);
      }
    }

    const update = {
      ...req.body,
      updated_by: req.userIdNumber ?? null,
      updated_at: new Date()
    };

    const favorite = await MyFavorites.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    });

    if (!favorite) {
      return sendNotFound(res, 'Favorite not found');
    }

    console.info('Favorite updated successfully', { id: favorite._id });

    sendSuccess(res, favorite, 'Favorite updated successfully');
  } catch (error) {
    console.error('Error updating favorite', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteFavorite = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const favorite = await MyFavorites.findByIdAndUpdate(
      id,
      {
        status: false,
        updated_by: req.userIdNumber ?? null,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!favorite) {
      return sendNotFound(res, 'Favorite not found');
    }

    console.info('Favorite deleted successfully', { id: favorite._id });

    sendSuccess(res, favorite, 'Favorite deleted successfully');
  } catch (error) {
    console.error('Error deleting favorite', { error: error.message, id: req.params.id });
    throw error;
  }
});

module.exports = {
  createFavorite,
  getAllFavorites,
  getFavoritesByAuthUser,
  getFavoriteById,
  updateFavorite,
  deleteFavorite
};

