const Reviews = require('../models/Vendor_Products_Reviews.model');
const VendorStore = require('../models/Vendor_Store.model');
const VendorProducts = require('../models/Vendor_Products.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateReviews = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;

      const recordObj = record.toObject ? record.toObject() : record;

      // Populate Vendor_Store_id
      if (recordObj.Vendor_Store_id) {
        const storeId = typeof recordObj.Vendor_Store_id === 'object' ? recordObj.Vendor_Store_id : recordObj.Vendor_Store_id;
        const store = await VendorStore.findOne({ Vendor_Store_id: storeId })
          .select('Vendor_Store_id StoreName StoreAddress City State Country EmailAddress mobileno');
        if (store) {
          recordObj.Vendor_Store_id = store.toObject ? store.toObject() : store;
        }
      }

      // Populate Vendor_Products_id
      if (recordObj.Vendor_Products_id) {
        const productId = typeof recordObj.Vendor_Products_id === 'object' ? recordObj.Vendor_Products_id : recordObj.Vendor_Products_id;
        const product = await VendorProducts.findOne({ Vendor_Products_id: productId })
          .select('Vendor_Products_id Title price PriceCurrency Category_id Subcategory_id');
        if (product) {
          recordObj.Vendor_Products_id = product.toObject ? product.toObject() : product;
        }
      }

      // Populate User_id
      if (recordObj.User_id) {
        const userId = typeof recordObj.User_id === 'object' ? recordObj.User_id : recordObj.User_id;
        const user = await User.findOne({ user_id: userId })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (user) {
          recordObj.User_id = user.toObject ? user.toObject() : user;
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

const buildFilter = ({ search, status, Vendor_Store_id, Vendor_Products_id, ReviewsStatus, User_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Vendor_Store_id !== undefined) {
    const storeId = parseInt(Vendor_Store_id, 10);
    if (!Number.isNaN(storeId)) {
      filter.Vendor_Store_id = storeId;
    }
  }

  if (Vendor_Products_id !== undefined) {
    const productId = parseInt(Vendor_Products_id, 10);
    if (!Number.isNaN(productId)) {
      filter.Vendor_Products_id = productId;
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

const ensureStoreExists = async (Vendor_Store_id) => {
  if (Vendor_Store_id === undefined) {
    return false;
  }

  const storeId = parseInt(Vendor_Store_id, 10);
  if (Number.isNaN(storeId)) {
    return false;
  }

  const store = await VendorStore.findOne({ Vendor_Store_id: storeId, Status: true });
  return Boolean(store);
};

const ensureProductExists = async (Vendor_Products_id) => {
  if (Vendor_Products_id === undefined) {
    return false;
  }

  const productId = parseInt(Vendor_Products_id, 10);
  if (Number.isNaN(productId)) {
    return false;
  }

  const product = await VendorProducts.findOne({ Vendor_Products_id: productId, Status: true });
  return Boolean(product);
};

const validateRating = (Reating) => {
  if (Reating === undefined || Reating === null) {
    return { isValid: true, parsed: undefined };
  }

  const parsed = parseFloat(Reating);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 5) {
    return { isValid: false, message: 'Rating must be a number between 0 and 5' };
  }

  return { isValid: true, parsed };
};

const findReviewByIdentifier = async (identifier) => {
  let reviewData;

  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    reviewData = await Reviews.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      reviewData = await Reviews.findOne({ Vendor_Products_Reviews_id: numericId });
    }
  }

  if (!reviewData) {
    return null;
  }

  return await populateReviews(reviewData);
};

const createReview = async (req, res) => {
  try {
    const {
      Vendor_Store_id,
      Vendor_Products_id,
      Reating
    } = req.body;

    const [storeExists, productExists] = await Promise.all([
      ensureStoreExists(Vendor_Store_id),
      ensureProductExists(Vendor_Products_id)
    ]);

    if (!storeExists) {
      return sendError(res, 'Vendor store not found', 400);
    }

    if (!productExists) {
      return sendError(res, 'Vendor product not found', 400);
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
    const populated = await populateReviews(review);

    sendSuccess(res, populated, 'Vendor product review created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor product review', { error: error.message });
    throw error;
  }
};

const getAllReviews = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Vendor_Store_id,
      Vendor_Products_id,
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
      Vendor_Store_id,
      Vendor_Products_id,
      ReviewsStatus,
      User_id
    });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [itemsData, total] = await Promise.all([
      Reviews.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reviews.countDocuments(filter)
    ]);

    const items = await populateReviews(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Vendor product reviews retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product reviews', { error: error.message });
    throw error;
  }
});

const getReviewById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const review = await findReviewByIdentifier(id);

    if (!review) {
      return sendNotFound(res, 'Vendor product review not found');
    }

    sendSuccess(res, review, 'Vendor product review retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product review', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Vendor_Store_id, Vendor_Products_id } = req.body;

    if (Vendor_Store_id !== undefined && !(await ensureStoreExists(Vendor_Store_id))) {
      return sendError(res, 'Vendor store not found', 400);
    }

    if (Vendor_Products_id !== undefined && !(await ensureProductExists(Vendor_Products_id))) {
      return sendError(res, 'Vendor product not found', 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updatePayload.Reating !== undefined) {
      const ratingValidation = validateRating(updatePayload.Reating);
      if (!ratingValidation.isValid) {
        return sendError(res, ratingValidation.message, 400);
      }
      updatePayload.Reating = ratingValidation.parsed ?? 0;
    }

    let review;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      review = await Reviews.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid review ID format', 400);
      }
      review = await Reviews.findOneAndUpdate(
        { Vendor_Products_Reviews_id: numericId },
        updatePayload,
        { new: true, runValidators: true }
      );
    }

    if (!review) {
      return sendNotFound(res, 'Vendor product review not found');
    }

    const populated = await populateReviews(review);
    sendSuccess(res, populated, 'Vendor product review updated successfully');
  } catch (error) {
    console.error('Error updating vendor product review', { error: error.message, id: req.params.id });
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
        return sendError(res, 'Invalid review ID format', 400);
      }
      review = await Reviews.findOneAndUpdate(
        { Vendor_Products_Reviews_id: numericId },
        updatePayload,
        { new: true }
      );
    }

    if (!review) {
      return sendNotFound(res, 'Vendor product review not found');
    }

    sendSuccess(res, review, 'Vendor product review deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor product review', { error: error.message, id: req.params.id });
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
      Vendor_Store_id,
      Vendor_Products_id,
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
      Vendor_Store_id,
      Vendor_Products_id,
      ReviewsStatus,
      User_id: userId
    });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [itemsData, total] = await Promise.all([
      Reviews.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reviews.countDocuments(filter)
    ]);

    const items = await populateReviews(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Vendor product reviews retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product reviews by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getReviewsByStoreId = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Store_id } = req.params;
    const storeId = parseInt(Vendor_Store_id, 10);

    if (Number.isNaN(storeId)) {
      return sendError(res, 'Invalid vendor store ID format', 400);
    }

    if (!(await ensureStoreExists(storeId))) {
      return sendNotFound(res, 'Vendor store not found');
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Vendor_Products_id,
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
      Vendor_Store_id: storeId,
      Vendor_Products_id,
      ReviewsStatus
    });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [itemsData, total] = await Promise.all([
      Reviews.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reviews.countDocuments(filter)
    ]);

    const items = await populateReviews(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Vendor product reviews retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product reviews by store ID', { error: error.message, Vendor_Store_id: req.params.Vendor_Store_id });
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
      Vendor_Store_id,
      Vendor_Products_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({
      search,
      status,
      Vendor_Store_id,
      Vendor_Products_id,
      ReviewsStatus
    });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [itemsData, total] = await Promise.all([
      Reviews.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Reviews.countDocuments(filter)
    ]);

    const items = await populateReviews(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Vendor product reviews retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product reviews by status', { error: error.message, ReviewsStatus: req.params.ReviewsStatus });
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
  getReviewsByStoreId,
  getReviewsByStatus
};


