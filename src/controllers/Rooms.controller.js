const Rooms = require('../models/Rooms.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

const createRoom = asyncHandler(async (req, res) => {
  try {
    const roomData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const room = await Rooms.create(roomData);
    logger.info('Room created successfully', { roomId: room._id, Rooms_id: room.Rooms_id });
    sendSuccess(res, room, 'Room created successfully', 201);
  } catch (error) {
    logger.error('Error creating room', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllRooms = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, roomType, roomCategoryId, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { RoomName: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { Description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    if (roomType) filter.RoomType = roomType;
    if (roomCategoryId) filter.Room_Categories_id = parseInt(roomCategoryId, 10);
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [rooms, total] = await Promise.all([
      Rooms.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Rooms.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Rooms retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, rooms, pagination, 'Rooms retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving rooms', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getRoomById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let room;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      room = await Rooms.findById(id);
    } else {
      const roomId = parseInt(id, 10);
      if (isNaN(roomId)) return sendNotFound(res, 'Invalid room ID format');
      room = await Rooms.findOne({ Rooms_id: roomId });
    }
    if (!room) return sendNotFound(res, 'Room not found');
    logger.info('Room retrieved successfully', { roomId: room._id });
    sendSuccess(res, room, 'Room retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving room', { error: error.message, roomId: req.params.id });
    throw error;
  }
});

const updateRoom = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let room;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      room = await Rooms.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const roomId = parseInt(id, 10);
      if (isNaN(roomId)) return sendNotFound(res, 'Invalid room ID format');
      room = await Rooms.findOneAndUpdate({ Rooms_id: roomId }, updateData, { new: true, runValidators: true });
    }
    if (!room) return sendNotFound(res, 'Room not found');
    logger.info('Room updated successfully', { roomId: room._id });
    sendSuccess(res, room, 'Room updated successfully');
  } catch (error) {
    logger.error('Error updating room', { error: error.message, roomId: req.params.id });
    throw error;
  }
});

const deleteRoom = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let room;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      room = await Rooms.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const roomId = parseInt(id, 10);
      if (isNaN(roomId)) return sendNotFound(res, 'Invalid room ID format');
      room = await Rooms.findOneAndUpdate({ Rooms_id: roomId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!room) return sendNotFound(res, 'Room not found');
    logger.info('Room deleted successfully', { roomId: room._id });
    sendSuccess(res, room, 'Room deleted successfully');
  } catch (error) {
    logger.error('Error deleting room', { error: error.message, roomId: req.params.id });
    throw error;
  }
});

const getRoomsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { created_by: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [rooms, total] = await Promise.all([
      Rooms.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Rooms.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Rooms by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, rooms, pagination, 'Rooms retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving rooms by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getRoomsByRoomCategoryId = asyncHandler(async (req, res) => {
  try {
    const { roomCategoryId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const categoryId = parseInt(roomCategoryId, 10);
    if (isNaN(categoryId)) return sendNotFound(res, 'Invalid room category ID format');
    const filter = { Room_Categories_id: categoryId };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [rooms, total] = await Promise.all([
      Rooms.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Rooms.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Rooms by Room Category ID retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), roomCategoryId: categoryId });
    sendPaginated(res, rooms, pagination, 'Rooms retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving rooms by Room Category ID', { error: error.message, roomCategoryId: req.params.roomCategoryId });
    throw error;
  }
});

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomsByAuth,
  getRoomsByRoomCategoryId
};

