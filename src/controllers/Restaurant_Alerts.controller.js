const RestaurantAlerts = require('../models/Restaurant_Alerts.model');
const RestaurantAlertsType = require('../models/Restaurant_Alerts_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateRestaurantAlerts = (query) => query
  .populate('Restaurant_Alerts_type_id', 'Restaurant_Alerts_type_id TypeName')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, Restaurant_Alerts_type_id, model, referenceId }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Alerts: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Restaurant_Alerts_type_id !== undefined) {
    const typeId = parseInt(Restaurant_Alerts_type_id, 10);
    if (!Number.isNaN(typeId)) {
      filter.Restaurant_Alerts_type_id = typeId;
    }
  }

  if (model) {
    filter.model = { $regex: model, $options: 'i' };
  }

  if (referenceId !== undefined) {
    const refId = parseInt(referenceId, 10);
    if (!Number.isNaN(refId)) {
      filter.id = refId;
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

const ensureAlertTypeExists = async (Restaurant_Alerts_type_id) => {
  if (Restaurant_Alerts_type_id === undefined) {
    return true;
  }

  const typeId = parseInt(Restaurant_Alerts_type_id, 10);
  if (Number.isNaN(typeId)) {
    return false;
  }

  const type = await RestaurantAlertsType.findOne({ Restaurant_Alerts_type_id: typeId, Status: true });
  return Boolean(type);
};

const findAlertByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateRestaurantAlerts(RestaurantAlerts.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateRestaurantAlerts(RestaurantAlerts.findOne({ Restaurant_Alerts_id: numericId }));
  }

  return null;
};

const createRestaurantAlert = asyncHandler(async (req, res) => {
  try {
    const { Restaurant_Alerts_type_id } = req.body;

    if (!(await ensureAlertTypeExists(Restaurant_Alerts_type_id))) {
      return sendError(res, 'Restaurant alert type not found', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const alert = await RestaurantAlerts.create(payload);
    const populated = await populateRestaurantAlerts(RestaurantAlerts.findById(alert._id));

    sendSuccess(res, populated, 'Restaurant alert created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant alert', { error: error.message });
    throw error;
  }
});

const getAllRestaurantAlerts = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Restaurant_Alerts_type_id,
      model,
      referenceId,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Restaurant_Alerts_type_id, model, referenceId });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [alerts, total] = await Promise.all([
      populateRestaurantAlerts(RestaurantAlerts.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantAlerts.countDocuments(filter)
    ]);

    sendPaginated(res, alerts, paginateMeta(numericPage, numericLimit, total), 'Restaurant alerts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant alerts', { error: error.message });
    throw error;
  }
});

const getRestaurantAlertById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const alertQuery = findAlertByIdentifier(id);

    if (!alertQuery) {
      return sendError(res, 'Invalid restaurant alert identifier', 400);
    }

    const alert = await alertQuery;

    if (!alert) {
      return sendNotFound(res, 'Restaurant alert not found');
    }

    sendSuccess(res, alert, 'Restaurant alert retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant alert', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateRestaurantAlert = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Restaurant_Alerts_type_id } = req.body;

    if (Restaurant_Alerts_type_id !== undefined && !(await ensureAlertTypeExists(Restaurant_Alerts_type_id))) {
      return sendError(res, 'Restaurant alert type not found', 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let alert;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      alert = await RestaurantAlerts.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant alert ID format', 400);
      }
      alert = await RestaurantAlerts.findOneAndUpdate({ Restaurant_Alerts_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!alert) {
      return sendNotFound(res, 'Restaurant alert not found');
    }

    const populated = await populateRestaurantAlerts(RestaurantAlerts.findById(alert._id));
    sendSuccess(res, populated, 'Restaurant alert updated successfully');
  } catch (error) {
    console.error('Error updating restaurant alert', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteRestaurantAlert = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let alert;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      alert = await RestaurantAlerts.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant alert ID format', 400);
      }
      alert = await RestaurantAlerts.findOneAndUpdate({ Restaurant_Alerts_id: numericId }, updatePayload, { new: true });
    }

    if (!alert) {
      return sendNotFound(res, 'Restaurant alert not found');
    }

    sendSuccess(res, alert, 'Restaurant alert deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant alert', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getRestaurantAlertsByTypeId = asyncHandler(async (req, res) => {
  try {
    const { Restaurant_Alerts_type_id } = req.params;
    const typeId = parseInt(Restaurant_Alerts_type_id, 10);

    if (Number.isNaN(typeId)) {
      return sendError(res, 'Invalid restaurant alert type ID format', 400);
    }

    if (!(await ensureAlertTypeExists(typeId))) {
      return sendNotFound(res, 'Restaurant alert type not found');
    }

    const alerts = await populateRestaurantAlerts(RestaurantAlerts.find({
      Restaurant_Alerts_type_id: typeId,
      Status: true
    }));

    sendSuccess(res, alerts, 'Restaurant alerts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant alerts by type ID', { error: error.message, Restaurant_Alerts_type_id: req.params.Restaurant_Alerts_type_id });
    throw error;
  }
});

const getRestaurantAlertsByAuth = asyncHandler(async (req, res) => {
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
      Restaurant_Alerts_type_id,
      model,
      referenceId,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Restaurant_Alerts_type_id, model, referenceId });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [alerts, total] = await Promise.all([
      populateRestaurantAlerts(RestaurantAlerts.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      RestaurantAlerts.countDocuments(filter)
    ]);

    sendPaginated(res, alerts, paginateMeta(numericPage, numericLimit, total), 'Restaurant alerts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant alerts by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getRestaurantAlertsByModel = asyncHandler(async (req, res) => {
  try {
    const { model, referenceId } = req.query;

    if (!model) {
      return sendError(res, 'Model is required', 400);
    }

    const filter = {
      model: { $regex: model, $options: 'i' },
      Status: true
    };

    if (referenceId !== undefined) {
      const refId = parseInt(referenceId, 10);
      if (Number.isNaN(refId)) {
        return sendError(res, 'Invalid reference id format', 400);
      }
      filter.id = refId;
    }

    const alerts = await populateRestaurantAlerts(RestaurantAlerts.find(filter));

    sendSuccess(res, alerts, 'Restaurant alerts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant alerts by model', { error: error.message, model: req.query.model });
    throw error;
  }
});

module.exports = {
  createRestaurantAlert,
  getAllRestaurantAlerts,
  getRestaurantAlertById,
  updateRestaurantAlert,
  deleteRestaurantAlert,
  getRestaurantAlertsByTypeId,
  getRestaurantAlertsByAuth,
  getRestaurantAlertsByModel
};


