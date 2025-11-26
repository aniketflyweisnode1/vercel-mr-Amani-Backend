const GiftCards = require('../models/GiftCards.model');
const GiftCardsType = require('../models/GiftCards_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const buildFilterFromQuery = ({ search, status, minPrice, maxPrice, GiftCards_type_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (minPrice !== undefined) {
    const value = Number(minPrice);
    if (!Number.isNaN(value)) {
      filter.price = { ...filter.price, $gte: value };
    }
  }

  if (maxPrice !== undefined) {
    const value = Number(maxPrice);
    if (!Number.isNaN(value)) {
      filter.price = { ...filter.price, $lte: value };
    }
  }

  if (GiftCards_type_id !== undefined) {
    const parsed = Number(GiftCards_type_id);
    if (!Number.isNaN(parsed)) {
      filter.GiftCards_type_id = parsed;
    }
  }

  return filter;
};

const populateGiftCard = (query) => query
  .populate('GiftCards_type_id', 'GiftCards_type_id name Status');

const createGiftCard = asyncHandler(async (req, res) => {
  try {
    const { GiftCards_type_id } = req.body;

    const giftCardTypeExists = await GiftCardsType.findOne({ GiftCards_type_id: GiftCards_type_id, Status: true });
    if (!giftCardTypeExists) {
      return sendError(res, 'Gift card type not found or inactive', 404);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const giftCard = await GiftCards.create(payload);
    console.info('Gift card created successfully', { id: giftCard._id, GiftCards_id: giftCard.GiftCards_id });

    const populated = await populateGiftCard(GiftCards.findById(giftCard._id));

    sendSuccess(res, populated, 'Gift card created successfully', 201);
  } catch (error) {
    console.error('Error creating gift card', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllGiftCards = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      minPrice,
      maxPrice,
      GiftCards_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status, minPrice, maxPrice, GiftCards_type_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [giftCards, total] = await Promise.all([
      populateGiftCard(GiftCards.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      GiftCards.countDocuments(filter)
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

    console.info('Gift cards retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, giftCards, pagination, 'Gift cards retrieved successfully');
  } catch (error) {
    console.error('Error retrieving gift cards', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getGiftCardById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let giftCard;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      giftCard = await populateGiftCard(GiftCards.findById(id));
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid gift card ID format');
      }
      giftCard = await populateGiftCard(GiftCards.findOne({ GiftCards_id: numericId }));
    }

    if (!giftCard) {
      return sendNotFound(res, 'Gift card not found');
    }

    console.info('Gift card retrieved successfully', { id: giftCard._id });
    sendSuccess(res, giftCard, 'Gift card retrieved successfully');
  } catch (error) {
    console.error('Error retrieving gift card', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateGiftCard = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.GiftCards_type_id !== undefined) {
      const giftCardTypeExists = await GiftCardsType.findOne({
        GiftCards_type_id: updateData.GiftCards_type_id,
        Status: true
      });

      if (!giftCardTypeExists) {
        return sendError(res, 'Gift card type not found or inactive', 404);
      }
    }

    let giftCard;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      giftCard = await populateGiftCard(GiftCards.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }));
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid gift card ID format');
      }
      giftCard = await populateGiftCard(GiftCards.findOneAndUpdate({ GiftCards_id: numericId }, updateData, { new: true, runValidators: true }));
    }

    if (!giftCard) {
      return sendNotFound(res, 'Gift card not found');
    }

    console.info('Gift card updated successfully', { id: giftCard._id });
    sendSuccess(res, giftCard, 'Gift card updated successfully');
  } catch (error) {
    console.error('Error updating gift card', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteGiftCard = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let giftCard;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      giftCard = await populateGiftCard(GiftCards.findByIdAndUpdate(id, updateData, { new: true }));
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendNotFound(res, 'Invalid gift card ID format');
      }
      giftCard = await populateGiftCard(GiftCards.findOneAndUpdate({ GiftCards_id: numericId }, updateData, { new: true }));
    }

    if (!giftCard) {
      return sendNotFound(res, 'Gift card not found');
    }

    console.info('Gift card deleted successfully', { id: giftCard._id });
    sendSuccess(res, giftCard, 'Gift card deleted successfully');
  } catch (error) {
    console.error('Error deleting gift card', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getGiftCardsByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = {
      created_by: userId
    };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [giftCards, total] = await Promise.all([
      populateGiftCard(GiftCards.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      GiftCards.countDocuments(filter)
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

    console.info('Gift cards retrieved for authenticated user', { total, page: numericPage, limit: numericLimit, userId });
    sendPaginated(res, giftCards, pagination, 'Gift cards retrieved successfully');
  } catch (error) {
    console.error('Error retrieving gift cards for auth user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createGiftCard,
  getAllGiftCards,
  getGiftCardById,
  updateGiftCard,
  deleteGiftCard,
  getGiftCardsByAuth
};


