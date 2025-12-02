const Catering_Event = require('../models/Catering_Event.model');
const Catering_EventType = require('../models/Catering_EventType.model');
const User = require('../models/User.model');
const City = require('../models/city.model');
const State = require('../models/state.model');
const Country = require('../models/country.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to ensure event type exists
const ensureEventTypeExists = async (eventTypeId) => {
  if (eventTypeId === undefined || eventTypeId === null) {
    return false;
  }
  const eventType = await Catering_EventType.findOne({ Catering_EventType_id: eventTypeId, Status: true });
  return !!eventType;
};

// Manual population function for Number refs
const populateCateringEvent = async (events) => {
  const eventsArray = Array.isArray(events) ? events : [events];
  const populatedEvents = await Promise.all(
    eventsArray.map(async (event) => {
      if (!event) return null;
      
      const eventObj = event.toObject ? event.toObject() : event;
      
      // Populate Catering_Eventtype_id
      if (eventObj.Catering_Eventtype_id) {
        const eventType = await Catering_EventType.findOne({ Catering_EventType_id: eventObj.Catering_Eventtype_id });
        if (eventType) {
          eventObj.Catering_Eventtype_id = eventType.toObject ? eventType.toObject() : eventType;
        }
      }
      
      // Populate created_by
      if (eventObj.created_by) {
        const createdById = typeof eventObj.created_by === 'object' ? eventObj.created_by : eventObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          eventObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (eventObj.updated_by) {
        const updatedById = typeof eventObj.updated_by === 'object' ? eventObj.updated_by : eventObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          eventObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      // Populate city
      if (eventObj.city) {
        const cityId = typeof eventObj.city === 'object' ? eventObj.city : eventObj.city;
        const city = await City.findOne({ city_id: cityId })
          .select('city_id name stateCode countryCode');
        if (city) {
          eventObj.city = city.toObject ? city.toObject() : city;
        }
      }
      
      // Populate state
      if (eventObj.state) {
        const stateId = typeof eventObj.state === 'object' ? eventObj.state : eventObj.state;
        const state = await State.findOne({ state_id: stateId })
          .select('state_id name isoCode code countryCode');
        if (state) {
          eventObj.state = state.toObject ? state.toObject() : state;
        }
      }
      
      // Populate country
      if (eventObj.country) {
        const countryId = typeof eventObj.country === 'object' ? eventObj.country : eventObj.country;
        const country = await Country.findOne({ country_id: countryId })
          .select('country_id name isoCode code2 code3 phonecode capital currency');
        if (country) {
          eventObj.country = country.toObject ? country.toObject() : country;
        }
      }
      
      return eventObj;
    })
  );
  
  return Array.isArray(events) ? populatedEvents : populatedEvents[0];
};

const createCateringEvent = asyncHandler(async (req, res) => {
  try {
    const { Catering_Eventtype_id } = req.body;

    // Validate event type exists
    const eventTypeExists = await ensureEventTypeExists(Catering_Eventtype_id);
    if (!eventTypeExists) {
      return sendError(res, 'Catering Event Type not found or inactive', 400);
    }

    // Process Days array - convert date strings to Date objects
    let processedDays = req.body.Days;
    if (Array.isArray(processedDays)) {
      processedDays = processedDays.map(day => ({
        ...day,
        StartDate: day.StartDate ? new Date(day.StartDate) : undefined,
        EndDate: day.EndDate ? new Date(day.EndDate) : undefined
      }));
    }

    const eventData = {
      ...req.body,
      DateTime: req.body.DateTime ? new Date(req.body.DateTime) : undefined,
      DeliveryDate: req.body.DeliveryDate ? new Date(req.body.DeliveryDate) : undefined,
      Days: processedDays,
      created_by: req.userIdNumber || null
    };

    const event = await Catering_Event.create(eventData);
    console.info('Catering Event created successfully', { id: event._id, Catering_Event_id: event.Catering_Event_id });

    const populated = await populateCateringEvent(event);
    sendSuccess(res, populated, 'Catering Event created successfully', 201);
  } catch (error) {
    console.error('Error creating catering event', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllCateringEvents = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Catering_Eventtype_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { EventName: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { CuisinePreference: { $regex: search, $options: 'i' } },
        { SpecialInstructions: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { Email: { $regex: search, $options: 'i' } },
        { website: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (Catering_Eventtype_id) {
      const eventTypeIdNum = parseInt(Catering_Eventtype_id, 10);
      if (!isNaN(eventTypeIdNum)) {
        filter.Catering_Eventtype_id = eventTypeIdNum;
      }
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Catering_Event.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Catering_Event.countDocuments(filter)
    ]);

    const populatedEvents = await populateCateringEvent(events);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Catering Events retrieved successfully', { count: populatedEvents.length, total });
    sendPaginated(res, populatedEvents, paginationMeta, 'Catering Events retrieved successfully');
  } catch (error) {
    console.error('Error retrieving catering events', { error: error.message });
    throw error;
  }
});

const getCateringEventById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let event;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      event = await Catering_Event.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid event ID format', 400);
      }
      event = await Catering_Event.findOne({ Catering_Event_id: numId });
    }

    if (!event) {
      return sendNotFound(res, 'Catering Event not found');
    }

    const populatedEvent = await populateCateringEvent(event);

    console.info('Catering Event retrieved successfully', { id: event._id });
    sendSuccess(res, populatedEvent, 'Catering Event retrieved successfully');
  } catch (error) {
    console.error('Error retrieving catering event', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateCateringEvent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Catering_Eventtype_id } = req.body;

    // Validate event type exists if being updated
    if (Catering_Eventtype_id !== undefined) {
      const eventTypeExists = await ensureEventTypeExists(Catering_Eventtype_id);
      if (!eventTypeExists) {
        return sendError(res, 'Catering Event Type not found or inactive', 400);
      }
    }

    // Process Days array - convert date strings to Date objects
    let processedDays = req.body.Days;
    if (Array.isArray(processedDays)) {
      processedDays = processedDays.map(day => ({
        ...day,
        StartDate: day.StartDate ? new Date(day.StartDate) : undefined,
        EndDate: day.EndDate ? new Date(day.EndDate) : undefined
      }));
    }

    const updateData = {
      ...req.body,
      DateTime: req.body.DateTime ? new Date(req.body.DateTime) : undefined,
      DeliveryDate: req.body.DeliveryDate ? new Date(req.body.DeliveryDate) : undefined,
      Days: processedDays !== undefined ? processedDays : undefined,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    let event;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      event = await Catering_Event.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid event ID format', 400);
      }
      event = await Catering_Event.findOneAndUpdate({ Catering_Event_id: numId }, updateData, { new: true, runValidators: true });
    }

    if (!event) {
      return sendNotFound(res, 'Catering Event not found');
    }

    const populatedEvent = await populateCateringEvent(event);

    console.info('Catering Event updated successfully', { id: event._id });
    sendSuccess(res, populatedEvent, 'Catering Event updated successfully');
  } catch (error) {
    console.error('Error updating catering event', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteCateringEvent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let event;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      event = await Catering_Event.findByIdAndUpdate(
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
        return sendError(res, 'Invalid event ID format', 400);
      }
      event = await Catering_Event.findOneAndUpdate(
        { Catering_Event_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    if (!event) {
      return sendNotFound(res, 'Catering Event not found');
    }

    console.info('Catering Event deleted successfully', { id: event._id });
    sendSuccess(res, event, 'Catering Event deleted successfully');
  } catch (error) {
    console.error('Error deleting catering event', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getCateringEventsByTypeId = asyncHandler(async (req, res) => {
  try {
    const { Catering_Eventtype_id } = req.params;
    const eventTypeIdNum = parseInt(Catering_Eventtype_id, 10);
    
    if (isNaN(eventTypeIdNum)) {
      return sendError(res, 'Invalid event type ID format', 400);
    }

    // Validate event type exists
    const eventTypeExists = await ensureEventTypeExists(eventTypeIdNum);
    if (!eventTypeExists) {
      return sendNotFound(res, 'Catering Event Type not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { Catering_Eventtype_id: eventTypeIdNum };

    if (search) {
      filter.$or = [
        { EventName: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { CuisinePreference: { $regex: search, $options: 'i' } },
        { SpecialInstructions: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { Email: { $regex: search, $options: 'i' } },
        { website: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Catering_Event.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Catering_Event.countDocuments(filter)
    ]);

    const populatedEvents = await populateCateringEvent(events);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Catering Events retrieved by type ID', { Catering_Eventtype_id: eventTypeIdNum, total });
    sendPaginated(res, populatedEvents, paginationMeta, 'Catering Events retrieved successfully');
  } catch (error) {
    console.error('Error retrieving catering events by type ID', { error: error.message, Catering_Eventtype_id: req.params.Catering_Eventtype_id });
    throw error;
  }
});

const getCateringEventsByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      Catering_Eventtype_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { created_by: userId };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (Catering_Eventtype_id) {
      const eventTypeIdNum = parseInt(Catering_Eventtype_id, 10);
      if (!isNaN(eventTypeIdNum)) {
        filter.Catering_Eventtype_id = eventTypeIdNum;
      }
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Catering_Event.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Catering_Event.countDocuments(filter)
    ]);

    const populatedEvents = await populateCateringEvent(events);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Catering Events retrieved for authenticated user', { userId, total });
    sendPaginated(res, populatedEvents, paginationMeta, 'Catering Events retrieved successfully');
  } catch (error) {
    console.error('Error retrieving catering events for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createCateringEvent,
  getAllCateringEvents,
  getCateringEventById,
  updateCateringEvent,
  deleteCateringEvent,
  getCateringEventsByTypeId,
  getCateringEventsByAuth
};

