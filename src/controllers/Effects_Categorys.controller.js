const EffectsCategorys = require('../models/Effects_Categorys.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateEffectsCategorys = (query) => query
  .populate('created_by', 'user_id firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'user_id firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
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

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateEffectsCategorys(EffectsCategorys.findById(identifier));
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateEffectsCategorys(EffectsCategorys.findOne({ Effects_Categorys_id: numericId }));
  }
  return null;
};

const createEffectsCategorys = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const category = await EffectsCategorys.create(payload);
    const populated = await populateEffectsCategorys(EffectsCategorys.findById(category._id));
    sendSuccess(res, populated, 'Effects category created successfully', 201);
  } catch (error) {
    console.error('Error creating effects category', { error: error.message });
    throw error;
  }
});

const getAllEffectsCategorys = asyncHandler(async (req, res) => {
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
      populateEffectsCategorys(EffectsCategorys.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      EffectsCategorys.countDocuments(filter)
    ]);
    sendPaginated(res, categories, paginateMeta(numericPage, numericLimit, total), 'Effects categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving effects categories', { error: error.message });
    throw error;
  }
});

const getEffectsCategorysById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const categoryQuery = findByIdentifier(id);
    if (!categoryQuery) {
      return sendError(res, 'Invalid effects category identifier', 400);
    }
    const category = await categoryQuery;
    if (!category) {
      return sendNotFound(res, 'Effects category not found');
    }
    sendSuccess(res, category, 'Effects category retrieved successfully');
  } catch (error) {
    console.error('Error retrieving effects category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateEffectsCategorys = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await EffectsCategorys.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid effects category ID format', 400);
      }
      category = await EffectsCategorys.findOneAndUpdate({ Effects_Categorys_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!category) {
      return sendNotFound(res, 'Effects category not found');
    }
    const populated = await populateEffectsCategorys(EffectsCategorys.findById(category._id));
    sendSuccess(res, populated, 'Effects category updated successfully');
  } catch (error) {
    console.error('Error updating effects category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteEffectsCategorys = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await EffectsCategorys.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid effects category ID format', 400);
      }
      category = await EffectsCategorys.findOneAndUpdate({ Effects_Categorys_id: numericId }, updatePayload, { new: true });
    }
    if (!category) {
      return sendNotFound(res, 'Effects category not found');
    }
    sendSuccess(res, category, 'Effects category deleted successfully');
  } catch (error) {
    console.error('Error deleting effects category', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getEffectsCategorysByAuth = asyncHandler(async (req, res) => {
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
    filter.created_by = req.userIdNumber || null;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [categories, total] = await Promise.all([
      populateEffectsCategorys(EffectsCategorys.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      EffectsCategorys.countDocuments(filter)
    ]);
    sendPaginated(res, categories, paginateMeta(numericPage, numericLimit, total), 'Effects categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving effects categories by auth', { error: error.message });
    throw error;
  }
});

module.exports = {
  createEffectsCategorys,
  getAllEffectsCategorys,
  getEffectsCategorysById,
  updateEffectsCategorys,
  deleteEffectsCategorys,
  getEffectsCategorysByAuth
};

