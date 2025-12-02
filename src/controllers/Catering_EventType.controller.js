const Catering_EventType = require('../models/Catering_EventType.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateCateringEventType = async (eventTypes) => {
  const eventTypesArray = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
  const populatedEventTypes = await Promise.all(
    eventTypesArray.map(async (eventType) => {
      if (!eventType) return null;
      
      const eventTypeObj = eventType.toObject ? eventType.toObject() : eventType;
      
      // Populate created_by
      if (eventTypeObj.created_by) {
        const createdById = typeof eventTypeObj.created_by === 'object' ? eventTypeObj.created_by : eventTypeObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          eventTypeObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (eventTypeObj.updated_by) {
        const updatedById = typeof eventTypeObj.updated_by === 'object' ? eventTypeObj.updated_by : eventTypeObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          eventTypeObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return eventTypeObj;
    })
  );
  
  return Array.isArray(eventTypes) ? populatedEventTypes : populatedEventTypes[0];
};

const createCateringEventType = asyncHandler(async (req, res) => {
  try {
    const eventTypeData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const eventType = await Catering_EventType.create(eventTypeData);
    console.info('Catering Event Type created successfully', { id: eventType._id, Catering_EventType_id: eventType.Catering_EventType_id });

    const populated = await populateCateringEventType(eventType);
    sendSuccess(res, populated, 'Catering Event Type created successfully', 201);
  } catch (error) {
    console.error('Error creating catering event type', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllCateringEventTypes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [eventTypes, total] = await Promise.all([
      Catering_EventType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Catering_EventType.countDocuments(filter)
    ]);

    const populatedEventTypes = await populateCateringEventType(eventTypes);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Catering Event Types retrieved successfully', { count: populatedEventTypes.length, total });
    sendPaginated(res, populatedEventTypes, paginationMeta, 'Catering Event Types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving catering event types', { error: error.message });
    throw error;
  }
});

const getCateringEventTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let eventType;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      eventType = await Catering_EventType.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid event type ID format', 400);
      }
      eventType = await Catering_EventType.findOne({ Catering_EventType_id: numId });
    }

    if (!eventType) {
      return sendNotFound(res, 'Catering Event Type not found');
    }

    const populatedEventType = await populateCateringEventType(eventType);

    console.info('Catering Event Type retrieved successfully', { id: eventType._id });
    sendSuccess(res, populatedEventType, 'Catering Event Type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving catering event type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateCateringEventType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let eventType;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      eventType = await Catering_EventType.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid event type ID format', 400);
      }
      eventType = await Catering_EventType.findOneAndUpdate({ Catering_EventType_id: numId }, updateData, { new: true, runValidators: true });
    }

    if (!eventType) {
      return sendNotFound(res, 'Catering Event Type not found');
    }

    const populatedEventType = await populateCateringEventType(eventType);

    console.info('Catering Event Type updated successfully', { id: eventType._id });
    sendSuccess(res, populatedEventType, 'Catering Event Type updated successfully');
  } catch (error) {
    console.error('Error updating catering event type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteCateringEventType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let eventType;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      eventType = await Catering_EventType.findByIdAndUpdate(
        id,
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid event type ID format', 400);
      }
      eventType = await Catering_EventType.findOneAndUpdate(
        { Catering_EventType_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    if (!eventType) {
      return sendNotFound(res, 'Catering Event Type not found');
    }

    console.info('Catering Event Type deleted successfully', { id: eventType._id });
    sendSuccess(res, eventType, 'Catering Event Type deleted successfully');
  } catch (error) {
    console.error('Error deleting catering event type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getCateringEventTypesByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { created_by: userId };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [eventTypes, total] = await Promise.all([
      Catering_EventType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Catering_EventType.countDocuments(filter)
    ]);

    const populatedEventTypes = await populateCateringEventType(eventTypes);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Catering Event Types retrieved for authenticated user', { userId, total });
    sendPaginated(res, populatedEventTypes, paginationMeta, 'Catering Event Types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving catering event types for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createCateringEventType,
  getAllCateringEventTypes,
  getCateringEventTypeById,
  updateCateringEventType,
  deleteCateringEventType,
  getCateringEventTypesByAuth
};

