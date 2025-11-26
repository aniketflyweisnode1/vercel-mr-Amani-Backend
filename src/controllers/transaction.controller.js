const Transaction = require('../models/transaction.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const createTransaction = asyncHandler(async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const transaction = await Transaction.create(transactionData);
    console.info('Transaction created successfully', { transactionId: transaction._id, transaction_id: transaction.transaction_id });
    sendSuccess(res, transaction, 'Transaction created successfully', 201);
  } catch (error) {
    console.error('Error creating transaction', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllTransactions = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      transactionType,
      user_id,
      business_Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { reference_number: { $regex: search, $options: 'i' } },
        { metadata: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.status = status;
    if (transactionType) filter.transactionType = transactionType;
    if (user_id) filter.user_id = parseInt(user_id, 10);
    if (business_Branch_id) filter.business_Branch_id = parseInt(business_Branch_id, 10);
    if (req.query.Status !== undefined) filter.Status = req.query.Status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('Plan_id', 'name Price')
        .populate('user_id', 'firstName lastName phoneNo')
        .populate('payment_method_id', 'payment_method emoji')
        .populate('business_Branch_id', 'business_Branch_id BusinessName firstName lastName Address')
        .sort(sort).skip(skip).limit(parseInt(limit)),
      Transaction.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Transactions retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, transactions, pagination, 'Transactions retrieved successfully');
  } catch (error) {
    console.error('Error retrieving transactions', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getTransactionById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let transaction;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findById(id)
        .populate('Plan_id', 'name Price')
        .populate('user_id', 'firstName lastName phoneNo')
        .populate('payment_method_id', 'payment_method emoji')
        .populate('business_Branch_id', 'business_Branch_id BusinessName firstName lastName Address');
    } else {
      const transactionId = parseInt(id, 10);
      if (isNaN(transactionId)) return sendNotFound(res, 'Invalid transaction ID format');
      transaction = await Transaction.findOne({ transaction_id: transactionId })
        .populate('Plan_id', 'name Price')
        .populate('user_id', 'firstName lastName phoneNo')
        .populate('payment_method_id', 'payment_method emoji')
        .populate('business_Branch_id', 'business_Branch_id BusinessName firstName lastName Address');
    }
    if (!transaction) return sendNotFound(res, 'Transaction not found');
    console.info('Transaction retrieved successfully', { transactionId: transaction._id });
    sendSuccess(res, transaction, 'Transaction retrieved successfully');
  } catch (error) {
    console.error('Error retrieving transaction', { error: error.message, transactionId: req.params.id });
    throw error;
  }
});

const updateTransaction = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let transaction;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const transactionId = parseInt(id, 10);
      if (isNaN(transactionId)) return sendNotFound(res, 'Invalid transaction ID format');
      transaction = await Transaction.findOneAndUpdate({ transaction_id: transactionId }, updateData, { new: true, runValidators: true });
    }
    if (!transaction) return sendNotFound(res, 'Transaction not found');
    console.info('Transaction updated successfully', { transactionId: transaction._id });
    sendSuccess(res, transaction, 'Transaction updated successfully');
  } catch (error) {
    console.error('Error updating transaction', { error: error.message, transactionId: req.params.id });
    throw error;
  }
});

const deleteTransaction = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let transaction;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const transactionId = parseInt(id, 10);
      if (isNaN(transactionId)) return sendNotFound(res, 'Invalid transaction ID format');
      transaction = await Transaction.findOneAndUpdate({ transaction_id: transactionId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!transaction) return sendNotFound(res, 'Transaction not found');
    console.info('Transaction deleted successfully', { transactionId: transaction._id });
    sendSuccess(res, transaction, 'Transaction deleted successfully');
  } catch (error) {
    console.error('Error deleting transaction', { error: error.message, transactionId: req.params.id });
    throw error;
  }
});

const getTransactionsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      transactionType,
      business_Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const filter = { user_id: req.userIdNumber };
    if (status !== undefined) filter.status = status;
    if (transactionType) filter.transactionType = transactionType;
    if (business_Branch_id) filter.business_Branch_id = parseInt(business_Branch_id, 10);
    if (req.query.Status !== undefined) filter.Status = req.query.Status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('Plan_id', 'name Price')
        .populate('payment_method_id', 'payment_method emoji')
        .populate('business_Branch_id', 'business_Branch_id BusinessName firstName lastName Address')
        .sort(sort).skip(skip).limit(parseInt(limit)),
      Transaction.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Transactions by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, transactions, pagination, 'Transactions retrieved successfully');
  } catch (error) {
    console.error('Error retrieving transactions by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createTransaction, getAllTransactions, getTransactionById, updateTransaction, deleteTransaction, getTransactionsByAuth
};

