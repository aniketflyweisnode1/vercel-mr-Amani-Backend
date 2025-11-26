const ScheduleOnlyMe = require('../models/WorkForceManagement_Schedule_Onlyme.model');
const WorkForceEmployee = require('../models/WorkForceManagement_Employee.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateSchedule = (query) => query
  .populate('Employee_id', 'WorkForceManagement_Employee_id First_name last_name email phoneNumber Department_id Role_id')
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

const ensureEmployeeExists = async (employeeId) => {
  const employee = await WorkForceEmployee.findOne({
    WorkForceManagement_Employee_id: employeeId,
    Status: true
  });
  return !!employee;
};

const buildFilter = ({ search, status, employee_id, otherInfo_type, Business }) => {
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

  if (employee_id) {
    const numericEmployeeId = parseInt(employee_id, 10);
    if (!isNaN(numericEmployeeId)) {
      filter.Employee_id = numericEmployeeId;
    }
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
    return populateSchedule(ScheduleOnlyMe.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!isNaN(numericId)) {
    return populateSchedule(ScheduleOnlyMe.findOne({ WorkForceManagement_Schedule_Onlyme_id: numericId }));
  }

  return null;
};

const createScheduleOnlyMe = asyncHandler(async (req, res) => {
  try {
    const { Employee_id, worckingHoure } = req.body;

    const employeeExists = await ensureEmployeeExists(Employee_id);
    if (!employeeExists) {
      return sendError(res, 'Employee not found or inactive', 400);
    }

    const payload = {
      ...req.body,
      worckingHoure: normalizeWorkingHours(worckingHoure),
      created_by: req.userIdNumber || null
    };

    const schedule = await ScheduleOnlyMe.create(payload);
    const populated = await populateSchedule(ScheduleOnlyMe.findById(schedule._id));

    sendSuccess(res, populated, 'Schedule (Only Me) created successfully', 201);
  } catch (error) {
    console.error('Error creating schedule (Only Me)', { error: error.message });
    throw error;
  }
});

const getAllScheduleOnlyMe = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      employee_id,
      otherInfo_type,
      Business,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, employee_id, otherInfo_type, Business });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [schedules, total] = await Promise.all([
      populateSchedule(ScheduleOnlyMe.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ScheduleOnlyMe.countDocuments(filter)
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
    console.error('Error retrieving schedules (Only Me)', { error: error.message });
    throw error;
  }
});

const getScheduleOnlyMeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await findScheduleByIdentifier(id);

    if (!schedule) {
      return sendNotFound(res, 'Schedule not found');
    }

    sendSuccess(res, schedule, 'Schedule retrieved successfully');
  } catch (error) {
    console.error('Error retrieving schedule (Only Me)', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateScheduleOnlyMe = asyncHandler(async (req, res) => {
  try {
    const { Employee_id, worckingHoure } = req.body;

    if (Employee_id !== undefined) {
      const employeeExists = await ensureEmployeeExists(Employee_id);
      if (!employeeExists) {
        return sendError(res, 'Employee not found or inactive', 400);
      }
    }

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (worckingHoure !== undefined) {
      updateData.worckingHoure = normalizeWorkingHours(worckingHoure);
    }

    const { id } = req.params;

    let schedule;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      schedule = await ScheduleOnlyMe.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendNotFound(res, 'Invalid schedule ID format');
      }
      schedule = await ScheduleOnlyMe.findOneAndUpdate({ WorkForceManagement_Schedule_Onlyme_id: numericId }, updateData, { new: true, runValidators: true });
    }

    if (!schedule) {
      return sendNotFound(res, 'Schedule not found');
    }

    const populated = await populateSchedule(ScheduleOnlyMe.findById(schedule._id));
    sendSuccess(res, populated, 'Schedule updated successfully');
  } catch (error) {
    console.error('Error updating schedule (Only Me)', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteScheduleOnlyMe = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let schedule;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      schedule = await ScheduleOnlyMe.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendNotFound(res, 'Invalid schedule ID format');
      }
      schedule = await ScheduleOnlyMe.findOneAndUpdate({ WorkForceManagement_Schedule_Onlyme_id: numericId }, updateData, { new: true });
    }

    if (!schedule) {
      return sendNotFound(res, 'Schedule not found');
    }

    sendSuccess(res, schedule, 'Schedule deleted successfully');
  } catch (error) {
    console.error('Error deleting schedule (Only Me)', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getScheduleOnlyMeByAuth = asyncHandler(async (req, res) => {
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
      employee_id,
      otherInfo_type,
      Business,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, employee_id, otherInfo_type, Business });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [schedules, total] = await Promise.all([
      populateSchedule(ScheduleOnlyMe.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ScheduleOnlyMe.countDocuments(filter)
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
    console.error('Error retrieving schedules by auth (Only Me)', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getScheduleOnlyMeByTypeId = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      employee_id,
      Business,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, employee_id, otherInfo_type: type, Business });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [schedules, total] = await Promise.all([
      populateSchedule(ScheduleOnlyMe.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ScheduleOnlyMe.countDocuments(filter)
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
    console.error('Error retrieving schedules by type (Only Me)', { error: error.message, type: req.params.type });
    throw error;
  }
});

module.exports = {
  createScheduleOnlyMe,
  getAllScheduleOnlyMe,
  getScheduleOnlyMeById,
  updateScheduleOnlyMe,
  deleteScheduleOnlyMe,
  getScheduleOnlyMeByAuth,
  getScheduleOnlyMeByTypeId
};


