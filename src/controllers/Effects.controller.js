const Effects = require('../models/Effects.model');
const EffectsCategorys = require('../models/Effects_Categorys.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateEffects = (query) => query
  .populate('Effects_Categorys_id', 'Effects_Categorys_id name Description')
  .populate('created_by', 'user_id firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'user_id firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, Effects_Categorys_id }) => {
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

  if (Effects_Categorys_id !== undefined) {
    const categoryId = parseInt(Effects_Categorys_id, 10);
    if (!Number.isNaN(categoryId)) {
      filter.Effects_Categorys_id = categoryId;
    }
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

const ensureCategoryExists = async (Effects_Categorys_id) => {
  if (Effects_Categorys_id === undefined) {
    return true;
  }
  const categoryId = parseInt(Effects_Categorys_id, 10);
  if (Number.isNaN(categoryId)) {
    return false;
  }
  const category = await EffectsCategorys.findOne({ Effects_Categorys_id: categoryId, Status: true });
  return Boolean(category);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateEffects(Effects.findById(identifier));
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateEffects(Effects.findOne({ Effects_id: numericId }));
  }
  return null;
};

const createEffects = asyncHandler(async (req, res) => {
  try {
    const { Effects_Categorys_id } = req.body;
    if (!(await ensureCategoryExists(Effects_Categorys_id))) {
      return sendError(res, 'Effects category not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const effect = await Effects.create(payload);
    const populated = await populateEffects(Effects.findById(effect._id));
    sendSuccess(res, populated, 'Effect created successfully', 201);
  } catch (error) {
    console.error('Error creating effect', { error: error.message });
    throw error;
  }
});

const getAllEffects = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Effects_Categorys_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Effects_Categorys_id });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [effects, total] = await Promise.all([
      populateEffects(Effects.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Effects.countDocuments(filter)
    ]);
    sendPaginated(res, effects, paginateMeta(numericPage, numericLimit, total), 'Effects retrieved successfully');
  } catch (error) {
    console.error('Error retrieving effects', { error: error.message });
    throw error;
  }
});

const getEffectsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const effectQuery = findByIdentifier(id);
    if (!effectQuery) {
      return sendError(res, 'Invalid effect identifier', 400);
    }
    const effect = await effectQuery;
    if (!effect) {
      return sendNotFound(res, 'Effect not found');
    }
    sendSuccess(res, effect, 'Effect retrieved successfully');
  } catch (error) {
    console.error('Error retrieving effect', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateEffects = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Effects_Categorys_id } = req.body;
    if (Effects_Categorys_id !== undefined && !(await ensureCategoryExists(Effects_Categorys_id))) {
      return sendError(res, 'Effects category not found', 400);
    }
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let effect;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      effect = await Effects.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid effect ID format', 400);
      }
      effect = await Effects.findOneAndUpdate({ Effects_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!effect) {
      return sendNotFound(res, 'Effect not found');
    }
    const populated = await populateEffects(Effects.findById(effect._id));
    sendSuccess(res, populated, 'Effect updated successfully');
  } catch (error) {
    console.error('Error updating effect', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteEffects = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let effect;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      effect = await Effects.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid effect ID format', 400);
      }
      effect = await Effects.findOneAndUpdate({ Effects_id: numericId }, updatePayload, { new: true });
    }
    if (!effect) {
      return sendNotFound(res, 'Effect not found');
    }
    sendSuccess(res, effect, 'Effect deleted successfully');
  } catch (error) {
    console.error('Error deleting effect', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getEffectsByCategoryId = asyncHandler(async (req, res) => {
  try {
    const { Effects_Categorys_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const categoryId = parseInt(Effects_Categorys_id, 10);
    if (Number.isNaN(categoryId)) {
      return sendError(res, 'Invalid effects category ID format', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status });
    filter.Effects_Categorys_id = categoryId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [effects, total] = await Promise.all([
      populateEffects(Effects.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Effects.countDocuments(filter)
    ]);
    sendPaginated(res, effects, paginateMeta(numericPage, numericLimit, total), 'Effects retrieved successfully');
  } catch (error) {
    console.error('Error retrieving effects by category', { error: error.message, Effects_Categorys_id: req.params.Effects_Categorys_id });
    throw error;
  }
});

const getEffectsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Effects_Categorys_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Effects_Categorys_id });
    filter.created_by = req.userIdNumber || null;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [effects, total] = await Promise.all([
      populateEffects(Effects.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Effects.countDocuments(filter)
    ]);
    sendPaginated(res, effects, paginateMeta(numericPage, numericLimit, total), 'Effects retrieved successfully');
  } catch (error) {
    console.error('Error retrieving effects by auth', { error: error.message });
    throw error;
  }
});

module.exports = {
  createEffects,
  getAllEffects,
  getEffectsById,
  updateEffects,
  deleteEffects,
  getEffectsByCategoryId,
  getEffectsByAuth
};

