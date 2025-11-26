const Subscription = require('../models/subscription.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const createSubscription = asyncHandler(async (req, res) => {
  try {
    const subscriptionData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const subscription = await Subscription.create(subscriptionData);
    console.info('Subscription created successfully', { subscriptionId: subscription._id, subscription_id: subscription.subscription_id });
    sendSuccess(res, subscription, 'Subscription created successfully', 201);
  } catch (error) {
    console.error('Error creating subscription', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllSubscriptions = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, user_id, Plan_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { planStatus: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    if (user_id) filter.user_id = parseInt(user_id, 10);
    if (Plan_id) filter.Plan_id = parseInt(Plan_id, 10);
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter)
        .populate('Plan_id', 'name Price PlanDurectionDay')
        .populate('user_id', 'firstName lastName phoneNo')
        .populate('transaction_id', 'amount status transactionType')
        .sort(sort).skip(skip).limit(parseInt(limit)),
      Subscription.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Subscriptions retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, subscriptions, pagination, 'Subscriptions retrieved successfully');
  } catch (error) {
    console.error('Error retrieving subscriptions', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getSubscriptionById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let subscription;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      subscription = await Subscription.findById(id)
        .populate('Plan_id', 'name Price PlanDurectionDay')
        .populate('user_id', 'firstName lastName phoneNo')
        .populate('transaction_id', 'amount status transactionType');
    } else {
      const subscriptionId = parseInt(id, 10);
      if (isNaN(subscriptionId)) return sendNotFound(res, 'Invalid subscription ID format');
      subscription = await Subscription.findOne({ subscription_id: subscriptionId })
        .populate('Plan_id', 'name Price PlanDurectionDay')
        .populate('user_id', 'firstName lastName phoneNo')
        .populate('transaction_id', 'amount status transactionType');
    }
    if (!subscription) return sendNotFound(res, 'Subscription not found');
    console.info('Subscription retrieved successfully', { subscriptionId: subscription._id });
    sendSuccess(res, subscription, 'Subscription retrieved successfully');
  } catch (error) {
    console.error('Error retrieving subscription', { error: error.message, subscriptionId: req.params.id });
    throw error;
  }
});

const updateSubscription = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let subscription;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      subscription = await Subscription.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const subscriptionId = parseInt(id, 10);
      if (isNaN(subscriptionId)) return sendNotFound(res, 'Invalid subscription ID format');
      subscription = await Subscription.findOneAndUpdate({ subscription_id: subscriptionId }, updateData, { new: true, runValidators: true });
    }
    if (!subscription) return sendNotFound(res, 'Subscription not found');
    console.info('Subscription updated successfully', { subscriptionId: subscription._id });
    sendSuccess(res, subscription, 'Subscription updated successfully');
  } catch (error) {
    console.error('Error updating subscription', { error: error.message, subscriptionId: req.params.id });
    throw error;
  }
});

const deleteSubscription = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let subscription;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      subscription = await Subscription.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const subscriptionId = parseInt(id, 10);
      if (isNaN(subscriptionId)) return sendNotFound(res, 'Invalid subscription ID format');
      subscription = await Subscription.findOneAndUpdate({ subscription_id: subscriptionId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!subscription) return sendNotFound(res, 'Subscription not found');
    console.info('Subscription deleted successfully', { subscriptionId: subscription._id });
    sendSuccess(res, subscription, 'Subscription deleted successfully');
  } catch (error) {
    console.error('Error deleting subscription', { error: error.message, subscriptionId: req.params.id });
    throw error;
  }
});

const getSubscriptionsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { user_id: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter)
        .populate('Plan_id', 'name Price PlanDurectionDay')
        .populate('transaction_id', 'amount status transactionType')
        .sort(sort).skip(skip).limit(parseInt(limit)),
      Subscription.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Subscriptions by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, subscriptions, pagination, 'Subscriptions retrieved successfully');
  } catch (error) {
    console.error('Error retrieving subscriptions by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createSubscription, getAllSubscriptions, getSubscriptionById, updateSubscription, deleteSubscription, getSubscriptionsByAuth
};

