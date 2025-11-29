const Referral = require('../models/Referral.model');
const User = require('../models/User.model');
const Transaction = require('../models/transaction.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateReferralData = async (referrals) => {
  const referralsArray = Array.isArray(referrals) ? referrals : [referrals];
  const populatedReferrals = await Promise.all(
    referralsArray.map(async (referral) => {
      const referralObj = referral.toObject ? referral.toObject() : referral;
      
      // Populate Referral_To
      if (referralObj.Referral_To) {
        const referralTo = await User.findOne({ user_id: referralObj.Referral_To });
        if (referralTo) {
          referralObj.Referral_To = referralTo.toObject ? referralTo.toObject() : referralTo;
        }
      }
      
      // Populate Referral_from
      if (referralObj.Referral_from) {
        const referralFrom = await User.findOne({ user_id: referralObj.Referral_from });
        if (referralFrom) {
          referralObj.Referral_from = referralFrom.toObject ? referralFrom.toObject() : referralFrom;
        }
      }
      
      // Populate Earning (Transaction)
      if (referralObj.Earning) {
        const transaction = await Transaction.findOne({ transaction_id: referralObj.Earning });
        if (transaction) {
          referralObj.Earning = transaction.toObject ? transaction.toObject() : transaction;
        }
      }
      
      // Populate created_by
      if (referralObj.created_by) {
        const createdById = typeof referralObj.created_by === 'object' ? referralObj.created_by : referralObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById });
        if (createdBy) {
          referralObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (referralObj.updated_by) {
        const updatedById = typeof referralObj.updated_by === 'object' ? referralObj.updated_by : referralObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById });
        if (updatedBy) {
          referralObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return referralObj;
    })
  );
  
  return Array.isArray(referrals) ? populatedReferrals : populatedReferrals[0];
};

const ensureUserExists = async (userId) => {
  if (userId === undefined || userId === null) {
    return false;
  }
  const userIdNum = parseInt(userId, 10);
  if (Number.isNaN(userIdNum)) {
    return false;
  }
  const user = await User.findOne({ user_id: userIdNum, status: true });
  return Boolean(user);
};

const ensureTransactionExists = async (transactionId) => {
  if (transactionId === undefined || transactionId === null) {
    return true; // Optional field
  }
  const transactionIdNum = parseInt(transactionId, 10);
  if (Number.isNaN(transactionIdNum)) {
    return false;
  }
  const transaction = await Transaction.findOne({ transaction_id: transactionIdNum });
  return Boolean(transaction);
};

const buildFilter = ({ status, Referral_To, Referral_from, Earning }) => {
  const filter = {};

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Referral_To !== undefined) {
    const referralToId = parseInt(Referral_To, 10);
    if (!Number.isNaN(referralToId)) {
      filter.Referral_To = referralToId;
    }
  }

  if (Referral_from !== undefined) {
    const referralFromId = parseInt(Referral_from, 10);
    if (!Number.isNaN(referralFromId)) {
      filter.Referral_from = referralFromId;
    }
  }

  if (Earning !== undefined) {
    const earningId = parseInt(Earning, 10);
    if (!Number.isNaN(earningId)) {
      filter.Earning = earningId;
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

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return Referral.findById(identifier);
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return Referral.findOne({ Referral_id: numericId });
  }
  return null;
};

const createReferral = asyncHandler(async (req, res) => {
  try {
    const { Referral_To, Referral_from, Earning } = req.body;
    
    if (!Referral_To) {
      return sendError(res, 'Referral To (User ID) is required', 400);
    }
    
    if (!Referral_from) {
      return sendError(res, 'Referral From (User ID) is required', 400);
    }
    
    if (Referral_To === Referral_from) {
      return sendError(res, 'Referral To and Referral From cannot be the same user', 400);
    }
    
    if (!(await ensureUserExists(Referral_To))) {
      return sendError(res, 'Referral To user not found or inactive', 400);
    }
    
    if (!(await ensureUserExists(Referral_from))) {
      return sendError(res, 'Referral From user not found or inactive', 400);
    }
    
    if (Earning !== undefined && Earning !== null && !(await ensureTransactionExists(Earning))) {
      return sendError(res, 'Transaction not found', 400);
    }
    
    const payload = {
      Referral_To,
      Referral_from,
      Earning: Earning || null,
      Status: true,
      created_by: req.userIdNumber || null
    };
    
    const referral = await Referral.create(payload);
    const populated = await populateReferralData(referral);
    sendSuccess(res, populated, 'Referral created successfully', 201);
  } catch (error) {
    console.error('Error creating referral', { error: error.message });
    throw error;
  }
});

const getAllReferrals = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      Referral_To,
      Referral_from,
      Earning,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const filter = buildFilter({ status, Referral_To, Referral_from, Earning });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [referrals, total] = await Promise.all([
      Referral.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Referral.countDocuments(filter)
    ]);
    
    const populatedReferrals = await populateReferralData(referrals);
    sendPaginated(res, populatedReferrals, paginateMeta(numericPage, numericLimit, total), 'Referrals retrieved successfully');
  } catch (error) {
    console.error('Error retrieving referrals', { error: error.message });
    throw error;
  }
});

const getReferralById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const referralQuery = findByIdentifier(id);
    if (!referralQuery) {
      return sendError(res, 'Invalid referral identifier', 400);
    }
    const referral = await referralQuery;
    if (!referral) {
      return sendNotFound(res, 'Referral not found');
    }
    const populated = await populateReferralData(referral);
    sendSuccess(res, populated, 'Referral retrieved successfully');
  } catch (error) {
    console.error('Error retrieving referral', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateReferral = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Referral_To, Referral_from, Earning, Status } = req.body;
    
    if (Referral_To !== undefined && !(await ensureUserExists(Referral_To))) {
      return sendError(res, 'Referral To user not found or inactive', 400);
    }
    
    if (Referral_from !== undefined && !(await ensureUserExists(Referral_from))) {
      return sendError(res, 'Referral From user not found or inactive', 400);
    }
    
    if (Referral_To !== undefined && Referral_from !== undefined && Referral_To === Referral_from) {
      return sendError(res, 'Referral To and Referral From cannot be the same user', 400);
    }
    
    if (Earning !== undefined && Earning !== null && !(await ensureTransactionExists(Earning))) {
      return sendError(res, 'Transaction not found', 400);
    }
    
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    
    let referral;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      referral = await Referral.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid referral ID format', 400);
      }
      referral = await Referral.findOneAndUpdate({ Referral_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    
    if (!referral) {
      return sendNotFound(res, 'Referral not found');
    }
    
    const populated = await populateReferralData(referral);
    sendSuccess(res, populated, 'Referral updated successfully');
  } catch (error) {
    console.error('Error updating referral', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteReferral = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    
    let referral;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      referral = await Referral.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid referral ID format', 400);
      }
      referral = await Referral.findOneAndUpdate({ Referral_id: numericId }, updatePayload, { new: true });
    }
    
    if (!referral) {
      return sendNotFound(res, 'Referral not found');
    }
    
    sendSuccess(res, referral, 'Referral deleted successfully');
  } catch (error) {
    console.error('Error deleting referral', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getReferralsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      Referral_To,
      Referral_from,
      Earning,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const filter = buildFilter({ status, Referral_To, Referral_from, Earning });
    // Filter by authenticated user - show referrals where user is either Referral_To or Referral_from
    filter.$or = [
      { Referral_To: req.userIdNumber },
      { Referral_from: req.userIdNumber }
    ];
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [referrals, total] = await Promise.all([
      Referral.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Referral.countDocuments(filter)
    ]);
    
    const populatedReferrals = await populateReferralData(referrals);
    sendPaginated(res, populatedReferrals, paginateMeta(numericPage, numericLimit, total), 'Referrals retrieved successfully');
  } catch (error) {
    console.error('Error retrieving referrals by auth', { error: error.message });
    throw error;
  }
});

module.exports = {
  createReferral,
  getAllReferrals,
  getReferralById,
  updateReferral,
  deleteReferral,
  getReferralsByAuth
};

