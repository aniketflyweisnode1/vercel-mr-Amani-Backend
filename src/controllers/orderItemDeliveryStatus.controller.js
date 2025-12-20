const OrderItemDeliveryStatus = require('../models/orderItemDeliveryStatus.model');
const OrderNow = require('../models/Order_Now.model');
const RestaurantItems = require('../models/Restaurant_Items.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateOrderItemDeliveryStatus = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate order_id
      if (recordObj.order_id) {
        const orderId = typeof recordObj.order_id === 'object' 
          ? (recordObj.order_id.Order_Now_id || recordObj.order_id.order_id || recordObj.order_id)
          : recordObj.order_id;
        const order = await OrderNow.findOne({ Order_Now_id: orderId });
        if (order) {
          recordObj.order_id = order.toObject ? order.toObject() : order;
        }
      }
      
      // Populate Item_id
      if (recordObj.Item_id) {
        const itemId = typeof recordObj.Item_id === 'object' 
          ? (recordObj.Item_id.Restaurant_Items_id || recordObj.Item_id.Item_id || recordObj.Item_id)
          : recordObj.Item_id;
        const item = await RestaurantItems.findOne({ Restaurant_Items_id: itemId });
        if (item) {
          recordObj.Item_id = item.toObject ? item.toObject() : item;
        }
      }
      
      // Populate created_by
      if (recordObj.created_by) {
        const createdById = typeof recordObj.created_by === 'object' 
          ? (recordObj.created_by.user_id || recordObj.created_by)
          : recordObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (createdBy) {
          recordObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (recordObj.updated_by) {
        const updatedById = typeof recordObj.updated_by === 'object' 
          ? (recordObj.updated_by.user_id || recordObj.updated_by)
          : recordObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (updatedBy) {
          recordObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return recordObj;
    })
  );
  
  return Array.isArray(records) ? populatedRecords : populatedRecords[0];
};

const buildFilter = ({ search, status, deliveryStatus, order_id, Item_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { location: { $regex: search, $options: 'i' } },
      { DeliveryStatus: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    if (typeof status === 'string') {
      filter.Status = status === 'true' || status === '1';
    } else {
      filter.Status = Boolean(status);
    }
  }

  if (deliveryStatus) {
    filter.DeliveryStatus = deliveryStatus;
  }

  if (order_id !== undefined) {
    const orderId = parseInt(order_id, 10);
    if (!Number.isNaN(orderId)) {
      filter.order_id = orderId;
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

const ensureItemExists = async (Item_id) => {
  if (Item_id === undefined) {
    return false;
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
    return OrderItemDeliveryStatus.findById(identifier);
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return OrderItemDeliveryStatus.findOne({ orderItemDeliveryStatus_id: numericId });
  }
  return null;
};

const createOrderItemDeliveryStatus = asyncHandler(async (req, res) => {
  try {
    const { order_id, Item_id } = req.body;
    
    if (!(await ensureOrderExists(order_id))) {
      return sendError(res, 'Order not found or inactive', 400);
    }
    
    if (!(await ensureItemExists(Item_id))) {
      return sendError(res, 'Item not found or inactive', 400);
    }
    
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    
    const orderItemDeliveryStatus = await OrderItemDeliveryStatus.create(payload);
    const populated = await populateOrderItemDeliveryStatus(orderItemDeliveryStatus);
    sendSuccess(res, populated, 'Order item delivery status created successfully', 201);
  } catch (error) {
    console.error('Error creating order item delivery status', { error: error.message });
    throw error;
  }
});

const getAllOrderItemDeliveryStatus = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      deliveryStatus,
      order_id,
      Item_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const filter = buildFilter({ search, status, deliveryStatus, order_id, Item_id });
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [records, total] = await Promise.all([
      OrderItemDeliveryStatus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OrderItemDeliveryStatus.countDocuments(filter)
    ]);
    
    const populatedRecords = await populateOrderItemDeliveryStatus(records);
    sendPaginated(res, populatedRecords, paginateMeta(numericPage, numericLimit, total), 'Order item delivery status retrieved successfully');
  } catch (error) {
    console.error('Error retrieving order item delivery status', { error: error.message });
    throw error;
  }
});

const getOrderItemDeliveryStatusById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const recordQuery = findByIdentifier(id);
    if (!recordQuery) {
      return sendError(res, 'Invalid order item delivery status identifier', 400);
    }
    const record = await recordQuery;
    if (!record) {
      return sendNotFound(res, 'Order item delivery status not found');
    }
    const populated = await populateOrderItemDeliveryStatus(record);
    sendSuccess(res, populated, 'Order item delivery status retrieved successfully');
  } catch (error) {
    console.error('Error retrieving order item delivery status', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateOrderItemDeliveryStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { order_id, Item_id } = req.body;
    
    if (order_id !== undefined && !(await ensureOrderExists(order_id))) {
      return sendError(res, 'Order not found or inactive', 400);
    }
    
    if (Item_id !== undefined && !(await ensureItemExists(Item_id))) {
      return sendError(res, 'Item not found or inactive', 400);
    }
    
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    
    let record;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await OrderItemDeliveryStatus.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid order item delivery status ID format', 400);
      }
      record = await OrderItemDeliveryStatus.findOneAndUpdate({ orderItemDeliveryStatus_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    
    if (!record) {
      return sendNotFound(res, 'Order item delivery status not found');
    }
    
    const populated = await populateOrderItemDeliveryStatus(record);
    sendSuccess(res, populated, 'Order item delivery status updated successfully');
  } catch (error) {
    console.error('Error updating order item delivery status', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteOrderItemDeliveryStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    
    let record;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await OrderItemDeliveryStatus.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid order item delivery status ID format', 400);
      }
      record = await OrderItemDeliveryStatus.findOneAndUpdate({ orderItemDeliveryStatus_id: numericId }, updatePayload, { new: true });
    }
    
    if (!record) {
      return sendNotFound(res, 'Order item delivery status not found');
    }
    
    sendSuccess(res, record, 'Order item delivery status deleted successfully');
  } catch (error) {
    console.error('Error deleting order item delivery status', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getOrderItemDeliveryStatusByOrderId = asyncHandler(async (req, res) => {
  try {
    const { order_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      deliveryStatus,
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
    
    const filter = buildFilter({ search, status, deliveryStatus });
    filter.order_id = orderId;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [records, total] = await Promise.all([
      OrderItemDeliveryStatus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OrderItemDeliveryStatus.countDocuments(filter)
    ]);
    
    const populatedRecords = await populateOrderItemDeliveryStatus(records);
    sendPaginated(res, populatedRecords, paginateMeta(numericPage, numericLimit, total), 'Order item delivery status retrieved successfully');
  } catch (error) {
    console.error('Error retrieving order item delivery status by order ID', { error: error.message, order_id: req.params.order_id });
    throw error;
  }
});

const getOrderItemDeliveryStatusByItemId = asyncHandler(async (req, res) => {
  try {
    const { Item_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      deliveryStatus,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const itemId = parseInt(Item_id, 10);
    if (Number.isNaN(itemId)) {
      return sendError(res, 'Invalid item ID format', 400);
    }
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const filter = buildFilter({ search, status, deliveryStatus });
    filter.Item_id = itemId;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [records, total] = await Promise.all([
      OrderItemDeliveryStatus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OrderItemDeliveryStatus.countDocuments(filter)
    ]);
    
    const populatedRecords = await populateOrderItemDeliveryStatus(records);
    sendPaginated(res, populatedRecords, paginateMeta(numericPage, numericLimit, total), 'Order item delivery status retrieved successfully');
  } catch (error) {
    console.error('Error retrieving order item delivery status by item ID', { error: error.message, Item_id: req.params.Item_id });
    throw error;
  }
});

const getOrderItemDeliveryStatusByDeliveryStatus = asyncHandler(async (req, res) => {
  try {
    const { DeliveryStatus } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      order_id,
      Item_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const filter = buildFilter({ search, status, order_id, Item_id });
    filter.DeliveryStatus = DeliveryStatus;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [records, total] = await Promise.all([
      OrderItemDeliveryStatus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OrderItemDeliveryStatus.countDocuments(filter)
    ]);
    
    const populatedRecords = await populateOrderItemDeliveryStatus(records);
    sendPaginated(res, populatedRecords, paginateMeta(numericPage, numericLimit, total), 'Order item delivery status retrieved successfully');
  } catch (error) {
    console.error('Error retrieving order item delivery status by delivery status', { error: error.message, DeliveryStatus: req.params.DeliveryStatus });
    throw error;
  }
});

const getOrderItemDeliveryStatusByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      deliveryStatus,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const filter = buildFilter({ search, status, deliveryStatus });
    filter.created_by = userId;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [records, total] = await Promise.all([
      OrderItemDeliveryStatus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OrderItemDeliveryStatus.countDocuments(filter)
    ]);
    
    const populatedRecords = await populateOrderItemDeliveryStatus(records);
    
    console.info('Order item delivery status retrieved for authenticated user', { userId, total, page: numericPage, limit: numericLimit });
    sendPaginated(res, populatedRecords, paginateMeta(numericPage, numericLimit, total), 'Order item delivery status retrieved successfully');
  } catch (error) {
    console.error('Error retrieving order item delivery status for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createOrderItemDeliveryStatus,
  getAllOrderItemDeliveryStatus,
  getOrderItemDeliveryStatusById,
  updateOrderItemDeliveryStatus,
  deleteOrderItemDeliveryStatus,
  getOrderItemDeliveryStatusByOrderId,
  getOrderItemDeliveryStatusByItemId,
  getOrderItemDeliveryStatusByDeliveryStatus,
  getOrderItemDeliveryStatusByAuth
};

