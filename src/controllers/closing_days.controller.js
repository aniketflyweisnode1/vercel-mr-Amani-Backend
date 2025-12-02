const Closing_Days = require('../models/closing_days.model');
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

const buildFilterFromQuery = ({ search, status, Branch_id, dateFrom, datedTo }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } }
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

  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    if (!isNaN(fromDate.getTime())) {
      filter.dateFrom = { $gte: fromDate };
    }
  }

  if (datedTo) {
    const toDate = new Date(datedTo);
    if (!isNaN(toDate.getTime())) {
      filter.datedTo = { $lte: toDate };
    }
  }

  return filter;
};

// Manual population function for Number refs
const populateClosingDays = async (closingDays) => {
  const closingDaysArray = Array.isArray(closingDays) ? closingDays : [closingDays];
  const populatedClosingDays = await Promise.all(
    closingDaysArray.map(async (cd) => {
      if (!cd) return null;
      
      const cdObj = cd.toObject ? cd.toObject() : cd;
      
      // Populate Branch_id
      if (cdObj.Branch_id) {
        const branch = await Business_Branch.findOne({ business_Branch_id: cdObj.Branch_id })
          .select('business_Branch_id firstName lastName Address');
        if (branch) {
          cdObj.Branch_id = branch.toObject ? branch.toObject() : branch;
        }
      }
      
      // Populate created_by
      if (cdObj.created_by) {
        const createdById = typeof cdObj.created_by === 'object' ? cdObj.created_by : cdObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          cdObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (cdObj.updated_by) {
        const updatedById = typeof cdObj.updated_by === 'object' ? cdObj.updated_by : cdObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          cdObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return cdObj;
    })
  );
  
  return Array.isArray(closingDays) ? populatedClosingDays : populatedClosingDays[0];
};

const createClosingDays = asyncHandler(async (req, res) => {
  try {
    const { Branch_id, dateFrom, datedTo } = req.body;

    // Validate branch exists
    const branchExists = await ensureBusinessBranchExists(Branch_id);
    if (!branchExists) {
      return sendError(res, 'Associated business branch not found or inactive', 400);
    }

    // Validate date range
    if (dateFrom && datedTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(datedTo);
      if (fromDate > toDate) {
        return sendError(res, 'Date from must be before or equal to date to', 400);
      }
    }

    const payload = {
      ...req.body,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      datedTo: datedTo ? new Date(datedTo) : undefined,
      created_by: req.userIdNumber || null
    };

    const closingDays = await Closing_Days.create(payload);
    console.info('Closing days created successfully', { id: closingDays._id, closing_days_id: closingDays.closing_days_id });

    const populated = await populateClosingDays(closingDays);
    sendSuccess(res, populated, 'Closing days created successfully', 201);
  } catch (error) {
    console.error('Error creating closing days', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllClosingDays = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, Branch_id, dateFrom, datedTo, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = buildFilterFromQuery({ search, status, Branch_id, dateFrom, datedTo });

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [closingDays, total] = await Promise.all([
      Closing_Days.find(filter).sort(sort).skip(skip).limit(limitNum),
      Closing_Days.countDocuments(filter)
    ]);

    const populatedClosingDays = await populateClosingDays(closingDays);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Closing days retrieved successfully', { count: populatedClosingDays.length, total });
    sendPaginated(res, populatedClosingDays, paginationMeta, 'Closing days retrieved successfully');
  } catch (error) {
    console.error('Error retrieving closing days', { error: error.message });
    throw error;
  }
});

const getClosingDaysById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = Closing_Days.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid closing days ID format', 400);
      }
      query = Closing_Days.findOne({ closing_days_id: numId });
    }

    const closingDays = await query;

    if (!closingDays) {
      return sendNotFound(res, 'Closing days not found');
    }

    const populatedClosingDays = await populateClosingDays(closingDays);

    console.info('Closing days retrieved successfully', { id: closingDays._id });
    sendSuccess(res, populatedClosingDays, 'Closing days retrieved successfully');
  } catch (error) {
    console.error('Error retrieving closing days', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateClosingDays = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Branch_id, dateFrom, datedTo } = req.body;

    // Validate branch exists if being updated
    if (Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(Branch_id);
      if (!branchExists) {
        return sendError(res, 'Associated business branch not found or inactive', 400);
      }
    }

    // Validate date range if both dates are provided
    if (dateFrom && datedTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(datedTo);
      if (fromDate > toDate) {
        return sendError(res, 'Date from must be before or equal to date to', 400);
      }
    }

    const updateData = { ...req.body };
    if (dateFrom) {
      updateData.dateFrom = new Date(dateFrom);
    }
    if (datedTo) {
      updateData.datedTo = new Date(datedTo);
    }
    updateData.updated_by = req.userIdNumber || null;
    updateData.updated_at = new Date();

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = Closing_Days.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid closing days ID format', 400);
      }
      query = Closing_Days.findOneAndUpdate(
        { closing_days_id: numId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    const closingDays = await query;

    if (!closingDays) {
      return sendNotFound(res, 'Closing days not found');
    }

    const populatedClosingDays = await populateClosingDays(closingDays);

    console.info('Closing days updated successfully', { id: closingDays._id });
    sendSuccess(res, populatedClosingDays, 'Closing days updated successfully');
  } catch (error) {
    console.error('Error updating closing days', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteClosingDays = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = Closing_Days.findByIdAndUpdate(
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
        return sendError(res, 'Invalid closing days ID format', 400);
      }
      query = Closing_Days.findOneAndUpdate(
        { closing_days_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    const closingDays = await query;

    if (!closingDays) {
      return sendNotFound(res, 'Closing days not found');
    }

    console.info('Closing days deleted successfully', { id: closingDays._id });
    sendSuccess(res, closingDays, 'Closing days deleted successfully');
  } catch (error) {
    console.error('Error deleting closing days', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getClosingDaysByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, Branch_id, dateFrom, datedTo, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

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

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (!isNaN(fromDate.getTime())) {
        filter.dateFrom = { $gte: fromDate };
      }
    }

    if (datedTo) {
      const toDate = new Date(datedTo);
      if (!isNaN(toDate.getTime())) {
        filter.datedTo = { $lte: toDate };
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [closingDays, total] = await Promise.all([
      Closing_Days.find(filter).sort(sort).skip(skip).limit(limitNum),
      Closing_Days.countDocuments(filter)
    ]);

    const populatedClosingDays = await populateClosingDays(closingDays);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Closing days retrieved by auth successfully', { count: populatedClosingDays.length, total });
    sendPaginated(res, populatedClosingDays, paginationMeta, 'Closing days retrieved successfully');
  } catch (error) {
    console.error('Error retrieving closing days by auth', { error: error.message });
    throw error;
  }
});

const getClosingDaysByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.params;
    const { page = 1, limit = 10, search, status, dateFrom, datedTo, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const branchIdNum = parseInt(Branch_id, 10);
    if (isNaN(branchIdNum)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }

    const filter = { Branch_id: branchIdNum };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (!isNaN(fromDate.getTime())) {
        filter.dateFrom = { $gte: fromDate };
      }
    }

    if (datedTo) {
      const toDate = new Date(datedTo);
      if (!isNaN(toDate.getTime())) {
        filter.datedTo = { $lte: toDate };
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [closingDays, total] = await Promise.all([
      Closing_Days.find(filter).sort(sort).skip(skip).limit(limitNum),
      Closing_Days.countDocuments(filter)
    ]);

    const populatedClosingDays = await populateClosingDays(closingDays);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Closing days retrieved by branch ID successfully', { count: populatedClosingDays.length, total, Branch_id: branchIdNum });
    sendPaginated(res, populatedClosingDays, paginationMeta, 'Closing days retrieved successfully');
  } catch (error) {
    console.error('Error retrieving closing days by branch ID', { error: error.message, Branch_id: req.params.Branch_id });
    throw error;
  }
});

module.exports = {
  createClosingDays,
  getAllClosingDays,
  getClosingDaysById,
  updateClosingDays,
  deleteClosingDays,
  getClosingDaysByAuth,
  getClosingDaysByBranchId
};

