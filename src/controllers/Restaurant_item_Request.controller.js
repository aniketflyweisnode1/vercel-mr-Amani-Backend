const RestaurantItemRequest = require('../models/Restaurant_item_Request.model');
const Restaurant_Items = require('../models/Restaurant_Items.model');
const Supplier = require('../models/Supplier.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureRestaurantItemExists = async (item_id) => {
  if (item_id === undefined || item_id === null) {
    return false;
  }
  const item = await Restaurant_Items.findOne({ Restaurant_Items_id: item_id, Status: true });
  return !!item;
};

const ensureSupplierExists = async (Supplier_id) => {
  if (Supplier_id === undefined || Supplier_id === null) {
    return false;
  }
  const supplier = await Supplier.findOne({ Supplier_id, Status: true });
  return !!supplier;
};

// Manual population function for Number refs
const populateRestaurantItemRequest = async (requests) => {
  const requestsArray = Array.isArray(requests) ? requests : [requests];
  const populatedRequests = await Promise.all(
    requestsArray.map(async (request) => {
      if (!request) return null;
      
      const requestObj = request.toObject ? request.toObject() : request;
      
      // Populate item_id
      if (requestObj.item_id) {
        const itemId = typeof requestObj.item_id === 'object' ? requestObj.item_id : requestObj.item_id;
        const item = await Restaurant_Items.findOne({ Restaurant_Items_id: itemId })
          .select('Restaurant_Items_id name unit CurrentStock');
        if (item) {
          requestObj.item_id = item.toObject ? item.toObject() : item;
        }
      }
      
      // Populate Supplier_id
      if (requestObj.Supplier_id) {
        const supplierId = typeof requestObj.Supplier_id === 'object' ? requestObj.Supplier_id : requestObj.Supplier_id;
        const supplier = await Supplier.findOne({ Supplier_id: supplierId })
          .select('Supplier_id Name Email Mobile Address');
        if (supplier) {
          requestObj.Supplier_id = supplier.toObject ? supplier.toObject() : supplier;
        }
      }
      
      // Populate created_by
      if (requestObj.created_by) {
        const createdById = typeof requestObj.created_by === 'object' ? requestObj.created_by : requestObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          requestObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (requestObj.updated_by) {
        const updatedById = typeof requestObj.updated_by === 'object' ? requestObj.updated_by : requestObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          requestObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return requestObj;
    })
  );
  
  return Array.isArray(requests) ? populatedRequests : populatedRequests[0];
};

const createRestaurantItemRequest = asyncHandler(async (req, res) => {
  try {
    const { item_id, Supplier_id } = req.body;

    const [itemExists, supplierExists] = await Promise.all([
      ensureRestaurantItemExists(item_id),
      ensureSupplierExists(Supplier_id)
    ]);

    if (!itemExists) {
      return sendError(res, 'Restaurant item not found or inactive', 400);
    }

    if (!supplierExists) {
      return sendError(res, 'Supplier not found or inactive', 400);
    }

    const requestData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const request = await RestaurantItemRequest.create(requestData);
    console.info('Restaurant item request created successfully', { requestId: request._id, Restaurant_item_Request_id: request.Restaurant_item_Request_id });

    const populated = await populateRestaurantItemRequest(request);
    sendSuccess(res, populated, 'Restaurant item request created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant item request', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllRestaurantItemRequests = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      item_id,
      Supplier_id,
      DeliveryPeriod,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { Unit: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      if (typeof status === 'string') {
        filter.Status = status === 'true' || status === '1';
      } else {
        filter.Status = Boolean(status);
      }
    }

    if (item_id) {
      const itemIdNum = parseInt(item_id, 10);
      if (!isNaN(itemIdNum)) {
        filter.item_id = itemIdNum;
      }
    }

    if (Supplier_id) {
      const supplierIdNum = parseInt(Supplier_id, 10);
      if (!isNaN(supplierIdNum)) {
        filter.Supplier_id = supplierIdNum;
      }
    }

    if (DeliveryPeriod) {
      filter.DeliveryPeriod = DeliveryPeriod;
    }

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [requestsData, total] = await Promise.all([
      RestaurantItemRequest.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantItemRequest.countDocuments(filter)
    ]);

    const requests = await populateRestaurantItemRequest(requestsData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Restaurant item requests retrieved successfully', { total, page: numericPage });
    sendPaginated(res, requests, pagination, 'Restaurant item requests retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item requests', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getRestaurantItemRequestById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let requestData;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      requestData = await RestaurantItemRequest.findById(id);
    } else {
      const requestId = parseInt(id, 10);
      if (isNaN(requestId)) {
        return sendNotFound(res, 'Invalid restaurant item request ID format');
      }
      requestData = await RestaurantItemRequest.findOne({ Restaurant_item_Request_id: requestId });
    }

    if (!requestData) {
      return sendNotFound(res, 'Restaurant item request not found');
    }

    const request = await populateRestaurantItemRequest(requestData);
    console.info('Restaurant item request retrieved successfully', { id: requestData._id });
    sendSuccess(res, request, 'Restaurant item request retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item request', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateRestaurantItemRequest = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.item_id !== undefined) {
      const itemExists = await ensureRestaurantItemExists(updateData.item_id);
      if (!itemExists) {
        return sendError(res, 'Restaurant item not found or inactive', 400);
      }
    }

    if (updateData.Supplier_id !== undefined) {
      const supplierExists = await ensureSupplierExists(updateData.Supplier_id);
      if (!supplierExists) {
        return sendError(res, 'Supplier not found or inactive', 400);
      }
    }

    let request;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      request = await RestaurantItemRequest.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const requestId = parseInt(id, 10);
      if (isNaN(requestId)) {
        return sendNotFound(res, 'Invalid restaurant item request ID format');
      }
      request = await RestaurantItemRequest.findOneAndUpdate({ Restaurant_item_Request_id: requestId }, updateData, { new: true, runValidators: true });
    }

    if (!request) {
      return sendNotFound(res, 'Restaurant item request not found');
    }

    const populated = await populateRestaurantItemRequest(request);
    console.info('Restaurant item request updated successfully', { id: request._id });
    sendSuccess(res, populated, 'Restaurant item request updated successfully');
  } catch (error) {
    console.error('Error updating restaurant item request', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteRestaurantItemRequest = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let request;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      request = await RestaurantItemRequest.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const requestId = parseInt(id, 10);
      if (isNaN(requestId)) {
        return sendNotFound(res, 'Invalid restaurant item request ID format');
      }
      request = await RestaurantItemRequest.findOneAndUpdate({ Restaurant_item_Request_id: requestId }, updateData, { new: true });
    }

    if (!request) {
      return sendNotFound(res, 'Restaurant item request not found');
    }

    console.info('Restaurant item request deleted successfully', { id: request._id });
    sendSuccess(res, request, 'Restaurant item request deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant item request', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getRestaurantItemRequestsBySupplier = asyncHandler(async (req, res) => {
  try {
    const { Supplier_id } = req.params;
    const supplierIdNum = parseInt(Supplier_id, 10);

    if (isNaN(supplierIdNum)) {
      return sendError(res, 'Invalid supplier ID format', 400);
    }

    const supplierExists = await ensureSupplierExists(supplierIdNum);
    if (!supplierExists) {
      return sendNotFound(res, 'Supplier not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      item_id,
      DeliveryPeriod,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { Supplier_id: supplierIdNum };

    if (status !== undefined) {
      if (typeof status === 'string') {
        filter.Status = status === 'true' || status === '1';
      } else {
        filter.Status = Boolean(status);
      }
    }

    if (item_id) {
      const itemIdNum = parseInt(item_id, 10);
      if (!isNaN(itemIdNum)) {
        filter.item_id = itemIdNum;
      }
    }

    if (DeliveryPeriod) {
      filter.DeliveryPeriod = DeliveryPeriod;
    }

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [requestsData, total] = await Promise.all([
      RestaurantItemRequest.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantItemRequest.countDocuments(filter)
    ]);

    const requests = await populateRestaurantItemRequest(requestsData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Restaurant item requests retrieved by supplier ID', { Supplier_id: supplierIdNum, total });
    sendPaginated(res, requests, pagination, 'Restaurant item requests retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item requests by supplier ID', { error: error.message, Supplier_id: req.params.Supplier_id });
    throw error;
  }
});

const getRestaurantItemRequestsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      item_id,
      Supplier_id,
      DeliveryPeriod,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { created_by: req.userIdNumber };

    if (search) {
      filter.$or = [
        { Unit: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      if (typeof status === 'string') {
        filter.Status = status === 'true' || status === '1';
      } else {
        filter.Status = Boolean(status);
      }
    }

    if (item_id) {
      const itemIdNum = parseInt(item_id, 10);
      if (!isNaN(itemIdNum)) {
        filter.item_id = itemIdNum;
      }
    }

    if (Supplier_id) {
      const supplierIdNum = parseInt(Supplier_id, 10);
      if (!isNaN(supplierIdNum)) {
        filter.Supplier_id = supplierIdNum;
      }
    }

    if (DeliveryPeriod) {
      filter.DeliveryPeriod = DeliveryPeriod;
    }

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [requestsData, total] = await Promise.all([
      RestaurantItemRequest.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantItemRequest.countDocuments(filter)
    ]);

    const requests = await populateRestaurantItemRequest(requestsData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Restaurant item requests retrieved for authenticated user', { userId: req.userIdNumber, total });
    sendPaginated(res, requests, pagination, 'Restaurant item requests retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item requests for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createRestaurantItemRequest,
  getAllRestaurantItemRequests,
  getRestaurantItemRequestById,
  updateRestaurantItemRequest,
  deleteRestaurantItemRequest,
  getRestaurantItemRequestsBySupplier,
  getRestaurantItemRequestsByAuth
};
