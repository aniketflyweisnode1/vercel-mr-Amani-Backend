const Grocery_Categories = require('../models/Grocery_Categories.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateGroceryCategories = async (groceryCategories) => {
  const groceryCategoriesArray = Array.isArray(groceryCategories) ? groceryCategories : [groceryCategories];
  const populatedGroceryCategories = await Promise.all(
    groceryCategoriesArray.map(async (groceryCategory) => {
      if (!groceryCategory) return null;
      
      const groceryCategoryObj = groceryCategory.toObject ? groceryCategory.toObject() : groceryCategory;
      
      // Populate created_by
      if (groceryCategoryObj.created_by) {
        const createdById = typeof groceryCategoryObj.created_by === 'object' ? groceryCategoryObj.created_by : groceryCategoryObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          groceryCategoryObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (groceryCategoryObj.updated_by) {
        const updatedById = typeof groceryCategoryObj.updated_by === 'object' ? groceryCategoryObj.updated_by : groceryCategoryObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          groceryCategoryObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return groceryCategoryObj;
    })
  );
  
  return Array.isArray(groceryCategories) ? populatedGroceryCategories : populatedGroceryCategories[0];
};

const createGroceryCategories = asyncHandler(async (req, res) => {
  try {
    const groceryCategoriesData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const groceryCategories = await Grocery_Categories.create(groceryCategoriesData);
    console.info('Grocery Categories created successfully', { id: groceryCategories._id, Grocery_Categories_id: groceryCategories.Grocery_Categories_id });

    const populated = await populateGroceryCategories(groceryCategories);
    sendSuccess(res, populated, 'Grocery Categories created successfully', 201);
  } catch (error) {
    console.error('Error creating grocery categories', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllGroceryCategories = asyncHandler(async (req, res) => {
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

    const [groceryCategories, total] = await Promise.all([
      Grocery_Categories.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Grocery_Categories.countDocuments(filter)
    ]);

    const populatedGroceryCategories = await populateGroceryCategories(groceryCategories);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Grocery Categories retrieved successfully', { count: populatedGroceryCategories.length, total });
    sendPaginated(res, populatedGroceryCategories, paginationMeta, 'Grocery Categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving grocery categories', { error: error.message });
    throw error;
  }
});

const getGroceryCategoriesById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let groceryCategories;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      groceryCategories = await Grocery_Categories.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid grocery categories ID format', 400);
      }
      groceryCategories = await Grocery_Categories.findOne({ Grocery_Categories_id: numId });
    }

    if (!groceryCategories) {
      return sendNotFound(res, 'Grocery Categories not found');
    }

    const populatedGroceryCategories = await populateGroceryCategories(groceryCategories);

    console.info('Grocery Categories retrieved successfully', { id: groceryCategories._id });
    sendSuccess(res, populatedGroceryCategories, 'Grocery Categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving grocery categories', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateGroceryCategories = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let groceryCategories;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      groceryCategories = await Grocery_Categories.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid grocery categories ID format', 400);
      }
      groceryCategories = await Grocery_Categories.findOneAndUpdate({ Grocery_Categories_id: numId }, updateData, { new: true, runValidators: true });
    }

    if (!groceryCategories) {
      return sendNotFound(res, 'Grocery Categories not found');
    }

    const populatedGroceryCategories = await populateGroceryCategories(groceryCategories);

    console.info('Grocery Categories updated successfully', { id: groceryCategories._id });
    sendSuccess(res, populatedGroceryCategories, 'Grocery Categories updated successfully');
  } catch (error) {
    console.error('Error updating grocery categories', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteGroceryCategories = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let groceryCategories;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      groceryCategories = await Grocery_Categories.findByIdAndUpdate(
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
        return sendError(res, 'Invalid grocery categories ID format', 400);
      }
      groceryCategories = await Grocery_Categories.findOneAndUpdate(
        { Grocery_Categories_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    if (!groceryCategories) {
      return sendNotFound(res, 'Grocery Categories not found');
    }

    console.info('Grocery Categories deleted successfully', { id: groceryCategories._id });
    sendSuccess(res, groceryCategories, 'Grocery Categories deleted successfully');
  } catch (error) {
    console.error('Error deleting grocery categories', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getGroceryCategoriesByAuth = asyncHandler(async (req, res) => {
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

    const [groceryCategories, total] = await Promise.all([
      Grocery_Categories.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Grocery_Categories.countDocuments(filter)
    ]);

    const populatedGroceryCategories = await populateGroceryCategories(groceryCategories);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Grocery Categories retrieved for authenticated user', { userId, total });
    sendPaginated(res, populatedGroceryCategories, paginationMeta, 'Grocery Categories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving grocery categories for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createGroceryCategories,
  getAllGroceryCategories,
  getGroceryCategoriesById,
  updateGroceryCategories,
  deleteGroceryCategories,
  getGroceryCategoriesByAuth
};

