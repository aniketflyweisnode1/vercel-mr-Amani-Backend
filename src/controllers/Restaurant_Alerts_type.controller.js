const RestaurantAlertsType = require('../models/Restaurant_Alerts_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateAlertsType = (query) => query
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { TypeName: { $regex: search, $options: 'i' } }
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

const findAlertsTypeByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateAlertsType(RestaurantAlertsType.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateAlertsType(RestaurantAlertsType.findOne({ Restaurant_Alerts_type_id: numericId }));
  }

  return null;
};

const createRestaurantAlertType = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const alertType = await RestaurantAlertsType.create(payload);
    const populated = await populateAlertsType(RestaurantAlertsType.findById(alertType._id));

    sendSuccess(res, populated, 'Restaurant alert type created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant alert type', { error: error.message });
    throw error;
  }
});

const getAllRestaurantAlertTypes = asyncHandler(async (req, res) => {
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

    const [alertTypes, total] = await Promise.all([
      populateAlertsType(RestaurantAlertsType.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantAlertsType.countDocuments(filter)
    ]);

    sendPaginated(res, alertTypes, paginateMeta(numericPage, numericLimit, total), 'Restaurant alert types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant alert types', { error: error.message });
    throw error;
  }
});

const getRestaurantAlertTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const alertTypeQuery = findAlertsTypeByIdentifier(id);

    if (!alertTypeQuery) {
      return sendError(res, 'Invalid restaurant alert type identifier', 400);
    }

    const alertType = await alertTypeQuery;

    if (!alertType) {
      return sendNotFound(res, 'Restaurant alert type not found');
    }

    sendSuccess(res, alertType, 'Restaurant alert type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant alert type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateRestaurantAlertType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let alertType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      alertType = await RestaurantAlertsType.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant alert type ID format', 400);
      }
      alertType = await RestaurantAlertsType.findOneAndUpdate({ Restaurant_Alerts_type_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!alertType) {
      return sendNotFound(res, 'Restaurant alert type not found');
    }

    const populated = await populateAlertsType(RestaurantAlertsType.findById(alertType._id));
    sendSuccess(res, populated, 'Restaurant alert type updated successfully');
  } catch (error) {
    console.error('Error updating restaurant alert type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteRestaurantAlertType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let alertType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      alertType = await RestaurantAlertsType.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant alert type ID format', 400);
      }
      alertType = await RestaurantAlertsType.findOneAndUpdate({ Restaurant_Alerts_type_id: numericId }, updatePayload, { new: true });
    }

    if (!alertType) {
      return sendNotFound(res, 'Restaurant alert type not found');
    }

    sendSuccess(res, alertType, 'Restaurant alert type deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant alert type', { error: error.message, id: req.params.id });
    throw error;
  }
});

module.exports = {
  createRestaurantAlertType,
  getAllRestaurantAlertTypes,
  getRestaurantAlertTypeById,
  updateRestaurantAlertType,
  deleteRestaurantAlertType
};


