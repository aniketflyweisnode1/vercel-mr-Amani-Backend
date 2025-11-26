const Departments = require('../models/Departments.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateDepartment = (query) => query
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  return filter;
};

const findDepartmentByIdentifier = async (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateDepartment(Departments.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!isNaN(numericId)) {
    return populateDepartment(Departments.findOne({ Departments_id: numericId }));
  }

  return null;
};

const createDepartment = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const department = await Departments.create(payload);
    const populated = await populateDepartment(Departments.findById(department._id));

    sendSuccess(res, populated, 'Department created successfully', 201);
  } catch (error) {
    console.error('Error creating department', { error: error.message });
    throw error;
  }
});

const getAllDepartments = asyncHandler(async (req, res) => {
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

    const filter = buildFilter({ search, status });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [departments, total] = await Promise.all([
      populateDepartment(Departments.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Departments.countDocuments(filter)
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

    sendPaginated(res, departments, pagination, 'Departments retrieved successfully');
  } catch (error) {
    console.error('Error retrieving departments', { error: error.message });
    throw error;
  }
});

const getDepartmentById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const department = await findDepartmentByIdentifier(id);

    if (!department) {
      return sendNotFound(res, 'Department not found');
    }

    sendSuccess(res, department, 'Department retrieved successfully');
  } catch (error) {
    console.error('Error retrieving department', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateDepartment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let department;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      department = await Departments.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendNotFound(res, 'Invalid department ID format');
      }
      department = await Departments.findOneAndUpdate({ Departments_id: numericId }, updateData, { new: true, runValidators: true });
    }

    if (!department) {
      return sendNotFound(res, 'Department not found');
    }

    const populated = await populateDepartment(Departments.findById(department._id));
    sendSuccess(res, populated, 'Department updated successfully');
  } catch (error) {
    console.error('Error updating department', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteDepartment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let department;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      department = await Departments.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendNotFound(res, 'Invalid department ID format');
      }
      department = await Departments.findOneAndUpdate({ Departments_id: numericId }, updateData, { new: true });
    }

    if (!department) {
      return sendNotFound(res, 'Department not found');
    }

    sendSuccess(res, department, 'Department deleted successfully');
  } catch (error) {
    console.error('Error deleting department', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getDepartmentsByAuth = asyncHandler(async (req, res) => {
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
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [departments, total] = await Promise.all([
      populateDepartment(Departments.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Departments.countDocuments(filter)
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

    sendPaginated(res, departments, pagination, 'Departments retrieved successfully');
  } catch (error) {
    console.error('Error retrieving departments by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getDepartmentsByTypeId = asyncHandler(async (req, res) => {
  try {
    const { department_id } = req.params;
    const numericId = parseInt(department_id, 10);

    if (isNaN(numericId)) {
      return sendError(res, 'Invalid department ID format', 400);
    }

    const department = await populateDepartment(Departments.findOne({ Departments_id: numericId }));

    if (!department) {
      return sendNotFound(res, 'Department not found');
    }

    sendSuccess(res, department, 'Department retrieved successfully');
  } catch (error) {
    console.error('Error retrieving department by type ID', { error: error.message, department_id: req.params.department_id });
    throw error;
  }
});

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByAuth,
  getDepartmentsByTypeId
};



