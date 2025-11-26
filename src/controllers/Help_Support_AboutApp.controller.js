const HelpSupportAboutApp = require('../models/Help_Support_AboutApp.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateHelpSupportAboutApp = (query) => query
  .populate('Branch_Id', 'business_Branch_id firstName lastName BusinessName Address City state country')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, Branch_Id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { aboutus: { $regex: search, $options: 'i' } }
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

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateHelpSupportAboutApp(HelpSupportAboutApp.findById(identifier));
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateHelpSupportAboutApp(HelpSupportAboutApp.findOne({ Help_Support_AboutApp_id: numericId }));
  }
  return null;
};

const createHelpSupportAboutApp = asyncHandler(async (req, res) => {
  try {
    const { Branch_Id } = req.body;
    if (!(await ensureBranchExists(Branch_Id))) {
      return sendError(res, 'Business branch not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const aboutApp = await HelpSupportAboutApp.create(payload);
    const populated = await populateHelpSupportAboutApp(HelpSupportAboutApp.findById(aboutApp._id));
    sendSuccess(res, populated, 'Help support about app created successfully', 201);
  } catch (error) {
    console.error('Error creating help support about app', { error: error.message });
    throw error;
  }
});

const getAllHelpSupportAboutApps = asyncHandler(async (req, res) => {
  try {
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
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [aboutApps, total] = await Promise.all([
      populateHelpSupportAboutApp(HelpSupportAboutApp.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportAboutApp.countDocuments(filter)
    ]);
    sendPaginated(res, aboutApps, paginateMeta(numericPage, numericLimit, total), 'Help support about apps retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support about apps', { error: error.message });
    throw error;
  }
});

const getHelpSupportAboutAppById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const aboutAppQuery = findByIdentifier(id);
    if (!aboutAppQuery) {
      return sendError(res, 'Invalid help support about app identifier', 400);
    }
    const aboutApp = await aboutAppQuery;
    if (!aboutApp) {
      return sendNotFound(res, 'Help support about app not found');
    }
    sendSuccess(res, aboutApp, 'Help support about app retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support about app', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateHelpSupportAboutApp = asyncHandler(async (req, res) => {
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
    let aboutApp;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      aboutApp = await HelpSupportAboutApp.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid help support about app ID format', 400);
      }
      aboutApp = await HelpSupportAboutApp.findOneAndUpdate({ Help_Support_AboutApp_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!aboutApp) {
      return sendNotFound(res, 'Help support about app not found');
    }
    const populated = await populateHelpSupportAboutApp(HelpSupportAboutApp.findById(aboutApp._id));
    sendSuccess(res, populated, 'Help support about app updated successfully');
  } catch (error) {
    console.error('Error updating help support about app', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteHelpSupportAboutApp = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let aboutApp;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      aboutApp = await HelpSupportAboutApp.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid help support about app ID format', 400);
      }
      aboutApp = await HelpSupportAboutApp.findOneAndUpdate({ Help_Support_AboutApp_id: numericId }, updatePayload, { new: true });
    }
    if (!aboutApp) {
      return sendNotFound(res, 'Help support about app not found');
    }
    sendSuccess(res, aboutApp, 'Help support about app deleted successfully');
  } catch (error) {
    console.error('Error deleting help support about app', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getHelpSupportAboutAppsByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_Id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
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
    const filter = buildFilter({ search, status });
    filter.Branch_Id = branchId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [aboutApps, total] = await Promise.all([
      populateHelpSupportAboutApp(HelpSupportAboutApp.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportAboutApp.countDocuments(filter)
    ]);
    sendPaginated(res, aboutApps, paginateMeta(numericPage, numericLimit, total), 'Help support about apps retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support about apps by branch', { error: error.message, Branch_Id: req.params.Branch_Id });
    throw error;
  }
});

const getHelpSupportAboutAppsByAuth = asyncHandler(async (req, res) => {
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
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Branch_Id });
    filter.created_by = userId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [aboutApps, total] = await Promise.all([
      populateHelpSupportAboutApp(HelpSupportAboutApp.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportAboutApp.countDocuments(filter)
    ]);
    sendPaginated(res, aboutApps, paginateMeta(numericPage, numericLimit, total), 'Help support about apps retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support about apps by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createHelpSupportAboutApp,
  getAllHelpSupportAboutApps,
  getHelpSupportAboutAppById,
  updateHelpSupportAboutApp,
  deleteHelpSupportAboutApp,
  getHelpSupportAboutAppsByBranchId,
  getHelpSupportAboutAppsByAuth
};

