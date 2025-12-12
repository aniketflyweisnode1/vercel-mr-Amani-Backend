const HelpSupportRateus = require('../models/Help_Support_Rateus.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateHelpSupportRateus = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate Branch_Id
      if (recordObj.Branch_Id) {
        const branchId = typeof recordObj.Branch_Id === 'object' ? recordObj.Branch_Id : recordObj.Branch_Id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id firstName lastName BusinessName Address City state country');
        if (branch) {
          recordObj.Branch_Id = branch.toObject ? branch.toObject() : branch;
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

const buildFilter = ({ search, status, Branch_Id, YourFeel }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Feedback: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Branch_Id !== undefined) {
    const branchId = parseInt(Branch_Id, 10);
    if (!Number.isNaN(branchId)) {
      filter.Branch_Id = branchId;
    }
  }

  if (YourFeel && YourFeel.status) {
    filter['YourFeel.status'] = YourFeel.status;
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

const ensureBranchExists = async (Branch_Id) => {
  if (Branch_Id === undefined) {
    return true;
  }
  const branchId = parseInt(Branch_Id, 10);
  if (Number.isNaN(branchId)) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return Boolean(branch);
};

const findByIdentifier = async (identifier) => {
  let rateusData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    rateusData = await HelpSupportRateus.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      rateusData = await HelpSupportRateus.findOne({ Help_Support_Rateus_id: numericId });
    }
  }
  
  if (!rateusData) {
    return null;
  }
  
  return await populateHelpSupportRateus(rateusData);
};

const createHelpSupportRateus = asyncHandler(async (req, res) => {
  try {
    const { Branch_Id } = req.body;
    if (!(await ensureBranchExists(Branch_Id))) {
      return sendError(res, 'Business branch not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const rateus = await HelpSupportRateus.create(payload);
    const populated = await populateHelpSupportRateus(rateus);
    sendSuccess(res, populated, 'Help support rate us created successfully', 201);
  } catch (error) {
    console.error('Error creating help support rate us', { error: error.message });
    throw error;
  }
});

const getAllHelpSupportRateuses = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Branch_Id,
      YourFeel,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Branch_Id, YourFeel });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [rateusesData, total] = await Promise.all([
      HelpSupportRateus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportRateus.countDocuments(filter)
    ]);
    
    const rateuses = await populateHelpSupportRateus(rateusesData);
    sendPaginated(res, rateuses, paginateMeta(numericPage, numericLimit, total), 'Help support rate uses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support rate uses', { error: error.message });
    throw error;
  }
});

const getHelpSupportRateusById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const rateus = await findByIdentifier(id);
    if (!rateus) {
      return sendNotFound(res, 'Help support rate us not found');
    }
    sendSuccess(res, rateus, 'Help support rate us retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support rate us', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateHelpSupportRateus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Branch_Id } = req.body;
    if (Branch_Id !== undefined && !(await ensureBranchExists(Branch_Id))) {
      return sendError(res, 'Business branch not found', 400);
    }
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let rateus;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      rateus = await HelpSupportRateus.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid help support rate us ID format', 400);
      }
      rateus = await HelpSupportRateus.findOneAndUpdate({ Help_Support_Rateus_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!rateus) {
      return sendNotFound(res, 'Help support rate us not found');
    }
    const populated = await populateHelpSupportRateus(rateus);
    sendSuccess(res, populated, 'Help support rate us updated successfully');
  } catch (error) {
    console.error('Error updating help support rate us', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteHelpSupportRateus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let rateus;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      rateus = await HelpSupportRateus.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid help support rate us ID format', 400);
      }
      rateus = await HelpSupportRateus.findOneAndUpdate({ Help_Support_Rateus_id: numericId }, updatePayload, { new: true });
    }
    if (!rateus) {
      return sendNotFound(res, 'Help support rate us not found');
    }
    sendSuccess(res, rateus, 'Help support rate us deleted successfully');
  } catch (error) {
    console.error('Error deleting help support rate us', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getHelpSupportRateusesByFeel = asyncHandler(async (req, res) => {
  try {
    const { feel } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Branch_Id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Branch_Id });
    filter['YourFeel.status'] = feel;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [rateusesData, total] = await Promise.all([
      HelpSupportRateus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportRateus.countDocuments(filter)
    ]);
    
    const rateuses = await populateHelpSupportRateus(rateusesData);
    sendPaginated(res, rateuses, paginateMeta(numericPage, numericLimit, total), 'Help support rate uses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support rate uses by feel', { error: error.message, feel: req.params.feel });
    throw error;
  }
});

const getHelpSupportRateusesByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_Id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      YourFeel,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const branchId = parseInt(Branch_Id, 10);
    if (Number.isNaN(branchId)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, YourFeel });
    filter.Branch_Id = branchId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [rateusesData, total] = await Promise.all([
      HelpSupportRateus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportRateus.countDocuments(filter)
    ]);
    
    const rateuses = await populateHelpSupportRateus(rateusesData);
    sendPaginated(res, rateuses, paginateMeta(numericPage, numericLimit, total), 'Help support rate uses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support rate uses by branch', { error: error.message, Branch_Id: req.params.Branch_Id });
    throw error;
  }
});

const getHelpSupportRateusesByAuth = asyncHandler(async (req, res) => {
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
      Branch_Id,
      YourFeel,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Branch_Id, YourFeel });
    filter.created_by = userId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [rateusesData, total] = await Promise.all([
      HelpSupportRateus.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportRateus.countDocuments(filter)
    ]);
    
    const rateuses = await populateHelpSupportRateus(rateusesData);
    sendPaginated(res, rateuses, paginateMeta(numericPage, numericLimit, total), 'Help support rate uses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support rate uses by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createHelpSupportRateus,
  getAllHelpSupportRateuses,
  getHelpSupportRateusById,
  updateHelpSupportRateus,
  deleteHelpSupportRateus,
  getHelpSupportRateusesByFeel,
  getHelpSupportRateusesByBranchId,
  getHelpSupportRateusesByAuth
};

