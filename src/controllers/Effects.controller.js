const Effects = require('../models/Effects.model');
const EffectsCategorys = require('../models/Effects_Categorys.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Effects (since numeric IDs don't work with .populate())
const populateEffectsData = async (effects) => {
  const effectsArray = Array.isArray(effects) ? effects : [effects];
  
  const populatedEffects = await Promise.all(
    effectsArray.map(async (effect) => {
      if (!effect) return null;
      
      const effectObj = effect.toObject ? effect.toObject() : effect;
      
      // Populate Effects_Categorys_id
      if (effectObj.Effects_Categorys_id) {
        const categoryId = typeof effectObj.Effects_Categorys_id === 'object' 
          ? effectObj.Effects_Categorys_id 
          : effectObj.Effects_Categorys_id;
        const category = await EffectsCategorys.findOne({ 
          Effects_Categorys_id: categoryId, 
          Status: true 
        }).select('Effects_Categorys_id name Description');
        if (category) {
          effectObj.Effects_Categorys_id = category.toObject ? category.toObject() : category;
        }
      }
      
      // Populate created_by
      if (effectObj.created_by) {
        const createdById = typeof effectObj.created_by === 'object' 
          ? effectObj.created_by 
          : effectObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (createdBy) {
          effectObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (effectObj.updated_by) {
        const updatedById = typeof effectObj.updated_by === 'object' 
          ? effectObj.updated_by 
          : effectObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (updatedBy) {
          effectObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return effectObj;
    })
  );
  
  return Array.isArray(effects) ? populatedEffects : populatedEffects[0];
};

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

const findByIdentifier = async (identifier) => {
  let effect;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    effect = await Effects.findById(identifier).lean();
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      effect = await Effects.findOne({ Effects_id: numericId }).lean();
    }
  }
  if (!effect) return null;
  return await populateEffectsData(effect);
};

const createEffects = asyncHandler(async (req, res) => {
  try {
    const { Effects_Categorys_id, image, video, name, Description, Status } = req.body;
    
    // Validate and convert Effects_Categorys_id to number
    const categoryId = typeof Effects_Categorys_id === 'string' 
      ? parseInt(Effects_Categorys_id, 10) 
      : Effects_Categorys_id;
    
    if (Number.isNaN(categoryId) || categoryId <= 0) {
      return sendError(res, 'Invalid Effects Category ID format', 400);
    }
    
    if (!(await ensureCategoryExists(categoryId))) {
      return sendError(res, 'Effects category not found', 400);
    }
    
    const payload = {
      Effects_Categorys_id: categoryId,
      image: image || undefined,
      video: video || undefined,
      name: name?.trim(),
      Description: Description?.trim() || undefined,
      Status: Status !== undefined ? Status : true,
      created_by: req.userIdNumber || null
    };
    
    const effect = await Effects.create(payload);
    const effectObj = effect.toObject ? effect.toObject() : effect;
    const populated = await populateEffectsData(effectObj);
    sendSuccess(res, populated, 'Effect created successfully', 201);
  } catch (error) {
    console.error('Error creating effect', { error: error.message, stack: error.stack });
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
      Effects.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit)
        .lean(),
      Effects.countDocuments(filter)
    ]);
    const populatedEffects = await populateEffectsData(effects);
    sendPaginated(res, populatedEffects, paginateMeta(numericPage, numericLimit, total), 'Effects retrieved successfully');
  } catch (error) {
    console.error('Error retrieving effects', { error: error.message });
    throw error;
  }
});

const getEffectsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const effect = await findByIdentifier(id);
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
    const { Effects_Categorys_id, image, video, name, Description, Status } = req.body;
    
    // Build update payload with proper type conversion
    const updatePayload = {
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    
    // Convert and validate Effects_Categorys_id if provided
    if (Effects_Categorys_id !== undefined) {
      const categoryId = typeof Effects_Categorys_id === 'string' 
        ? parseInt(Effects_Categorys_id, 10) 
        : Effects_Categorys_id;
      
      if (Number.isNaN(categoryId) || categoryId <= 0) {
        return sendError(res, 'Invalid Effects Category ID format', 400);
      }
      
      if (!(await ensureCategoryExists(categoryId))) {
        return sendError(res, 'Effects category not found', 400);
      }
      
      updatePayload.Effects_Categorys_id = categoryId;
    }
    
    // Add other fields if provided
    if (image !== undefined) updatePayload.image = image || undefined;
    if (video !== undefined) updatePayload.video = video || undefined;
    if (name !== undefined) updatePayload.name = name?.trim();
    if (Description !== undefined) updatePayload.Description = Description?.trim() || undefined;
    if (Status !== undefined) updatePayload.Status = Status;
    
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
    const effectObj = effect.toObject ? effect.toObject() : effect;
    const populated = await populateEffectsData(effectObj);
    sendSuccess(res, populated, 'Effect updated successfully');
  } catch (error) {
    console.error('Error updating effect', { error: error.message, stack: error.stack, id: req.params.id });
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
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    // Parse category ID from URL parameter
    const categoryId = parseInt(id, 10);
    if (Number.isNaN(categoryId)) {
      return sendError(res, 'Invalid effects category ID format', 400);
    }
    
    // Verify category exists
    const category = await EffectsCategorys.findOne({ 
      Effects_Categorys_id: categoryId, 
      Status: true 
    });
    if (!category) {
      return sendNotFound(res, 'Effects category not found');
    }
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    // Build filter with category ID
    const filter = buildFilter({ search, status });
    filter.Effects_Categorys_id = categoryId;
    
    // Default to active effects if status not specified
    if (status === undefined) {
      filter.Status = true;
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [effects, total] = await Promise.all([
      Effects.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit)
        .lean(),
      Effects.countDocuments(filter)
    ]);
    
    const populatedEffects = await populateEffectsData(effects);
    
    console.info('Effects retrieved by category successfully', { 
      categoryId, 
      total, 
      page: numericPage, 
      limit: numericLimit 
    });
    
    sendPaginated(res, populatedEffects, paginateMeta(numericPage, numericLimit, total), 'Effects retrieved successfully');
  } catch (error) {
    console.error('Error retrieving effects by category', { error: error.message, categoryId: req.params.id });
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
      Effects.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit)
        .lean(),
      Effects.countDocuments(filter)
    ]);
    const populatedEffects = await populateEffectsData(effects);
    sendPaginated(res, populatedEffects, paginateMeta(numericPage, numericLimit, total), 'Effects retrieved successfully');
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

