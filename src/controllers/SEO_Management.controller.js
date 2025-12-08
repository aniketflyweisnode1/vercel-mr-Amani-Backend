const SEOManagement = require('../models/SEO_Management.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const getBusinessBranchIdByAuth = async (userIdNumber) => {
  if (!userIdNumber) {
    return null;
  }
  const branch = await Business_Branch.findOne({ created_by: userIdNumber, Status: true });
  return branch ? branch.business_Branch_id : null;
};

const ensureBusinessBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined || business_Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id, Status: true });
  return !!branch;
};

// Manual population function for Number refs
const populateSEO = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate business_Branch_id
      if (recordObj.business_Branch_id) {
        const branchId = typeof recordObj.business_Branch_id === 'object' ? recordObj.business_Branch_id : recordObj.business_Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id BusinessName Address');
        if (branch) {
          recordObj.business_Branch_id = branch.toObject ? branch.toObject() : branch;
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

const buildFilterFromQuery = ({ search, status, business_Branch_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { website: { $regex: search, $options: 'i' } },
      { TargetPositons: { $regex: search, $options: 'i' } },
      { KeyWord: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (business_Branch_id !== undefined) {
    const numericBranch = parseInt(business_Branch_id, 10);
    if (!Number.isNaN(numericBranch)) {
      filter.business_Branch_id = numericBranch;
    }
  }

  return filter;
};

const listSEORecords = async ({ query, res, successMessage, filterOverrides = {} }) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status,
    business_Branch_id,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = query;

  const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
  const numericPage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (numericPage - 1) * numericLimit;

  const filter = buildFilterFromQuery({ search, status, business_Branch_id });
  Object.assign(filter, filterOverrides);

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [recordsData, total] = await Promise.all([
    SEOManagement.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(numericLimit),
    SEOManagement.countDocuments(filter)
  ]);

  const records = await populateSEO(recordsData);

  const totalPages = Math.ceil(total / numericLimit) || 1;
  const pagination = {
    currentPage: numericPage,
    totalPages,
    totalItems: total,
    itemsPerPage: numericLimit,
    hasNextPage: numericPage < totalPages,
    hasPrevPage: numericPage > 1
  };

  sendPaginated(res, records, pagination, successMessage);
};

const findSEOByIdentifier = async (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateSEO(SEOManagement.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateSEO(SEOManagement.findOne({ SEO_Management_id: numericId }));
  }

  return null;
};

const createSEOManagement = asyncHandler(async (req, res) => {
  try {
    let business_Branch_id = req.body.business_Branch_id;
    if (business_Branch_id === undefined || business_Branch_id === null) {
      business_Branch_id = await getBusinessBranchIdByAuth(req.userIdNumber);
    }

    if (!business_Branch_id) {
      return sendError(res, 'Unable to determine business branch for authenticated user', 400);
    }

    const branchExists = await ensureBusinessBranchExists(business_Branch_id);
    if (!branchExists) {
      return sendError(res, 'Business branch not found or inactive', 400);
    }

    const payload = {
      ...req.body,
      business_Branch_id,
      created_by: req.userIdNumber || null
    };

    const record = await SEOManagement.create(payload);
    const populated = await populateSEO(record);

    sendSuccess(res, populated, 'SEO management record created successfully', 201);
  } catch (error) {
    console.error('Error creating SEO management record', { error: error.message });
    throw error;
  }
});

const getAllSEOManagements = asyncHandler(async (req, res) => {
  try {
    await listSEORecords({
      query: req.query,
      res,
      successMessage: 'SEO management records retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving SEO management records', { error: error.message });
    throw error;
  }
});

const getSEOManagementById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const record = await findSEOByIdentifier(id);

    if (!record) {
      return sendNotFound(res, 'SEO management record not found');
    }

    sendSuccess(res, record, 'SEO management record retrieved successfully');
  } catch (error) {
    console.error('Error retrieving SEO management record', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateSEOManagement = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Business branch not found or inactive', 400);
      }
    }

    let record;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await SEOManagement.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid SEO management ID format', 400);
      }
      record = await SEOManagement.findOneAndUpdate(
        { SEO_Management_id: numericId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!record) {
      return sendNotFound(res, 'SEO management record not found');
    }

    const populated = await populateSEO(record);
    sendSuccess(res, populated, 'SEO management record updated successfully');
  } catch (error) {
    console.error('Error updating SEO management record', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteSEOManagement = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let record;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await SEOManagement.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid SEO management ID format', 400);
      }
      record = await SEOManagement.findOneAndUpdate(
        { SEO_Management_id: numericId },
        updateData,
        { new: true }
      );
    }

    if (!record) {
      return sendNotFound(res, 'SEO management record not found');
    }

    sendSuccess(res, record, 'SEO management record deleted successfully');
  } catch (error) {
    console.error('Error deleting SEO management record', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getSEOManagementsByAuth = asyncHandler(async (req, res) => {
  try {
    await listSEORecords({
      query: req.query,
      res,
      successMessage: 'SEO management records retrieved successfully',
      filterOverrides: { created_by: req.userIdNumber }
    });
  } catch (error) {
    console.error('Error retrieving SEO management records by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getSEOManagementsByBranchId = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.params;
    const numericBranch = parseInt(business_Branch_id, 10);

    if (Number.isNaN(numericBranch)) {
      return sendError(res, 'Invalid business branch ID format', 400);
    }

    const branchExists = await ensureBusinessBranchExists(numericBranch);
    if (!branchExists) {
      return sendNotFound(res, 'Business branch not found');
    }

    await listSEORecords({
      query: req.query,
      res,
      successMessage: 'SEO management records retrieved successfully',
      filterOverrides: { business_Branch_id: numericBranch }
    });
  } catch (error) {
    console.error('Error retrieving SEO management records by branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createSEOManagement,
  getAllSEOManagements,
  getSEOManagementById,
  updateSEOManagement,
  deleteSEOManagement,
  getSEOManagementsByAuth,
  getSEOManagementsByBranchId
};

