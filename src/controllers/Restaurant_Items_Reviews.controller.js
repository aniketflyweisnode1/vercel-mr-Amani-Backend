const Reviews = require('../models/Restaurant_Items_Reviews.model');
const Business_Branch = require('../models/business_Branch.model');
const ReviewsType = require('../models/Restaurant_Items_ReviewsType.model');
const RestaurantItems = require('../models/Restaurant_Items.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateReviews = (query) => query
  .populate('business_Branch_id', 'business_Branch_id firstName lastName BusinessName Address City state country')
  .populate('Restaurant_Items_ReviewsType_id', 'Restaurant_Items_ReviewsType_id ReviewsType')
  .populate('Restaurant_Items_id', 'Restaurant_Items_id name')
  .populate('User_id', 'firstName lastName phoneNo')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({
  search,
  status,
  business_Branch_id,
  Restaurant_Items_id,
  Restaurant_Items_ReviewsType_id,
  ReviewsStatus,
  User_id
}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (business_Branch_id !== undefined) {
    const branchId = parseInt(business_Branch_id, 10);
    if (!Number.isNaN(branchId)) {
      filter.business_Branch_id = branchId;
    }
  }

  if (Restaurant_Items_id !== undefined) {
    const itemId = parseInt(Restaurant_Items_id, 10);
    if (!Number.isNaN(itemId)) {
      filter.Restaurant_Items_id = itemId;
    }
  }

  if (Restaurant_Items_ReviewsType_id !== undefined) {
    const typeId = parseInt(Restaurant_Items_ReviewsType_id, 10);
    if (!Number.isNaN(typeId)) {
      filter.Restaurant_Items_ReviewsType_id = typeId;
    }
  }

  if (ReviewsStatus) {
    filter.ReviewsStatus = ReviewsStatus;
  }

  if (User_id !== undefined) {
    const userId = parseInt(User_id, 10);
    if (!Number.isNaN(userId)) {
      filter.User_id = userId;
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

const ensureBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined) {
    return true;
  }

  const branchId = parseInt(business_Branch_id, 10);
  if (Number.isNaN(branchId)) {
    return false;
  }

  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return Boolean(branch);
};

const ensureReviewTypeExists = async (Restaurant_Items_ReviewsType_id) => {
  if (Restaurant_Items_ReviewsType_id === undefined) {
    return true;
  }

  const typeId = parseInt(Restaurant_Items_ReviewsType_id, 10);
  if (Number.isNaN(typeId)) {
    return false;
  }

  const type = await ReviewsType.findOne({ Restaurant_Items_ReviewsType_id: typeId, Status: true });
  return Boolean(type);
};

const ensureRestaurantItemExists = async (Restaurant_Items_id) => {
  if (Restaurant_Items_id === undefined) {
    return true;
  }

  const itemId = parseInt(Restaurant_Items_id, 10);
  if (Number.isNaN(itemId)) {
    return false;
  }

  const item = await RestaurantItems.findOne({ Restaurant_Items_id: itemId, Status: true });
  return Boolean(item);
};

const findReviewByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateReviews(Reviews.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateReviews(Reviews.findOne({ Restaurant_Items_Reviews_id: numericId }));
  }

  return null;
};

const validateRating = (rating) => {
  if (rating === undefined || rating === null) {
    return { isValid: true, parsed: undefined };
  }

  const parsed = Number(rating);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 5) {
    return { isValid: false, message: 'Rating must be between 0 and 5' };
  }

  return { isValid: true, parsed };
};

const createReview = asyncHandler(async (req, res) => {
  try {
    const {
      business_Branch_id,
      Restaurant_Items_ReviewsType_id,
      Restaurant_Items_id,
      Reating
    } = req.body;

    const [branchExists, typeExists, itemExists] = await Promise.all([
      ensureBranchExists(business_Branch_id),
      ensureReviewTypeExists(Restaurant_Items_ReviewsType_id),
      ensureRestaurantItemExists(Restaurant_Items_id)
    ]);

    if (!branchExists) {
      return sendError(res, 'Business branch not found', 400);
    }

    if (!typeExists) {
      return sendError(res, 'Restaurant item reviews type not found', 400);
    }

    if (!itemExists) {
      return sendError(res, 'Restaurant item not found', 400);
    }

    const ratingValidation = validateRating(Reating);
    if (!ratingValidation.isValid) {
      return sendError(res, ratingValidation.message, 400);
    }

    const payload = {
      ...req.body,
      Reating: ratingValidation.parsed ?? 0,
      User_id: req.body.User_id ?? req.userIdNumber ?? null,
      created_by: req.userIdNumber || null
    };

    const review = await Reviews.create(payload);
    const populated = await populateReviews(Reviews.findById(review._id));

    sendSuccess(res, populated, 'Restaurant item review created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant item review', { error: error.message });
    throw error;
  }
});

const getAllReviews = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      Restaurant_Items_id,
      Restaurant_Items_ReviewsType_id,
      ReviewsStatus,
      User_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({
      search,
      status,
      business_Branch_id,
      Restaurant_Items_id,
      Restaurant_Items_ReviewsType_id,
      ReviewsStatus,
      User_id
    });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateReviews(Reviews.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reviews.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant item reviews retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item reviews', { error: error.message });
    throw error;
  }
});

const getReviewById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const query = findReviewByIdentifier(id);

    if (!query) {
      return sendError(res, 'Invalid restaurant item review identifier', 400);
    }

    const review = await query;

    if (!review) {
      return sendNotFound(res, 'Restaurant item review not found');
    }

    sendSuccess(res, review, 'Restaurant item review retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item review', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      business_Branch_id,
      Restaurant_Items_ReviewsType_id,
      Restaurant_Items_id,
      Reating
    } = req.body;

    const [branchExists, typeExists, itemExists] = await Promise.all([
      ensureBranchExists(business_Branch_id),
      ensureReviewTypeExists(Restaurant_Items_ReviewsType_id),
      ensureRestaurantItemExists(Restaurant_Items_id)
    ]);

    if (business_Branch_id !== undefined && !branchExists) {
      return sendError(res, 'Business branch not found', 400);
    }

    if (Restaurant_Items_ReviewsType_id !== undefined && !typeExists) {
      return sendError(res, 'Restaurant item reviews type not found', 400);
    }

    if (Restaurant_Items_id !== undefined && !itemExists) {
      return sendError(res, 'Restaurant item not found', 400);
    }

    const ratingValidation = validateRating(Reating);
    if (!ratingValidation.isValid) {
      return sendError(res, ratingValidation.message, 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (ratingValidation.parsed !== undefined) {
      updatePayload.Reating = ratingValidation.parsed;
    }

    let review;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      review = await Reviews.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant item review ID format', 400);
      }
      review = await Reviews.findOneAndUpdate({ Restaurant_Items_Reviews_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!review) {
      return sendNotFound(res, 'Restaurant item review not found');
    }

    const populated = await populateReviews(Reviews.findById(review._id));
    sendSuccess(res, populated, 'Restaurant item review updated successfully');
  } catch (error) {
    console.error('Error updating restaurant item review', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let review;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      review = await Reviews.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant item review ID format', 400);
      }
      review = await Reviews.findOneAndUpdate({ Restaurant_Items_Reviews_id: numericId }, updatePayload, { new: true });
    }

    if (!review) {
      return sendNotFound(res, 'Restaurant item review not found');
    }

    sendSuccess(res, review, 'Restaurant item review deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant item review', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getReviewsByAuth = asyncHandler(async (req, res) => {
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
      business_Branch_id,
      Restaurant_Items_id,
      Restaurant_Items_ReviewsType_id,
      ReviewsStatus,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({
      search,
      status,
      business_Branch_id,
      Restaurant_Items_id,
      Restaurant_Items_ReviewsType_id,
      ReviewsStatus,
      User_id: userId
    });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateReviews(Reviews.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reviews.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant item reviews retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item reviews by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getReviewsByBranchId = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.params;
    const branchId = parseInt(business_Branch_id, 10);

    if (Number.isNaN(branchId)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }

    if (!(await ensureBranchExists(branchId))) {
      return sendNotFound(res, 'Business branch not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id: branchId });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateReviews(Reviews.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reviews.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant item reviews retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item reviews by branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

const getReviewsByStatus = asyncHandler(async (req, res) => {
  try {
    const { ReviewsStatus } = req.params;

    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      Restaurant_Items_id,
      Restaurant_Items_ReviewsType_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({
      search,
      status,
      business_Branch_id,
      Restaurant_Items_id,
      Restaurant_Items_ReviewsType_id,
      ReviewsStatus
    });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateReviews(Reviews.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reviews.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant item reviews retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant item reviews by status', { error: error.message, ReviewsStatus: req.params.ReviewsStatus });
    throw error;
  }
});

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByAuth,
  getReviewsByBranchId,
  getReviewsByStatus
};


