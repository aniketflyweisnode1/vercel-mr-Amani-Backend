const Business_Details = require('../models/Business_Details.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const createBusinessDetails = asyncHandler(async (req, res) => {
  try {
    const businessDetailsData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const businessDetails = await Business_Details.create(businessDetailsData);
    console.info('Business Details created successfully', { businessDetailsId: businessDetails._id, Business_Details_id: businessDetails.Business_Details_id });
    sendSuccess(res, businessDetails, 'Business Details created successfully', 201);
  } catch (error) {
    console.error('Error creating business details', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllBusinessDetails = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, user_id, BusinessType_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { BussinessName: { $regex: search, $options: 'i' } },
        { google_office_address: { $regex: search, $options: 'i' } },
        { office_address: { $regex: search, $options: 'i' } },
        { City: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    if (user_id) filter.user_id = parseInt(user_id, 10);
    if (BusinessType_id) filter.BusinessType_id = parseInt(BusinessType_id, 10);
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [businessDetailsList, total] = await Promise.all([
      Business_Details.find(filter)
        .populate('user_id', 'firstName lastName phoneNo BusinessName')
        .populate('BusinessType_id', 'name')
        .populate('subscription_Id', 'planStatus expiryDate')
        .sort(sort).skip(skip).limit(parseInt(limit)),
      Business_Details.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Business Details retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, businessDetailsList, pagination, 'Business Details retrieved successfully');
  } catch (error) {
    console.error('Error retrieving business details', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getBusinessDetailsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let businessDetails;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      businessDetails = await Business_Details.findById(id)
        .populate('user_id', 'firstName lastName phoneNo BusinessName')
        .populate('BusinessType_id', 'name')
        .populate('subscription_Id', 'planStatus expiryDate');
    } else {
      const businessDetailsId = parseInt(id, 10);
      if (isNaN(businessDetailsId)) return sendNotFound(res, 'Invalid business details ID format');
      businessDetails = await Business_Details.findOne({ Business_Details_id: businessDetailsId })
        .populate('user_id', 'firstName lastName phoneNo BusinessName')
        .populate('BusinessType_id', 'name')
        .populate('subscription_Id', 'planStatus expiryDate');
    }
    if (!businessDetails) return sendNotFound(res, 'Business Details not found');
    console.info('Business Details retrieved successfully', { businessDetailsId: businessDetails._id });
    sendSuccess(res, businessDetails, 'Business Details retrieved successfully');
  } catch (error) {
    console.error('Error retrieving business details', { error: error.message, businessDetailsId: req.params.id });
    throw error;
  }
});

const updateBusinessDetails = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let businessDetails;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      businessDetails = await Business_Details.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const businessDetailsId = parseInt(id, 10);
      if (isNaN(businessDetailsId)) return sendNotFound(res, 'Invalid business details ID format');
      businessDetails = await Business_Details.findOneAndUpdate({ Business_Details_id: businessDetailsId }, updateData, { new: true, runValidators: true });
    }
    if (!businessDetails) return sendNotFound(res, 'Business Details not found');
    console.info('Business Details updated successfully', { businessDetailsId: businessDetails._id });
    sendSuccess(res, businessDetails, 'Business Details updated successfully');
  } catch (error) {
    console.error('Error updating business details', { error: error.message, businessDetailsId: req.params.id });
    throw error;
  }
});

const deleteBusinessDetails = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let businessDetails;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      businessDetails = await Business_Details.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const businessDetailsId = parseInt(id, 10);
      if (isNaN(businessDetailsId)) return sendNotFound(res, 'Invalid business details ID format');
      businessDetails = await Business_Details.findOneAndUpdate({ Business_Details_id: businessDetailsId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!businessDetails) return sendNotFound(res, 'Business Details not found');
    console.info('Business Details deleted successfully', { businessDetailsId: businessDetails._id });
    sendSuccess(res, businessDetails, 'Business Details deleted successfully');
  } catch (error) {
    console.error('Error deleting business details', { error: error.message, businessDetailsId: req.params.id });
    throw error;
  }
});

const getBusinessDetailsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { user_id: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [businessDetailsList, total] = await Promise.all([
      Business_Details.find(filter)
        .populate('BusinessType_id', 'name')
        .populate('subscription_Id', 'planStatus expiryDate')
        .sort(sort).skip(skip).limit(parseInt(limit)),
      Business_Details.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Business Details by authenticated user retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit), userId: req.userIdNumber });
    sendPaginated(res, businessDetailsList, pagination, 'Business Details retrieved successfully');
  } catch (error) {
    console.error('Error retrieving business details by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createBusinessDetails, getAllBusinessDetails, getBusinessDetailsById, updateBusinessDetails, deleteBusinessDetails, getBusinessDetailsByAuth
};

