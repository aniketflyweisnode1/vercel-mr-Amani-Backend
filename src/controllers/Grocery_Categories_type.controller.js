const Grocery_Categories_type = require('../models/Grocery_Categories_type.model');
const Grocery_Categories = require('../models/Grocery_Categories.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateGroceryCategoriesType = async (groceryCategoriesTypes) => {
  const groceryCategoriesTypesArray = Array.isArray(groceryCategoriesTypes) ? groceryCategoriesTypes : [groceryCategoriesTypes];
  const populatedGroceryCategoriesTypes = await Promise.all(
    groceryCategoriesTypesArray.map(async (groceryCategoriesType) => {
      if (!groceryCategoriesType) return null;
      
      const groceryCategoriesTypeObj = groceryCategoriesType.toObject ? groceryCategoriesType.toObject() : groceryCategoriesType;
      
      // Populate Grocery_Categories_id
      if (groceryCategoriesTypeObj.Grocery_Categories_id) {
        const categoryId = typeof groceryCategoriesTypeObj.Grocery_Categories_id === 'object' ? groceryCategoriesTypeObj.Grocery_Categories_id : groceryCategoriesTypeObj.Grocery_Categories_id;
        const category = await Grocery_Categories.findOne({ Grocery_Categories_id: categoryId })
          .select('Grocery_Categories_id Name Coverimage Status');
        if (category) {
          groceryCategoriesTypeObj.Grocery_Categories_id = category.toObject ? category.toObject() : category;
        }
      }
      
      // Populate created_by
      if (groceryCategoriesTypeObj.created_by) {
        const createdById = typeof groceryCategoriesTypeObj.created_by === 'object' ? groceryCategoriesTypeObj.created_by : groceryCategoriesTypeObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          groceryCategoriesTypeObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (groceryCategoriesTypeObj.updated_by) {
        const updatedById = typeof groceryCategoriesTypeObj.updated_by === 'object' ? groceryCategoriesTypeObj.updated_by : groceryCategoriesTypeObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          groceryCategoriesTypeObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return groceryCategoriesTypeObj;
    })
  );
  
  return Array.isArray(groceryCategoriesTypes) ? populatedGroceryCategoriesTypes : populatedGroceryCategoriesTypes[0];
};

// Helper function to ensure Grocery_Categories exists
const ensureGroceryCategoriesExists = async (groceryCategoriesId) => {
  const category = await Grocery_Categories.findOne({ Grocery_Categories_id: groceryCategoriesId, Status: true });
  return !!category;
};

const createGroceryCategoriesType = asyncHandler(async (req, res) => {
  try {
    const { Grocery_Categories_id } = req.body;
    
    // Validate grocery categories exists
    const categoryExists = await ensureGroceryCategoriesExists(Grocery_Categories_id);
    if (!categoryExists) {
      return sendNotFound(res, 'Grocery Categories not found');
    }

    const groceryCategoriesTypeData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const groceryCategoriesType = await Grocery_Categories_type.create(groceryCategoriesTypeData);
    console.info('Grocery Categories Type created successfully', { id: groceryCategoriesType._id, Grocery_Categories_type_id: groceryCategoriesType.Grocery_Categories_type_id });

    const populated = await populateGroceryCategoriesType(groceryCategoriesType);
    sendSuccess(res, populated, 'Grocery Categories Type created successfully', 201);
  } catch (error) {
    console.error('Error creating grocery categories type', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllGroceryCategoriesTypes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Grocery_Categories_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.Name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (Grocery_Categories_id) {
      filter.Grocery_Categories_id = parseInt(Grocery_Categories_id, 10);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [groceryCategoriesTypes, total] = await Promise.all([
      Grocery_Categories_type.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Grocery_Categories_type.countDocuments(filter)
    ]);

    const populatedGroceryCategoriesTypes = await populateGroceryCategoriesType(groceryCategoriesTypes);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Grocery Categories Types retrieved successfully', { count: populatedGroceryCategoriesTypes.length, total });
    sendPaginated(res, populatedGroceryCategoriesTypes, paginationMeta, 'Grocery Categories Types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving grocery categories types', { error: error.message });
    throw error;
  }
});

const getGroceryCategoriesTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let groceryCategoriesType;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      groceryCategoriesType = await Grocery_Categories_type.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid grocery categories type ID format', 400);
      }
      groceryCategoriesType = await Grocery_Categories_type.findOne({ Grocery_Categories_type_id: numId });
    }

    if (!groceryCategoriesType) {
      return sendNotFound(res, 'Grocery Categories Type not found');
    }

    const populatedGroceryCategoriesType = await populateGroceryCategoriesType(groceryCategoriesType);

    console.info('Grocery Categories Type retrieved successfully', { id: groceryCategoriesType._id });
    sendSuccess(res, populatedGroceryCategoriesType, 'Grocery Categories Type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving grocery categories type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateGroceryCategoriesType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Grocery_Categories_id } = req.body;

    // Validate grocery categories exists if being updated
    if (Grocery_Categories_id) {
      const categoryExists = await ensureGroceryCategoriesExists(Grocery_Categories_id);
      if (!categoryExists) {
        return sendNotFound(res, 'Grocery Categories not found');
      }
    }

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let groceryCategoriesType;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      groceryCategoriesType = await Grocery_Categories_type.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid grocery categories type ID format', 400);
      }
      groceryCategoriesType = await Grocery_Categories_type.findOneAndUpdate({ Grocery_Categories_type_id: numId }, updateData, { new: true, runValidators: true });
    }

    if (!groceryCategoriesType) {
      return sendNotFound(res, 'Grocery Categories Type not found');
    }

    const populatedGroceryCategoriesType = await populateGroceryCategoriesType(groceryCategoriesType);

    console.info('Grocery Categories Type updated successfully', { id: groceryCategoriesType._id });
    sendSuccess(res, populatedGroceryCategoriesType, 'Grocery Categories Type updated successfully');
  } catch (error) {
    console.error('Error updating grocery categories type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteGroceryCategoriesType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let groceryCategoriesType;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      groceryCategoriesType = await Grocery_Categories_type.findByIdAndUpdate(
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
        return sendError(res, 'Invalid grocery categories type ID format', 400);
      }
      groceryCategoriesType = await Grocery_Categories_type.findOneAndUpdate(
        { Grocery_Categories_type_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    if (!groceryCategoriesType) {
      return sendNotFound(res, 'Grocery Categories Type not found');
    }

    console.info('Grocery Categories Type deleted successfully', { id: groceryCategoriesType._id });
    sendSuccess(res, groceryCategoriesType, 'Grocery Categories Type deleted successfully');
  } catch (error) {
    console.error('Error deleting grocery categories type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getGroceryCategoriesTypesByTypeId = asyncHandler(async (req, res) => {
  try {
    const { Grocery_Categories_id } = req.params;
    const groceryCategoriesIdNum = parseInt(Grocery_Categories_id, 10);
    
    if (isNaN(groceryCategoriesIdNum)) {
      return sendError(res, 'Invalid grocery categories ID format', 400);
    }

    // Validate grocery categories exists
    const categoryExists = await ensureGroceryCategoriesExists(groceryCategoriesIdNum);
    if (!categoryExists) {
      return sendNotFound(res, 'Grocery Categories not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { Grocery_Categories_id: groceryCategoriesIdNum };

    if (search) {
      filter.Name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [groceryCategoriesTypes, total] = await Promise.all([
      Grocery_Categories_type.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Grocery_Categories_type.countDocuments(filter)
    ]);

    const populatedGroceryCategoriesTypes = await populateGroceryCategoriesType(groceryCategoriesTypes);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Grocery Categories Types retrieved by type ID', { Grocery_Categories_id: groceryCategoriesIdNum, total });
    sendPaginated(res, populatedGroceryCategoriesTypes, paginationMeta, 'Grocery Categories Types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving grocery categories types by type ID', { error: error.message, Grocery_Categories_id: req.params.Grocery_Categories_id });
    throw error;
  }
});

const getGroceryCategoriesTypesByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      Grocery_Categories_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { created_by: userId };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (Grocery_Categories_id) {
      filter.Grocery_Categories_id = parseInt(Grocery_Categories_id, 10);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [groceryCategoriesTypes, total] = await Promise.all([
      Grocery_Categories_type.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Grocery_Categories_type.countDocuments(filter)
    ]);

    const populatedGroceryCategoriesTypes = await populateGroceryCategoriesType(groceryCategoriesTypes);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Grocery Categories Types retrieved for authenticated user', { userId, total });
    sendPaginated(res, populatedGroceryCategoriesTypes, paginationMeta, 'Grocery Categories Types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving grocery categories types for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createGroceryCategoriesType,
  getAllGroceryCategoriesTypes,
  getGroceryCategoriesTypeById,
  updateGroceryCategoriesType,
  deleteGroceryCategoriesType,
  getGroceryCategoriesTypesByTypeId,
  getGroceryCategoriesTypesByAuth
};

