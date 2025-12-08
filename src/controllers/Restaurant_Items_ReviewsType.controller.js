const ReviewsType = require('../models/Restaurant_Items_ReviewsType.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateReviewsType = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
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

const buildFilter = ({ search, status }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { ReviewsType: { $regex: search, $options: 'i' } }
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
    return populateReviewsType(ReviewsType.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateReviewsType(ReviewsType.findOne({ Restaurant_Items_ReviewsType_id: numericId }));
  }

  return null;
};

const createReviewsType = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const reviewsType = await ReviewsType.create(payload);
    const populated = await populateReviewsType(reviewsType);

    sendSuccess(res, populated, 'Restaurant items reviews type created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant items reviews type', { error: error.message });
    throw error;
  }
});

const getAllReviewsTypes = asyncHandler(async (req, res) => {
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

    const [itemsData, total] = await Promise.all([
      ReviewsType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ReviewsType.countDocuments(filter)
    ]);
    
    const items = await populateReviewsType(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant items reviews types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant items reviews types', { error: error.message });
    throw error;
  }
});

const getReviewsTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const reviewsType = await findByIdentifier(id);

    if (!reviewsType) {
      return sendNotFound(res, 'Restaurant items reviews type not found');
    }

    sendSuccess(res, reviewsType, 'Restaurant items reviews type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant items reviews type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateReviewsType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let reviewsType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reviewsType = await ReviewsType.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid review type ID format', 400);
      }
      reviewsType = await ReviewsType.findOneAndUpdate({ Restaurant_Items_ReviewsType_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!reviewsType) {
      return sendNotFound(res, 'Restaurant items reviews type not found');
    }

    const populated = await populateReviewsType(reviewsType);
    sendSuccess(res, populated, 'Restaurant items reviews type updated successfully');
  } catch (error) {
    console.error('Error updating restaurant items reviews type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteReviewsType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let reviewsType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reviewsType = await ReviewsType.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid review type ID format', 400);
      }
      reviewsType = await ReviewsType.findOneAndUpdate({ Restaurant_Items_ReviewsType_id: numericId }, updatePayload, { new: true });
    }

    if (!reviewsType) {
      return sendNotFound(res, 'Restaurant items reviews type not found');
    }

    sendSuccess(res, reviewsType, 'Restaurant items reviews type deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant items reviews type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getReviewsTypesByAuth = asyncHandler(async (req, res) => {
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

    const [itemsData, total] = await Promise.all([
      ReviewsType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ReviewsType.countDocuments(filter)
    ]);
    
    const items = await populateReviewsType(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant items reviews types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant items reviews types by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createReviewsType,
  getAllReviewsTypes,
  getReviewsTypeById,
  updateReviewsType,
  deleteReviewsType,
  getReviewsTypesByAuth
};


