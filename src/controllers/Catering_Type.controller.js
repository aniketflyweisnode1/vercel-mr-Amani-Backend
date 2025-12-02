const Catering_Type = require('../models/Catering_Type.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateCateringType = async (cateringTypes) => {
  const cateringTypesArray = Array.isArray(cateringTypes) ? cateringTypes : [cateringTypes];
  const populatedCateringTypes = await Promise.all(
    cateringTypesArray.map(async (cateringType) => {
      if (!cateringType) return null;
      
      const cateringTypeObj = cateringType.toObject ? cateringType.toObject() : cateringType;
      
      // Populate created_by
      if (cateringTypeObj.created_by) {
        const createdById = typeof cateringTypeObj.created_by === 'object' ? cateringTypeObj.created_by : cateringTypeObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          cateringTypeObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (cateringTypeObj.updated_by) {
        const updatedById = typeof cateringTypeObj.updated_by === 'object' ? cateringTypeObj.updated_by : cateringTypeObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          cateringTypeObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return cateringTypeObj;
    })
  );
  
  return Array.isArray(cateringTypes) ? populatedCateringTypes : populatedCateringTypes[0];
};

const createCateringType = asyncHandler(async (req, res) => {
  try {
    const cateringTypeData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const cateringType = await Catering_Type.create(cateringTypeData);
    console.info('Catering Type created successfully', { id: cateringType._id, Catering_Type_id: cateringType.Catering_Type_id });

    const populated = await populateCateringType(cateringType);
    sendSuccess(res, populated, 'Catering Type created successfully', 201);
  } catch (error) {
    console.error('Error creating catering type', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllCateringTypes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [cateringTypes, total] = await Promise.all([
      Catering_Type.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Catering_Type.countDocuments(filter)
    ]);

    const populatedCateringTypes = await populateCateringType(cateringTypes);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Catering Types retrieved successfully', { count: populatedCateringTypes.length, total });
    sendPaginated(res, populatedCateringTypes, paginationMeta, 'Catering Types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving catering types', { error: error.message });
    throw error;
  }
});

const getCateringTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let cateringType;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      cateringType = await Catering_Type.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid catering type ID format', 400);
      }
      cateringType = await Catering_Type.findOne({ Catering_Type_id: numId });
    }

    if (!cateringType) {
      return sendNotFound(res, 'Catering Type not found');
    }

    const populatedCateringType = await populateCateringType(cateringType);

    console.info('Catering Type retrieved successfully', { id: cateringType._id });
    sendSuccess(res, populatedCateringType, 'Catering Type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving catering type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateCateringType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let cateringType;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      cateringType = await Catering_Type.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid catering type ID format', 400);
      }
      cateringType = await Catering_Type.findOneAndUpdate({ Catering_Type_id: numId }, updateData, { new: true, runValidators: true });
    }

    if (!cateringType) {
      return sendNotFound(res, 'Catering Type not found');
    }

    const populatedCateringType = await populateCateringType(cateringType);

    console.info('Catering Type updated successfully', { id: cateringType._id });
    sendSuccess(res, populatedCateringType, 'Catering Type updated successfully');
  } catch (error) {
    console.error('Error updating catering type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteCateringType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let cateringType;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      cateringType = await Catering_Type.findByIdAndUpdate(
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
        return sendError(res, 'Invalid catering type ID format', 400);
      }
      cateringType = await Catering_Type.findOneAndUpdate(
        { Catering_Type_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    if (!cateringType) {
      return sendNotFound(res, 'Catering Type not found');
    }

    console.info('Catering Type deleted successfully', { id: cateringType._id });
    sendSuccess(res, cateringType, 'Catering Type deleted successfully');
  } catch (error) {
    console.error('Error deleting catering type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getCateringTypesByAuth = asyncHandler(async (req, res) => {
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

    const filter = { created_by: userId };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [cateringTypes, total] = await Promise.all([
      Catering_Type.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Catering_Type.countDocuments(filter)
    ]);

    const populatedCateringTypes = await populateCateringType(cateringTypes);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Catering Types retrieved for authenticated user', { userId, total });
    sendPaginated(res, populatedCateringTypes, paginationMeta, 'Catering Types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving catering types for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createCateringType,
  getAllCateringTypes,
  getCateringTypeById,
  updateCateringType,
  deleteCateringType,
  getCateringTypesByAuth
};

