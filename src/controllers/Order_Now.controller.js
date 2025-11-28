const OrderNow = require('../models/Order_Now.model');
const CartOrderFood = require('../models/Cart_Order_Food.model');
const RestaurantItems = require('../models/Restaurant_Items.model');
const Discounts = require('../models/Discounts.model');
const PaymentMethods = require('../models/payment_method.model');
const UserAddress = require('../models/User_Address.model');
const Transaction = require('../models/transaction.model');
const User = require('../models/User.model');
const BusinessBranch = require('../models/business_Branch.model');
const RestaurantItemCategory = require('../models/Restaurant_item_Category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateOrderNowData = async (orders) => {
  const ordersArray = Array.isArray(orders) ? orders : [orders];
  const populatedOrders = await Promise.all(
    ordersArray.map(async (order) => {
      const orderObj = order.toObject ? order.toObject() : order;
      
      // Populate Product array items
      if (orderObj.Product && orderObj.Product.length > 0) {
        orderObj.Product = await Promise.all(
          orderObj.Product.map(async (product) => {
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
      if (orderObj.applyDiscount_id) {
        const discount = await Discounts.findOne({ Discounts_id: orderObj.applyDiscount_id });
        if (discount) {
          orderObj.applyDiscount_id = discount.toObject ? discount.toObject() : discount;
        }
      }
      
      // Populate payment_method_id
      if (orderObj.payment_method_id) {
        const paymentMethod = await PaymentMethods.findOne({ payment_method_id: orderObj.payment_method_id });
        if (paymentMethod) {
          orderObj.payment_method_id = paymentMethod.toObject ? paymentMethod.toObject() : paymentMethod;
        }
      }
      
      // Populate Delivery_address_id
      if (orderObj.Delivery_address_id) {
        const address = await UserAddress.findOne({ User_Address_id: orderObj.Delivery_address_id });
        if (address) {
          orderObj.Delivery_address_id = address.toObject ? address.toObject() : address;
        }
      }
      
      // Populate Trangection_Id
      if (orderObj.Trangection_Id) {
        const transaction = await Transaction.findOne({ transaction_id: orderObj.Trangection_Id });
        if (transaction) {
          orderObj.Trangection_Id = transaction.toObject ? transaction.toObject() : transaction;
        }
      }
      
      // Populate User_Id
      if (orderObj.User_Id) {
        const userId = typeof orderObj.User_Id === 'object' ? orderObj.User_Id : orderObj.User_Id;
        const user = await User.findOne({ user_id: userId });
        if (user) {
          orderObj.User_Id = user.toObject ? user.toObject() : user;
        }
      }
      
      // Populate created_by
      if (orderObj.created_by) {
        const createdById = typeof orderObj.created_by === 'object' ? orderObj.created_by : orderObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById });
        if (createdBy) {
          orderObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (orderObj.updated_by) {
        const updatedById = typeof orderObj.updated_by === 'object' ? orderObj.updated_by : orderObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById });
        if (updatedBy) {
          orderObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return orderObj;
    })
  );
  
  return Array.isArray(orders) ? populatedOrders : populatedOrders[0];
};

const buildFilter = ({ search, status, User_Id, Order, OrderStatus, applyDiscount_id, payment_method_id }) => {
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

  if (Order !== undefined) {
    filter.Order = Order;
  }

  if (OrderStatus !== undefined) {
    filter.OrderStatus = OrderStatus;
  }

  if (applyDiscount_id !== undefined) {
    const discountId = parseInt(applyDiscount_id, 10);
    if (!Number.isNaN(discountId)) {
      filter.applyDiscount_id = discountId;
    }
  }

  if (payment_method_id !== undefined) {
    const paymentMethodId = parseInt(payment_method_id, 10);
    if (!Number.isNaN(paymentMethodId)) {
      filter.payment_method_id = paymentMethodId;
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

const ensurePaymentMethodExists = async (payment_method_id) => {
  if (payment_method_id === undefined) {
    return true;
  }
  const paymentMethodId = parseInt(payment_method_id, 10);
  if (Number.isNaN(paymentMethodId)) {
    return false;
  }
  const paymentMethod = await PaymentMethods.findOne({ payment_method_id: paymentMethodId, Status: true });
  return Boolean(paymentMethod);
};

const ensureAddressExists = async (Delivery_address_id) => {
  if (Delivery_address_id === undefined || Delivery_address_id === null) {
    return true;
  }
  const addressId = parseInt(Delivery_address_id, 10);
  if (Number.isNaN(addressId)) {
    return false;
  }
  const address = await UserAddress.findOne({ User_Address_id: addressId, Status: true });
  return Boolean(address);
};

const ensureTransactionExists = async (Trangection_Id) => {
  if (Trangection_Id === undefined || Trangection_Id === null) {
    return true;
  }
  const transactionId = parseInt(Trangection_Id, 10);
  if (Number.isNaN(transactionId)) {
    return false;
  }
  const transaction = await Transaction.findOne({ transaction_id: transactionId });
  return Boolean(transaction);
};

const deleteCartItemsByProductIds = async (userId, productItemIds) => {
  try {
    // Find all cart orders for this user
    const cartOrders = await CartOrderFood.find({
      User_Id: userId,
      Status: true
    });
    
    // For each cart order, remove products that match the Item_ids
    for (const cartOrder of cartOrders) {
      if (cartOrder.Product && cartOrder.Product.length > 0) {
        const updatedProducts = cartOrder.Product.filter(
          product => !productItemIds.includes(product.Item_id)
        );
        
        // If cart becomes empty, mark as deleted, otherwise update
        if (updatedProducts.length === 0) {
          await CartOrderFood.findOneAndUpdate(
            { Cart_Order_Food_id: cartOrder.Cart_Order_Food_id },
            { Status: false, updated_at: new Date() }
          );
        } else if (updatedProducts.length !== cartOrder.Product.length) {
          await CartOrderFood.findOneAndUpdate(
            { Cart_Order_Food_id: cartOrder.Cart_Order_Food_id },
            { Product: updatedProducts, updated_at: new Date() }
          );
        }
      }
    }
  } catch (error) {
    console.error('Error deleting cart items', { error: error.message });
    // Don't throw - allow order creation to continue even if cart deletion fails
  }
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return OrderNow.findById(identifier);
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return OrderNow.findOne({ Order_Now_id: numericId });
  }
  return null;
};

const createOrderNow = asyncHandler(async (req, res) => {
  try {
    const { Product, applyDiscount_id, payment_method_id, Delivery_address_id, Trangection_Id, Order } = req.body;
    
    if (!Product || !Array.isArray(Product) || Product.length === 0) {
      return sendError(res, 'Product array is required and must contain at least one item', 400);
    }
    
    if (!(await ensureItemsExist(Product))) {
      return sendError(res, 'One or more restaurant items not found or inactive', 400);
    }
    
    if (applyDiscount_id !== undefined && applyDiscount_id !== null && !(await ensureDiscountExists(applyDiscount_id))) {
      return sendError(res, 'Discount not found or inactive', 400);
    }
    
    if (!(await ensurePaymentMethodExists(payment_method_id))) {
      return sendError(res, 'Payment method not found or inactive', 400);
    }
    
    if (Delivery_address_id !== undefined && Delivery_address_id !== null && !(await ensureAddressExists(Delivery_address_id))) {
      return sendError(res, 'Delivery address not found or inactive', 400);
    }
    
    if (Trangection_Id !== undefined && Trangection_Id !== null && !(await ensureTransactionExists(Trangection_Id))) {
      return sendError(res, 'Transaction not found', 400);
    }
    
    if (Order === 'Delivery' && !Delivery_address_id) {
      return sendError(res, 'Delivery address is required for Delivery orders', 400);
    }
    
    // Extract Item_ids from Product array
    const productItemIds = Product.map(p => p.Item_id);
    
    // Delete cart items with these Item_ids
    await deleteCartItemsByProductIds(req.userIdNumber, productItemIds);
    
    const payload = {
      ...req.body,
      User_Id: req.userIdNumber || null, // Set from login user id
      created_by: req.userIdNumber || null
    };
    const order = await OrderNow.create(payload);
    const populated = await populateOrderNowData(order);
    sendSuccess(res, populated, 'Order created successfully', 201);
  } catch (error) {
    console.error('Error creating order', { error: error.message });
    throw error;
  }
});

const getAllOrderNows = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      User_Id,
      Order,
      OrderStatus,
      applyDiscount_id,
      payment_method_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status, User_Id, Order, OrderStatus, applyDiscount_id, payment_method_id });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [orders, total] = await Promise.all([
      OrderNow.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OrderNow.countDocuments(filter)
    ]);
    const populatedOrders = await populateOrderNowData(orders);
    sendPaginated(res, populatedOrders, paginateMeta(numericPage, numericLimit, total), 'Orders retrieved successfully');
  } catch (error) {
    console.error('Error retrieving orders', { error: error.message });
    throw error;
  }
});

const getOrderNowById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const orderQuery = findByIdentifier(id);
    if (!orderQuery) {
      return sendError(res, 'Invalid order identifier', 400);
    }
    const order = await orderQuery;
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }
    const populated = await populateOrderNowData(order);
    sendSuccess(res, populated, 'Order retrieved successfully');
  } catch (error) {
    console.error('Error retrieving order', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateOrderNow = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Product, applyDiscount_id, payment_method_id, Delivery_address_id, Trangection_Id, Order } = req.body;
    
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
    
    if (payment_method_id !== undefined && !(await ensurePaymentMethodExists(payment_method_id))) {
      return sendError(res, 'Payment method not found or inactive', 400);
    }
    
    if (Delivery_address_id !== undefined && Delivery_address_id !== null && !(await ensureAddressExists(Delivery_address_id))) {
      return sendError(res, 'Delivery address not found or inactive', 400);
    }
    
    if (Trangection_Id !== undefined && Trangection_Id !== null && !(await ensureTransactionExists(Trangection_Id))) {
      return sendError(res, 'Transaction not found', 400);
    }
    
    if (Order === 'Delivery' && Delivery_address_id === null) {
      return sendError(res, 'Delivery address is required for Delivery orders', 400);
    }
    
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await OrderNow.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid order ID format', 400);
      }
      order = await OrderNow.findOneAndUpdate({ Order_Now_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }
    const populated = await populateOrderNowData(order);
    sendSuccess(res, populated, 'Order updated successfully');
  } catch (error) {
    console.error('Error updating order', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteOrderNow = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await OrderNow.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid order ID format', 400);
      }
      order = await OrderNow.findOneAndUpdate({ Order_Now_id: numericId }, updatePayload, { new: true });
    }
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }
    sendSuccess(res, order, 'Order deleted successfully');
  } catch (error) {
    console.error('Error deleting order', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getOrderNowsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      Order,
      OrderStatus,
      applyDiscount_id,
      payment_method_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status, Order, OrderStatus, applyDiscount_id, payment_method_id });
    filter.User_Id = req.userIdNumber || null;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [orders, total] = await Promise.all([
      OrderNow.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OrderNow.countDocuments(filter)
    ]);
    const populatedOrders = await populateOrderNowData(orders);
    sendPaginated(res, populatedOrders, paginateMeta(numericPage, numericLimit, total), 'Orders retrieved successfully');
  } catch (error) {
    console.error('Error retrieving orders by auth', { error: error.message });
    throw error;
  }
});

const getOrderNowsByDate = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      User_Id,
      Order,
      OrderStatus,
      applyDiscount_id,
      payment_method_id,
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
    const filter = buildFilter({ status, User_Id, Order, OrderStatus, applyDiscount_id, payment_method_id });
    filter.created_at = {
      $gte: startOfDay,
      $lte: endOfDay
    };
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [orders, total] = await Promise.all([
      OrderNow.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OrderNow.countDocuments(filter)
    ]);
    const populatedOrders = await populateOrderNowData(orders);
    sendPaginated(res, populatedOrders, paginateMeta(numericPage, numericLimit, total), 'Orders retrieved successfully');
  } catch (error) {
    console.error('Error retrieving orders by date', { error: error.message });
    throw error;
  }
});

module.exports = {
  createOrderNow,
  getAllOrderNows,
  getOrderNowById,
  updateOrderNow,
  deleteOrderNow,
  getOrderNowsByAuth,
  getOrderNowsByDate
};

