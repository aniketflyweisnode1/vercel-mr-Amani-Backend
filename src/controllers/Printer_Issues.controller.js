const Printer_Issues = require('../models/Printer_Issues.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const createPrinterIssue = asyncHandler(async (req, res) => {
  try {
    const printerIssueData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const printerIssue = await Printer_Issues.create(printerIssueData);
    console.info('Printer issue created successfully', { printerIssueId: printerIssue._id, Printer_Issues_id: printerIssue.Printer_Issues_id });
    sendSuccess(res, printerIssue, 'Printer issue created successfully', 201);
  } catch (error) {
    console.error('Error creating printer issue', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllPrinterIssues = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, solveStatus, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { Printer_Issues: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      if (typeof status === 'string') {
        filter.Status = status === 'true' || status === '1';
      } else {
        filter.Status = Boolean(status);
      }
    }
    if (solveStatus !== undefined) {
      if (typeof solveStatus === 'string') {
        filter.solveStatus = solveStatus === 'true' || solveStatus === '1';
      } else {
        filter.solveStatus = Boolean(solveStatus);
      }
    }
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [printerIssues, total] = await Promise.all([
      Printer_Issues.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Printer_Issues.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Printer issues retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, printerIssues, pagination, 'Printer issues retrieved successfully');
  } catch (error) {
    console.error('Error retrieving printer issues', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getPrinterIssueById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let printerIssue;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      printerIssue = await Printer_Issues.findById(id);
    } else {
      const printerIssueId = parseInt(id, 10);
      if (isNaN(printerIssueId)) return sendNotFound(res, 'Invalid printer issue ID format');
      printerIssue = await Printer_Issues.findOne({ Printer_Issues_id: printerIssueId });
    }
    if (!printerIssue) return sendNotFound(res, 'Printer issue not found');
    console.info('Printer issue retrieved successfully', { printerIssueId: printerIssue._id });
    sendSuccess(res, printerIssue, 'Printer issue retrieved successfully');
  } catch (error) {
    console.error('Error retrieving printer issue', { error: error.message, printerIssueId: req.params.id });
    throw error;
  }
});

const updatePrinterIssue = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let printerIssue;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      printerIssue = await Printer_Issues.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const printerIssueId = parseInt(id, 10);
      if (isNaN(printerIssueId)) return sendNotFound(res, 'Invalid printer issue ID format');
      printerIssue = await Printer_Issues.findOneAndUpdate({ Printer_Issues_id: printerIssueId }, updateData, { new: true, runValidators: true });
    }
    if (!printerIssue) return sendNotFound(res, 'Printer issue not found');
    console.info('Printer issue updated successfully', { printerIssueId: printerIssue._id });
    sendSuccess(res, printerIssue, 'Printer issue updated successfully');
  } catch (error) {
    console.error('Error updating printer issue', { error: error.message, printerIssueId: req.params.id });
    throw error;
  }
});

const deletePrinterIssue = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let printerIssue;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      printerIssue = await Printer_Issues.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const printerIssueId = parseInt(id, 10);
      if (isNaN(printerIssueId)) return sendNotFound(res, 'Invalid printer issue ID format');
      printerIssue = await Printer_Issues.findOneAndUpdate({ Printer_Issues_id: printerIssueId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!printerIssue) return sendNotFound(res, 'Printer issue not found');
    console.info('Printer issue deleted successfully', { printerIssueId: printerIssue._id });
    sendSuccess(res, printerIssue, 'Printer issue deleted successfully');
  } catch (error) {
    console.error('Error deleting printer issue', { error: error.message, printerIssueId: req.params.id });
    throw error;
  }
});

module.exports = {
  createPrinterIssue,
  getAllPrinterIssues,
  getPrinterIssueById,
  updatePrinterIssue,
  deletePrinterIssue
};
