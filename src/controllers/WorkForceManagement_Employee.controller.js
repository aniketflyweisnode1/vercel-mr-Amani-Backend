const WorkForceEmployee = require('../models/WorkForceManagement_Employee.model');
const Role = require('../models/role.model');
const Departments = require('../models/Departments.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateEmployee = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate Role_id
      if (recordObj.Role_id) {
        const roleId = typeof recordObj.Role_id === 'object' ? recordObj.Role_id : recordObj.Role_id;
        const role = await Role.findOne({ role_id: roleId })
          .select('role_id name status');
        if (role) {
          recordObj.Role_id = role.toObject ? role.toObject() : role;
        }
      }
      
      // Populate Department_id
      if (recordObj.Department_id) {
        const departmentId = typeof recordObj.Department_id === 'object' ? recordObj.Department_id : recordObj.Department_id;
        const department = await Departments.findOne({ Departments_id: departmentId })
          .select('Departments_id name Status');
        if (department) {
          recordObj.Department_id = department.toObject ? department.toObject() : department;
        }
      }
      
      // Populate Branch_id
      if (recordObj.Branch_id) {
        const branchId = typeof recordObj.Branch_id === 'object' ? recordObj.Branch_id : recordObj.Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id BusinessName Address Status');
        if (branch) {
          recordObj.Branch_id = branch.toObject ? branch.toObject() : branch;
        }
      }
      
      // Populate created_by
      if (recordObj.created_by) {
        const createdById = typeof recordObj.created_by === 'object' ? recordObj.created_by : recordObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          recordObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (recordObj.updated_by) {
        const updatedById = typeof recordObj.updated_by === 'object' ? recordObj.updated_by : recordObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          recordObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return recordObj;
    })
  );
  
  return Array.isArray(records) ? populatedRecords : populatedRecords[0];
};

const normalizeBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1';
};

const normalizeAccessPermissions = (permissions = []) => {
  if (!Array.isArray(permissions)) {
    return [];
  }

  return permissions
    .filter(entry => entry && typeof entry === 'object')
    .map(entry => ({
      name: entry.name ? String(entry.name).trim() : '',
      Access: normalizeBoolean(entry.Access, false)
    }))
    .filter(entry => entry.name.length > 0);
};

const ensureRoleExists = async (roleId) => {
  const role = await Role.findOne({ role_id: roleId, status: true });
  return !!role;
};

const ensureDepartmentExists = async (departmentId) => {
  const department = await Departments.findOne({ Departments_id: departmentId, Status: true });
  return !!department;
};

const ensureBranchExists = async (branchId) => {
  if (branchId === undefined || branchId === null) {
    return true; // Branch_id is optional
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return !!branch;
};

const buildFilter = ({ search, status, role_id, department_id, Branch_id, type }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { First_name: { $regex: search, $options: 'i' } },
      { last_name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (role_id) {
    const numericRoleId = parseInt(role_id, 10);
    if (!isNaN(numericRoleId)) {
      filter.Role_id = numericRoleId;
    }
  }

  if (department_id) {
    const numericDepartmentId = parseInt(department_id, 10);
    if (!isNaN(numericDepartmentId)) {
      filter.Department_id = numericDepartmentId;
    }
  }

  if (Branch_id !== undefined) {
    const numericBranchId = parseInt(Branch_id, 10);
    if (!isNaN(numericBranchId)) {
      filter.Branch_id = numericBranchId;
    }
  }

  if (type) {
    filter.type = type;
  }

  return filter;
};

const findEmployeeByIdentifier = async (identifier) => {
  let employeeData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    employeeData = await WorkForceEmployee.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      employeeData = await WorkForceEmployee.findOne({ WorkForceManagement_Employee_id: numericId });
    }
  }

  if (!employeeData) {
    return null;
  }

  return await populateEmployee(employeeData);
};

const createWorkForceEmployee = asyncHandler(async (req, res) => {
  try {
    const { Role_id, Department_id, Branch_id, AcessPermission } = req.body;

    const roleExists = await ensureRoleExists(Role_id);
    if (!roleExists) {
      return sendError(res, 'Role not found or inactive', 400);
    }

    const departmentExists = await ensureDepartmentExists(Department_id);
    if (!departmentExists) {
      return sendError(res, 'Department not found or inactive', 400);
    }

    if (Branch_id !== undefined && Branch_id !== null) {
      const branchExists = await ensureBranchExists(Branch_id);
      if (!branchExists) {
        return sendError(res, 'Branch not found or inactive', 400);
      }
    }

    const payload = {
      ...req.body,
      AcessPermission: normalizeAccessPermissions(AcessPermission),
      branchPermission: normalizeBoolean(req.body.branchPermission, false),
      created_by: req.userIdNumber || null
    };

    const employee = await WorkForceEmployee.create(payload);
    const populated = await populateEmployee(employee);

    sendSuccess(res, populated, 'Workforce employee created successfully', 201);
  } catch (error) {
    console.error('Error creating workforce employee', { error: error.message });
    throw error;
  }
});

const getAllWorkForceEmployees = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      role_id,
      department_id,
      type,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, role_id, department_id, type });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [employeesData, total] = await Promise.all([
      WorkForceEmployee.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      WorkForceEmployee.countDocuments(filter)
    ]);
    
    const employees = await populateEmployee(employeesData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    sendPaginated(res, employees, pagination, 'Workforce employees retrieved successfully');
  } catch (error) {
    console.error('Error retrieving workforce employees', { error: error.message });
    throw error;
  }
});

const getWorkForceEmployeeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await findEmployeeByIdentifier(id);

    if (!employee) {
      return sendNotFound(res, 'Workforce employee not found');
    }

    sendSuccess(res, employee, 'Workforce employee retrieved successfully');
  } catch (error) {
    console.error('Error retrieving workforce employee', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateWorkForceEmployee = asyncHandler(async (req, res) => {
  try {
    const { Role_id, Department_id, Branch_id, AcessPermission } = req.body;

    if (Role_id !== undefined) {
      const roleExists = await ensureRoleExists(Role_id);
      if (!roleExists) {
        return sendError(res, 'Role not found or inactive', 400);
      }
    }

    if (Department_id !== undefined) {
      const departmentExists = await ensureDepartmentExists(Department_id);
      if (!departmentExists) {
        return sendError(res, 'Department not found or inactive', 400);
      }
    }

    if (Branch_id !== undefined && Branch_id !== null) {
      const branchExists = await ensureBranchExists(Branch_id);
      if (!branchExists) {
        return sendError(res, 'Branch not found or inactive', 400);
      }
    }

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (AcessPermission !== undefined) {
      updateData.AcessPermission = normalizeAccessPermissions(AcessPermission);
    }

    if (req.body.branchPermission !== undefined) {
      updateData.branchPermission = normalizeBoolean(req.body.branchPermission, false);
    }

    const { id } = req.params;

    let employee;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await WorkForceEmployee.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendNotFound(res, 'Invalid workforce employee ID format');
      }
      employee = await WorkForceEmployee.findOneAndUpdate({ WorkForceManagement_Employee_id: numericId }, updateData, { new: true, runValidators: true });
    }

    if (!employee) {
      return sendNotFound(res, 'Workforce employee not found');
    }

    const populated = await populateEmployee(employee);
    sendSuccess(res, populated, 'Workforce employee updated successfully');
  } catch (error) {
    console.error('Error updating workforce employee', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteWorkForceEmployee = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let employee;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await WorkForceEmployee.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendNotFound(res, 'Invalid workforce employee ID format');
      }
      employee = await WorkForceEmployee.findOneAndUpdate({ WorkForceManagement_Employee_id: numericId }, updateData, { new: true });
    }

    if (!employee) {
      return sendNotFound(res, 'Workforce employee not found');
    }

    sendSuccess(res, employee, 'Workforce employee deleted successfully');
  } catch (error) {
    console.error('Error deleting workforce employee', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getWorkForceEmployeesByAuth = asyncHandler(async (req, res) => {
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
      role_id,
      department_id,
      Branch_id,
      type,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, role_id, department_id, Branch_id, type });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [employeesData, total] = await Promise.all([
      WorkForceEmployee.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      WorkForceEmployee.countDocuments(filter)
    ]);
    
    const employees = await populateEmployee(employeesData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    sendPaginated(res, employees, pagination, 'Workforce employees retrieved successfully');
  } catch (error) {
    console.error('Error retrieving workforce employees by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createWorkForceEmployee,
  getAllWorkForceEmployees,
  getWorkForceEmployeeById,
  updateWorkForceEmployee,
  deleteWorkForceEmployee,
  getWorkForceEmployeesByAuth
};



