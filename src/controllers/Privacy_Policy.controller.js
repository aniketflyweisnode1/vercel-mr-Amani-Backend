const Privacy_Policy = require('../models/Privacy_Policy.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

const createPrivacyPolicy = asyncHandler(async (req, res) => {
  try {
    const policyData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const policy = await Privacy_Policy.create(policyData);
    logger.info('Privacy Policy created successfully', { policyId: policy._id, Privacy_Policy_id: policy.Privacy_Policy_id });
    sendSuccess(res, policy, 'Privacy Policy created successfully', 201);
  } catch (error) {
    logger.error('Error creating privacy policy', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllPrivacyPolicies = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { Description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [policies, total] = await Promise.all([
      Privacy_Policy.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Privacy_Policy.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('Privacy Policies retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, policies, pagination, 'Privacy Policies retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving privacy policies', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getPrivacyPolicyById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let policy;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      policy = await Privacy_Policy.findById(id);
    } else {
      const policyId = parseInt(id, 10);
      if (isNaN(policyId)) return sendNotFound(res, 'Invalid privacy policy ID format');
      policy = await Privacy_Policy.findOne({ Privacy_Policy_id: policyId });
    }
    if (!policy) return sendNotFound(res, 'Privacy Policy not found');
    logger.info('Privacy Policy retrieved successfully', { policyId: policy._id });
    sendSuccess(res, policy, 'Privacy Policy retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving privacy policy', { error: error.message, policyId: req.params.id });
    throw error;
  }
});

const updatePrivacyPolicy = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let policy;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      policy = await Privacy_Policy.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const policyId = parseInt(id, 10);
      if (isNaN(policyId)) return sendNotFound(res, 'Invalid privacy policy ID format');
      policy = await Privacy_Policy.findOneAndUpdate({ Privacy_Policy_id: policyId }, updateData, { new: true, runValidators: true });
    }
    if (!policy) return sendNotFound(res, 'Privacy Policy not found');
    logger.info('Privacy Policy updated successfully', { policyId: policy._id });
    sendSuccess(res, policy, 'Privacy Policy updated successfully');
  } catch (error) {
    logger.error('Error updating privacy policy', { error: error.message, policyId: req.params.id });
    throw error;
  }
});

const deletePrivacyPolicy = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let policy;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      policy = await Privacy_Policy.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const policyId = parseInt(id, 10);
      if (isNaN(policyId)) return sendNotFound(res, 'Invalid privacy policy ID format');
      policy = await Privacy_Policy.findOneAndUpdate({ Privacy_Policy_id: policyId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!policy) return sendNotFound(res, 'Privacy Policy not found');
    logger.info('Privacy Policy deleted successfully', { policyId: policy._id });
    sendSuccess(res, policy, 'Privacy Policy deleted successfully');
  } catch (error) {
    logger.error('Error deleting privacy policy', { error: error.message, policyId: req.params.id });
    throw error;
  }
});

module.exports = {
  createPrivacyPolicy, getAllPrivacyPolicies, getPrivacyPolicyById, updatePrivacyPolicy, deletePrivacyPolicy
};

