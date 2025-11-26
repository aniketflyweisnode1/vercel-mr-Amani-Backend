const ContentCreator = require('../models/Restaurant_Items_ReviewsForm_ContentCreator.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateContentCreator = (query) => query
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, Country }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Name: { $regex: search, $options: 'i' } },
      { Email: { $regex: search, $options: 'i' } },
      { Phone: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Country) {
    filter.Country = { $regex: Country, $options: 'i' };
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
    return populateContentCreator(ContentCreator.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateContentCreator(ContentCreator.findOne({ ReviewsForm_ContentCreator_id: numericId }));
  }

  return null;
};

const createContentCreator = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const record = await ContentCreator.create(payload);
    const populated = await populateContentCreator(ContentCreator.findById(record._id));

    sendSuccess(res, populated, 'Content creator entry created successfully', 201);
  } catch (error) {
    console.error('Error creating content creator entry', { error: error.message });
    throw error;
  }
});

const getAllContentCreators = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Country,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Country });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateContentCreator(ContentCreator.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ContentCreator.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Content creator entries retrieved successfully');
  } catch (error) {
    console.error('Error retrieving content creator entries', { error: error.message });
    throw error;
  }
});

const getContentCreatorById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const query = findByIdentifier(id);

    if (!query) {
      return sendError(res, 'Invalid content creator identifier', 400);
    }

    const record = await query;

    if (!record) {
      return sendNotFound(res, 'Content creator entry not found');
    }

    sendSuccess(res, record, 'Content creator entry retrieved successfully');
  } catch (error) {
    console.error('Error retrieving content creator entry', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateContentCreator = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let record;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await ContentCreator.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid content creator ID format', 400);
      }
      record = await ContentCreator.findOneAndUpdate({ ReviewsForm_ContentCreator_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!record) {
      return sendNotFound(res, 'Content creator entry not found');
    }

    const populated = await populateContentCreator(ContentCreator.findById(record._id));
    sendSuccess(res, populated, 'Content creator entry updated successfully');
  } catch (error) {
    console.error('Error updating content creator entry', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteContentCreator = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let record;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await ContentCreator.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid content creator ID format', 400);
      }
      record = await ContentCreator.findOneAndUpdate({ ReviewsForm_ContentCreator_id: numericId }, updatePayload, { new: true });
    }

    if (!record) {
      return sendNotFound(res, 'Content creator entry not found');
    }

    sendSuccess(res, record, 'Content creator entry deleted successfully');
  } catch (error) {
    console.error('Error deleting content creator entry', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getContentCreatorsByAuth = asyncHandler(async (req, res) => {
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
      Country,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Country });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateContentCreator(ContentCreator.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ContentCreator.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Content creator entries retrieved successfully');
  } catch (error) {
    console.error('Error retrieving content creator entries by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createContentCreator,
  getAllContentCreators,
  getContentCreatorById,
  updateContentCreator,
  deleteContentCreator,
  getContentCreatorsByAuth
};


