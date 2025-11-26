const ScheduleEveryOne = require('../models/WorkForceManagement_Schedule_EveryOne.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateSchedule = (query) => query
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const normalizeWorkingHours = (entries = []) => {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .filter(entry => entry && typeof entry === 'object')
    .map(entry => ({
      Day: entry.Day ? String(entry.Day).trim() : '',
      Houre: Array.isArray(entry.Houre) ? entry.Houre : []
    }))
    .filter(entry => entry.Day.length > 0);
};

const buildFilter = ({ search, status, otherInfo_type, Business }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (otherInfo_type) {
    filter.otherInfo_type = otherInfo_type;
  }

  if (Business) {
    filter.Business = Business;
  }

  return filter;
};

const findScheduleByIdentifier = async (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateSchedule(ScheduleEveryOne.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!isNaN(numericId)) {
    return populateSchedule(ScheduleEveryOne.findOne({ WorkForceManagement_Schedule_EveryOne_id: numericId }));
  }

  return null;
};

const createScheduleEveryOne = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      worckingHoure: normalizeWorkingHours(req.body.worckingHoure),
      created_by: req.userIdNumber || null
    };

    const schedule = await ScheduleEveryOne.create(payload);
    const populated = await populateSchedule(ScheduleEveryOne.findById(schedule._id));

    sendSuccess(res, populated, 'Schedule (Everyone) created successfully', 201);
  } catch (error) {
    console.error('Error creating schedule (Everyone)', { error: error.message });
    throw error;
  }
});

const getAllScheduleEveryOne = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      otherInfo_type,
      Business,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, otherInfo_type, Business });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [schedules, total] = await Promise.all([
      populateSchedule(ScheduleEveryOne.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ScheduleEveryOne.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    sendPaginated(res, schedules, pagination, 'Schedules retrieved successfully');
  } catch (error) {
    console.error('Error retrieving schedules (Everyone)', { error: error.message });
    throw error;
  }
});

const getScheduleEveryOneById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await findScheduleByIdentifier(id);

    if (!schedule) {
      return sendNotFound(res, 'Schedule not found');
    }

    sendSuccess(res, schedule, 'Schedule retrieved successfully');
  } catch (error) {
    console.error('Error retrieving schedule (Everyone)', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateScheduleEveryOne = asyncHandler(async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (req.body.worckingHoure !== undefined) {
      updateData.worckingHoure = normalizeWorkingHours(req.body.worckingHoure);
    }

    const { id } = req.params;
    let schedule;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      schedule = await ScheduleEveryOne.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendNotFound(res, 'Invalid schedule ID format');
      }
      schedule = await ScheduleEveryOne.findOneAndUpdate({ WorkForceManagement_Schedule_EveryOne_id: numericId }, updateData, { new: true, runValidators: true });
    }

    if (!schedule) {
      return sendNotFound(res, 'Schedule not found');
    }

    const populated = await populateSchedule(ScheduleEveryOne.findById(schedule._id));
    sendSuccess(res, populated, 'Schedule updated successfully');
  } catch (error) {
    console.error('Error updating schedule (Everyone)', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteScheduleEveryOne = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let schedule;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      schedule = await ScheduleEveryOne.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendNotFound(res, 'Invalid schedule ID format');
      }
      schedule = await ScheduleEveryOne.findOneAndUpdate({ WorkForceManagement_Schedule_EveryOne_id: numericId }, updateData, { new: true });
    }

    if (!schedule) {
      return sendNotFound(res, 'Schedule not found');
    }

    sendSuccess(res, schedule, 'Schedule deleted successfully');
  } catch (error) {
    console.error('Error deleting schedule (Everyone)', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getScheduleEveryOneByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      otherInfo_type,
      Business,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, otherInfo_type, Business });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [schedules, total] = await Promise.all([
      populateSchedule(ScheduleEveryOne.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ScheduleEveryOne.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    sendPaginated(res, schedules, pagination, 'Schedules retrieved successfully');
  } catch (error) {
    console.error('Error retrieving schedules by auth (Everyone)', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getScheduleEveryOneByTypeId = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      Business,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, otherInfo_type: type, Business });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [schedules, total] = await Promise.all([
      populateSchedule(ScheduleEveryOne.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ScheduleEveryOne.countDocuments(filter)
    ]);

    if (total === 0) {
      return sendNotFound(res, 'Schedules not found for the given type');
    }

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    sendPaginated(res, schedules, pagination, 'Schedules retrieved successfully');
  } catch (error) {
    console.error('Error retrieving schedules by type (Everyone)', { error: error.message, type: req.params.type });
    throw error;
  }
});

module.exports = {
  createScheduleEveryOne,
  getAllScheduleEveryOne,
  getScheduleEveryOneById,
  updateScheduleEveryOne,
  deleteScheduleEveryOne,
  getScheduleEveryOneByAuth,
  getScheduleEveryOneByTypeId
};


