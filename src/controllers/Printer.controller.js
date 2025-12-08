const Printer = require('../models/Printer.model');
const Printer_Issues = require('../models/Printer_Issues.model');
const Printer_Orders = require('../models/Printer_Orders.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const createPrinter = asyncHandler(async (req, res) => {
  try {
    const printerData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const printer = await Printer.create(printerData);
    console.info('Printer created successfully', { printerId: printer._id, Printer_id: printer.Printer_id });
    sendSuccess(res, printer, 'Printer created successfully', 201);
  } catch (error) {
    console.error('Error creating printer', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllPrinters = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { PrinterName: { $regex: search, $options: 'i' } },
        { IpAddress: { $regex: search, $options: 'i' } }
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
    const [printers, total] = await Promise.all([
      Printer.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Printer.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Printers retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, printers, pagination, 'Printers retrieved successfully');
  } catch (error) {
    console.error('Error retrieving printers', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getPrinterById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let printer;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      printer = await Printer.findById(id);
    } else {
      const printerId = parseInt(id, 10);
      if (isNaN(printerId)) return sendNotFound(res, 'Invalid printer ID format');
      printer = await Printer.findOne({ Printer_id: printerId });
    }
    if (!printer) return sendNotFound(res, 'Printer not found');
    console.info('Printer retrieved successfully', { printerId: printer._id });
    sendSuccess(res, printer, 'Printer retrieved successfully');
  } catch (error) {
    console.error('Error retrieving printer', { error: error.message, printerId: req.params.id });
    throw error;
  }
});

const updatePrinter = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let printer;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      printer = await Printer.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const printerId = parseInt(id, 10);
      if (isNaN(printerId)) return sendNotFound(res, 'Invalid printer ID format');
      printer = await Printer.findOneAndUpdate({ Printer_id: printerId }, updateData, { new: true, runValidators: true });
    }
    if (!printer) return sendNotFound(res, 'Printer not found');
    console.info('Printer updated successfully', { printerId: printer._id });
    sendSuccess(res, printer, 'Printer updated successfully');
  } catch (error) {
    console.error('Error updating printer', { error: error.message, printerId: req.params.id });
    throw error;
  }
});

const deletePrinter = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let printer;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      printer = await Printer.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const printerId = parseInt(id, 10);
      if (isNaN(printerId)) return sendNotFound(res, 'Invalid printer ID format');
      printer = await Printer.findOneAndUpdate({ Printer_id: printerId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!printer) return sendNotFound(res, 'Printer not found');
    console.info('Printer deleted successfully', { printerId: printer._id });
    sendSuccess(res, printer, 'Printer deleted successfully');
  } catch (error) {
    console.error('Error deleting printer', { error: error.message, printerId: req.params.id });
    throw error;
  }
});

const getPrintersByTypeId = asyncHandler(async (req, res) => {
  try {
    const { type_id } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const typeId = parseInt(type_id, 10);
    if (isNaN(typeId)) return sendError(res, 'Invalid printer type ID format', 400);
    const filter = { Printer_type: typeId };
    if (status !== undefined) {
      if (typeof status === 'string') {
        filter.Status = status === 'true' || status === '1';
      } else {
        filter.Status = Boolean(status);
      }
    }
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [printers, total] = await Promise.all([
      Printer.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Printer.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Printers by type retrieved successfully', { total, typeId, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, printers, pagination, 'Printers retrieved successfully');
  } catch (error) {
    console.error('Error retrieving printers by type', { error: error.message, typeId: req.params.type_id });
    throw error;
  }
});

const getPrintersByAuth = asyncHandler(async (req, res) => {
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
    const [printers, total] = await Promise.all([
      Printer.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Printer.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Printers by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, printers, pagination, 'Printers retrieved successfully');
  } catch (error) {
    console.error('Error retrieving printers by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getPrinterDashboard = asyncHandler(async (req, res) => {
  try {
    const { branch_id } = req.query;
    
    if (!branch_id) {
      return sendError(res, 'Branch ID is required', 400);
    }
    
    const branchId = parseInt(branch_id, 10);
    if (isNaN(branchId)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }
    
    // Get all active printers for this branch
    const printers = await Printer.find({ Branch_id: branchId, Status: true });
    const printerIds = printers.map(p => p.Printer_id);
    
    // Count online and offline printers
    const PrinterOnlineCount = await Printer.countDocuments({ 
      Branch_id: branchId, 
      Status: true, 
      onlineStatus: true 
    });
    
    const PrinterOfflineCount = await Printer.countDocuments({ 
      Branch_id: branchId, 
      Status: true, 
      onlineStatus: false 
    });
    
    // Count printer issues (only active and unsolved issues)
    const PrinterIssuesCount = await Printer_Issues.countDocuments({ 
      Printer_id: { $in: printerIds }, 
      Status: true,
      solveStatus: false 
    });
    
    // Count pending and process orders
    const PrinterPendingandProcessOrderCount = await Printer_Orders.countDocuments({ 
      Branch_id: branchId, 
      Status: true, 
      orderStatus: { $in: ['Pending', 'Process'] } 
    });
    
    // Get printer list with order counts - only include printers with at least one "Done" order
    const PrinterListByBranchId = await Promise.all(
      printers.map(async (printer) => {
        // Check if printer has at least one "Done" order
        const hasDoneOrder = await Printer_Orders.exists({ 
          Printer_id: printer.Printer_id, 
          Status: true,
          orderStatus: 'Done'
        });
        
        // Only include printer if it has at least one "Done" order
        if (!hasDoneOrder) {
          return null;
        }
        
        const orderCount = await Printer_Orders.countDocuments({ 
          Printer_id: printer.Printer_id, 
          Status: true 
        });
        
        return {
          PrinterId: printer.Printer_id,
          PrinterName: printer.PrinterName,
          PrinterOnlineStatus: printer.onlineStatus,
          PaperStatus: printer.PaperStatus || '',
          OrderCount: orderCount,
          IpAddress: printer.IpAddress || ''
        };
      })
    );
    
    // Filter out null values (printers without "Done" orders)
    const filteredPrinterList = PrinterListByBranchId.filter(printer => printer !== null);
    
    const dashboardData = {
      PrinterOnlineCount,
      PrinterOfflineCount,
      PrinterIssuesCount,
      PrinterPendingandProcessOrderCount,
      PrinterListByBranchId: filteredPrinterList
    };
    
    console.info('Printer dashboard retrieved successfully', { branchId });
    sendSuccess(res, dashboardData, 'Printer dashboard retrieved successfully');
  } catch (error) {
    console.error('Error retrieving printer dashboard', { error: error.message, branchId: req.query.branch_id });
    throw error;
  }
});

module.exports = {
  createPrinter,
  getAllPrinters,
  getPrinterById,
  updatePrinter,
  deletePrinter,
  getPrintersByTypeId,
  getPrintersByAuth,
  getPrinterDashboard
};
