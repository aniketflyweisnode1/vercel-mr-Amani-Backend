const Bank = require('../models/Bank.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

const createBank = asyncHandler(async (req, res) => {
  try {
    const bankData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const existingAccount = await Bank.findOne({ AccountNo: bankData.AccountNo, User_Id: bankData.User_Id });
    if (existingAccount) {
      return sendError(res, 'Bank account already exists for this user with the provided account number', 400);
    }

    const bank = await Bank.create(bankData);
    logger.info('Bank created successfully', { bankId: bank._id, Bank_id: bank.Bank_id });
    sendSuccess(res, bank, 'Bank created successfully', 201);
  } catch (error) {
    logger.error('Error creating bank', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllBanks = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, user_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { Bank_name: { $regex: search, $options: 'i' } },
        { AccountNo: { $regex: search, $options: 'i' } },
        { AccountType: { $regex: search, $options: 'i' } },
        { AccountHoladerName: { $regex: search, $options: 'i' } },
        { RoutingNo: { $regex: search, $options: 'i' } },
        { Branch: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    if (user_id) filter.User_Id = parseInt(user_id, 10);

    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const [banks, total] = await Promise.all([
      Bank.find(filter).sort(sort).skip(skip).limit(parseInt(limit, 10)),
      Bank.countDocuments(filter)
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

    logger.info('Banks retrieved successfully', { total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
    sendPaginated(res, banks, pagination, 'Banks retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving banks', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getBankById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let bank;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      bank = await Bank.findById(id);
    } else {
      const bankId = parseInt(id, 10);
      if (isNaN(bankId)) return sendNotFound(res, 'Invalid bank ID format');
      bank = await Bank.findOne({ Bank_id: bankId });
    }

    if (!bank) return sendNotFound(res, 'Bank not found');

    logger.info('Bank retrieved successfully', { bankId: bank._id });
    sendSuccess(res, bank, 'Bank retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving bank', { error: error.message, bankId: req.params.id });
    throw error;
  }
});

const updateBank = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let bank;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      bank = await Bank.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const bankId = parseInt(id, 10);
      if (isNaN(bankId)) return sendNotFound(res, 'Invalid bank ID format');
      bank = await Bank.findOneAndUpdate({ Bank_id: bankId }, updateData, { new: true, runValidators: true });
    }

    if (!bank) return sendNotFound(res, 'Bank not found');

    logger.info('Bank updated successfully', { bankId: bank._id });
    sendSuccess(res, bank, 'Bank updated successfully');
  } catch (error) {
    logger.error('Error updating bank', { error: error.message, bankId: req.params.id });
    throw error;
  }
});

const deleteBank = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let bank;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      bank = await Bank.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const bankId = parseInt(id, 10);
      if (isNaN(bankId)) return sendNotFound(res, 'Invalid bank ID format');
      bank = await Bank.findOneAndUpdate({ Bank_id: bankId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }

    if (!bank) return sendNotFound(res, 'Bank not found');

    logger.info('Bank deleted successfully', { bankId: bank._id });
    sendSuccess(res, bank, 'Bank deleted successfully');
  } catch (error) {
    logger.error('Error deleting bank', { error: error.message, bankId: req.params.id });
    throw error;
  }
});

module.exports = {
  createBank,
  getAllBanks,
  getBankById,
  updateBank,
  deleteBank
};
