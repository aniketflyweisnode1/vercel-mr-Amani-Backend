const Plan = require('../models/Plan.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const createPlan = asyncHandler(async (req, res) => {
  try {
    const planData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const plan = await Plan.create(planData);
    console.info('Plan created successfully', { planId: plan._id, Plan_id: plan.Plan_id });
    sendSuccess(res, plan, 'Plan created successfully', 201);
  } catch (error) {
    console.error('Error creating plan', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllPlans = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [plans, total] = await Promise.all([
      Plan.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Plan.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Plans retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, plans, pagination, 'Plans retrieved successfully');
  } catch (error) {
    console.error('Error retrieving plans', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getPlanById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let plan;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      plan = await Plan.findById(id);
    } else {
      const planId = parseInt(id, 10);
      if (isNaN(planId)) return sendNotFound(res, 'Invalid plan ID format');
      plan = await Plan.findOne({ Plan_id: planId });
    }
    if (!plan) return sendNotFound(res, 'Plan not found');
    console.info('Plan retrieved successfully', { planId: plan._id });
    sendSuccess(res, plan, 'Plan retrieved successfully');
  } catch (error) {
    console.error('Error retrieving plan', { error: error.message, planId: req.params.id });
    throw error;
  }
});

const updatePlan = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let plan;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      plan = await Plan.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const planId = parseInt(id, 10);
      if (isNaN(planId)) return sendNotFound(res, 'Invalid plan ID format');
      plan = await Plan.findOneAndUpdate({ Plan_id: planId }, updateData, { new: true, runValidators: true });
    }
    if (!plan) return sendNotFound(res, 'Plan not found');
    console.info('Plan updated successfully', { planId: plan._id });
    sendSuccess(res, plan, 'Plan updated successfully');
  } catch (error) {
    console.error('Error updating plan', { error: error.message, planId: req.params.id });
    throw error;
  }
});

const deletePlan = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let plan;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      plan = await Plan.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const planId = parseInt(id, 10);
      if (isNaN(planId)) return sendNotFound(res, 'Invalid plan ID format');
      plan = await Plan.findOneAndUpdate({ Plan_id: planId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!plan) return sendNotFound(res, 'Plan not found');
    console.info('Plan deleted successfully', { planId: plan._id });
    sendSuccess(res, plan, 'Plan deleted successfully');
  } catch (error) {
    console.error('Error deleting plan', { error: error.message, planId: req.params.id });
    throw error;
  }
});

const getPlansByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { created_by: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [plans, total] = await Promise.all([
      Plan.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Plan.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Plans by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, plans, pagination, 'Plans retrieved successfully');
  } catch (error) {
    console.error('Error retrieving plans by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createPlan, getAllPlans, getPlanById, updatePlan, deletePlan, getPlansByAuth
};

