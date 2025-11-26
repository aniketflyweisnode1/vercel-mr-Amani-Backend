const HelpSupportReportAnIssue = require('../models/Help_Support_ReportAnIssue.model');
const Business_Branch = require('../models/business_Branch.model');
const Issue_Type = require('../models/Issue_Type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateHelpSupportReportAnIssue = (query) => query
  .populate('Branch_Id', 'business_Branch_id firstName lastName BusinessName Address City state country')
  .populate('Issue_type_id', 'Issue_Type_id Issue_type Description')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, Branch_Id, Issue_type_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Description: { $regex: search, $options: 'i' } }
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

  if (Issue_type_id !== undefined) {
    const issueTypeId = parseInt(Issue_type_id, 10);
    if (!Number.isNaN(issueTypeId)) {
      filter.Issue_type_id = issueTypeId;
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

const ensureIssueTypeExists = async (Issue_type_id) => {
  if (Issue_type_id === undefined) {
    return true;
  }
  const issueTypeId = parseInt(Issue_type_id, 10);
  if (Number.isNaN(issueTypeId)) {
    return false;
  }
  const issueType = await Issue_Type.findOne({ Issue_Type_id: issueTypeId, Status: true });
  return Boolean(issueType);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateHelpSupportReportAnIssue(HelpSupportReportAnIssue.findById(identifier));
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateHelpSupportReportAnIssue(HelpSupportReportAnIssue.findOne({ Help_Support_ReportAnIssue_id: numericId }));
  }
  return null;
};

const createHelpSupportReportAnIssue = asyncHandler(async (req, res) => {
  try {
    const { Branch_Id, Issue_type_id } = req.body;
    if (!(await ensureBranchExists(Branch_Id))) {
      return sendError(res, 'Business branch not found', 400);
    }
    if (!(await ensureIssueTypeExists(Issue_type_id))) {
      return sendError(res, 'Issue type not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const report = await HelpSupportReportAnIssue.create(payload);
    const populated = await populateHelpSupportReportAnIssue(HelpSupportReportAnIssue.findById(report._id));
    sendSuccess(res, populated, 'Help support report an issue created successfully', 201);
  } catch (error) {
    console.error('Error creating help support report an issue', { error: error.message });
    throw error;
  }
});

const getAllHelpSupportReportAnIssues = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Branch_Id,
      Issue_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Branch_Id, Issue_type_id });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [reports, total] = await Promise.all([
      populateHelpSupportReportAnIssue(HelpSupportReportAnIssue.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportReportAnIssue.countDocuments(filter)
    ]);
    sendPaginated(res, reports, paginateMeta(numericPage, numericLimit, total), 'Help support report an issues retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support report an issues', { error: error.message });
    throw error;
  }
});

const getHelpSupportReportAnIssueById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const reportQuery = findByIdentifier(id);
    if (!reportQuery) {
      return sendError(res, 'Invalid help support report an issue identifier', 400);
    }
    const report = await reportQuery;
    if (!report) {
      return sendNotFound(res, 'Help support report an issue not found');
    }
    sendSuccess(res, report, 'Help support report an issue retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support report an issue', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateHelpSupportReportAnIssue = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Branch_Id, Issue_type_id } = req.body;
    if (Branch_Id !== undefined && !(await ensureBranchExists(Branch_Id))) {
      return sendError(res, 'Business branch not found', 400);
    }
    if (Issue_type_id !== undefined && !(await ensureIssueTypeExists(Issue_type_id))) {
      return sendError(res, 'Issue type not found', 400);
    }
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let report;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      report = await HelpSupportReportAnIssue.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid help support report an issue ID format', 400);
      }
      report = await HelpSupportReportAnIssue.findOneAndUpdate({ Help_Support_ReportAnIssue_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!report) {
      return sendNotFound(res, 'Help support report an issue not found');
    }
    const populated = await populateHelpSupportReportAnIssue(HelpSupportReportAnIssue.findById(report._id));
    sendSuccess(res, populated, 'Help support report an issue updated successfully');
  } catch (error) {
    console.error('Error updating help support report an issue', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteHelpSupportReportAnIssue = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let report;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      report = await HelpSupportReportAnIssue.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid help support report an issue ID format', 400);
      }
      report = await HelpSupportReportAnIssue.findOneAndUpdate({ Help_Support_ReportAnIssue_id: numericId }, updatePayload, { new: true });
    }
    if (!report) {
      return sendNotFound(res, 'Help support report an issue not found');
    }
    sendSuccess(res, report, 'Help support report an issue deleted successfully');
  } catch (error) {
    console.error('Error deleting help support report an issue', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getHelpSupportReportAnIssuesByIssueTypeId = asyncHandler(async (req, res) => {
  try {
    const { Issue_type_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Branch_Id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const issueTypeId = parseInt(Issue_type_id, 10);
    if (Number.isNaN(issueTypeId)) {
      return sendError(res, 'Invalid issue type ID format', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Branch_Id });
    filter.Issue_type_id = issueTypeId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [reports, total] = await Promise.all([
      populateHelpSupportReportAnIssue(HelpSupportReportAnIssue.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportReportAnIssue.countDocuments(filter)
    ]);
    sendPaginated(res, reports, paginateMeta(numericPage, numericLimit, total), 'Help support report an issues retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support report an issues by issue type', { error: error.message, Issue_type_id: req.params.Issue_type_id });
    throw error;
  }
});

const getHelpSupportReportAnIssuesByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_Id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Issue_type_id,
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
    const filter = buildFilter({ search, status, Issue_type_id });
    filter.Branch_Id = branchId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [reports, total] = await Promise.all([
      populateHelpSupportReportAnIssue(HelpSupportReportAnIssue.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportReportAnIssue.countDocuments(filter)
    ]);
    sendPaginated(res, reports, paginateMeta(numericPage, numericLimit, total), 'Help support report an issues retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support report an issues by branch', { error: error.message, Branch_Id: req.params.Branch_Id });
    throw error;
  }
});

const getHelpSupportReportAnIssuesByAuth = asyncHandler(async (req, res) => {
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
      Issue_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Branch_Id, Issue_type_id });
    filter.created_by = userId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [reports, total] = await Promise.all([
      populateHelpSupportReportAnIssue(HelpSupportReportAnIssue.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportReportAnIssue.countDocuments(filter)
    ]);
    sendPaginated(res, reports, paginateMeta(numericPage, numericLimit, total), 'Help support report an issues retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support report an issues by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createHelpSupportReportAnIssue,
  getAllHelpSupportReportAnIssues,
  getHelpSupportReportAnIssueById,
  updateHelpSupportReportAnIssue,
  deleteHelpSupportReportAnIssue,
  getHelpSupportReportAnIssuesByIssueTypeId,
  getHelpSupportReportAnIssuesByBranchId,
  getHelpSupportReportAnIssuesByAuth
};

