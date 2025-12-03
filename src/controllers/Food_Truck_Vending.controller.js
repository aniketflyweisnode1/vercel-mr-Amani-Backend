const FoodTruckVending = require('../models/Food_Truck_Vending.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateFoodTruckVending = async (items) => {
  const itemsArray = Array.isArray(items) ? items : [items];
  const populatedItems = await Promise.all(
    itemsArray.map(async (item) => {
      if (!item) return null;
      
      const itemObj = item.toObject ? item.toObject() : item;
      
      // Populate created_by
      if (itemObj.created_by) {
        const createdById = typeof itemObj.created_by === 'object' ? itemObj.created_by : itemObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          itemObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (itemObj.updated_by) {
        const updatedById = typeof itemObj.updated_by === 'object' ? itemObj.updated_by : itemObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          itemObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return itemObj;
    })
  );
  
  return Array.isArray(items) ? populatedItems : populatedItems[0];
};

const findByIdentifier = async (identifier) => {
  let item;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    item = await FoodTruckVending.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      item = await FoodTruckVending.findOne({ Food_Truck_Vending_id: numericId });
    }
  }
  
  if (!item) return null;
  return await populateFoodTruckVending(item);
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

const createFoodTruckVending = asyncHandler(async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      StartDate: req.body.StartDate ? new Date(req.body.StartDate) : undefined,
      EndDate: req.body.EndDate ? new Date(req.body.EndDate) : undefined,
      created_by: req.userIdNumber || null
    };

    const event = await FoodTruckVending.create(eventData);
    const populated = await populateFoodTruckVending(event);
    sendSuccess(res, populated, 'Food Truck Vending created successfully', 201);
  } catch (error) {
    console.error('Error creating food truck vending', { error: error.message });
    throw error;
  }
});

const getAllFoodTruckVending = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = {};

    if (search && search.trim()) {
      filter.$or = [
        { EventName: { $regex: search.trim(), $options: 'i' } },
        { Name: { $regex: search.trim(), $options: 'i' } },
        { Email: { $regex: search.trim(), $options: 'i' } },
        { Phone: { $regex: search.trim(), $options: 'i' } },
        { Website: { $regex: search.trim(), $options: 'i' } },
        { Address: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true' || status === '1' || status === true;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      FoodTruckVending.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      FoodTruckVending.countDocuments(filter)
    ]);

    const populatedItems = await populateFoodTruckVending(items);
    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Food Truck Vending retrieved successfully');
  } catch (error) {
    console.error('Error retrieving food truck vending', { error: error.message });
    throw error;
  }
});

const getFoodTruckVendingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const item = await findByIdentifier(id);

    if (!item) {
      return sendNotFound(res, 'Food Truck Vending not found');
    }

    sendSuccess(res, item, 'Food Truck Vending retrieved successfully');
  } catch (error) {
    console.error('Error retrieving food truck vending', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateFoodTruckVending = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      StartDate: req.body.StartDate ? new Date(req.body.StartDate) : undefined,
      EndDate: req.body.EndDate ? new Date(req.body.EndDate) : undefined,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Explicitly remove Food_Truck_Vending_id if it was accidentally included
    delete updateData.Food_Truck_Vending_id;

    let item;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await FoodTruckVending.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid food truck vending ID format', 400);
      }
      item = await FoodTruckVending.findOneAndUpdate({ Food_Truck_Vending_id: numericId }, updateData, { new: true, runValidators: true });
    }

    if (!item) {
      return sendNotFound(res, 'Food Truck Vending not found');
    }

    const populated = await populateFoodTruckVending(item);
    sendSuccess(res, populated, 'Food Truck Vending updated successfully');
  } catch (error) {
    console.error('Error updating food truck vending', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteFoodTruckVending = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let item;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await FoodTruckVending.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid food truck vending ID format', 400);
      }
      item = await FoodTruckVending.findOneAndUpdate({ Food_Truck_Vending_id: numericId }, updateData, { new: true });
    }

    if (!item) {
      return sendNotFound(res, 'Food Truck Vending not found');
    }

    sendSuccess(res, null, 'Food Truck Vending deleted successfully');
  } catch (error) {
    console.error('Error deleting food truck vending', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getFoodTruckVendingByAuth = asyncHandler(async (req, res) => {
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
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = { created_by: userId };

    if (search && search.trim()) {
      filter.$or = [
        { EventName: { $regex: search.trim(), $options: 'i' } },
        { Name: { $regex: search.trim(), $options: 'i' } },
        { Email: { $regex: search.trim(), $options: 'i' } },
        { Phone: { $regex: search.trim(), $options: 'i' } },
        { Website: { $regex: search.trim(), $options: 'i' } },
        { Address: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true' || status === '1' || status === true;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      FoodTruckVending.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      FoodTruckVending.countDocuments(filter)
    ]);

    const populatedItems = await populateFoodTruckVending(items);
    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Food Truck Vending retrieved successfully');
  } catch (error) {
    console.error('Error retrieving food truck vending by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getFoodTruckVendingByPaymentOptions = asyncHandler(async (req, res) => {
  try {
    const { paymentOptions } = req.query;
    
    if (!paymentOptions) {
      return sendError(res, 'Payment options parameter is required', 400);
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = {};

    // Filter by payment options - this might need to be adjusted based on actual field structure
    // Assuming there's a payment-related field, otherwise this would need to be implemented based on requirements
    if (paymentOptions) {
      // Placeholder - adjust based on actual payment options field
      filter.IsAgree = paymentOptions === 'agreed' || paymentOptions === 'true';
    }

    if (search && search.trim()) {
      filter.$or = [
        { EventName: { $regex: search.trim(), $options: 'i' } },
        { Name: { $regex: search.trim(), $options: 'i' } },
        { Email: { $regex: search.trim(), $options: 'i' } },
        { Phone: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true' || status === '1' || status === true;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      FoodTruckVending.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      FoodTruckVending.countDocuments(filter)
    ]);

    const populatedItems = await populateFoodTruckVending(items);
    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Food Truck Vending retrieved successfully');
  } catch (error) {
    console.error('Error retrieving food truck vending by payment options', { error: error.message });
    throw error;
  }
});

module.exports = {
  createFoodTruckVending,
  getAllFoodTruckVending,
  getFoodTruckVendingById,
  updateFoodTruckVending,
  deleteFoodTruckVending,
  getFoodTruckVendingByAuth,
  getFoodTruckVendingByPaymentOptions
};

