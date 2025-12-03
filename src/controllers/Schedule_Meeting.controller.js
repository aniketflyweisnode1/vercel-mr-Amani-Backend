const ScheduleMeeting = require('../models/Schedule_Meeting.model');
const User = require('../models/User.model');
const Subscription = require('../models/subscription.model');
const Plan = require('../models/Plan.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateScheduleMeeting = async (items) => {
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
    item = await ScheduleMeeting.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      item = await ScheduleMeeting.findOne({ Schedule_Meeting_id: numericId });
    }
  }
  
  if (!item) return null;
  return await populateScheduleMeeting(item);
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

const createScheduleMeeting = asyncHandler(async (req, res) => {
  try {
    const meetingData = {
      ...req.body,
      meetingDate: req.body.meetingDate ? new Date(req.body.meetingDate) : undefined,
      created_by: req.userIdNumber || null
    };

    const meeting = await ScheduleMeeting.create(meetingData);
    const populated = await populateScheduleMeeting(meeting);
    sendSuccess(res, populated, 'Schedule Meeting created successfully', 201);
  } catch (error) {
    console.error('Error creating schedule meeting', { error: error.message });
    throw error;
  }
});

const getAllScheduleMeetings = asyncHandler(async (req, res) => {
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
        { ContactPersonName: { $regex: search.trim(), $options: 'i' } },
        { PhoneNo: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true' || status === '1' || status === true;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      ScheduleMeeting.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ScheduleMeeting.countDocuments(filter)
    ]);

    const populatedItems = await populateScheduleMeeting(items);
    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Schedule Meetings retrieved successfully');
  } catch (error) {
    console.error('Error retrieving schedule meetings', { error: error.message });
    throw error;
  }
});

const getScheduleMeetingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const item = await findByIdentifier(id);

    if (!item) {
      return sendNotFound(res, 'Schedule Meeting not found');
    }

    sendSuccess(res, item, 'Schedule Meeting retrieved successfully');
  } catch (error) {
    console.error('Error retrieving schedule meeting', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateScheduleMeeting = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      meetingDate: req.body.meetingDate ? new Date(req.body.meetingDate) : undefined,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Explicitly remove Schedule_Meeting_id if it was accidentally included
    delete updateData.Schedule_Meeting_id;

    let item;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await ScheduleMeeting.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid schedule meeting ID format', 400);
      }
      item = await ScheduleMeeting.findOneAndUpdate({ Schedule_Meeting_id: numericId }, updateData, { new: true, runValidators: true });
    }

    if (!item) {
      return sendNotFound(res, 'Schedule Meeting not found');
    }

    const populated = await populateScheduleMeeting(item);
    sendSuccess(res, populated, 'Schedule Meeting updated successfully');
  } catch (error) {
    console.error('Error updating schedule meeting', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteScheduleMeeting = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let item;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await ScheduleMeeting.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid schedule meeting ID format', 400);
      }
      item = await ScheduleMeeting.findOneAndUpdate({ Schedule_Meeting_id: numericId }, updateData, { new: true });
    }

    if (!item) {
      return sendNotFound(res, 'Schedule Meeting not found');
    }

    sendSuccess(res, null, 'Schedule Meeting deleted successfully');
  } catch (error) {
    console.error('Error deleting schedule meeting', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getScheduleMeetingsSubscriberGroupByPlanName = asyncHandler(async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status !== undefined) {
      filter.Status = status === 'true' || status === '1' || status === true;
    }

    // Get all subscriptions
    const subscriptions = await Subscription.find(filter).lean();
    
    // Group subscriptions by plan name
    const groupedByPlan = {};
    for (const subscription of subscriptions) {
      let planName = 'Unknown';
      
      // Fetch plan details if Plan_id exists
      if (subscription.Plan_id) {
        const plan = await Plan.findOne({ Plan_id: subscription.Plan_id }).lean();
        if (plan) {
          planName = plan.name || plan.PlanName || plan.planName || 'Unknown';
        }
      }
      
      if (!groupedByPlan[planName]) {
        groupedByPlan[planName] = {
          planName,
          count: 0
        };
      }
      groupedByPlan[planName].count++;
    }

    // Convert to array format
    const result = Object.values(groupedByPlan);

    sendSuccess(res, result, 'Schedule Meetings grouped by plan name retrieved successfully');
  } catch (error) {
    console.error('Error retrieving schedule meetings grouped by plan name', { error: error.message });
    throw error;
  }
});

module.exports = {
  createScheduleMeeting,
  getAllScheduleMeetings,
  getScheduleMeetingById,
  updateScheduleMeeting,
  deleteScheduleMeeting,
  getScheduleMeetingsSubscriberGroupByPlanName
};

