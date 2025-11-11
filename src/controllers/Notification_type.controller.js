const NotificationType = require('../models/Notification_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


const createNotificationType = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const existingType = await NotificationType.findOne({ name: payload.name.trim() });
    if (existingType) {
      return sendError(res, 'Notification type with this name already exists', 400);
    }

    const notificationType = await NotificationType.create(payload);
    console.info('Notification type created successfully', { id: notificationType._id, Notification_type_id: notificationType.Notification_type_id });
    sendSuccess(res, notificationType, 'Notification type created successfully', 201);
  } catch (error) {
    console.error('Error creating notification type', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllNotificationTypes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { emozi: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [types, total] = await Promise.all([
      NotificationType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      NotificationType.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: parseInt(page, 10) < totalPages,
      hasPrevPage: parseInt(page, 10) > 1
    };

    console.info('Notification types retrieved successfully', { total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
    sendPaginated(res, types, pagination, 'Notification types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving notification types', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getNotificationTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let notificationType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      notificationType = await NotificationType.findById(id);
    } else {
      const typeId = parseInt(id, 10);
      if (isNaN(typeId)) {
        return sendNotFound(res, 'Invalid notification type ID format');
      }
      notificationType = await NotificationType.findOne({ Notification_type_id: typeId });
    }

    if (!notificationType) {
      return sendNotFound(res, 'Notification type not found');
    }

    console.info('Notification type retrieved successfully', { id: notificationType._id });
    sendSuccess(res, notificationType, 'Notification type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving notification type', { error: error.message, notificationTypeId: req.params.id });
    throw error;
  }
});

const updateNotificationType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let notificationType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      notificationType = await NotificationType.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const typeId = parseInt(id, 10);
      if (isNaN(typeId)) {
        return sendNotFound(res, 'Invalid notification type ID format');
      }
      notificationType = await NotificationType.findOneAndUpdate({ Notification_type_id: typeId }, updateData, { new: true, runValidators: true });
    }

    if (!notificationType) {
      return sendNotFound(res, 'Notification type not found');
    }

    console.info('Notification type updated successfully', { id: notificationType._id });
    sendSuccess(res, notificationType, 'Notification type updated successfully');
  } catch (error) {
    console.error('Error updating notification type', { error: error.message, notificationTypeId: req.params.id });
    throw error;
  }
});

const deleteNotificationType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let notificationType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      notificationType = await NotificationType.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const typeId = parseInt(id, 10);
      if (isNaN(typeId)) {
        return sendNotFound(res, 'Invalid notification type ID format');
      }
      notificationType = await NotificationType.findOneAndUpdate({ Notification_type_id: typeId }, updateData, { new: true });
    }

    if (!notificationType) {
      return sendNotFound(res, 'Notification type not found');
    }

    console.info('Notification type deleted successfully', { id: notificationType._id });
    sendSuccess(res, notificationType, 'Notification type deleted successfully');
  } catch (error) {
    console.error('Error deleting notification type', { error: error.message, notificationTypeId: req.params.id });
    throw error;
  }
});

module.exports = {
  createNotificationType,
  getAllNotificationTypes,
  getNotificationTypeById,
  updateNotificationType,
  deleteNotificationType
};
