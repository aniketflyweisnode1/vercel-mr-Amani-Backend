const ChangesPlatfroms = require('../models/Changes_Platfroms.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureBranchExists = async (Branch_id) => {
  if (Branch_id === undefined || Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: Branch_id, Status: true });
  return !!branch;
};

// Manual population function for Number refs
const populateChangesPlatfroms = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate Branch_id
      if (recordObj.Branch_id) {
        const branchId = typeof recordObj.Branch_id === 'object' ? recordObj.Branch_id : recordObj.Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id firstName lastName BusinessName Address City_id State_id Country_id');
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

const buildFilter = ({ search, status, Branch_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Branch_id: Number(search) || undefined }
    ].filter(Boolean);
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Branch_id !== undefined) {
    const branchId = parseInt(Branch_id, 10);
    if (!Number.isNaN(branchId)) {
      filter.Branch_id = branchId;
    }
  }

  return filter;
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

const findByIdentifier = async (identifier) => {
  let recordData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    recordData = await ChangesPlatfroms.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      recordData = await ChangesPlatfroms.findOne({ Changes_Platfroms_id: numericId });
    }
  }

  if (!recordData) {
    return null;
  }

  return await populateChangesPlatfroms(recordData);
};

const createChangesPlatfroms = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.body;

    if (!(await ensureBranchExists(Branch_id))) {
      return sendError(res, 'Business branch not found or inactive', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const record = await ChangesPlatfroms.create(payload);
    const populated = await populateChangesPlatfroms(record);

    sendSuccess(res, populated, 'Changes platforms created successfully', 201);
  } catch (error) {
    console.error('Error creating changes platforms', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllChangesPlatfroms = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Branch_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [itemsData, total] = await Promise.all([
      ChangesPlatfroms.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ChangesPlatfroms.countDocuments(filter)
    ]);
    
    const items = await populateChangesPlatfroms(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Changes platforms retrieved successfully');
  } catch (error) {
    console.error('Error retrieving changes platforms', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getChangesPlatfromsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const record = await findByIdentifier(id);

    if (!record) {
      return sendNotFound(res, 'Changes platforms not found');
    }

    sendSuccess(res, record, 'Changes platforms retrieved successfully');
  } catch (error) {
    console.error('Error retrieving changes platforms', { error: error.message, id: req.params.id, stack: error.stack });
    throw error;
  }
});

const updateChangesPlatfroms = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Branch_id } = req.body;

    if (Branch_id !== undefined && !(await ensureBranchExists(Branch_id))) {
      return sendError(res, 'Business branch not found or inactive', 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let record;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await ChangesPlatfroms.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid changes platforms ID format', 400);
      }
      record = await ChangesPlatfroms.findOneAndUpdate({ Changes_Platfroms_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!record) {
      return sendNotFound(res, 'Changes platforms not found');
    }

    const populated = await populateChangesPlatfroms(record);
    sendSuccess(res, populated, 'Changes platforms updated successfully');
  } catch (error) {
    console.error('Error updating changes platforms', { error: error.message, id: req.params.id, stack: error.stack });
    throw error;
  }
});

const deleteChangesPlatfroms = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let record;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await ChangesPlatfroms.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid changes platforms ID format', 400);
      }
      record = await ChangesPlatfroms.findOneAndUpdate({ Changes_Platfroms_id: numericId }, updatePayload, { new: true });
    }

    if (!record) {
      return sendNotFound(res, 'Changes platforms not found');
    }

    sendSuccess(res, record, 'Changes platforms deleted successfully');
  } catch (error) {
    console.error('Error deleting changes platforms', { error: error.message, id: req.params.id, stack: error.stack });
    throw error;
  }
});

const getChangesPlatfromsByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.params;
    const branchId = parseInt(Branch_id, 10);

    if (Number.isNaN(branchId)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }

    if (!(await ensureBranchExists(branchId))) {
      return sendNotFound(res, 'Business branch not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = { Branch_id: branchId };
    if (status !== undefined) {
      filter.Status = status === 'true' || status === true;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [itemsData, total] = await Promise.all([
      ChangesPlatfroms.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ChangesPlatfroms.countDocuments(filter)
    ]);
    
    const items = await populateChangesPlatfroms(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Changes platforms retrieved successfully');
  } catch (error) {
    console.error('Error retrieving changes platforms by branch ID', { error: error.message, Branch_id: req.params.Branch_id, stack: error.stack });
    throw error;
  }
});

const getChangesPlatfromsByAuth = asyncHandler(async (req, res) => {
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
      Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Branch_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [itemsData, total] = await Promise.all([
      ChangesPlatfroms.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ChangesPlatfroms.countDocuments(filter)
    ]);
    
    const items = await populateChangesPlatfroms(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Changes platforms retrieved successfully');
  } catch (error) {
    console.error('Error retrieving changes platforms by auth', { error: error.message, userId: req.userIdNumber, stack: error.stack });
    throw error;
  }
});

module.exports = {
  createChangesPlatfroms,
  getAllChangesPlatfroms,
  getChangesPlatfromsById,
  updateChangesPlatfroms,
  deleteChangesPlatfroms,
  getChangesPlatfromsByBranchId,
  getChangesPlatfromsByAuth
};
