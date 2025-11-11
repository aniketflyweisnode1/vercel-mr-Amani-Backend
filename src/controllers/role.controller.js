const Role = require('../models/role.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


/**
 * Create a new role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRole = asyncHandler(async (req, res) => {
  try {
    const roleData = {
      ...req.body,
      created_by: 1
    };

    const role = await Role.create(roleData);

    console.info('Role created successfully', { roleId: role._id, role_id: role.role_id });

    sendSuccess(res, role, 'Role created successfully', 201);
  } catch (error) {
    console.error('Error creating role', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all roles with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllRoles = asyncHandler(async (req, res) => {
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
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      Role.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Role.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };

    console.info('Roles retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, roles, pagination, 'Roles retrieved successfully');
  } catch (error) {
    console.error('Error retrieving roles', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRoleById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);

    if (!role) {
      return sendNotFound(res, 'Role not found');
    }

    console.info('Role retrieved successfully', { roleId: role._id });

    sendSuccess(res, role, 'Role retrieved successfully');
  } catch (error) {
    console.error('Error retrieving role', { error: error.message, roleId: req.params.id });
    throw error;
  }
});

/**
 * Update role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRole = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const role = await Role.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!role) {
      return sendNotFound(res, 'Role not found');
    }

    console.info('Role updated successfully', { roleId: role._id });

    sendSuccess(res, role, 'Role updated successfully');
  } catch (error) {
    console.error('Error updating role', { error: error.message, roleId: req.params.id });
    throw error;
  }
});

/**
 * Delete role by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteRole = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByIdAndUpdate(
      id,
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!role) {
      return sendNotFound(res, 'Role not found');
    }

    console.info('Role deleted successfully', { roleId: role._id });

    sendSuccess(res, role, 'Role deleted successfully');
  } catch (error) {
    console.error('Error deleting role', { error: error.message, roleId: req.params.id });
    throw error;
  }
});

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
};

