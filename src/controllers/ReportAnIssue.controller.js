const ReportAnIssue = require('../models/ReportAnIssue.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { generateReferenceIssue } = require('../../utils/helpers');

// Helper function to ensure business branch exists
const ensureBusinessBranchExists = async (Branch_id) => {
  if (Branch_id === undefined || Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: Branch_id, Status: true });
  return !!branch;
};

// Helper function to generate unique reference issue
const generateUniqueReferenceIssue = async () => {
  let referenceIssue;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    referenceIssue = generateReferenceIssue();
    const existing = await ReportAnIssue.findOne({ referenceissue: referenceIssue });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    // Fallback: add timestamp to ensure uniqueness
    referenceIssue = `${generateReferenceIssue()}-${Date.now()}`;
  }

  return referenceIssue;
};

const buildFilterFromQuery = ({ search, status, Branch_id, TypeIssue }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { TypeIssue: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } },
      { referenceissue: { $regex: search, $options: 'i' } }
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

  if (TypeIssue) {
    filter.TypeIssue = { $regex: TypeIssue, $options: 'i' };
  }

  return filter;
};

const populateReportAnIssue = (query) => query
  .populate('Branch_id', 'business_Branch_id firstName lastName Address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const createReportAnIssue = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.body;

    // Validate branch exists
    const branchExists = await ensureBusinessBranchExists(Branch_id);
    if (!branchExists) {
      return sendError(res, 'Associated business branch not found or inactive', 400);
    }

    // Generate unique reference issue
    const referenceissue = await generateUniqueReferenceIssue();

    const payload = {
      ...req.body,
      referenceissue,
      created_by: req.userIdNumber || null
    };

    const reportAnIssue = await ReportAnIssue.create(payload);
    console.info('Report an issue created successfully', { id: reportAnIssue._id, ReportAnIssue_id: reportAnIssue.ReportAnIssue_id, referenceissue: reportAnIssue.referenceissue });

    const populated = await populateReportAnIssue(ReportAnIssue.findById(reportAnIssue._id));
    sendSuccess(res, populated, 'Report an issue created successfully', 201);
  } catch (error) {
    console.error('Error creating report an issue', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllReportAnIssue = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, Branch_id, TypeIssue, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = buildFilterFromQuery({ search, status, Branch_id, TypeIssue });

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reportAnIssue, total] = await Promise.all([
      populateReportAnIssue(ReportAnIssue.find(filter).sort(sort).skip(skip).limit(limitNum)),
      ReportAnIssue.countDocuments(filter)
    ]);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Report an issue retrieved successfully', { count: reportAnIssue.length, total });
    sendPaginated(res, reportAnIssue, paginationMeta, 'Report an issue retrieved successfully');
  } catch (error) {
    console.error('Error retrieving report an issue', { error: error.message });
    throw error;
  }
});

const getReportAnIssueById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = ReportAnIssue.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid report an issue ID format', 400);
      }
      query = ReportAnIssue.findOne({ ReportAnIssue_id: numId });
    }

    const reportAnIssue = await populateReportAnIssue(query);

    if (!reportAnIssue) {
      return sendNotFound(res, 'Report an issue not found');
    }

    console.info('Report an issue retrieved successfully', { id: reportAnIssue._id });
    sendSuccess(res, reportAnIssue, 'Report an issue retrieved successfully');
  } catch (error) {
    console.error('Error retrieving report an issue', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateReportAnIssue = asyncHandler(async (req, res) => {
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

    // Don't allow updating referenceissue
    const updateData = { ...req.body };
    delete updateData.referenceissue;

    updateData.updated_by = req.userIdNumber || null;
    updateData.updated_at = new Date();

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = ReportAnIssue.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid report an issue ID format', 400);
      }
      query = ReportAnIssue.findOneAndUpdate(
        { ReportAnIssue_id: numId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    const reportAnIssue = await populateReportAnIssue(query);

    if (!reportAnIssue) {
      return sendNotFound(res, 'Report an issue not found');
    }

    console.info('Report an issue updated successfully', { id: reportAnIssue._id });
    sendSuccess(res, reportAnIssue, 'Report an issue updated successfully');
  } catch (error) {
    console.error('Error updating report an issue', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteReportAnIssue = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = ReportAnIssue.findByIdAndUpdate(
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
        return sendError(res, 'Invalid report an issue ID format', 400);
      }
      query = ReportAnIssue.findOneAndUpdate(
        { ReportAnIssue_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    const reportAnIssue = await query;

    if (!reportAnIssue) {
      return sendNotFound(res, 'Report an issue not found');
    }

    console.info('Report an issue deleted successfully', { id: reportAnIssue._id });
    sendSuccess(res, reportAnIssue, 'Report an issue deleted successfully');
  } catch (error) {
    console.error('Error deleting report an issue', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getReportAnIssueByType = asyncHandler(async (req, res) => {
  try {
    const { TypeIssue } = req.params;
    const { page = 1, limit = 10, search, status, Branch_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = { TypeIssue: { $regex: TypeIssue, $options: 'i' } };

    if (search) {
      filter.$or = [
        { Description: { $regex: search, $options: 'i' } },
        { referenceissue: { $regex: search, $options: 'i' } }
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

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reportAnIssue, total] = await Promise.all([
      populateReportAnIssue(ReportAnIssue.find(filter).sort(sort).skip(skip).limit(limitNum)),
      ReportAnIssue.countDocuments(filter)
    ]);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Report an issue retrieved by type successfully', { count: reportAnIssue.length, total, TypeIssue });
    sendPaginated(res, reportAnIssue, paginationMeta, 'Report an issue retrieved successfully');
  } catch (error) {
    console.error('Error retrieving report an issue by type', { error: error.message, TypeIssue: req.params.TypeIssue });
    throw error;
  }
});

const getReportAnIssueByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, Branch_id, TypeIssue, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

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

    if (TypeIssue) {
      filter.TypeIssue = { $regex: TypeIssue, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reportAnIssue, total] = await Promise.all([
      populateReportAnIssue(ReportAnIssue.find(filter).sort(sort).skip(skip).limit(limitNum)),
      ReportAnIssue.countDocuments(filter)
    ]);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Report an issue retrieved by auth successfully', { count: reportAnIssue.length, total });
    sendPaginated(res, reportAnIssue, paginationMeta, 'Report an issue retrieved successfully');
  } catch (error) {
    console.error('Error retrieving report an issue by auth', { error: error.message });
    throw error;
  }
});

const getReportAnIssueByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.params;
    const { page = 1, limit = 10, search, status, TypeIssue, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const branchIdNum = parseInt(Branch_id, 10);
    if (isNaN(branchIdNum)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }

    const filter = { Branch_id: branchIdNum };

    if (search) {
      filter.$or = [
        { TypeIssue: { $regex: search, $options: 'i' } },
        { Description: { $regex: search, $options: 'i' } },
        { referenceissue: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (TypeIssue) {
      filter.TypeIssue = { $regex: TypeIssue, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reportAnIssue, total] = await Promise.all([
      populateReportAnIssue(ReportAnIssue.find(filter).sort(sort).skip(skip).limit(limitNum)),
      ReportAnIssue.countDocuments(filter)
    ]);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Report an issue retrieved by branch ID successfully', { count: reportAnIssue.length, total, Branch_id: branchIdNum });
    sendPaginated(res, reportAnIssue, paginationMeta, 'Report an issue retrieved successfully');
  } catch (error) {
    console.error('Error retrieving report an issue by branch ID', { error: error.message, Branch_id: req.params.Branch_id });
    throw error;
  }
});

module.exports = {
  createReportAnIssue,
  getAllReportAnIssue,
  getReportAnIssueById,
  updateReportAnIssue,
  deleteReportAnIssue,
  getReportAnIssueByType,
  getReportAnIssueByAuth,
  getReportAnIssueByBranchId
};

