const faq = require('../models/faq.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


const createFaq = asyncHandler(async (req, res) => {
  try {
    const faqData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const faqItem = await faq.create(faqData);
    console.info('FAQ created successfully', { faqId: faqItem._id, faq_id: faqItem.faq_id });
    sendSuccess(res, faqItem, 'FAQ created successfully', 201);
  } catch (error) {
    console.error('Error creating FAQ', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllFaqs = asyncHandler(async (req, res) => {
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
    const [faqs, total] = await Promise.all([
      faq.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      faq.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('FAQs retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, faqs, pagination, 'FAQs retrieved successfully');
  } catch (error) {
    console.error('Error retrieving FAQs', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getFaqById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let faqItem;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      faqItem = await faq.findById(id);
    } else {
      const faqId = parseInt(id, 10);
      if (isNaN(faqId)) return sendNotFound(res, 'Invalid FAQ ID format');
      faqItem = await faq.findOne({ faq_id: faqId });
    }
    if (!faqItem) return sendNotFound(res, 'FAQ not found');
    console.info('FAQ retrieved successfully', { faqId: faqItem._id });
    sendSuccess(res, faqItem, 'FAQ retrieved successfully');
  } catch (error) {
    console.error('Error retrieving FAQ', { error: error.message, faqId: req.params.id });
    throw error;
  }
});

const updateFaq = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let faqItem;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      faqItem = await faq.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const faqId = parseInt(id, 10);
      if (isNaN(faqId)) return sendNotFound(res, 'Invalid FAQ ID format');
      faqItem = await faq.findOneAndUpdate({ faq_id: faqId }, updateData, { new: true, runValidators: true });
    }
    if (!faqItem) return sendNotFound(res, 'FAQ not found');
    console.info('FAQ updated successfully', { faqId: faqItem._id });
    sendSuccess(res, faqItem, 'FAQ updated successfully');
  } catch (error) {
    console.error('Error updating FAQ', { error: error.message, faqId: req.params.id });
    throw error;
  }
});

const deleteFaq = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let faqItem;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      faqItem = await faq.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const faqId = parseInt(id, 10);
      if (isNaN(faqId)) return sendNotFound(res, 'Invalid FAQ ID format');
      faqItem = await faq.findOneAndUpdate({ faq_id: faqId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!faqItem) return sendNotFound(res, 'FAQ not found');
    console.info('FAQ deleted successfully', { faqId: faqItem._id });
    sendSuccess(res, faqItem, 'FAQ deleted successfully');
  } catch (error) {
    console.error('Error deleting FAQ', { error: error.message, faqId: req.params.id });
    throw error;
  }
});

module.exports = {
  createFaq, getAllFaqs, getFaqById, updateFaq, deleteFaq
};

