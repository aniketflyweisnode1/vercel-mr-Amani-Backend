const ContentCreator = require('../models/Restaurant_Items_ReviewsForm_ContentCreator.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateContentCreator = async (records) => {
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

const findByIdentifier = async (identifier) => {
  let recordData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    recordData = await ContentCreator.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      recordData = await ContentCreator.findOne({ ReviewsForm_ContentCreator_id: numericId });
    }
  }

  if (!recordData) {
    return null;
  }

  return await populateContentCreator(recordData);
};

const createContentCreator = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const record = await ContentCreator.create(payload);
    const populated = await populateContentCreator(record);

    sendSuccess(res, populated, 'Content creator entry created successfully', 201);
  } catch (error) {
    console.error('Error creating content creator entry', { error: error.message, stack: error.stack });
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

    const [itemsData, total] = await Promise.all([
      ContentCreator.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ContentCreator.countDocuments(filter)
    ]);
    
    const items = await populateContentCreator(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Content creator entries retrieved successfully');
  } catch (error) {
    console.error('Error retrieving content creator entries', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getContentCreatorById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const record = await findByIdentifier(id);

    if (!record) {
      return sendNotFound(res, 'Content creator entry not found');
    }

    sendSuccess(res, record, 'Content creator entry retrieved successfully');
  } catch (error) {
    console.error('Error retrieving content creator entry', { error: error.message, id: req.params.id, stack: error.stack });
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

    const populated = await populateContentCreator(record);
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

    const [itemsData, total] = await Promise.all([
      ContentCreator.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      ContentCreator.countDocuments(filter)
    ]);
    
    const items = await populateContentCreator(itemsData);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Content creator entries retrieved successfully');
  } catch (error) {
    console.error('Error retrieving content creator entries by auth', { error: error.message, userId: req.userIdNumber, stack: error.stack });
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


