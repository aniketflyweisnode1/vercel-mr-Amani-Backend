const OrderNow = require('../models/Order_Now.model');
const Cart = require('../models/Cart.model');
const RestaurantItems = require('../models/Restaurant_Items.model');
const Discounts = require('../models/Discounts.model');
const Services = require('../models/services.model');
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
      
      // Populate service_id
      if (orderObj.service_id) {
        const serviceId = typeof orderObj.service_id === 'object' ? orderObj.service_id : orderObj.service_id;
        const service = await Services.findOne({ service_id: serviceId })
          .select('service_id name description emozji status');
        if (service) {
          orderObj.service_id = service.toObject ? service.toObject() : service;
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

const buildFilter = ({ search, status, User_Id, Order, OrderStatus, applyDiscount_id, service_id, payment_method_id }) => {
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

  if (service_id !== undefined) {
    const serviceId = parseInt(service_id, 10);
    if (!Number.isNaN(serviceId)) {
      filter.service_id = serviceId;
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
    const cartOrders = await Cart.find({
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
          await Cart.findOneAndUpdate(
            { Cart_id: cartOrder.Cart_id },
            { Status: false, updated_at: new Date() }
          );
        } else if (updatedProducts.length !== cartOrder.Product.length) {
          await Cart.findOneAndUpdate(
            { Cart_id: cartOrder.Cart_id },
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
  if (!identifier) return null;
  
  // Convert to string for pattern matching
  const idStr = String(identifier);
  if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
    return OrderNow.findById(identifier);
  }
  
  // Try numeric ID
  const numericId = typeof identifier === 'number' ? identifier : parseInt(identifier, 10);
  if (!Number.isNaN(numericId) && numericId > 0) {
    return OrderNow.findOne({ Order_Now_id: numericId });
  }
  return null;
};

const createOrderNow = asyncHandler(async (req, res) => {
  try {
    const { Order, applyDiscount_id, service_id, payment_method_id, Delivery_address_id } = req.body;
    
    // Get cart items for the user
    const cartItems = await Cart.find({
      User_Id: req.userIdNumber,
      Status: true
    });
    
    if (!cartItems || cartItems.length === 0) {
      return sendError(res, 'Cart is empty. Please add items to cart before creating an order', 400);
    }
    
    // Combine all products from all cart items
    let productsFromCart = [];
    let cartDiscountId = null;
    let cartServiceId = null;
    
    for (const cartItem of cartItems) {
      if (cartItem.Product && cartItem.Product.length > 0) {
        productsFromCart = productsFromCart.concat(cartItem.Product);
      }
      // Use discount from first cart item if available
      if (cartItem.applyDiscount_id && !cartDiscountId) {
        cartDiscountId = cartItem.applyDiscount_id;
      }
      // Use service_id from first cart item if available
      if (cartItem.service_id && !cartServiceId) {
        cartServiceId = cartItem.service_id;
      }
    }
    
    if (productsFromCart.length === 0) {
      return sendError(res, 'No products found in cart', 400);
    }
    
    // Always use products from cart
    const finalProducts = productsFromCart;
    
    // Use discount from cart if not provided in request
    const finalDiscountId = applyDiscount_id !== undefined && applyDiscount_id !== null ? applyDiscount_id : cartDiscountId;
    
    // Use service_id from cart if not provided in request
    const finalServiceId = service_id !== undefined && service_id !== null ? service_id : cartServiceId;
    
    if (!(await ensureItemsExist(finalProducts))) {
      return sendError(res, 'One or more restaurant items not found or inactive', 400);
    }
    
    if (finalDiscountId !== undefined && finalDiscountId !== null && !(await ensureDiscountExists(finalDiscountId))) {
      return sendError(res, 'Discount not found or inactive', 400);
    }
    
    if (finalServiceId !== undefined && finalServiceId !== null && !(await ensureServiceExists(finalServiceId))) {
      return sendError(res, 'Service not found or inactive', 400);
    }
    
    if (!(await ensurePaymentMethodExists(payment_method_id))) {
      return sendError(res, 'Payment method not found or inactive', 400);
    }
    
    if (Delivery_address_id !== undefined && Delivery_address_id !== null && !(await ensureAddressExists(Delivery_address_id))) {
      return sendError(res, 'Delivery address not found or inactive', 400);
    }
    
    const payload = {
      Product: finalProducts,
      applyDiscount_id: finalDiscountId,
      service_id: finalServiceId,
      payment_method_id: payment_method_id,
      Delivery_address_id: Delivery_address_id,
      User_Id: req.userIdNumber || null,
      created_by: req.userIdNumber || null
    };
    
    // Add Order field if provided
    if (Order !== undefined && Order !== null && Order !== '') {
      payload.Order = Order;
    }
    
    const order = await OrderNow.create(payload);
    
    // Verify and remove cart items that belong to this user after successful order creation
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'User ID is required', 400);
    }
    
    // Get Item_ids from the order products
    const orderItemIds = finalProducts.map(product => product.Item_id);
    
    // Find cart items that belong to the user and contain the items used in the order
    const cartItemsToDelete = await Cart.find({
      User_Id: userId,
      Status: true
    });
    
    // Verify all cart items belong to the user and check Item_ids match
    const allItemsBelongToUser = cartItemsToDelete.every(item => {
      // Check user ownership
      if (item.User_Id !== userId) {
        return false;
      }
      // Check if cart item contains any of the Item_ids used in the order
      if (item.Product && item.Product.length > 0) {
        const cartItemIds = item.Product.map(p => p.Item_id);
        return cartItemIds.some(itemId => orderItemIds.includes(itemId));
      }
      return false;
    });
    
    if (!allItemsBelongToUser) {
      return sendError(res, 'Unauthorized: Some cart items do not belong to you or do not match order items', 403);
    }
    
    // Remove cart items that contain the Item_ids used in the order
    for (const cartItem of cartItemsToDelete) {
      if (cartItem.Product && cartItem.Product.length > 0) {
        const cartItemIds = cartItem.Product.map(p => p.Item_id);
        const hasMatchingItems = cartItemIds.some(itemId => orderItemIds.includes(itemId));
        
        if (hasMatchingItems) {
          // Remove matching products from cart item or mark as inactive if all products match
          const remainingProducts = cartItem.Product.filter(p => !orderItemIds.includes(p.Item_id));
          
          if (remainingProducts.length === 0) {
            // All products in this cart item were used, mark cart item as inactive
            await Cart.findByIdAndUpdate(
              cartItem._id,
              { Status: false, updated_at: new Date() }
            );
          } else {
            // Some products remain, update the cart item with remaining products
            await Cart.findByIdAndUpdate(
              cartItem._id,
              { Product: remainingProducts, updated_at: new Date() }
            );
          }
        }
      }
    }
    
    const populated = await populateOrderNowData(order);
    sendSuccess(res, populated, 'Order created successfully from cart', 201);
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
      service_id,
      payment_method_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status, User_Id, Order, OrderStatus, applyDiscount_id, service_id, payment_method_id });
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
    const { Product, applyDiscount_id, service_id, payment_method_id, Delivery_address_id, Trangection_Id, Order } = req.body;
    
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
    const idStr = String(id);
    if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
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
    const idStr = String(id);
    if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
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
      service_id,
      payment_method_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status, Order, OrderStatus, applyDiscount_id, service_id, payment_method_id });
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
      service_id,
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
    const filter = buildFilter({ status, User_Id, Order, OrderStatus, applyDiscount_id, service_id, payment_method_id });
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

const processPayment = asyncHandler(async (req, res) => {
  try {
    const { order_id, payment_method_id, amount, reference_number, metadata, status, transactionType } = req.body;
    
    if (!order_id) {
      return sendError(res, 'Order ID is required', 400);
    }
    
    if (!payment_method_id) {
      return sendError(res, 'Payment method ID is required', 400);
    }
    
    if (!amount || amount <= 0) {
      return sendError(res, 'Valid amount is required', 400);
    }
    
    // Find the order - handle both MongoDB ObjectId and numeric ID
    const orderQuery = findByIdentifier(order_id);
    if (!orderQuery) {
      return sendError(res, 'Invalid order ID format', 400);
    }
    const order = await orderQuery;
    
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }
    
    // Check if order belongs to the authenticated user
    if (order.User_Id !== req.userIdNumber) {
      return sendError(res, 'Unauthorized: Order does not belong to you', 403);
    }
    
    // Check if order already has a transaction
    if (order.Trangection_Id) {
      return sendError(res, 'Order already has a transaction', 400);
    }
    
    // Verify payment method exists
    if (!(await ensurePaymentMethodExists(payment_method_id))) {
      return sendError(res, 'Payment method not found or inactive', 400);
    }
    
    // Create transaction
    // Default to 'Order_Now_Payment' if transactionType is not provided
    const finalTransactionType = transactionType || 'Order_Now_Payment';
    
    const transactionData = {
      user_id: req.userIdNumber,
      amount: amount,
      payment_method_id: payment_method_id,
      transactionType: finalTransactionType,
      status: 'completed', // Set to 'pending' if you need to verify payment first
      reference_number: reference_number || null,
      metadata: metadata || null,
      created_by: req.userIdNumber || null
    };
    
    const transaction = await Transaction.create(transactionData);
    
    // Update order with transaction ID and payment method
    const updatePayload = {
      Trangection_Id: transaction.transaction_id,
      payment_method_id: payment_method_id,
      paymentStatus: 'completed',
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    
    let updatedOrder;
    const orderIdStr = String(order_id);
    if (orderIdStr.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      updatedOrder = await OrderNow.findByIdAndUpdate(order_id, updatePayload, { new: true, runValidators: true });
    } else {
      // Numeric ID - use the order's _id or Order_Now_id
      const numericId = typeof order_id === 'number' ? order_id : parseInt(order_id, 10);
      updatedOrder = await OrderNow.findOneAndUpdate(
        { Order_Now_id: numericId },
        updatePayload,
        { new: true, runValidators: true }
      );
    }
    
    if (!updatedOrder) {
      return sendError(res, 'Failed to update order with transaction', 500);
    }
    
    const populated = await populateOrderNowData(updatedOrder);
    
    sendSuccess(res, {
      order: populated,
      transaction: transaction
    }, 'Payment processed successfully and transaction created', 200);
  } catch (error) {
    console.error('Error processing payment', { error: error.message });
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
  getOrderNowsByDate,
  processPayment
};

