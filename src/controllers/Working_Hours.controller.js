const Working_Hours = require('../models/Working_Hours.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to ensure business branch exists
const ensureBusinessBranchExists = async (Branch_id) => {
  if (Branch_id === undefined || Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: Branch_id, Status: true });
  return !!branch;
};

const buildFilterFromQuery = ({ search, status, Branch_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { Days: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (Branch_id) {
    const branchIdNum = parseInt(Branch_id, 10);
    if (!isNaN(branchIdNum)) {
      filter.Branch_id = branchIdNum;
    }
  }

  return filter;
};

// Manual population function for Number refs
const populateWorkingHours = async (workingHours) => {
  const workingHoursArray = Array.isArray(workingHours) ? workingHours : [workingHours];
  const populatedWorkingHours = await Promise.all(
    workingHoursArray.map(async (wh) => {
      if (!wh) return null;
      
      const whObj = wh.toObject ? wh.toObject() : wh;
      
      // Populate Branch_id
      if (whObj.Branch_id) {
        const branch = await Business_Branch.findOne({ business_Branch_id: whObj.Branch_id })
          .select('business_Branch_id firstName lastName Address');
        if (branch) {
          whObj.Branch_id = branch.toObject ? branch.toObject() : branch;
        }
      }
      
      // Populate created_by
      if (whObj.created_by) {
        const createdById = typeof whObj.created_by === 'object' ? whObj.created_by : whObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          whObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (whObj.updated_by) {
        const updatedById = typeof whObj.updated_by === 'object' ? whObj.updated_by : whObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          whObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return whObj;
    })
  );
  
  return Array.isArray(workingHours) ? populatedWorkingHours : populatedWorkingHours[0];
};

const createWorkingHours = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.body;

    // Validate branch exists
    const branchExists = await ensureBusinessBranchExists(Branch_id);
    if (!branchExists) {
      return sendError(res, 'Associated business branch not found or inactive', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const workingHours = await Working_Hours.create(payload);
    console.info('Working hours created successfully', { id: workingHours._id, Working_Hours_id: workingHours.Working_Hours_id });

    const populated = await populateWorkingHours(workingHours);
    sendSuccess(res, populated, 'Working hours created successfully', 201);
  } catch (error) {
    console.error('Error creating working hours', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllWorkingHours = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, Branch_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = buildFilterFromQuery({ search, status, Branch_id });

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [workingHours, total] = await Promise.all([
      Working_Hours.find(filter).sort(sort).skip(skip).limit(limitNum),
      Working_Hours.countDocuments(filter)
    ]);

    const populatedWorkingHours = await populateWorkingHours(workingHours);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Working hours retrieved successfully', { count: populatedWorkingHours.length, total });
    sendPaginated(res, populatedWorkingHours, paginationMeta, 'Working hours retrieved successfully');
  } catch (error) {
    console.error('Error retrieving working hours', { error: error.message });
    throw error;
  }
});

const getWorkingHoursById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = Working_Hours.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid working hours ID format', 400);
      }
      query = Working_Hours.findOne({ Working_Hours_id: numId });
    }

    const workingHours = await query;

    if (!workingHours) {
      return sendNotFound(res, 'Working hours not found');
    }

    const populatedWorkingHours = await populateWorkingHours(workingHours);

    console.info('Working hours retrieved successfully', { id: workingHours._id });
    sendSuccess(res, populatedWorkingHours, 'Working hours retrieved successfully');
  } catch (error) {
    console.error('Error retrieving working hours', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateWorkingHours = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Branch_id } = req.body;

    // Validate branch exists if being updated
    if (Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(Branch_id);
      if (!branchExists) {
        return sendError(res, 'Associated business branch not found or inactive', 400);
      }
    }

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = Working_Hours.findByIdAndUpdate(
        id,
        {
          ...req.body,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true, runValidators: true }
      );
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid working hours ID format', 400);
      }
      query = Working_Hours.findOneAndUpdate(
        { Working_Hours_id: numId },
        {
          ...req.body,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true, runValidators: true }
      );
    }

    const workingHours = await query;

    if (!workingHours) {
      return sendNotFound(res, 'Working hours not found');
    }

    const populatedWorkingHours = await populateWorkingHours(workingHours);

    console.info('Working hours updated successfully', { id: workingHours._id });
    sendSuccess(res, populatedWorkingHours, 'Working hours updated successfully');
  } catch (error) {
    console.error('Error updating working hours', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteWorkingHours = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = Working_Hours.findByIdAndUpdate(
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
        return sendError(res, 'Invalid working hours ID format', 400);
      }
      query = Working_Hours.findOneAndUpdate(
        { Working_Hours_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    const workingHours = await query;

    if (!workingHours) {
      return sendNotFound(res, 'Working hours not found');
    }

    console.info('Working hours deleted successfully', { id: workingHours._id });
    sendSuccess(res, workingHours, 'Working hours deleted successfully');
  } catch (error) {
    console.error('Error deleting working hours', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getWorkingHoursByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, Branch_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = { created_by: req.userIdNumber };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (Branch_id) {
      const branchIdNum = parseInt(Branch_id, 10);
      if (!isNaN(branchIdNum)) {
        filter.Branch_id = branchIdNum;
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [workingHours, total] = await Promise.all([
      Working_Hours.find(filter).sort(sort).skip(skip).limit(limitNum),
      Working_Hours.countDocuments(filter)
    ]);

    const populatedWorkingHours = await populateWorkingHours(workingHours);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Working hours retrieved by auth successfully', { count: populatedWorkingHours.length, total });
    sendPaginated(res, populatedWorkingHours, paginationMeta, 'Working hours retrieved successfully');
  } catch (error) {
    console.error('Error retrieving working hours by auth', { error: error.message });
    throw error;
  }
});

const getWorkingHoursByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.params;
    const { page = 1, limit = 10, search, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const branchIdNum = parseInt(Branch_id, 10);
    if (isNaN(branchIdNum)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }

    const filter = { Branch_id: branchIdNum };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { Days: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [workingHours, total] = await Promise.all([
      Working_Hours.find(filter).sort(sort).skip(skip).limit(limitNum),
      Working_Hours.countDocuments(filter)
    ]);

    const populatedWorkingHours = await populateWorkingHours(workingHours);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Working hours retrieved by branch ID successfully', { count: populatedWorkingHours.length, total, Branch_id: branchIdNum });
    sendPaginated(res, populatedWorkingHours, paginationMeta, 'Working hours retrieved successfully');
  } catch (error) {
    console.error('Error retrieving working hours by branch ID', { error: error.message, Branch_id: req.params.Branch_id });
    throw error;
  }
});

module.exports = {
  createWorkingHours,
  getAllWorkingHours,
  getWorkingHoursById,
  updateWorkingHours,
  deleteWorkingHours,
  getWorkingHoursByAuth,
  getWorkingHoursByBranchId
};

