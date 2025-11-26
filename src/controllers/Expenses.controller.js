const Expenses = require('../models/Expenses.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureBusinessBranchExists = async (Branch_id) => {
  if (Branch_id === undefined || Branch_id === null) {
    return false;
  }

  const branch = await Business_Branch.findOne({ business_Branch_id: Branch_id, Status: true });
  return !!branch;
};

const parseDateInput = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const buildFilterFromQuery = ({ search, status, Branch_id, minAmount, maxAmount, startDate, endDate }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Expense_Name: { $regex: search, $options: 'i' } },
      { Details: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (Branch_id) {
    const branchIdNum = parseInt(Branch_id, 10);
    if (!isNaN(branchIdNum)) {
      filter.Branch_id = branchIdNum;
    }
  }

  if (minAmount !== undefined) {
    const min = parseFloat(minAmount);
    if (!isNaN(min)) {
      filter.Amount = { ...(filter.Amount || {}), $gte: min };
    }
  }

  if (maxAmount !== undefined) {
    const max = parseFloat(maxAmount);
    if (!isNaN(max)) {
      filter.Amount = { ...(filter.Amount || {}), $lte: max };
    }
  }

  if (startDate) {
    const parsedStart = parseDateInput(startDate);
    if (parsedStart) {
      filter.Date = { ...(filter.Date || {}), $gte: parsedStart };
    }
  }

  if (endDate) {
    const parsedEnd = parseDateInput(endDate);
    if (parsedEnd) {
      filter.Date = { ...(filter.Date || {}), $lte: parsedEnd };
    }
  }

  return filter;
};

const populateExpenses = (query) => query
  .populate('Branch_id', 'business_Branch_id firstName lastName Address BusinessName')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const createExpense = asyncHandler(async (req, res) => {
  try {
    const { Branch_id, Date: expenseDateString } = req.body;

    const branchExists = await ensureBusinessBranchExists(Branch_id);
    if (!branchExists) {
      return sendError(res, 'Associated business branch not found or inactive', 400);
    }

    const parsedDate = parseDateInput(expenseDateString);
    if (!parsedDate) {
      return sendError(res, 'Invalid date format provided', 400);
    }

    const payload = {
      ...req.body,
      Date: parsedDate,
      created_by: req.userIdNumber || null
    };

    const expense = await Expenses.create(payload);
    console.info('Expense created successfully', { Expense_id: expense.Expense_id });

    const populated = await populateExpenses(Expenses.findById(expense._id));
    sendSuccess(res, populated, 'Expense created successfully', 201);
  } catch (error) {
    console.error('Error creating expense', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllExpenses = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Branch_id,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ search, status, Branch_id, minAmount, maxAmount, startDate, endDate });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [expenses, total] = await Promise.all([
      populateExpenses(Expenses.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Expenses.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Expenses retrieved successfully', { total, page: numericPage });
    sendPaginated(res, expenses, pagination, 'Expenses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving expenses', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getExpenseById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let expense;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      expense = await populateExpenses(Expenses.findById(id));
    } else {
      const expenseId = parseInt(id, 10);
      if (isNaN(expenseId)) {
        return sendNotFound(res, 'Invalid expense ID format');
      }
      expense = await populateExpenses(Expenses.findOne({ Expense_id: expenseId }));
    }

    if (!expense) {
      return sendNotFound(res, 'Expense not found');
    }

    console.info('Expense retrieved successfully', { id: expense._id });
    sendSuccess(res, expense, 'Expense retrieved successfully');
  } catch (error) {
    console.error('Error retrieving expense', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateExpense = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.Branch_id);
      if (!branchExists) {
        return sendError(res, 'Associated business branch not found or inactive', 400);
      }
    }

    if (updateData.Date !== undefined) {
      const parsedDate = parseDateInput(updateData.Date);
      if (!parsedDate) {
        return sendError(res, 'Invalid date format provided', 400);
      }
      updateData.Date = parsedDate;
    }

    let expense;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      expense = await Expenses.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const expenseId = parseInt(id, 10);
      if (isNaN(expenseId)) {
        return sendNotFound(res, 'Invalid expense ID format');
      }
      expense = await Expenses.findOneAndUpdate({ Expense_id: expenseId }, updateData, { new: true, runValidators: true });
    }

    if (!expense) {
      return sendNotFound(res, 'Expense not found');
    }

    const populated = await populateExpenses(Expenses.findById(expense._id));
    console.info('Expense updated successfully', { id: expense._id });
    sendSuccess(res, populated, 'Expense updated successfully');
  } catch (error) {
    console.error('Error updating expense', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteExpense = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let expense;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      expense = await Expenses.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const expenseId = parseInt(id, 10);
      if (isNaN(expenseId)) {
        return sendNotFound(res, 'Invalid expense ID format');
      }
      expense = await Expenses.findOneAndUpdate({ Expense_id: expenseId }, updateData, { new: true });
    }

    if (!expense) {
      return sendNotFound(res, 'Expense not found');
    }

    console.info('Expense deleted successfully', { id: expense._id });
    sendSuccess(res, expense, 'Expense deleted successfully');
  } catch (error) {
    console.error('Error deleting expense', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getExpensesByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      Branch_id,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ status, Branch_id, minAmount, maxAmount, startDate, endDate });
    filter.created_by = req.userIdNumber;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [expenses, total] = await Promise.all([
      populateExpenses(Expenses.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Expenses.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Expenses retrieved for authenticated user', { userId: req.userIdNumber, total });
    sendPaginated(res, expenses, pagination, 'Expenses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving expenses for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getExpensesByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.params;
    const branchIdNum = parseInt(Branch_id, 10);

    if (isNaN(branchIdNum)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }

    const branchExists = await ensureBusinessBranchExists(branchIdNum);
    if (!branchExists) {
      return sendNotFound(res, 'Business branch not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      minAmount,
      maxAmount,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ search, status, minAmount, maxAmount, startDate, endDate });
    filter.Branch_id = branchIdNum;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [expenses, total] = await Promise.all([
      populateExpenses(Expenses.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Expenses.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Expenses retrieved by branch ID', { Branch_id: branchIdNum, total });
    sendPaginated(res, expenses, pagination, 'Expenses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving expenses by branch ID', { error: error.message, Branch_id: req.params.Branch_id });
    throw error;
  }
});

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpensesByAuth,
  getExpensesByBranchId
};


