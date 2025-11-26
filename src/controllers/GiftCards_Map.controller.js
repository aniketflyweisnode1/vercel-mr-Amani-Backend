const GiftCardsMap = require('../models/GiftCards_Map.model');
const GiftCards = require('../models/GiftCards.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureGiftCardExists = async (giftCardId) => {
  if (giftCardId === undefined || giftCardId === null) {
    return true;
  }
  const giftCard = await GiftCards.findOne({ GiftCards_id: giftCardId, Status: true });
  return Boolean(giftCard);
};

const ensureUserExists = async (userId) => {
  if (userId === undefined || userId === null) {
    return true;
  }
  const user = await User.findOne({ user_id: userId, status: true });
  return Boolean(user);
};

const buildFilterFromQuery = ({ search, status, ExpiryStatus, GiftCards_id, user_id, fromExpiryDate, toExpiryDate }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (ExpiryStatus !== undefined) {
    filter.ExpiryStatus = ExpiryStatus === 'true';
  }

  if (GiftCards_id !== undefined) {
    const parsed = Number(GiftCards_id);
    if (!Number.isNaN(parsed)) {
      filter.GiftCards_id = parsed;
    }
  }

  if (user_id !== undefined) {
    const parsed = Number(user_id);
    if (!Number.isNaN(parsed)) {
      filter.user_id = parsed;
    }
  }

  if (fromExpiryDate || toExpiryDate) {
    filter.ExpiryDate = {};
    if (fromExpiryDate) {
      filter.ExpiryDate.$gte = new Date(fromExpiryDate);
    }
    if (toExpiryDate) {
      filter.ExpiryDate.$lte = new Date(toExpiryDate);
    }
  }

  return filter;
};

const populateQuery = (query) => query
  .populate('GiftCards_id', 'GiftCards_id name price expiryDays Status')
  .populate('user_id', 'user_id firstName lastName phoneNo Email status');

const createGiftCardsMap = asyncHandler(async (req, res) => {
  try {
    const { GiftCards_id, user_id } = req.body;

    const [giftCardExists, userExists] = await Promise.all([
      ensureGiftCardExists(GiftCards_id),
      ensureUserExists(user_id)
    ]);

    if (!giftCardExists) {
      return sendError(res, 'Gift card not found or inactive', 404);
    }

    if (!userExists) {
      return sendError(res, 'User not found or inactive', 404);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const giftCardMap = await GiftCardsMap.create(payload);
    console.info('Gift card map created successfully', { id: giftCardMap._id, GiftCards_Map_id: giftCardMap.GiftCards_Map_id });

    sendSuccess(res, giftCardMap, 'Gift card map created successfully', 201);
  } catch (error) {
    console.error('Error creating gift card map', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllGiftCardsMaps = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      ExpiryStatus,
      GiftCards_id,
      user_id,
      fromExpiryDate,
      toExpiryDate,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status, ExpiryStatus, GiftCards_id, user_id, fromExpiryDate, toExpiryDate });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [giftCardsMaps, total] = await Promise.all([
      populateQuery(GiftCardsMap.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      GiftCardsMap.countDocuments(filter)
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

    console.info('Gift card maps retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, giftCardsMaps, pagination, 'Gift card maps retrieved successfully');
  } catch (error) {
    console.error('Error retrieving gift card maps', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getGiftCardsMapById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let giftCardMap;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      giftCardMap = await populateQuery(GiftCardsMap.findById(id));
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid gift card map ID format');
      }
      giftCardMap = await populateQuery(GiftCardsMap.findOne({ GiftCards_Map_id: numericId }));
    }

    if (!giftCardMap) {
      return sendNotFound(res, 'Gift card map not found');
    }

    console.info('Gift card map retrieved successfully', { id: giftCardMap._id });
    sendSuccess(res, giftCardMap, 'Gift card map retrieved successfully');
  } catch (error) {
    console.error('Error retrieving gift card map', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateGiftCardsMap = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.GiftCards_id !== undefined) {
      const giftCardExists = await ensureGiftCardExists(updateData.GiftCards_id);
      if (!giftCardExists) {
        return sendError(res, 'Gift card not found or inactive', 404);
      }
    }

    if (updateData.user_id !== undefined) {
      const userExists = await ensureUserExists(updateData.user_id);
      if (!userExists) {
        return sendError(res, 'User not found or inactive', 404);
      }
    }

    let giftCardMap;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      giftCardMap = await populateQuery(GiftCardsMap.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }));
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid gift card map ID format');
      }
      giftCardMap = await populateQuery(GiftCardsMap.findOneAndUpdate({ GiftCards_Map_id: numericId }, updateData, { new: true, runValidators: true }));
    }

    if (!giftCardMap) {
      return sendNotFound(res, 'Gift card map not found');
    }

    console.info('Gift card map updated successfully', { id: giftCardMap._id });
    sendSuccess(res, giftCardMap, 'Gift card map updated successfully');
  } catch (error) {
    console.error('Error updating gift card map', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteGiftCardsMap = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let giftCardMap;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      giftCardMap = await populateQuery(GiftCardsMap.findByIdAndUpdate(id, updateData, { new: true }));
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid gift card map ID format');
      }
      giftCardMap = await populateQuery(GiftCardsMap.findOneAndUpdate({ GiftCards_Map_id: numericId }, updateData, { new: true }));
    }

    if (!giftCardMap) {
      return sendNotFound(res, 'Gift card map not found');
    }

    console.info('Gift card map deleted successfully', { id: giftCardMap._id });
    sendSuccess(res, giftCardMap, 'Gift card map deleted successfully');
  } catch (error) {
    console.error('Error deleting gift card map', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getGiftCardsMapByUserId = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const numericUserId = parseInt(userId, 10);

    if (Number.isNaN(numericUserId)) {
      return sendError(res, 'Invalid user ID format', 400);
    }

    const { status, ExpiryStatus } = req.query;
    const filter = {
      user_id: numericUserId
    };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (ExpiryStatus !== undefined) {
      filter.ExpiryStatus = ExpiryStatus === 'true';
    }

    const giftCardsMaps = await populateQuery(GiftCardsMap.find(filter));

    console.info('Gift card maps retrieved by user ID', { userId: numericUserId, total: giftCardsMaps.length });
    sendSuccess(res, giftCardsMaps, 'Gift card maps retrieved successfully');
  } catch (error) {
    console.error('Error retrieving gift card maps by user ID', { error: error.message, userId: req.params.userId });
    throw error;
  }
});

const getGiftCardsMapByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const { status, ExpiryStatus } = req.query;
    const filter = {
      user_id: userId
    };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (ExpiryStatus !== undefined) {
      filter.ExpiryStatus = ExpiryStatus === 'true';
    }

    const giftCardsMaps = await populateQuery(GiftCardsMap.find(filter));

    console.info('Gift card maps retrieved for authenticated user', { userId, total: giftCardsMaps.length });
    sendSuccess(res, giftCardsMaps, 'Gift card maps retrieved successfully');
  } catch (error) {
    console.error('Error retrieving gift card maps for auth user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createGiftCardsMap,
  getAllGiftCardsMaps,
  getGiftCardsMapById,
  updateGiftCardsMap,
  deleteGiftCardsMap,
  getGiftCardsMapByUserId,
  getGiftCardsMapByAuth
};


