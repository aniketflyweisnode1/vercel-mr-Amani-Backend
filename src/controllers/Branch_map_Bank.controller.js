const BranchMapBank = require('../models/Branch_map_Bank.model');
const Business_Branch = require('../models/business_Branch.model');
const Bank = require('../models/Bank.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureBusinessBranchExists = async (Branch_id) => {
  if (Branch_id === undefined || Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: Branch_id, Status: true });
  return !!branch;
};

const ensureBankExists = async (Bank_id) => {
  if (Bank_id === undefined || Bank_id === null) {
    return false;
  }
  const bank = await Bank.findOne({ Bank_id, Status: true });
  return !!bank;
};

const buildFilterFromQuery = ({ status, Branch_id, Bank_id }) => {
  const filter = {};

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (Branch_id) {
    const branchIdNum = parseInt(Branch_id, 10);
    if (!isNaN(branchIdNum)) {
      filter.Branch_id = branchIdNum;
    }
  }

  if (Bank_id) {
    const bankIdNum = parseInt(Bank_id, 10);
    if (!isNaN(bankIdNum)) {
      filter.Bank_id = bankIdNum;
    }
  }

  return filter;
};

const populateBranchMapBank = (query) => query
  .populate('Branch_id', 'business_Branch_id firstName lastName Address BusinessName')
  .populate('Bank_id', 'Bank_id Bank_name AccountNo AccountType')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const createBranchMapBank = asyncHandler(async (req, res) => {
  try {
    const { Branch_id, Bank_id } = req.body;

    const [branchExists, bankExists] = await Promise.all([
      ensureBusinessBranchExists(Branch_id),
      ensureBankExists(Bank_id)
    ]);

    if (!branchExists) {
      return sendError(res, 'Associated business branch not found or inactive', 400);
    }

    if (!bankExists) {
      return sendError(res, 'Associated bank not found or inactive', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const mapping = await BranchMapBank.create(payload);
    console.info('Branch map bank created successfully', { Branch_map_Bank_id: mapping.Branch_map_Bank_id });

    const populated = await populateBranchMapBank(BranchMapBank.findById(mapping._id));
    sendSuccess(res, populated, 'Branch map bank created successfully', 201);
  } catch (error) {
    console.error('Error creating branch map bank', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllBranchMapBanks = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      Branch_id,
      Bank_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilterFromQuery({ status, Branch_id, Bank_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [mappings, total] = await Promise.all([
      populateBranchMapBank(BranchMapBank.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      BranchMapBank.countDocuments(filter)
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

    console.info('Branch map bank records retrieved successfully', { total, page: numericPage });
    sendPaginated(res, mappings, pagination, 'Branch map bank records retrieved successfully');
  } catch (error) {
    console.error('Error retrieving branch map bank records', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getBranchMapBankById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let mapping;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      mapping = await populateBranchMapBank(BranchMapBank.findById(id));
    } else {
      const mapId = parseInt(id, 10);
      if (isNaN(mapId)) {
        return sendNotFound(res, 'Invalid branch map bank ID format');
      }
      mapping = await populateBranchMapBank(BranchMapBank.findOne({ Branch_map_Bank_id: mapId }));
    }

    if (!mapping) {
      return sendNotFound(res, 'Branch map bank record not found');
    }

    console.info('Branch map bank record retrieved successfully', { id: mapping._id });
    sendSuccess(res, mapping, 'Branch map bank record retrieved successfully');
  } catch (error) {
    console.error('Error retrieving branch map bank record', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateBranchMapBank = asyncHandler(async (req, res) => {
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

    if (updateData.Bank_id !== undefined) {
      const bankExists = await ensureBankExists(updateData.Bank_id);
      if (!bankExists) {
        return sendError(res, 'Associated bank not found or inactive', 400);
      }
    }

    let mapping;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      mapping = await BranchMapBank.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const mapId = parseInt(id, 10);
      if (isNaN(mapId)) {
        return sendNotFound(res, 'Invalid branch map bank ID format');
      }
      mapping = await BranchMapBank.findOneAndUpdate({ Branch_map_Bank_id: mapId }, updateData, { new: true, runValidators: true });
    }

    if (!mapping) {
      return sendNotFound(res, 'Branch map bank record not found');
    }

    const populated = await populateBranchMapBank(BranchMapBank.findById(mapping._id));
    console.info('Branch map bank record updated successfully', { id: mapping._id });
    sendSuccess(res, populated, 'Branch map bank record updated successfully');
  } catch (error) {
    console.error('Error updating branch map bank record', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteBranchMapBank = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let mapping;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      mapping = await BranchMapBank.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const mapId = parseInt(id, 10);
      if (isNaN(mapId)) {
        return sendNotFound(res, 'Invalid branch map bank ID format');
      }
      mapping = await BranchMapBank.findOneAndUpdate({ Branch_map_Bank_id: mapId }, updateData, { new: true });
    }

    if (!mapping) {
      return sendNotFound(res, 'Branch map bank record not found');
    }

    console.info('Branch map bank record deleted successfully', { id: mapping._id });
    sendSuccess(res, mapping, 'Branch map bank record deleted successfully');
  } catch (error) {
    console.error('Error deleting branch map bank record', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getBranchMapBankByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      Branch_id,
      Bank_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ status, Branch_id, Bank_id });
    filter.created_by = req.userIdNumber;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [mappings, total] = await Promise.all([
      populateBranchMapBank(BranchMapBank.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      BranchMapBank.countDocuments(filter)
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

    console.info('Branch map bank records retrieved for authenticated user', { userId: req.userIdNumber, total });
    sendPaginated(res, mappings, pagination, 'Branch map bank records retrieved successfully');
  } catch (error) {
    console.error('Error retrieving branch map bank records for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getBranchMapBankByBranchId = asyncHandler(async (req, res) => {
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
      Bank_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = buildFilterFromQuery({ status, Bank_id });
    filter.Branch_id = branchIdNum;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [mappings, total] = await Promise.all([
      populateBranchMapBank(BranchMapBank.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      BranchMapBank.countDocuments(filter)
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

    console.info('Branch map bank records retrieved by branch ID', { Branch_id: branchIdNum, total });
    sendPaginated(res, mappings, pagination, 'Branch map bank records retrieved successfully');
  } catch (error) {
    console.error('Error retrieving branch map bank records by branch ID', { error: error.message, Branch_id: req.params.Branch_id });
    throw error;
  }
});

module.exports = {
  createBranchMapBank,
  getAllBranchMapBanks,
  getBranchMapBankById,
  updateBranchMapBank,
  deleteBranchMapBank,
  getBranchMapBankByAuth,
  getBranchMapBankByBranchId
};


