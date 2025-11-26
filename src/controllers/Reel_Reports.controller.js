const Reel_Reports = require('../models/Reel_Reports.model');
const Reel = require('../models/Reel.model');
const User = require('../models/user.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateReelReports = (query) => query
  .populate('Real_Post_id', 'Real_Post_id title Discription image VideoUrl')
  .populate('ReportBy', 'firstName lastName phoneNo email')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, Real_Post_id, ReportBy }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Real_Post_id !== undefined) {
    const reelId = parseInt(Real_Post_id, 10);
    if (!Number.isNaN(reelId)) {
      filter.Real_Post_id = reelId;
    }
  }

  if (ReportBy !== undefined) {
    const userId = parseInt(ReportBy, 10);
    if (!Number.isNaN(userId)) {
      filter.ReportBy = userId;
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

const ensureReelExists = async (Real_Post_id) => {
  if (Real_Post_id === undefined) {
    return true;
  }
  const reelId = parseInt(Real_Post_id, 10);
  if (Number.isNaN(reelId)) {
    return false;
  }
  const reel = await Reel.findOne({ Real_Post_id: reelId, Status: true });
  return Boolean(reel);
};

const ensureUserExists = async (ReportBy) => {
  if (ReportBy === undefined) {
    return true;
  }
  const userId = parseInt(ReportBy, 10);
  if (Number.isNaN(userId)) {
    return false;
  }
  const user = await User.findOne({ user_id: userId, Status: true });
  return Boolean(user);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateReelReports(Reel_Reports.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateReelReports(Reel_Reports.findOne({ Reel_Reports_id: numericId }));
  }

  return null;
};

const createReelReports = asyncHandler(async (req, res) => {
  try {
    const { Real_Post_id, ReportBy } = req.body;

    const [reelExists, userExists] = await Promise.all([
      ensureReelExists(Real_Post_id),
      ensureUserExists(ReportBy)
    ]);

    if (!reelExists) {
      return sendError(res, 'Reel not found', 400);
    }
    if (!userExists) {
      return sendError(res, 'User not found', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const reelReports = await Reel_Reports.create(payload);
    const populated = await populateReelReports(Reel_Reports.findById(reelReports._id));

    sendSuccess(res, populated, 'Reel reports created successfully', 201);
  } catch (error) {
    console.error('Error creating reel reports', { error: error.message });
    throw error;
  }
});

const getAllReelReports = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Real_Post_id,
      ReportBy,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Real_Post_id, ReportBy });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reelReports, total] = await Promise.all([
      populateReelReports(Reel_Reports.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reel_Reports.countDocuments(filter)
    ]);

    sendPaginated(res, reelReports, paginateMeta(numericPage, numericLimit, total), 'Reel reports retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel reports', { error: error.message });
    throw error;
  }
});

const getReelReportsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const reelReportsQuery = findByIdentifier(id);

    if (!reelReportsQuery) {
      return sendError(res, 'Invalid reel reports identifier', 400);
    }

    const reelReports = await reelReportsQuery;

    if (!reelReports) {
      return sendNotFound(res, 'Reel reports not found');
    }

    sendSuccess(res, reelReports, 'Reel reports retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel reports', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateReelReports = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Real_Post_id, ReportBy } = req.body;

    const [reelExists, userExists] = await Promise.all([
      ensureReelExists(Real_Post_id),
      ensureUserExists(ReportBy)
    ]);

    if (Real_Post_id !== undefined && !reelExists) {
      return sendError(res, 'Reel not found', 400);
    }
    if (ReportBy !== undefined && !userExists) {
      return sendError(res, 'User not found', 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let reelReports;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reelReports = await Reel_Reports.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid reel reports ID format', 400);
      }
      reelReports = await Reel_Reports.findOneAndUpdate({ Reel_Reports_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!reelReports) {
      return sendNotFound(res, 'Reel reports not found');
    }

    const populated = await populateReelReports(Reel_Reports.findById(reelReports._id));
    sendSuccess(res, populated, 'Reel reports updated successfully');
  } catch (error) {
    console.error('Error updating reel reports', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteReelReports = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let reelReports;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reelReports = await Reel_Reports.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid reel reports ID format', 400);
      }
      reelReports = await Reel_Reports.findOneAndUpdate({ Reel_Reports_id: numericId }, updatePayload, { new: true });
    }

    if (!reelReports) {
      return sendNotFound(res, 'Reel reports not found');
    }

    sendSuccess(res, reelReports, 'Reel reports deleted successfully');
  } catch (error) {
    console.error('Error deleting reel reports', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getReelReportsByAuth = asyncHandler(async (req, res) => {
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
      Real_Post_id,
      ReportBy,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Real_Post_id, ReportBy });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reelReports, total] = await Promise.all([
      populateReelReports(Reel_Reports.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reel_Reports.countDocuments(filter)
    ]);

    sendPaginated(res, reelReports, paginateMeta(numericPage, numericLimit, total), 'Reel reports retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel reports by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getReelReportsByReelId = asyncHandler(async (req, res) => {
  try {
    const { reelId } = req.params;
    const reelIdNum = parseInt(reelId, 10);

    if (Number.isNaN(reelIdNum)) {
      return sendError(res, 'Invalid reel ID format', 400);
    }

    if (!(await ensureReelExists(reelIdNum))) {
      return sendNotFound(res, 'Reel not found');
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      ReportBy,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, ReportBy });
    filter.Real_Post_id = reelIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reelReports, total] = await Promise.all([
      populateReelReports(Reel_Reports.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reel_Reports.countDocuments(filter)
    ]);

    sendPaginated(res, reelReports, paginateMeta(numericPage, numericLimit, total), 'Reel reports retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel reports by reel ID', { error: error.message, reelId: req.params.reelId });
    throw error;
  }
});

module.exports = {
  createReelReports,
  getAllReelReports,
  getReelReportsById,
  updateReelReports,
  deleteReelReports,
  getReelReportsByAuth,
  getReelReportsByReelId
};

