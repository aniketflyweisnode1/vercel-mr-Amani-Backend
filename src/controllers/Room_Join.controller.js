const Room_Join = require('../models/Room_Join.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


const createRoomJoin = asyncHandler(async (req, res) => {
  try {
    const joinData = {
      ...req.body,
      join_by: req.body.join_by || req.userIdNumber,
      created_by: req.userIdNumber || null
    };
    const join = await Room_Join.create(joinData);
    console.info('Room Join created successfully', { joinId: join._id, Room_Join_id: join.Room_Join_id });
    sendSuccess(res, join, 'Room Join created successfully', 201);
  } catch (error) {
    console.error('Error creating room join', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllRoomJoins = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [joins, total] = await Promise.all([
      Room_Join.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Room_Join.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Room Joins retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, joins, pagination, 'Room Joins retrieved successfully');
  } catch (error) {
    console.error('Error retrieving room joins', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getRoomJoinById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let join;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      join = await Room_Join.findById(id);
    } else {
      const joinId = parseInt(id, 10);
      if (isNaN(joinId)) return sendNotFound(res, 'Invalid room join ID format');
      join = await Room_Join.findOne({ Room_Join_id: joinId });
    }
    if (!join) return sendNotFound(res, 'Room Join not found');
    console.info('Room Join retrieved successfully', { joinId: join._id });
    sendSuccess(res, join, 'Room Join retrieved successfully');
  } catch (error) {
    console.error('Error retrieving room join', { error: error.message, joinId: req.params.id });
    throw error;
  }
});

const updateRoomJoin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let join;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      join = await Room_Join.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const joinId = parseInt(id, 10);
      if (isNaN(joinId)) return sendNotFound(res, 'Invalid room join ID format');
      join = await Room_Join.findOneAndUpdate({ Room_Join_id: joinId }, updateData, { new: true, runValidators: true });
    }
    if (!join) return sendNotFound(res, 'Room Join not found');
    console.info('Room Join updated successfully', { joinId: join._id });
    sendSuccess(res, join, 'Room Join updated successfully');
  } catch (error) {
    console.error('Error updating room join', { error: error.message, joinId: req.params.id });
    throw error;
  }
});

const deleteRoomJoin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let join;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      join = await Room_Join.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const joinId = parseInt(id, 10);
      if (isNaN(joinId)) return sendNotFound(res, 'Invalid room join ID format');
      join = await Room_Join.findOneAndUpdate({ Room_Join_id: joinId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!join) return sendNotFound(res, 'Room Join not found');
    console.info('Room Join deleted successfully', { joinId: join._id });
    sendSuccess(res, join, 'Room Join deleted successfully');
  } catch (error) {
    console.error('Error deleting room join', { error: error.message, joinId: req.params.id });
    throw error;
  }
});

const getRoomJoinsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { join_by: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [joins, total] = await Promise.all([
      Room_Join.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Room_Join.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Room Joins by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, joins, pagination, 'Room Joins retrieved successfully');
  } catch (error) {
    console.error('Error retrieving room joins by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getRoomJoinsByRoomId = asyncHandler(async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const roomIdNum = parseInt(roomId, 10);
    if (isNaN(roomIdNum)) return sendNotFound(res, 'Invalid room ID format');
    const filter = { Room_id: roomIdNum };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [joins, total] = await Promise.all([
      Room_Join.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Room_Join.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Room Joins by Room ID retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), roomId: roomIdNum });
    sendPaginated(res, joins, pagination, 'Room Joins retrieved successfully');
  } catch (error) {
    console.error('Error retrieving room joins by Room ID', { error: error.message, roomId: req.params.roomId });
    throw error;
  }
});

module.exports = {
  createRoomJoin,
  getAllRoomJoins,
  getRoomJoinById,
  updateRoomJoin,
  deleteRoomJoin,
  getRoomJoinsByAuth,
  getRoomJoinsByRoomId
};

