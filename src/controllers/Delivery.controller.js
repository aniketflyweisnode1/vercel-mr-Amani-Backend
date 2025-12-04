const Delivery = require('../models/Delivery.model');
const OrderNow = require('../models/Order_Now.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateDeliveryData = async (deliveries) => {
  const deliveriesArray = Array.isArray(deliveries) ? deliveries : [deliveries];
  const populatedDeliveries = await Promise.all(
    deliveriesArray.map(async (delivery) => {
      const deliveryObj = delivery.toObject ? delivery.toObject() : delivery;
      
      // Populate order_id
      if (deliveryObj.order_id) {
        const orderId = typeof deliveryObj.order_id === 'object' ? deliveryObj.order_id : deliveryObj.order_id;
        const order = await OrderNow.findOne({ Order_Now_id: orderId });
        if (order) {
          deliveryObj.order_id = order.toObject ? order.toObject() : order;
        }
      }
      
      // Populate created_by
      if (deliveryObj.created_by) {
        const createdById = typeof deliveryObj.created_by === 'object' ? deliveryObj.created_by : deliveryObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          deliveryObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (deliveryObj.updated_by) {
        const updatedById = typeof deliveryObj.updated_by === 'object' ? deliveryObj.updated_by : deliveryObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          deliveryObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return deliveryObj;
    })
  );
  
  return Array.isArray(deliveries) ? populatedDeliveries : populatedDeliveries[0];
};

const buildFilter = ({ search, status, order_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { ReceivedPersonName: { $regex: search, $options: 'i' } },
      { DliveryPersonName: { $regex: search, $options: 'i' } },
      { DliveryStatus: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (order_id !== undefined) {
    const orderId = parseInt(order_id, 10);
    if (!Number.isNaN(orderId)) {
      filter.order_id = orderId;
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

const ensureOrderExists = async (order_id) => {
  if (order_id === undefined) {
    return false;
  }
  const orderId = parseInt(order_id, 10);
  if (Number.isNaN(orderId)) {
    return false;
  }
  const order = await OrderNow.findOne({ Order_Now_id: orderId, Status: true });
  return Boolean(order);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return Delivery.findById(identifier);
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return Delivery.findOne({ Delivery_id: numericId });
  }
  return null;
};

const createDelivery = asyncHandler(async (req, res) => {
  try {
    const { order_id } = req.body;
    
    if (!(await ensureOrderExists(order_id))) {
      return sendError(res, 'Order not found or inactive', 400);
    }
    
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    
    const delivery = await Delivery.create(payload);
    const populated = await populateDeliveryData(delivery);
    sendSuccess(res, populated, 'Delivery created successfully', 201);
  } catch (error) {
    console.error('Error creating delivery', { error: error.message });
    throw error;
  }
});

const getAllDeliveries = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      order_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const filter = buildFilter({ search, status, order_id });
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [deliveries, total] = await Promise.all([
      Delivery.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Delivery.countDocuments(filter)
    ]);
    
    const populatedDeliveries = await populateDeliveryData(deliveries);
    sendPaginated(res, populatedDeliveries, paginateMeta(numericPage, numericLimit, total), 'Deliveries retrieved successfully');
  } catch (error) {
    console.error('Error retrieving deliveries', { error: error.message });
    throw error;
  }
});

const getDeliveryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryQuery = findByIdentifier(id);
    if (!deliveryQuery) {
      return sendError(res, 'Invalid delivery identifier', 400);
    }
    const delivery = await deliveryQuery;
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found');
    }
    const populated = await populateDeliveryData(delivery);
    sendSuccess(res, populated, 'Delivery retrieved successfully');
  } catch (error) {
    console.error('Error retrieving delivery', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateDelivery = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { order_id } = req.body;
    
    if (order_id !== undefined && !(await ensureOrderExists(order_id))) {
      return sendError(res, 'Order not found or inactive', 400);
    }
    
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    
    let delivery;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      delivery = await Delivery.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid delivery ID format', 400);
      }
      delivery = await Delivery.findOneAndUpdate({ Delivery_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found');
    }
    
    const populated = await populateDeliveryData(delivery);
    sendSuccess(res, populated, 'Delivery updated successfully');
  } catch (error) {
    console.error('Error updating delivery', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteDelivery = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    
    let delivery;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      delivery = await Delivery.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid delivery ID format', 400);
      }
      delivery = await Delivery.findOneAndUpdate({ Delivery_id: numericId }, updatePayload, { new: true });
    }
    
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found');
    }
    
    sendSuccess(res, delivery, 'Delivery deleted successfully');
  } catch (error) {
    console.error('Error deleting delivery', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getDeliveriesByOrderId = asyncHandler(async (req, res) => {
  try {
    const { order_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const orderId = parseInt(order_id, 10);
    if (Number.isNaN(orderId)) {
      return sendError(res, 'Invalid order ID format', 400);
    }
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const filter = buildFilter({ search, status });
    filter.order_id = orderId;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [deliveries, total] = await Promise.all([
      Delivery.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Delivery.countDocuments(filter)
    ]);
    
    const populatedDeliveries = await populateDeliveryData(deliveries);
    sendPaginated(res, populatedDeliveries, paginateMeta(numericPage, numericLimit, total), 'Deliveries retrieved successfully');
  } catch (error) {
    console.error('Error retrieving deliveries by order ID', { error: error.message, order_id: req.params.order_id });
    throw error;
  }
});

const getDeliveriesByItem = asyncHandler(async (req, res) => {
  try {
    const { item_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const itemId = parseInt(item_id, 10);
    if (Number.isNaN(itemId)) {
      return sendError(res, 'Invalid item ID format', 400);
    }
    
    // Find orders that contain this item
    const ordersWithItem = await OrderNow.find({
      'Product.Item_id': itemId,
      Status: true
    }).select('Order_Now_id');
    
    const orderIds = ordersWithItem.map(order => order.Order_Now_id);
    
    if (orderIds.length === 0) {
      return sendPaginated(res, [], paginateMeta(1, 10, 0), 'No deliveries found for this item');
    }
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const filter = buildFilter({ search, status });
    filter.order_id = { $in: orderIds };
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [deliveries, total] = await Promise.all([
      Delivery.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Delivery.countDocuments(filter)
    ]);
    
    const populatedDeliveries = await populateDeliveryData(deliveries);
    sendPaginated(res, populatedDeliveries, paginateMeta(numericPage, numericLimit, total), 'Deliveries retrieved successfully');
  } catch (error) {
    console.error('Error retrieving deliveries by item', { error: error.message, item_id: req.params.item_id });
    throw error;
  }
});

module.exports = {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
  getDeliveriesByOrderId,
  getDeliveriesByItem
};

