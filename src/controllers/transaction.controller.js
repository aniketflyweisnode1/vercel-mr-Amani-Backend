const Transaction = require('../models/transaction.model');
const Plan = require('../models/Plan.model');
const User = require('../models/User.model');
const PaymentMethods = require('../models/payment_method.model');
const BusinessBranch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateTransactionData = async (transactions) => {
  const transactionsArray = Array.isArray(transactions) ? transactions : [transactions];
  const populatedTransactions = await Promise.all(
    transactionsArray.map(async (transaction) => {
      const transactionObj = transaction.toObject ? transaction.toObject() : transaction;
      
      // Populate Plan_id
      if (transactionObj.Plan_id) {
        const plan = await Plan.findOne({ Plan_id: transactionObj.Plan_id })
          .select('Plan_id name Price');
        if (plan) {
          transactionObj.Plan_id = plan.toObject ? plan.toObject() : plan;
        }
      }
      
      // Populate user_id
      if (transactionObj.user_id) {
        const user = await User.findOne({ user_id: transactionObj.user_id })
          .select('user_id firstName lastName phoneNo');
        if (user) {
          transactionObj.user_id = user.toObject ? user.toObject() : user;
        }
      }
      
      // Populate payment_method_id
      if (transactionObj.payment_method_id) {
        const paymentMethod = await PaymentMethods.findOne({ payment_method_id: transactionObj.payment_method_id })
          .select('payment_method_id payment_method emoji');
        if (paymentMethod) {
          transactionObj.payment_method_id = paymentMethod.toObject ? paymentMethod.toObject() : paymentMethod;
        }
      }
      
      // Populate business_Branch_id
      if (transactionObj.business_Branch_id) {
        const branch = await BusinessBranch.findOne({ business_Branch_id: transactionObj.business_Branch_id })
          .select('business_Branch_id BusinessName firstName lastName Address');
        if (branch) {
          transactionObj.business_Branch_id = branch.toObject ? branch.toObject() : branch;
        }
      }
      
      return transactionObj;
    })
  );
  
  return Array.isArray(transactions) ? populatedTransactions : populatedTransactions[0];
};

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
    
    // Parse pagination parameters
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { reference_number: { $regex: search, $options: 'i' } },
        { metadata: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.status = status;
    if (transactionType) filter.transactionType = transactionType;
    if (user_id) {
      const userId = parseInt(user_id, 10);
      if (!Number.isNaN(userId) && userId > 0) {
        filter.user_id = userId;
      }
    }
    if (business_Branch_id) {
      const branchId = parseInt(business_Branch_id, 10);
      if (!Number.isNaN(branchId) && branchId > 0) {
        filter.business_Branch_id = branchId;
      }
    }
    if (req.query.Status !== undefined) filter.Status = req.query.Status === 'true';
    
    const sort = {}; 
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Transaction.countDocuments(filter)
    ]);
    
    const populatedTransactions = await populateTransactionData(transactions);
    
    const totalPages = Math.ceil(total / numericLimit);
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };
    
    console.info('Transactions retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, populatedTransactions, pagination, 'Transactions retrieved successfully');
  } catch (error) {
    console.error('Error retrieving transactions', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getTransactionById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let transaction;
    const idStr = String(id);
    if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findById(id);
    } else {
      const transactionId = parseInt(id, 10);
      if (Number.isNaN(transactionId) || transactionId <= 0) {
        return sendError(res, 'Invalid transaction ID format', 400);
      }
      transaction = await Transaction.findOne({ transaction_id: transactionId });
    }
    if (!transaction) return sendNotFound(res, 'Transaction not found');
    
    const populated = await populateTransactionData(transaction);
    console.info('Transaction retrieved successfully', { transactionId: transaction._id });
    sendSuccess(res, populated, 'Transaction retrieved successfully');
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
    const idStr = String(id);
    if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const transactionId = parseInt(id, 10);
      if (Number.isNaN(transactionId) || transactionId <= 0) {
        return sendError(res, 'Invalid transaction ID format', 400);
      }
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
    const idStr = String(id);
    if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const transactionId = parseInt(id, 10);
      if (Number.isNaN(transactionId) || transactionId <= 0) {
        return sendError(res, 'Invalid transaction ID format', 400);
      }
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
    
    // Parse pagination parameters
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const filter = { user_id: req.userIdNumber };
    
    // Filter by status
    if (status !== undefined && status !== null && status !== '') {
      filter.status = status;
    }
    
    // Filter by transactionType
    if (transactionType !== undefined && transactionType !== null && transactionType !== '') {
      filter.transactionType = transactionType;
    }
    if (business_Branch_id) {
      const branchId = parseInt(business_Branch_id, 10);
      if (!Number.isNaN(branchId) && branchId > 0) {
        filter.business_Branch_id = branchId;
      }
    }
    if (req.query.Status !== undefined) filter.Status = req.query.Status === 'true';
    
    const sort = {}; 
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Transaction.countDocuments(filter)
    ]);
    
    const populatedTransactions = await populateTransactionData(transactions);
    
    const totalPages = Math.ceil(total / numericLimit);
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };
    
    console.info('Transactions by authenticated user retrieved successfully', { total, page: numericPage, limit: numericLimit, userId: req.userIdNumber });
    sendPaginated(res, populatedTransactions, pagination, 'Transactions retrieved successfully');
  } catch (error) {
    console.error('Error retrieving transactions by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createTransaction, getAllTransactions, getTransactionById, updateTransaction, deleteTransaction, getTransactionsByAuth
};

