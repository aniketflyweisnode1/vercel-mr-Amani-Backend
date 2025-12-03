const FoodTruckCatering = require('../models/Food_Truck_Catering.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateFoodTruckCatering = async (items) => {
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
    item = await FoodTruckCatering.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      item = await FoodTruckCatering.findOne({ Food_Truck_Catering_id: numericId });
    }
  }
  
  if (!item) return null;
  return await populateFoodTruckCatering(item);
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

const createFoodTruckCatering = asyncHandler(async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      StartDate: req.body.StartDate ? new Date(req.body.StartDate) : undefined,
      EndDate: req.body.EndDate ? new Date(req.body.EndDate) : undefined,
      created_by: req.userIdNumber || null
    };

    const event = await FoodTruckCatering.create(eventData);
    const populated = await populateFoodTruckCatering(event);
    sendSuccess(res, populated, 'Food Truck Catering created successfully', 201);
  } catch (error) {
    console.error('Error creating food truck catering', { error: error.message });
    throw error;
  }
});

const getAllFoodTruckCatering = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Occasion,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = {};

    if (search && search.trim()) {
      filter.$or = [
        { Name: { $regex: search.trim(), $options: 'i' } },
        { Email: { $regex: search.trim(), $options: 'i' } },
        { Phone: { $regex: search.trim(), $options: 'i' } },
        { Address: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true' || status === '1' || status === true;
    }

    if (Occasion) {
      filter.Occasion = Occasion;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      FoodTruckCatering.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      FoodTruckCatering.countDocuments(filter)
    ]);

    const populatedItems = await populateFoodTruckCatering(items);
    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Food Truck Catering retrieved successfully');
  } catch (error) {
    console.error('Error retrieving food truck catering', { error: error.message });
    throw error;
  }
});

const getFoodTruckCateringById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const item = await findByIdentifier(id);

    if (!item) {
      return sendNotFound(res, 'Food Truck Catering not found');
    }

    sendSuccess(res, item, 'Food Truck Catering retrieved successfully');
  } catch (error) {
    console.error('Error retrieving food truck catering', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateFoodTruckCatering = asyncHandler(async (req, res) => {
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

    // Explicitly remove Food_Truck_Catering_id if it was accidentally included
    delete updateData.Food_Truck_Catering_id;

    let item;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await FoodTruckCatering.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid food truck catering ID format', 400);
      }
      item = await FoodTruckCatering.findOneAndUpdate({ Food_Truck_Catering_id: numericId }, updateData, { new: true, runValidators: true });
    }

    if (!item) {
      return sendNotFound(res, 'Food Truck Catering not found');
    }

    const populated = await populateFoodTruckCatering(item);
    sendSuccess(res, populated, 'Food Truck Catering updated successfully');
  } catch (error) {
    console.error('Error updating food truck catering', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteFoodTruckCatering = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let item;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await FoodTruckCatering.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid food truck catering ID format', 400);
      }
      item = await FoodTruckCatering.findOneAndUpdate({ Food_Truck_Catering_id: numericId }, updateData, { new: true });
    }

    if (!item) {
      return sendNotFound(res, 'Food Truck Catering not found');
    }

    sendSuccess(res, null, 'Food Truck Catering deleted successfully');
  } catch (error) {
    console.error('Error deleting food truck catering', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getFoodTruckCateringByAuth = asyncHandler(async (req, res) => {
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
      Occasion,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = { created_by: userId };

    if (search && search.trim()) {
      filter.$or = [
        { Name: { $regex: search.trim(), $options: 'i' } },
        { Email: { $regex: search.trim(), $options: 'i' } },
        { Phone: { $regex: search.trim(), $options: 'i' } },
        { Address: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true' || status === '1' || status === true;
    }

    if (Occasion) {
      filter.Occasion = Occasion;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      FoodTruckCatering.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      FoodTruckCatering.countDocuments(filter)
    ]);

    const populatedItems = await populateFoodTruckCatering(items);
    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Food Truck Catering retrieved successfully');
  } catch (error) {
    console.error('Error retrieving food truck catering by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createFoodTruckCatering,
  getAllFoodTruckCatering,
  getFoodTruckCateringById,
  updateFoodTruckCatering,
  deleteFoodTruckCatering,
  getFoodTruckCateringByAuth
};

