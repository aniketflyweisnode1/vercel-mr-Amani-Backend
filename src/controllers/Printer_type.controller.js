const Printer_type = require('../models/Printer_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const createPrinterType = asyncHandler(async (req, res) => {
  try {
    const printerTypeData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const printerType = await Printer_type.create(printerTypeData);
    console.info('Printer type created successfully', { printerTypeId: printerType._id, Printer_type_id: printerType.Printer_type_id });
    sendSuccess(res, printerType, 'Printer type created successfully', 201);
  } catch (error) {
    console.error('Error creating printer type', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllPrinterTypes = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { Printer_type: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      if (typeof status === 'string') {
        filter.Status = status === 'true' || status === '1';
      } else {
        filter.Status = Boolean(status);
      }
    }
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [printerTypes, total] = await Promise.all([
      Printer_type.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Printer_type.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Printer types retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, printerTypes, pagination, 'Printer types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving printer types', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getPrinterTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let printerType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      printerType = await Printer_type.findById(id);
    } else {
      const printerTypeId = parseInt(id, 10);
      if (isNaN(printerTypeId)) return sendNotFound(res, 'Invalid printer type ID format');
      printerType = await Printer_type.findOne({ Printer_type_id: printerTypeId });
    }
    if (!printerType) return sendNotFound(res, 'Printer type not found');
    console.info('Printer type retrieved successfully', { printerTypeId: printerType._id });
    sendSuccess(res, printerType, 'Printer type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving printer type', { error: error.message, printerTypeId: req.params.id });
    throw error;
  }
});

const updatePrinterType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let printerType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      printerType = await Printer_type.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const printerTypeId = parseInt(id, 10);
      if (isNaN(printerTypeId)) return sendNotFound(res, 'Invalid printer type ID format');
      printerType = await Printer_type.findOneAndUpdate({ Printer_type_id: printerTypeId }, updateData, { new: true, runValidators: true });
    }
    if (!printerType) return sendNotFound(res, 'Printer type not found');
    console.info('Printer type updated successfully', { printerTypeId: printerType._id });
    sendSuccess(res, printerType, 'Printer type updated successfully');
  } catch (error) {
    console.error('Error updating printer type', { error: error.message, printerTypeId: req.params.id });
    throw error;
  }
});

const deletePrinterType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let printerType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      printerType = await Printer_type.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const printerTypeId = parseInt(id, 10);
      if (isNaN(printerTypeId)) return sendNotFound(res, 'Invalid printer type ID format');
      printerType = await Printer_type.findOneAndUpdate({ Printer_type_id: printerTypeId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!printerType) return sendNotFound(res, 'Printer type not found');
    console.info('Printer type deleted successfully', { printerTypeId: printerType._id });
    sendSuccess(res, printerType, 'Printer type deleted successfully');
  } catch (error) {
    console.error('Error deleting printer type', { error: error.message, printerTypeId: req.params.id });
    throw error;
  }
});

const getPrinterTypesByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { created_by: req.userIdNumber };
    if (status !== undefined) {
      if (typeof status === 'string') {
        filter.Status = status === 'true' || status === '1';
      } else {
        filter.Status = Boolean(status);
      }
    }
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [printerTypes, total] = await Promise.all([
      Printer_type.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Printer_type.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Printer types by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, printerTypes, pagination, 'Printer types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving printer types by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createPrinterType,
  getAllPrinterTypes,
  getPrinterTypeById,
  updatePrinterType,
  deletePrinterType,
  getPrinterTypesByAuth
};
