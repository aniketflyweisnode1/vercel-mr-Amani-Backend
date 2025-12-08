const Printer_Orders = require('../models/Printer_Orders.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const createPrinterOrder = asyncHandler(async (req, res) => {
  try {
    const printerOrderData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const printerOrder = await Printer_Orders.create(printerOrderData);
    console.info('Printer order created successfully', { printerOrderId: printerOrder._id, Printer_Orders_id: printerOrder.Printer_Orders_id });
    sendSuccess(res, printerOrder, 'Printer order created successfully', 201);
  } catch (error) {
    console.error('Error creating printer order', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllPrinterOrders = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, orderStatus, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (status !== undefined) {
      if (typeof status === 'string') {
        filter.Status = status === 'true' || status === '1';
      } else {
        filter.Status = Boolean(status);
      }
    }
    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [printerOrders, total] = await Promise.all([
      Printer_Orders.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Printer_Orders.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Printer orders retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, printerOrders, pagination, 'Printer orders retrieved successfully');
  } catch (error) {
    console.error('Error retrieving printer orders', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getPrinterOrderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let printerOrder;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      printerOrder = await Printer_Orders.findById(id);
    } else {
      const printerOrderId = parseInt(id, 10);
      if (isNaN(printerOrderId)) return sendNotFound(res, 'Invalid printer order ID format');
      printerOrder = await Printer_Orders.findOne({ Printer_Orders_id: printerOrderId });
    }
    if (!printerOrder) return sendNotFound(res, 'Printer order not found');
    console.info('Printer order retrieved successfully', { printerOrderId: printerOrder._id });
    sendSuccess(res, printerOrder, 'Printer order retrieved successfully');
  } catch (error) {
    console.error('Error retrieving printer order', { error: error.message, printerOrderId: req.params.id });
    throw error;
  }
});

const updatePrinterOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let printerOrder;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      printerOrder = await Printer_Orders.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const printerOrderId = parseInt(id, 10);
      if (isNaN(printerOrderId)) return sendNotFound(res, 'Invalid printer order ID format');
      printerOrder = await Printer_Orders.findOneAndUpdate({ Printer_Orders_id: printerOrderId }, updateData, { new: true, runValidators: true });
    }
    if (!printerOrder) return sendNotFound(res, 'Printer order not found');
    console.info('Printer order updated successfully', { printerOrderId: printerOrder._id });
    sendSuccess(res, printerOrder, 'Printer order updated successfully');
  } catch (error) {
    console.error('Error updating printer order', { error: error.message, printerOrderId: req.params.id });
    throw error;
  }
});

const deletePrinterOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let printerOrder;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      printerOrder = await Printer_Orders.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const printerOrderId = parseInt(id, 10);
      if (isNaN(printerOrderId)) return sendNotFound(res, 'Invalid printer order ID format');
      printerOrder = await Printer_Orders.findOneAndUpdate({ Printer_Orders_id: printerOrderId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!printerOrder) return sendNotFound(res, 'Printer order not found');
    console.info('Printer order deleted successfully', { printerOrderId: printerOrder._id });
    sendSuccess(res, printerOrder, 'Printer order deleted successfully');
  } catch (error) {
    console.error('Error deleting printer order', { error: error.message, printerOrderId: req.params.id });
    throw error;
  }
});

module.exports = {
  createPrinterOrder,
  getAllPrinterOrders,
  getPrinterOrderById,
  updatePrinterOrder,
  deletePrinterOrder
};
