const CartOrderFood = require('../models/Cart_Order_Food.model.js');
const RestaurantItems = require('../models/Restaurant_Items.model');
const Discounts = require('../models/Discounts.model.js');
const User = require('../models/User.model');
const BusinessBranch = require('../models/business_Branch.model');
const RestaurantItemCategory = require('../models/Restaurant_item_Category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateCartOrderFoodData = async (cartOrders) => {
  const cartOrdersArray = Array.isArray(cartOrders) ? cartOrders : [cartOrders];
  const populatedCartOrders = await Promise.all(
    cartOrdersArray.map(async (cartOrder) => {
      const cartOrderObj = cartOrder.toObject ? cartOrder.toObject() : cartOrder;
      
      // Populate Product array items
      if (cartOrderObj.Product && cartOrderObj.Product.length > 0) {
        cartOrderObj.Product = await Promise.all(
          cartOrderObj.Product.map(async (product) => {
            if (product.Item_id) {
              const item = await RestaurantItems.findOne({ Restaurant_Items_id: product.Item_id });
              if (item) {
                const itemObj = item.toObject ? item.toObject() : item;
                
                // Populate business_Branch_id
                if (item.business_Branch_id) {
                  const branch = await BusinessBranch.findOne({ business_Branch_id: item.business_Branch_id });
                  if (branch) {
                    itemObj.business_Branch_id = branch.toObject ? branch.toObject() : branch;
                  }
                }
                
                // Populate Restaurant_item_Category_id
                if (item.Restaurant_item_Category_id) {
                  const category = await RestaurantItemCategory.findOne({ Restaurant_item_Category_id: item.Restaurant_item_Category_id });
                  if (category) {
                    itemObj.Restaurant_item_Category_id = category.toObject ? category.toObject() : category;
                  }
                }
                
                return {
                  ...product,
                  ItemDetails: itemObj
                };
              }
            }
            return product;
          })
        );
      }
      
      // Populate applyDiscount_id
      if (cartOrderObj.applyDiscount_id) {
        const discount = await Discounts.findOne({ Discounts_id: cartOrderObj.applyDiscount_id });
        if (discount) {
          cartOrderObj.applyDiscount_id = discount.toObject ? discount.toObject() : discount;
        }
      }
      
      // Populate User_Id
      if (cartOrderObj.User_Id) {
        const userId = typeof cartOrderObj.User_Id === 'object' ? cartOrderObj.User_Id : cartOrderObj.User_Id;
        const user = await User.findOne({ user_id: userId });
        if (user) {
          cartOrderObj.User_Id = user.toObject ? user.toObject() : user;
        }
      }
      
      // Populate created_by
      if (cartOrderObj.created_by) {
        const createdById = typeof cartOrderObj.created_by === 'object' ? cartOrderObj.created_by : cartOrderObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById });
        if (createdBy) {
          cartOrderObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (cartOrderObj.updated_by) {
        const updatedById = typeof cartOrderObj.updated_by === 'object' ? cartOrderObj.updated_by : cartOrderObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById });
        if (updatedBy) {
          cartOrderObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return cartOrderObj;
    })
  );
  
  return Array.isArray(cartOrders) ? populatedCartOrders : populatedCartOrders[0];
};

const buildFilter = ({ search, status, User_Id, applyDiscount_id }) => {
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

  if (applyDiscount_id !== undefined) {
    const discountId = parseInt(applyDiscount_id, 10);
    if (!Number.isNaN(discountId)) {
      filter.applyDiscount_id = discountId;
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

const ensureItemsExist = async (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return false;
  }
  
  for (const product of products) {
    if (!product.Item_id) {
      return false;
    }
    const itemId = parseInt(product.Item_id, 10);
    if (Number.isNaN(itemId)) {
      return false;
    }
    const item = await RestaurantItems.findOne({ Restaurant_Items_id: itemId, Status: true });
    if (!item) {
      return false;
    }
  }
  return true;
};

const ensureDiscountExists = async (applyDiscount_id) => {
  if (applyDiscount_id === undefined || applyDiscount_id === null) {
    return true;
  }
  const discountId = parseInt(applyDiscount_id, 10);
  if (Number.isNaN(discountId)) {
    return false;
  }
  const discount = await Discounts.findOne({ Discounts_id: discountId, Status: true });
  return Boolean(discount);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return CartOrderFood.findById(identifier);
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return CartOrderFood.findOne({ Cart_Order_Food_id: numericId });
  }
  return null;
};

const createCartOrderFood = asyncHandler(async (req, res) => {
  try {
    const { Product, applyDiscount_id } = req.body;
    
    if (!Product || !Array.isArray(Product) || Product.length === 0) {
      return sendError(res, 'Product array is required and must contain at least one item', 400);
    }
    
    if (!(await ensureItemsExist(Product))) {
      return sendError(res, 'One or more restaurant items not found or inactive', 400);
    }
    
    if (applyDiscount_id !== undefined && applyDiscount_id !== null && !(await ensureDiscountExists(applyDiscount_id))) {
      return sendError(res, 'Discount not found or inactive', 400);
    }
    
    const payload = {
      ...req.body,
      User_Id: req.userIdNumber || null, // Set from login user id
      created_by: req.userIdNumber || null
    };
    const cartOrder = await CartOrderFood.create(payload);
    const populated = await populateCartOrderFoodData(cartOrder);
    sendSuccess(res, populated, 'Cart order created successfully', 201);
  } catch (error) {
    console.error('Error creating cart order', { error: error.message });
    throw error;
  }
});

const getAllCartOrderFoods = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      User_Id,
      applyDiscount_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status, User_Id, applyDiscount_id });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [cartOrders, total] = await Promise.all([
      CartOrderFood.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      CartOrderFood.countDocuments(filter)
    ]);
    const populatedCartOrders = await populateCartOrderFoodData(cartOrders);
    sendPaginated(res, populatedCartOrders, paginateMeta(numericPage, numericLimit, total), 'Cart orders retrieved successfully');
  } catch (error) {
    console.error('Error retrieving cart orders', { error: error.message });
    throw error;
  }
});

const getCartOrderFoodById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const cartOrderQuery = findByIdentifier(id);
    if (!cartOrderQuery) {
      return sendError(res, 'Invalid cart order identifier', 400);
    }
    const cartOrder = await cartOrderQuery;
    if (!cartOrder) {
      return sendNotFound(res, 'Cart order not found');
    }
    const populated = await populateCartOrderFoodData(cartOrder);
    sendSuccess(res, populated, 'Cart order retrieved successfully');
  } catch (error) {
    console.error('Error retrieving cart order', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateCartOrderFood = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Product, applyDiscount_id } = req.body;
    
    if (Product !== undefined) {
      if (!Array.isArray(Product) || Product.length === 0) {
        return sendError(res, 'Product array must contain at least one item', 400);
      }
      if (!(await ensureItemsExist(Product))) {
        return sendError(res, 'One or more restaurant items not found or inactive', 400);
      }
    }
    
    if (applyDiscount_id !== undefined && applyDiscount_id !== null && !(await ensureDiscountExists(applyDiscount_id))) {
      return sendError(res, 'Discount not found or inactive', 400);
    }
    
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let cartOrder;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      cartOrder = await CartOrderFood.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid cart order ID format', 400);
      }
      cartOrder = await CartOrderFood.findOneAndUpdate({ Cart_Order_Food_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!cartOrder) {
      return sendNotFound(res, 'Cart order not found');
    }
    const populated = await populateCartOrderFoodData(cartOrder);
    sendSuccess(res, populated, 'Cart order updated successfully');
  } catch (error) {
    console.error('Error updating cart order', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteCartOrderFood = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let cartOrder;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      cartOrder = await CartOrderFood.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid cart order ID format', 400);
      }
      cartOrder = await CartOrderFood.findOneAndUpdate({ Cart_Order_Food_id: numericId }, updatePayload, { new: true });
    }
    if (!cartOrder) {
      return sendNotFound(res, 'Cart order not found');
    }
    sendSuccess(res, cartOrder, 'Cart order deleted successfully');
  } catch (error) {
    console.error('Error deleting cart order', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getCartOrderFoodsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      applyDiscount_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status, applyDiscount_id });
    filter.User_Id = req.userIdNumber || null;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [cartOrders, total] = await Promise.all([
      CartOrderFood.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      CartOrderFood.countDocuments(filter)
    ]);
    const populatedCartOrders = await populateCartOrderFoodData(cartOrders);
    sendPaginated(res, populatedCartOrders, paginateMeta(numericPage, numericLimit, total), 'Cart orders retrieved successfully');
  } catch (error) {
    console.error('Error retrieving cart orders by auth', { error: error.message });
    throw error;
  }
});

const getCartOrderFoodsByDate = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      User_Id,
      applyDiscount_id,
      date,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    if (!date) {
      return sendError(res, 'Date parameter is required', 400);
    }
    
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return sendError(res, 'Invalid date format', 400);
    }
    
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status, User_Id, applyDiscount_id });
    filter.created_at = {
      $gte: startOfDay,
      $lte: endOfDay
    };
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [cartOrders, total] = await Promise.all([
      CartOrderFood.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      CartOrderFood.countDocuments(filter)
    ]);
    const populatedCartOrders = await populateCartOrderFoodData(cartOrders);
    sendPaginated(res, populatedCartOrders, paginateMeta(numericPage, numericLimit, total), 'Cart orders retrieved successfully');
  } catch (error) {
    console.error('Error retrieving cart orders by date', { error: error.message });
    throw error;
  }
});

module.exports = {
  createCartOrderFood,
  getAllCartOrderFoods,
  getCartOrderFoodById,
  updateCartOrderFood,
  deleteCartOrderFood,
  getCartOrderFoodsByAuth,
  getCartOrderFoodsByDate
};

