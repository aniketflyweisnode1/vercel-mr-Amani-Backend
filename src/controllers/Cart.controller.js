const Cart = require('../models/Cart.model.js');
const RestaurantItems = require('../models/Restaurant_Items.model');
const Discounts = require('../models/Discounts.model.js');
const Services = require('../models/services.model');
const User = require('../models/User.model');
const BusinessBranch = require('../models/business_Branch.model.js');
const RestaurantItemCategory = require('../models/Restaurant_item_Category.model.js');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateCartData = async (carts) => {
  const cartsArray = Array.isArray(carts) ? carts : [carts];
  const populatedCarts = await Promise.all(
    cartsArray.map(async (cart) => {
      const cartObj = cart.toObject ? cart.toObject() : cart;
      
      // Populate Product array items
      if (cartObj.Product && cartObj.Product.length > 0) {
        cartObj.Product = await Promise.all(
          cartObj.Product.map(async (product) => {
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
      if (cartObj.applyDiscount_id) {
        const discount = await Discounts.findOne({ Discounts_id: cartObj.applyDiscount_id });
        if (discount) {
          cartObj.applyDiscount_id = discount.toObject ? discount.toObject() : discount;
        }
      }
      
      // Populate service_id
      if (cartObj.service_id) {
        const serviceId = typeof cartObj.service_id === 'object' ? cartObj.service_id : cartObj.service_id;
        const service = await Services.findOne({ service_id: serviceId })
          .select('service_id name description emozji status');
        if (service) {
          cartObj.service_id = service.toObject ? service.toObject() : service;
        }
      }
      
      // Populate User_Id
      if (cartObj.User_Id) {
        const userId = typeof cartObj.User_Id === 'object' ? cartObj.User_Id : cartObj.User_Id;
        const user = await User.findOne({ user_id: userId });
        if (user) {
          cartObj.User_Id = user.toObject ? user.toObject() : user;
        }
      }
      
      // Populate created_by
      if (cartObj.created_by) {
        const createdById = typeof cartObj.created_by === 'object' ? cartObj.created_by : cartObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById });
        if (createdBy) {
          cartObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (cartObj.updated_by) {
        const updatedById = typeof cartObj.updated_by === 'object' ? cartObj.updated_by : cartObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById });
        if (updatedBy) {
          cartObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return cartObj;
    })
  );
  
  return Array.isArray(carts) ? populatedCarts : populatedCarts[0];
};

const buildFilter = ({ search, status, User_Id, applyDiscount_id, service_id }) => {
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

  if (service_id !== undefined) {
    const serviceId = parseInt(service_id, 10);
    if (!Number.isNaN(serviceId)) {
      filter.service_id = serviceId;
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

const ensureServiceExists = async (service_id) => {
  if (service_id === undefined || service_id === null) {
    return true;
  }
  const serviceId = parseInt(service_id, 10);
  if (Number.isNaN(serviceId)) {
    return false;
  }
  const service = await Services.findOne({ service_id: serviceId, status: true });
  return Boolean(service);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return Cart.findById(identifier);
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return Cart.findOne({ Cart_id: numericId });
  }
  return null;
};

const createCart = asyncHandler(async (req, res) => {
  try {
    const { Product, applyDiscount_id, service_id } = req.body;
    
    if (!Product || !Array.isArray(Product) || Product.length === 0) {
      return sendError(res, 'Product array is required and must contain at least one item', 400);
    }
    
    if (!(await ensureItemsExist(Product))) {
      return sendError(res, 'One or more restaurant items not found or inactive', 400);
    }
    
    if (applyDiscount_id !== undefined && applyDiscount_id !== null && !(await ensureDiscountExists(applyDiscount_id))) {
      return sendError(res, 'Discount not found or inactive', 400);
    }
    
    if (service_id !== undefined && service_id !== null && !(await ensureServiceExists(service_id))) {
      return sendError(res, 'Service not found or inactive', 400);
    }
    
    const payload = {
      ...req.body,
      User_Id: req.userIdNumber || null, // Set from login user id
      created_by: req.userIdNumber || null
    };
    const cart = await Cart.create(payload);
    const populated = await populateCartData(cart);
    sendSuccess(res, populated, 'Cart created successfully', 201);
  } catch (error) {
    console.error('Error creating cart', { error: error.message });
    throw error;
  }
});

const getAllCarts = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      User_Id,
      applyDiscount_id,
      service_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status, User_Id, applyDiscount_id, service_id });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [carts, total] = await Promise.all([
      Cart.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Cart.countDocuments(filter)
    ]);
    const populatedCarts = await populateCartData(carts);
    sendPaginated(res, populatedCarts, paginateMeta(numericPage, numericLimit, total), 'Carts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving carts', { error: error.message });
    throw error;
  }
});

const getCartById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const cartQuery = findByIdentifier(id);
    if (!cartQuery) {
      return sendError(res, 'Invalid cart identifier', 400);
    }
    const cart = await cartQuery;
    if (!cart) {
      return sendNotFound(res, 'Cart not found');
    }
    const populated = await populateCartData(cart);
    sendSuccess(res, populated, 'Cart retrieved successfully');
  } catch (error) {
    console.error('Error retrieving cart', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateCart = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Product, applyDiscount_id, service_id } = req.body;
    
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
    
    if (service_id !== undefined && service_id !== null && !(await ensureServiceExists(service_id))) {
      return sendError(res, 'Service not found or inactive', 400);
    }
    
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let cart;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      cart = await Cart.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid cart ID format', 400);
      }
      cart = await Cart.findOneAndUpdate({ Cart_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!cart) {
      return sendNotFound(res, 'Cart not found');
    }
    const populated = await populateCartData(cart);
    sendSuccess(res, populated, 'Cart updated successfully');
  } catch (error) {
    console.error('Error updating cart', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteCart = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let cart;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      cart = await Cart.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid cart ID format', 400);
      }
      cart = await Cart.findOneAndUpdate({ Cart_id: numericId }, updatePayload, { new: true });
    }
    if (!cart) {
      return sendNotFound(res, 'Cart not found');
    }
    sendSuccess(res, cart, 'Cart deleted successfully');
  } catch (error) {
    console.error('Error deleting cart', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getCartsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      applyDiscount_id,
      service_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status, applyDiscount_id, service_id });
    filter.User_Id = req.userIdNumber || null;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [carts, total] = await Promise.all([
      Cart.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Cart.countDocuments(filter)
    ]);
    const populatedCarts = await populateCartData(carts);
    sendPaginated(res, populatedCarts, paginateMeta(numericPage, numericLimit, total), 'Carts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving carts by auth', { error: error.message });
    throw error;
  }
});

const getCartsByDate = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      User_Id,
      applyDiscount_id,
      service_id,
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
    const filter = buildFilter({ status, User_Id, applyDiscount_id, service_id });
    filter.created_at = {
      $gte: startOfDay,
      $lte: endOfDay
    };
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [carts, total] = await Promise.all([
      Cart.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Cart.countDocuments(filter)
    ]);
    const populatedCarts = await populateCartData(carts);
    sendPaginated(res, populatedCarts, paginateMeta(numericPage, numericLimit, total), 'Carts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving carts by date', { error: error.message });
    throw error;
  }
});

module.exports = {
  createCart,
  getAllCarts,
  getCartById,
  updateCart,
  deleteCart,
  getCartsByAuth,
  getCartsByDate
};

