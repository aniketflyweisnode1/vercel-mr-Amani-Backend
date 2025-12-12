const Favourites = require('../models/Favourites.model');
const Business_Branch = require('../models/business_Branch.model');
const RestaurantItems = require('../models/Restaurant_Items.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to get business_Branch_id from authenticated user
const getBusinessBranchIdByAuth = async (userIdNumber) => {
  const branch = await Business_Branch.findOne({ created_by: userIdNumber, Status: true });
  return branch ? branch.business_Branch_id : null;
};

// Helper function to ensure business branch exists
const ensureBusinessBranchExists = async (business_Branch_id) => {
  const branch = await Business_Branch.findOne({ business_Branch_id, Status: true });
  return !!branch;
};

// Helper function to validate items exist
const validateItemsExist = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, message: 'Items array is required and cannot be empty' };
  }

  for (const itemId of items) {
    const item = await RestaurantItems.findOne({ Restaurant_Items_id: itemId, Status: true });
    if (!item) {
      return { valid: false, message: `Restaurant item with ID ${itemId} not found or inactive` };
    }
  }
  return { valid: true };
};

const buildFilterFromQuery = ({ search, status, business_Branch_id, item_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (business_Branch_id) {
    const branchIdNum = parseInt(business_Branch_id, 10);
    if (!isNaN(branchIdNum)) {
      filter.business_Branch_id = branchIdNum;
    }
  }

  if (item_id) {
    const itemIdNum = parseInt(item_id, 10);
    if (!isNaN(itemIdNum)) {
      filter.items = itemIdNum;
    }
  }

  return filter;
};

// Manual population function for Number refs
const populateFavourites = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate business_Branch_id
      if (recordObj.business_Branch_id) {
        const branchId = typeof recordObj.business_Branch_id === 'object' ? recordObj.business_Branch_id : recordObj.business_Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id BusinessName Address');
        if (branch) {
          recordObj.business_Branch_id = branch.toObject ? branch.toObject() : branch;
        }
      }
      
      // Populate created_by
      if (recordObj.created_by) {
        const createdById = typeof recordObj.created_by === 'object' ? recordObj.created_by : recordObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          recordObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (recordObj.updated_by) {
        const updatedById = typeof recordObj.updated_by === 'object' ? recordObj.updated_by : recordObj.updated_by;
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

const createFavourite = asyncHandler(async (req, res) => {
  try {
    const { items } = req.body;

    // Validate items exist
    const itemsValidation = await validateItemsExist(items);
    if (!itemsValidation.valid) {
      return sendError(res, itemsValidation.message, 400);
    }

    // Get business_Branch_id from authenticated user
    const business_Branch_id = await getBusinessBranchIdByAuth(req.userIdNumber);
    if (!business_Branch_id) {
      return sendError(res, 'No active business branch found for authenticated user', 404);
    }

    const payload = {
      ...req.body,
      business_Branch_id,
      created_by: req.userIdNumber || null
    };

    const favourite = await Favourites.create(payload);
    console.info('Favourite created successfully', { id: favourite._id, Favourites_id: favourite.Favourites_id });

    const populated = await populateFavourites(favourite);
    sendSuccess(res, populated, 'Favourite created successfully', 201);
  } catch (error) {
    console.error('Error creating favourite', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllFavourites = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      item_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status, business_Branch_id, item_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [favouritesData, total] = await Promise.all([
      Favourites.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Favourites.countDocuments(filter)
    ]);
    
    const favourites = await populateFavourites(favouritesData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Favourites retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, favourites, pagination, 'Favourites retrieved successfully');
  } catch (error) {
    console.error('Error retrieving favourites', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getFavouriteById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let favouriteData;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      favouriteData = await Favourites.findById(id);
    } else {
      const favouriteId = parseInt(id, 10);
      if (isNaN(favouriteId)) {
        return sendNotFound(res, 'Invalid favourite ID format');
      }
      favouriteData = await Favourites.findOne({ Favourites_id: favouriteId });
    }
    
    if (!favouriteData) {
      return sendNotFound(res, 'Favourite not found');
    }
    
    const favourite = await populateFavourites(favouriteData);
    console.info('Favourite retrieved successfully', { id: favourite._id || favourite.Favourites_id });
    sendSuccess(res, favourite, 'Favourite retrieved successfully');
  } catch (error) {
    console.error('Error retrieving favourite', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateFavourite = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Validate items if being updated
    if (updateData.items !== undefined) {
      const itemsValidation = await validateItemsExist(updateData.items);
      if (!itemsValidation.valid) {
        return sendError(res, itemsValidation.message, 400);
      }
    }

    // Validate business_Branch_id if being updated
    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Business branch not found', 400);
      }
    }

    let favourite;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      favourite = await Favourites.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const favouriteId = parseInt(id, 10);
      if (isNaN(favouriteId)) {
        return sendNotFound(res, 'Invalid favourite ID format');
      }
      favourite = await Favourites.findOneAndUpdate({ Favourites_id: favouriteId }, updateData, { new: true, runValidators: true });
    }

    if (!favourite) {
      return sendNotFound(res, 'Favourite not found');
    }

    const populated = await populateFavourites(favourite);
    console.info('Favourite updated successfully', { id: favourite._id || favourite.Favourites_id });
    sendSuccess(res, populated, 'Favourite updated successfully');
  } catch (error) {
    console.error('Error updating favourite', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteFavourite = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let favourite;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      favourite = await Favourites.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const favouriteId = parseInt(id, 10);
      if (isNaN(favouriteId)) {
        return sendNotFound(res, 'Invalid favourite ID format');
      }
      favourite = await Favourites.findOneAndUpdate({ Favourites_id: favouriteId }, updateData, { new: true });
    }

    if (!favourite) {
      return sendNotFound(res, 'Favourite not found');
    }

    console.info('Favourite deleted successfully', { id: favourite._id });
    sendSuccess(res, favourite, 'Favourite deleted successfully');
  } catch (error) {
    console.error('Error deleting favourite', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getFavouritesByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      item_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ status, item_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [favouritesData, total] = await Promise.all([
      Favourites.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Favourites.countDocuments(filter)
    ]);
    
    const favourites = await populateFavourites(favouritesData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Favourites retrieved for authenticated user', { userId, total });
    sendPaginated(res, favourites, pagination, 'Favourites retrieved successfully');
  } catch (error) {
    console.error('Error retrieving favourites for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getFavouritesByBusinessBranchId = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.params;
    const branchIdNum = parseInt(business_Branch_id, 10);

    if (isNaN(branchIdNum)) {
      return sendError(res, 'Invalid business branch ID format', 400);
    }

    // Validate branch exists
    const branchExists = await ensureBusinessBranchExists(branchIdNum);
    if (!branchExists) {
      return sendNotFound(res, 'Business branch not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      item_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ search, status, item_id });
    filter.business_Branch_id = branchIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [favouritesData, total] = await Promise.all([
      Favourites.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Favourites.countDocuments(filter)
    ]);
    
    const favourites = await populateFavourites(favouritesData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Favourites retrieved by business branch ID', { business_Branch_id: branchIdNum, total });
    sendPaginated(res, favourites, pagination, 'Favourites retrieved successfully');
  } catch (error) {
    console.error('Error retrieving favourites by business branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createFavourite,
  getAllFavourites,
  getFavouriteById,
  updateFavourite,
  deleteFavourite,
  getFavouritesByAuth,
  getFavouritesByBusinessBranchId
};

