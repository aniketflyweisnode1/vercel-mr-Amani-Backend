const MyFavorites = require('../models/MyFavorites.model');
const RestaurantItems = require('../models/Restaurant_Items.model');
const BusinessBranch = require('../models/business_Branch.model');
const RestaurantItemCategory = require('../models/Restaurant_item_Category.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateMyFavoritesData = async (favorites) => {
  const favoritesArray = Array.isArray(favorites) ? favorites : [favorites];
  const populatedFavorites = await Promise.all(
    favoritesArray.map(async (favorite) => {
      const favoriteObj = favorite.toObject ? favorite.toObject() : favorite;
      
      // Populate Item_id (Restaurant_Items)
      if (favoriteObj.Item_id) {
        const itemId = typeof favoriteObj.Item_id === 'object' ? favoriteObj.Item_id : favoriteObj.Item_id;
        const item = await RestaurantItems.findOne({ Restaurant_Items_id: itemId });
        if (item) {
          favoriteObj.Item_id = item.toObject ? item.toObject() : item;
          
          // Populate business_Branch_id
          if (item.business_Branch_id) {
            const branch = await BusinessBranch.findOne({ business_Branch_id: item.business_Branch_id });
            if (branch) {
              favoriteObj.Item_id.business_Branch_id = branch.toObject ? branch.toObject() : branch;
            }
          }
          
          // Populate Restaurant_item_Category_id
          if (item.Restaurant_item_Category_id) {
            const category = await RestaurantItemCategory.findOne({ Restaurant_item_Category_id: item.Restaurant_item_Category_id });
            if (category) {
              favoriteObj.Item_id.Restaurant_item_Category_id = category.toObject ? category.toObject() : category;
            }
          }
        }
      }
      
      // Populate User_Id
      if (favoriteObj.User_Id) {
        const userId = typeof favoriteObj.User_Id === 'object' ? favoriteObj.User_Id : favoriteObj.User_Id;
        const user = await User.findOne({ user_id: userId });
        if (user) {
          favoriteObj.User_Id = user.toObject ? user.toObject() : user;
        }
      }
      
      // Populate created_by
      if (favoriteObj.created_by) {
        const createdById = typeof favoriteObj.created_by === 'object' ? favoriteObj.created_by : favoriteObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById });
        if (createdBy) {
          favoriteObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (favoriteObj.updated_by) {
        const updatedById = typeof favoriteObj.updated_by === 'object' ? favoriteObj.updated_by : favoriteObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById });
        if (updatedBy) {
          favoriteObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return favoriteObj;
    })
  );
  
  return Array.isArray(favorites) ? populatedFavorites : populatedFavorites[0];
};


const buildFilter = ({ search, status, User_Id, Item_id }) => {
  const filter = {};

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (User_Id !== undefined) {
    const userId = parseInt(User_Id, 10);
    if (!Number.isNaN(userId)) {
      filter.User_Id = userId;
    }
  }

  if (Item_id !== undefined) {
    const itemId = parseInt(Item_id, 10);
    if (!Number.isNaN(itemId)) {
      filter.Item_id = itemId;
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

const ensureItemExists = async (Item_id) => {
  if (Item_id === undefined) {
    return true;
  }
  const itemId = parseInt(Item_id, 10);
  if (Number.isNaN(itemId)) {
    return false;
  }
  const item = await RestaurantItems.findOne({ Restaurant_Items_id: itemId, Status: true });
  return Boolean(item);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return MyFavorites.findById(identifier);
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return MyFavorites.findOne({ MyFavorites_id: numericId });
  }
  return null;
};

const createMyFavorites = asyncHandler(async (req, res) => {
  try {
    const { Item_id } = req.body;
    if (!(await ensureItemExists(Item_id))) {
      return sendError(res, 'Restaurant item not found', 400);
    }
    
    // Check if favorite already exists for this user and item
    const existingFavorite = await MyFavorites.findOne({
      User_Id: req.userIdNumber,
      Item_id: Item_id,
      Status: true
    });
    
    if (existingFavorite) {
      return sendError(res, 'This item is already in your favorites', 400);
    }
    
    const payload = {
      ...req.body,
      User_Id: req.userIdNumber || null, // Set from login user id
      created_by: req.userIdNumber || null
    };
    const favorite = await MyFavorites.create(payload);
    const populated = await populateMyFavoritesData(favorite);
    sendSuccess(res, populated, 'Favorite created successfully', 201);
  } catch (error) {
    console.error('Error creating favorite', { error: error.message });
    throw error;
  }
});

const getAllMyFavorites = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      User_Id,
      Item_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status, User_Id, Item_id });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [favorites, total] = await Promise.all([
      MyFavorites.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      MyFavorites.countDocuments(filter)
    ]);
    const populatedFavorites = await populateMyFavoritesData(favorites);
    sendPaginated(res, populatedFavorites, paginateMeta(numericPage, numericLimit, total), 'Favorites retrieved successfully');
  } catch (error) {
    console.error('Error retrieving favorites', { error: error.message });
    throw error;
  }
});

const getMyFavoritesById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const favoriteQuery = findByIdentifier(id);
    if (!favoriteQuery) {
      return sendError(res, 'Invalid favorite identifier', 400);
    }
    const favorite = await favoriteQuery;
    if (!favorite) {
      return sendNotFound(res, 'Favorite not found');
    }
    const populated = await populateMyFavoritesData(favorite);
    sendSuccess(res, populated, 'Favorite retrieved successfully');
  } catch (error) {
    console.error('Error retrieving favorite', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateMyFavorites = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Item_id } = req.body;
    if (Item_id !== undefined && !(await ensureItemExists(Item_id))) {
      return sendError(res, 'Restaurant item not found', 400);
    }
    
    // Check if updating Item_id would create a duplicate
    if (Item_id !== undefined) {
      const existingFavorite = await MyFavorites.findOne({
        User_Id: req.userIdNumber,
        Item_id: Item_id,
        Status: true,
        MyFavorites_id: { $ne: id.match(/^\d+$/) ? parseInt(id, 10) : null }
      });
      
      if (existingFavorite) {
        return sendError(res, 'This item is already in your favorites', 400);
      }
    }
    
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let favorite;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      favorite = await MyFavorites.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid favorite ID format', 400);
      }
      favorite = await MyFavorites.findOneAndUpdate({ MyFavorites_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!favorite) {
      return sendNotFound(res, 'Favorite not found');
    }
    const populated = await populateMyFavoritesData(favorite);
    sendSuccess(res, populated, 'Favorite updated successfully');
  } catch (error) {
    console.error('Error updating favorite', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteMyFavorites = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let favorite;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      favorite = await MyFavorites.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid favorite ID format', 400);
      }
      favorite = await MyFavorites.findOneAndUpdate({ MyFavorites_id: numericId }, updatePayload, { new: true });
    }
    if (!favorite) {
      return sendNotFound(res, 'Favorite not found');
    }
    sendSuccess(res, favorite, 'Favorite deleted successfully');
  } catch (error) {
    console.error('Error deleting favorite', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getMyFavoritesByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      Item_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status, Item_id });
    filter.User_Id = req.userIdNumber || null;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [favorites, total] = await Promise.all([
      MyFavorites.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      MyFavorites.countDocuments(filter)
    ]);
    const populatedFavorites = await populateMyFavoritesData(favorites);
    sendPaginated(res, populatedFavorites, paginateMeta(numericPage, numericLimit, total), 'Favorites retrieved successfully');
  } catch (error) {
    console.error('Error retrieving favorites by auth', { error: error.message });
    throw error;
  }
});

// Export with both naming conventions for compatibility
module.exports = {
  // New naming convention
  createMyFavorites,
  getAllMyFavorites,
  getMyFavoritesById,
  updateMyFavorites,
  deleteMyFavorites,
  getMyFavoritesByAuth,
  // Old naming convention (for existing routes)
  createFavorite: createMyFavorites,
  getAllFavorites: getAllMyFavorites,
  getFavoriteById: getMyFavoritesById,
  updateFavorite: updateMyFavorites,
  deleteFavorite: deleteMyFavorites,
  getFavoritesByAuthUser: getMyFavoritesByAuth
};
