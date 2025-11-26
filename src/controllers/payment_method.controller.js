const PaymentMethods = require('../models/payment_method.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const createPaymentMethod = asyncHandler(async (req, res) => {
  try {
    const paymentMethodData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const paymentMethod = await PaymentMethods.create(paymentMethodData);
    console.info('Payment Method created successfully', { paymentMethodId: paymentMethod._id, payment_method_id: paymentMethod.payment_method_id });
    sendSuccess(res, paymentMethod, 'Payment Method created successfully', 201);
  } catch (error) {
    console.error('Error creating payment method', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllPaymentMethods = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { payment_method: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [paymentMethods, total] = await Promise.all([
      PaymentMethods.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      PaymentMethods.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Payment Methods retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, paymentMethods, pagination, 'Payment Methods retrieved successfully');
  } catch (error) {
    console.error('Error retrieving payment methods', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getPaymentMethodById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let paymentMethod;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      paymentMethod = await PaymentMethods.findById(id);
    } else {
      const paymentMethodId = parseInt(id, 10);
      if (isNaN(paymentMethodId)) return sendNotFound(res, 'Invalid payment method ID format');
      paymentMethod = await PaymentMethods.findOne({ payment_method_id: paymentMethodId });
    }
    if (!paymentMethod) return sendNotFound(res, 'Payment Method not found');
    console.info('Payment Method retrieved successfully', { paymentMethodId: paymentMethod._id });
    sendSuccess(res, paymentMethod, 'Payment Method retrieved successfully');
  } catch (error) {
    console.error('Error retrieving payment method', { error: error.message, paymentMethodId: req.params.id });
    throw error;
  }
});

const updatePaymentMethod = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let paymentMethod;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      paymentMethod = await PaymentMethods.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const paymentMethodId = parseInt(id, 10);
      if (isNaN(paymentMethodId)) return sendNotFound(res, 'Invalid payment method ID format');
      paymentMethod = await PaymentMethods.findOneAndUpdate({ payment_method_id: paymentMethodId }, updateData, { new: true, runValidators: true });
    }
    if (!paymentMethod) return sendNotFound(res, 'Payment Method not found');
    console.info('Payment Method updated successfully', { paymentMethodId: paymentMethod._id });
    sendSuccess(res, paymentMethod, 'Payment Method updated successfully');
  } catch (error) {
    console.error('Error updating payment method', { error: error.message, paymentMethodId: req.params.id });
    throw error;
  }
});

const deletePaymentMethod = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let paymentMethod;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      paymentMethod = await PaymentMethods.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const paymentMethodId = parseInt(id, 10);
      if (isNaN(paymentMethodId)) return sendNotFound(res, 'Invalid payment method ID format');
      paymentMethod = await PaymentMethods.findOneAndUpdate({ payment_method_id: paymentMethodId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!paymentMethod) return sendNotFound(res, 'Payment Method not found');
    console.info('Payment Method deleted successfully', { paymentMethodId: paymentMethod._id });
    sendSuccess(res, paymentMethod, 'Payment Method deleted successfully');
  } catch (error) {
    console.error('Error deleting payment method', { error: error.message, paymentMethodId: req.params.id });
    throw error;
  }
});

const getPaymentMethodsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { created_by: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [paymentMethods, total] = await Promise.all([
      PaymentMethods.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      PaymentMethods.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Payment Methods by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, paymentMethods, pagination, 'Payment Methods retrieved successfully');
  } catch (error) {
    console.error('Error retrieving payment methods by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createPaymentMethod, getAllPaymentMethods, getPaymentMethodById, updatePaymentMethod, deletePaymentMethod, getPaymentMethodsByAuth
};

