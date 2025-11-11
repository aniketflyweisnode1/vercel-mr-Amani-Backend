const Notification = require('../models/Notification.model');
const NotificationType = require('../models/Notification_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

const ensureNotificationTypeExists = async (Notification_type_id) => {
  const type = await NotificationType.findOne({ Notification_type_id });
  return !!type;
};

const createNotification = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const typeExists = await ensureNotificationTypeExists(payload.Notification_type_id);
    if (!typeExists) {
      return sendError(res, 'Notification type not found', 400);
    }

    const notification = await Notification.create(payload);
    logger.info('Notification created successfully', { id: notification._id, Notification_id: notification.Notification_id });
    sendSuccess(res, notification, 'Notification created successfully', 201);
  } catch (error) {
    logger.error('Error creating notification', { error: error.message, stack: error.stack });
    throw error;
  }
});

const buildFilterFromQuery = (query) => {
  const {
    search,
    status,
    user_id,
    Notification_type_id,
    isRead
  } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      { Notification: { $regex: search, $options: 'i' } },
      { routes: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (user_id) {
    const userIdNum = parseInt(user_id, 10);
    if (!isNaN(userIdNum)) {
      filter.user_id = userIdNum;
    }
  }

  if (Notification_type_id) {
    const typeIdNum = parseInt(Notification_type_id, 10);
    if (!isNaN(typeIdNum)) {
      filter.Notification_type_id = typeIdNum;
    }
  }

  if (isRead !== undefined) {
    filter.isRead = isRead === 'true';
  }

  return filter;
};

const getAllNotifications = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      Notification_type_id,
      isRead,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ search, status, user_id, Notification_type_id, isRead });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Notification.countDocuments(filter)
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

    logger.info('Notifications retrieved successfully', { total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
    sendPaginated(res, notifications, pagination, 'Notifications retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving notifications', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getNotificationById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let notification;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      notification = await Notification.findById(id);
    } else {
      const notificationId = parseInt(id, 10);
      if (isNaN(notificationId)) {
        return sendNotFound(res, 'Invalid notification ID format');
      }
      notification = await Notification.findOne({ Notification_id: notificationId });
    }

    if (!notification) {
      return sendNotFound(res, 'Notification not found');
    }

    logger.info('Notification retrieved successfully', { id: notification._id });
    sendSuccess(res, notification, 'Notification retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving notification', { error: error.message, notificationId: req.params.id });
    throw error;
  }
});

const updateNotification = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.Notification_type_id !== undefined) {
      const typeExists = await ensureNotificationTypeExists(updateData.Notification_type_id);
      if (!typeExists) {
        return sendError(res, 'Notification type not found', 400);
      }
    }

    let notification;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      notification = await Notification.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const notificationId = parseInt(id, 10);
      if (isNaN(notificationId)) {
        return sendNotFound(res, 'Invalid notification ID format');
      }
      notification = await Notification.findOneAndUpdate({ Notification_id: notificationId }, updateData, { new: true, runValidators: true });
    }

    if (!notification) {
      return sendNotFound(res, 'Notification not found');
    }

    logger.info('Notification updated successfully', { id: notification._id });
    sendSuccess(res, notification, 'Notification updated successfully');
  } catch (error) {
    logger.error('Error updating notification', { error: error.message, notificationId: req.params.id });
    throw error;
  }
});

const deleteNotification = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let notification;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      notification = await Notification.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const notificationId = parseInt(id, 10);
      if (isNaN(notificationId)) {
        return sendNotFound(res, 'Invalid notification ID format');
      }
      notification = await Notification.findOneAndUpdate({ Notification_id: notificationId }, updateData, { new: true });
    }

    if (!notification) {
      return sendNotFound(res, 'Notification not found');
    }

    logger.info('Notification deleted successfully', { id: notification._id });
    sendSuccess(res, notification, 'Notification deleted successfully');
  } catch (error) {
    logger.error('Error deleting notification', { error: error.message, notificationId: req.params.id });
    throw error;
  }
});

const getNotificationsByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      isRead,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ status, isRead });
    filter.user_id = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Notification.countDocuments(filter)
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

    logger.info('Notifications retrieved for authenticated user', { userId, total });
    sendPaginated(res, notifications, pagination, 'Notifications retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving notifications for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationsByAuth
};
