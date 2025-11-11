const ContactUs = require('../models/ContactUs.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

const createContactUs = asyncHandler(async (req, res) => {
  try {
    const contactUsData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const contactUs = await ContactUs.create(contactUsData);
    logger.info('ContactUs created successfully', { contactUsId: contactUs._id, ContactUs_id: contactUs.ContactUs_id });
    sendSuccess(res, contactUs, 'ContactUs created successfully', 201);
  } catch (error) {
    logger.error('Error creating contact us', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllContactUs = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [contactUsList, total] = await Promise.all([
      ContactUs.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      ContactUs.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    logger.info('ContactUs list retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, contactUsList, pagination, 'ContactUs list retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving contact us list', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getContactUsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let contactUs;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      contactUs = await ContactUs.findById(id);
    } else {
      const contactUsId = parseInt(id, 10);
      if (isNaN(contactUsId)) return sendNotFound(res, 'Invalid contact us ID format');
      contactUs = await ContactUs.findOne({ ContactUs_id: contactUsId });
    }
    if (!contactUs) return sendNotFound(res, 'ContactUs not found');
    logger.info('ContactUs retrieved successfully', { contactUsId: contactUs._id });
    sendSuccess(res, contactUs, 'ContactUs retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving contact us', { error: error.message, contactUsId: req.params.id });
    throw error;
  }
});

const updateContactUs = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let contactUs;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      contactUs = await ContactUs.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const contactUsId = parseInt(id, 10);
      if (isNaN(contactUsId)) return sendNotFound(res, 'Invalid contact us ID format');
      contactUs = await ContactUs.findOneAndUpdate({ ContactUs_id: contactUsId }, updateData, { new: true, runValidators: true });
    }
    if (!contactUs) return sendNotFound(res, 'ContactUs not found');
    logger.info('ContactUs updated successfully', { contactUsId: contactUs._id });
    sendSuccess(res, contactUs, 'ContactUs updated successfully');
  } catch (error) {
    logger.error('Error updating contact us', { error: error.message, contactUsId: req.params.id });
    throw error;
  }
});

const deleteContactUs = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let contactUs;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      contactUs = await ContactUs.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const contactUsId = parseInt(id, 10);
      if (isNaN(contactUsId)) return sendNotFound(res, 'Invalid contact us ID format');
      contactUs = await ContactUs.findOneAndUpdate({ ContactUs_id: contactUsId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!contactUs) return sendNotFound(res, 'ContactUs not found');
    logger.info('ContactUs deleted successfully', { contactUsId: contactUs._id });
    sendSuccess(res, contactUs, 'ContactUs deleted successfully');
  } catch (error) {
    logger.error('Error deleting contact us', { error: error.message, contactUsId: req.params.id });
    throw error;
  }
});

module.exports = {
  createContactUs, getAllContactUs, getContactUsById, updateContactUs, deleteContactUs
};

