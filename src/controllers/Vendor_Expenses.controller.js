const VendorExpenses = require('../models/Vendor_Expenses.model');
const User = require('../models/User.model');
const VendorProductCategory = require('../models/Vendor_Product_Category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateVendorExpenses = (query) => query
  .populate('user_id', 'user_id firstName lastName phoneNo BusinessName Email')
  .populate('Category_id', 'Vendor_Product_Category_id CategoryName')
  .populate('created_by', 'user_id firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'user_id firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, user_id, Category_id, startDate, endDate, date }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { ExpenseName: { $regex: search, $options: 'i' } },
      { Details: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (user_id !== undefined) {
    const userId = parseInt(user_id, 10);
    if (!Number.isNaN(userId)) {
      filter.user_id = userId;
    }
  }

  if (Category_id !== undefined) {
    const categoryId = parseInt(Category_id, 10);
    if (!Number.isNaN(categoryId)) {
      filter.Category_id = categoryId;
    }
  }

  if (date) {
    const expenseDate = new Date(date);
    const startOfDay = new Date(expenseDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(expenseDate.setHours(23, 59, 59, 999));
    filter.Date = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  } else if (startDate || endDate) {
    filter.Date = {};
    if (startDate) {
      filter.Date.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.Date.$lte = new Date(endDate);
    }
  }

  return filter;
};

const paginateMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

const ensureUserExists = async (user_id) => {
  if (user_id === undefined) {
    return true;
  }
  const userId = parseInt(user_id, 10);
  if (Number.isNaN(userId)) {
    return false;
  }
  const user = await User.findOne({ user_id: userId, status: true });
  return Boolean(user);
};

const ensureCategoryExists = async (Category_id) => {
  if (Category_id === undefined) {
    return true;
  }
  const categoryId = parseInt(Category_id, 10);
  if (Number.isNaN(categoryId)) {
    return false;
  }
  const category = await VendorProductCategory.findOne({ Vendor_Product_Category_id: categoryId, Status: true });
  return Boolean(category);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateVendorExpenses(VendorExpenses.findById(identifier));
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateVendorExpenses(VendorExpenses.findOne({ Vendor_Expenses_id: numericId }));
  }
  return null;
};

const createVendorExpenses = asyncHandler(async (req, res) => {
  try {
    const { user_id, Category_id } = req.body;
    if (!(await ensureUserExists(user_id))) {
      return sendError(res, 'User not found', 400);
    }
    if (!(await ensureCategoryExists(Category_id))) {
      return sendError(res, 'Category not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const expense = await VendorExpenses.create(payload);
    const populated = await populateVendorExpenses(VendorExpenses.findById(expense._id));
    sendSuccess(res, populated, 'Vendor expense created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor expense', { error: error.message });
    throw error;
  }
});

const getAllVendorExpenses = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      Category_id,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id, Category_id, startDate, endDate });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [expenses, total] = await Promise.all([
      populateVendorExpenses(VendorExpenses.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorExpenses.countDocuments(filter)
    ]);
    sendPaginated(res, expenses, paginateMeta(numericPage, numericLimit, total), 'Vendor expenses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor expenses', { error: error.message });
    throw error;
  }
});

const getVendorExpensesById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const expenseQuery = findByIdentifier(id);
    if (!expenseQuery) {
      return sendError(res, 'Invalid vendor expense identifier', 400);
    }
    const expense = await expenseQuery;
    if (!expense) {
      return sendNotFound(res, 'Vendor expense not found');
    }
    sendSuccess(res, expense, 'Vendor expense retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor expense', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorExpenses = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, Category_id } = req.body;
    if (user_id !== undefined && !(await ensureUserExists(user_id))) {
      return sendError(res, 'User not found', 400);
    }
    if (Category_id !== undefined && !(await ensureCategoryExists(Category_id))) {
      return sendError(res, 'Category not found', 400);
    }
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let expense;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      expense = await VendorExpenses.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor expense ID format', 400);
      }
      expense = await VendorExpenses.findOneAndUpdate({ Vendor_Expenses_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!expense) {
      return sendNotFound(res, 'Vendor expense not found');
    }
    const populated = await populateVendorExpenses(VendorExpenses.findById(expense._id));
    sendSuccess(res, populated, 'Vendor expense updated successfully');
  } catch (error) {
    console.error('Error updating vendor expense', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorExpenses = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let expense;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      expense = await VendorExpenses.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor expense ID format', 400);
      }
      expense = await VendorExpenses.findOneAndUpdate({ Vendor_Expenses_id: numericId }, updatePayload, { new: true });
    }
    if (!expense) {
      return sendNotFound(res, 'Vendor expense not found');
    }
    sendSuccess(res, expense, 'Vendor expense deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor expense', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorExpensesByTypeId = asyncHandler(async (req, res) => {
  try {
    const { Type_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const typeId = parseInt(Type_id, 10);
    if (Number.isNaN(typeId)) {
      return sendError(res, 'Invalid type ID format', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id, startDate, endDate });
    filter.Category_id = typeId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [expenses, total] = await Promise.all([
      populateVendorExpenses(VendorExpenses.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorExpenses.countDocuments(filter)
    ]);
    sendPaginated(res, expenses, paginateMeta(numericPage, numericLimit, total), 'Vendor expenses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor expenses by type', { error: error.message, Type_id: req.params.Type_id });
    throw error;
  }
});

const getVendorExpensesByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Category_id,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Category_id, startDate, endDate });
    filter.created_by = userId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [expenses, total] = await Promise.all([
      populateVendorExpenses(VendorExpenses.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorExpenses.countDocuments(filter)
    ]);
    sendPaginated(res, expenses, paginateMeta(numericPage, numericLimit, total), 'Vendor expenses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor expenses by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getVendorExpensesByCategoryId = asyncHandler(async (req, res) => {
  try {
    const { Category_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const categoryId = parseInt(Category_id, 10);
    if (Number.isNaN(categoryId)) {
      return sendError(res, 'Invalid category ID format', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id, startDate, endDate });
    filter.Category_id = categoryId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [expenses, total] = await Promise.all([
      populateVendorExpenses(VendorExpenses.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorExpenses.countDocuments(filter)
    ]);
    sendPaginated(res, expenses, paginateMeta(numericPage, numericLimit, total), 'Vendor expenses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor expenses by category', { error: error.message, Category_id: req.params.Category_id });
    throw error;
  }
});

const getVendorExpensesByDate = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      Category_id,
      date,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    if (!date) {
      return sendError(res, 'Date is required', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id, Category_id, date });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [expenses, total] = await Promise.all([
      populateVendorExpenses(VendorExpenses.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorExpenses.countDocuments(filter)
    ]);
    sendPaginated(res, expenses, paginateMeta(numericPage, numericLimit, total), 'Vendor expenses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor expenses by date', { error: error.message });
    throw error;
  }
});

module.exports = {
  createVendorExpenses,
  getAllVendorExpenses,
  getVendorExpensesById,
  updateVendorExpenses,
  deleteVendorExpenses,
  getVendorExpensesByTypeId,
  getVendorExpensesByAuth,
  getVendorExpensesByCategoryId,
  getVendorExpensesByDate
};

