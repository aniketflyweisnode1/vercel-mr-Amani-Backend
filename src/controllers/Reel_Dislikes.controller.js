const Reel_Dislikes = require('../models/Reel_Dislikes.model');
const Reel = require('../models/Reel.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population for Number refs (Real_Post_id, DislikesBy, created_by, updated_by)
const populateReelDislikes = async (records) => {
  if (!records) return records;

  const recordsArray = Array.isArray(records) ? records : [records];

  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;

      const recordObj = record.toObject ? record.toObject() : record;

      // Populate Real_Post_id -> Reel by numeric Real_Post_id
      if (recordObj.Real_Post_id) {
        const reelId =
          typeof recordObj.Real_Post_id === 'object'
            ? recordObj.Real_Post_id.Real_Post_id || recordObj.Real_Post_id
            : recordObj.Real_Post_id;

        const reel = await Reel.findOne({ Real_Post_id: reelId, Status: true })
          .select('Real_Post_id title Discription image VideoUrl');

        if (reel) {
          recordObj.Real_Post_id = reel.toObject ? reel.toObject() : reel;
        }
      }

      // Populate DislikesBy -> User by numeric user_id
      if (recordObj.DislikesBy) {
        const userId =
          typeof recordObj.DislikesBy === 'object'
            ? recordObj.DislikesBy.user_id || recordObj.DislikesBy
            : recordObj.DislikesBy;

        const user = await User.findOne({ user_id: userId })
          .select('user_id firstName lastName phoneNo email BusinessName');

        if (user) {
          recordObj.DislikesBy = user.toObject ? user.toObject() : user;
        }
      }

      // Populate created_by -> User
      if (recordObj.created_by) {
        const createdById =
          typeof recordObj.created_by === 'object'
            ? recordObj.created_by.user_id || recordObj.created_by
            : recordObj.created_by;

        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');

        if (createdBy) {
          recordObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }

      // Populate updated_by -> User
      if (recordObj.updated_by) {
        const updatedById =
          typeof recordObj.updated_by === 'object'
            ? recordObj.updated_by.user_id || recordObj.updated_by
            : recordObj.updated_by;

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

const buildFilter = ({ search, status, Real_Post_id, DislikesBy }) => {
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

  if (DislikesBy !== undefined) {
    const userId = parseInt(DislikesBy, 10);
    if (!Number.isNaN(userId)) {
      filter.DislikesBy = userId;
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

const ensureUserExists = async (DislikesBy) => {
  if (DislikesBy === undefined) {
    return true;
  }
  const userId = parseInt(DislikesBy, 10);
  if (Number.isNaN(userId)) {
    return false;
  }
  const user = await User.findOne({ user_id: userId });
  return Boolean(user);
};

const findByIdentifier = async (identifier) => {
  let reelDislikes;

  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    reelDislikes = await Reel_Dislikes.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      reelDislikes = await Reel_Dislikes.findOne({ Reel_Dislikes_id: numericId });
    }
  }

  if (!reelDislikes) return null;
  return reelDislikes;
};

const createReelDislikes = asyncHandler(async (req, res) => {
  try {
    const { Real_Post_id, DislikesBy } = req.body;

    const [reelExists, userExists] = await Promise.all([
      ensureReelExists(Real_Post_id),
      ensureUserExists(DislikesBy)
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

    const reelDislikes = await Reel_Dislikes.create(payload);
    const populated = await populateReelDislikes(reelDislikes);

    sendSuccess(res, populated, 'Reel dislikes created successfully', 201);
  } catch (error) {
    console.error('Error creating reel dislikes', { error: error.message });
    throw error;
  }
});

const getAllReelDislikes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Real_Post_id,
      DislikesBy,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Real_Post_id, DislikesBy });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reelDislikesRaw, total] = await Promise.all([
      Reel_Dislikes.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reel_Dislikes.countDocuments(filter)
    ]);

    const reelDislikes = await populateReelDislikes(reelDislikesRaw);

    sendPaginated(res, reelDislikes, paginateMeta(numericPage, numericLimit, total), 'Reel dislikes retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel dislikes', { error: error.message });
    throw error;
  }
});

const getReelDislikesById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const reelDislikes = await findByIdentifier(id);

    if (!reelDislikes) {
      return sendNotFound(res, 'Reel dislikes not found');
    }

    const populated = await populateReelDislikes(reelDislikes);

    sendSuccess(res, populated, 'Reel dislikes retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel dislikes', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateReelDislikes = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Real_Post_id, DislikesBy } = req.body;

    const [reelExists, userExists] = await Promise.all([
      ensureReelExists(Real_Post_id),
      ensureUserExists(DislikesBy)
    ]);

    if (Real_Post_id !== undefined && !reelExists) {
      return sendError(res, 'Reel not found', 400);
    }
    if (DislikesBy !== undefined && !userExists) {
      return sendError(res, 'User not found', 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let reelDislikes;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reelDislikes = await Reel_Dislikes.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid reel dislikes ID format', 400);
      }
      reelDislikes = await Reel_Dislikes.findOneAndUpdate({ Reel_Dislikes_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!reelDislikes) {
      return sendNotFound(res, 'Reel dislikes not found');
    }

    const populated = await populateReelDislikes(reelDislikes);
    sendSuccess(res, populated, 'Reel dislikes updated successfully');
  } catch (error) {
    console.error('Error updating reel dislikes', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteReelDislikes = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let reelDislikes;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reelDislikes = await Reel_Dislikes.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid reel dislikes ID format', 400);
      }
      reelDislikes = await Reel_Dislikes.findOneAndUpdate({ Reel_Dislikes_id: numericId }, updatePayload, { new: true });
    }

    if (!reelDislikes) {
      return sendNotFound(res, 'Reel dislikes not found');
    }

    sendSuccess(res, reelDislikes, 'Reel dislikes deleted successfully');
  } catch (error) {
    console.error('Error deleting reel dislikes', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getReelDislikesByAuth = asyncHandler(async (req, res) => {
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
      DislikesBy,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Real_Post_id, DislikesBy });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reelDislikesRaw, total] = await Promise.all([
      Reel_Dislikes.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reel_Dislikes.countDocuments(filter)
    ]);

    const reelDislikes = await populateReelDislikes(reelDislikesRaw);

    sendPaginated(res, reelDislikes, paginateMeta(numericPage, numericLimit, total), 'Reel dislikes retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel dislikes by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getReelDislikesByReelId = asyncHandler(async (req, res) => {
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
      DislikesBy,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, DislikesBy });
    filter.Real_Post_id = reelIdNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reelDislikesRaw, total] = await Promise.all([
      Reel_Dislikes.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reel_Dislikes.countDocuments(filter)
    ]);

    const reelDislikes = await populateReelDislikes(reelDislikesRaw);

    sendPaginated(res, reelDislikes, paginateMeta(numericPage, numericLimit, total), 'Reel dislikes retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel dislikes by reel ID', { error: error.message, reelId: req.params.reelId });
    throw error;
  }
});

module.exports = {
  createReelDislikes,
  getAllReelDislikes,
  getReelDislikesById,
  updateReelDislikes,
  deleteReelDislikes,
  getReelDislikesByAuth,
  getReelDislikesByReelId
};

