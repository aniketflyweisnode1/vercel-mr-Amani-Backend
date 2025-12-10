const SettingsAppPartnersNeeds = require('../models/Settings_App_Partners_Needs.model');
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
const populateSettingsAppPartnersNeeds = async (records) => {
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
    recordData = await SettingsAppPartnersNeeds.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      recordData = await SettingsAppPartnersNeeds.findOne({ Settings_App_Partners_Needs_id: numericId });
    }
  }

  if (!recordData) {
    return null;
  }

  return await populateSettingsAppPartnersNeeds(recordData);
};

const createSettingsAppPartnersNeeds = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.body;

    if (!(await ensureBranchExists(Branch_id))) {
      return sendError(res, 'Business branch not found or inactive', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const record = await SettingsAppPartnersNeeds.create(payload);
    const populated = await populateSettingsAppPartnersNeeds(record);

    sendSuccess(res, populated, 'Settings app partners needs created successfully', 201);
  } catch (error) {
    console.error('Error creating settings app partners needs', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllSettingsAppPartnersNeeds = asyncHandler(async (req, res) => {
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
      SettingsAppPartnersNeeds.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      SettingsAppPartnersNeeds.countDocuments(filter)
    ]);
    
    const items = await populateSettingsAppPartnersNeeds(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Settings app partners needs retrieved successfully');
  } catch (error) {
    console.error('Error retrieving settings app partners needs', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getSettingsAppPartnersNeedsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const record = await findByIdentifier(id);

    if (!record) {
      return sendNotFound(res, 'Settings app partners needs not found');
    }

    sendSuccess(res, record, 'Settings app partners needs retrieved successfully');
  } catch (error) {
    console.error('Error retrieving settings app partners needs', { error: error.message, id: req.params.id, stack: error.stack });
    throw error;
  }
});

const updateSettingsAppPartnersNeeds = asyncHandler(async (req, res) => {
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
      record = await SettingsAppPartnersNeeds.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid settings app partners needs ID format', 400);
      }
      record = await SettingsAppPartnersNeeds.findOneAndUpdate({ Settings_App_Partners_Needs_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!record) {
      return sendNotFound(res, 'Settings app partners needs not found');
    }

    const populated = await populateSettingsAppPartnersNeeds(record);
    sendSuccess(res, populated, 'Settings app partners needs updated successfully');
  } catch (error) {
    console.error('Error updating settings app partners needs', { error: error.message, id: req.params.id, stack: error.stack });
    throw error;
  }
});

const deleteSettingsAppPartnersNeeds = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let record;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await SettingsAppPartnersNeeds.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid settings app partners needs ID format', 400);
      }
      record = await SettingsAppPartnersNeeds.findOneAndUpdate({ Settings_App_Partners_Needs_id: numericId }, updatePayload, { new: true });
    }

    if (!record) {
      return sendNotFound(res, 'Settings app partners needs not found');
    }

    sendSuccess(res, record, 'Settings app partners needs deleted successfully');
  } catch (error) {
    console.error('Error deleting settings app partners needs', { error: error.message, id: req.params.id, stack: error.stack });
    throw error;
  }
});

const getSettingsAppPartnersNeedsByBranchId = asyncHandler(async (req, res) => {
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
      SettingsAppPartnersNeeds.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      SettingsAppPartnersNeeds.countDocuments(filter)
    ]);
    
    const items = await populateSettingsAppPartnersNeeds(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Settings app partners needs retrieved successfully');
  } catch (error) {
    console.error('Error retrieving settings app partners needs by branch ID', { error: error.message, Branch_id: req.params.Branch_id, stack: error.stack });
    throw error;
  }
});

const getSettingsAppPartnersNeedsByAuth = asyncHandler(async (req, res) => {
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
      SettingsAppPartnersNeeds.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      SettingsAppPartnersNeeds.countDocuments(filter)
    ]);
    
    const items = await populateSettingsAppPartnersNeeds(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Settings app partners needs retrieved successfully');
  } catch (error) {
    console.error('Error retrieving settings app partners needs by auth', { error: error.message, userId: req.userIdNumber, stack: error.stack });
    throw error;
  }
});

module.exports = {
  createSettingsAppPartnersNeeds,
  getAllSettingsAppPartnersNeeds,
  getSettingsAppPartnersNeedsById,
  updateSettingsAppPartnersNeeds,
  deleteSettingsAppPartnersNeeds,
  getSettingsAppPartnersNeedsByBranchId,
  getSettingsAppPartnersNeedsByAuth
};
