const IssueType = require('../models/Issue_Type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateIssueType = (query) => query
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Issue_type: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
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

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateIssueType(IssueType.findById(identifier));
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateIssueType(IssueType.findOne({ Issue_Type_id: numericId }));
  }
  return null;
};

const createIssueType = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const issueType = await IssueType.create(payload);
    const populated = await populateIssueType(IssueType.findById(issueType._id));
    sendSuccess(res, populated, 'Issue type created successfully', 201);
  } catch (error) {
    console.error('Error creating issue type', { error: error.message });
    throw error;
  }
});

const getAllIssueTypes = asyncHandler(async (req, res) => {
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
    const [issueTypes, total] = await Promise.all([
      populateIssueType(IssueType.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      IssueType.countDocuments(filter)
    ]);
    sendPaginated(res, issueTypes, paginateMeta(numericPage, numericLimit, total), 'Issue types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving issue types', { error: error.message });
    throw error;
  }
});

const getIssueTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const issueTypeQuery = findByIdentifier(id);
    if (!issueTypeQuery) {
      return sendError(res, 'Invalid issue type identifier', 400);
    }
    const issueType = await issueTypeQuery;
    if (!issueType) {
      return sendNotFound(res, 'Issue type not found');
    }
    sendSuccess(res, issueType, 'Issue type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving issue type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateIssueType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let issueType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      issueType = await IssueType.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid issue type ID format', 400);
      }
      issueType = await IssueType.findOneAndUpdate({ Issue_Type_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!issueType) {
      return sendNotFound(res, 'Issue type not found');
    }
    const populated = await populateIssueType(IssueType.findById(issueType._id));
    sendSuccess(res, populated, 'Issue type updated successfully');
  } catch (error) {
    console.error('Error updating issue type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteIssueType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let issueType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      issueType = await IssueType.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid issue type ID format', 400);
      }
      issueType = await IssueType.findOneAndUpdate({ Issue_Type_id: numericId }, updatePayload, { new: true });
    }
    if (!issueType) {
      return sendNotFound(res, 'Issue type not found');
    }
    sendSuccess(res, issueType, 'Issue type deleted successfully');
  } catch (error) {
    console.error('Error deleting issue type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getIssueTypesByAuth = asyncHandler(async (req, res) => {
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
    const [issueTypes, total] = await Promise.all([
      populateIssueType(IssueType.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      IssueType.countDocuments(filter)
    ]);
    sendPaginated(res, issueTypes, paginateMeta(numericPage, numericLimit, total), 'Issue types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving issue types by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createIssueType,
  getAllIssueTypes,
  getIssueTypeById,
  updateIssueType,
  deleteIssueType,
  getIssueTypesByAuth
};

