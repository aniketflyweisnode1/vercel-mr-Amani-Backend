const EffectsCategorys = require('../models/Effects_Categorys.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs (created_by, updated_by)
const populateEffectsCategorys = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate created_by
      if (recordObj.created_by) {
        const createdById = typeof recordObj.created_by === 'object' ? recordObj.created_by.user_id || recordObj.created_by : recordObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          recordObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (recordObj.updated_by) {
        const updatedById = typeof recordObj.updated_by === 'object' ? recordObj.updated_by.user_id || recordObj.updated_by : recordObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          recordObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return recordObj;
    })
  );
  
  return Array.isArray(records) ? populatedRecords : populatedRecords[0];
};

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

const findByIdentifier = async (identifier) => {
  let recordData;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    recordData = await EffectsCategorys.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      recordData = await EffectsCategorys.findOne({ Effects_Categorys_id: numericId });
    }
  }
  
  if (!recordData) {
    return null;
  }
  
  return await populateEffectsCategorys(recordData);
};

const createEffectsCategorys = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const category = await EffectsCategorys.create(payload);
    const populated = await populateEffectsCategorys(category);
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
    const [categoriesData, total] = await Promise.all([
      EffectsCategorys.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      EffectsCategorys.countDocuments(filter)
    ]);
    const categories = await populateEffectsCategorys(categoriesData);
    sendPaginated(res, categories, paginateMeta(numericPage, numericLimit, total), 'Effects categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving effects categories', { error: error.message });
    throw error;
  }
});

const getEffectsCategorysById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const category = await findByIdentifier(id);
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
    const populated = await populateEffectsCategorys(category);
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
    const [categoriesData, total] = await Promise.all([
      EffectsCategorys.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      EffectsCategorys.countDocuments(filter)
    ]);
    const categories = await populateEffectsCategorys(categoriesData);
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

