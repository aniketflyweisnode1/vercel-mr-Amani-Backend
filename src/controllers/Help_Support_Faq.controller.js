const HelpSupportFaq = require('../models/Help_Support_Faq.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateHelpSupportFaq = (query) => query
  .populate('Branch_Id', 'business_Branch_id firstName lastName BusinessName Address City state country')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, Branch_Id, type }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Question: { $regex: search, $options: 'i' } },
      { answer: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Branch_Id !== undefined) {
    const branchId = parseInt(Branch_Id, 10);
    if (!Number.isNaN(branchId)) {
      filter.Branch_Id = branchId;
    }
  }

  if (type !== undefined) {
    filter.type = type;
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

const ensureBranchExists = async (Branch_Id) => {
  if (Branch_Id === undefined) {
    return true;
  }
  const branchId = parseInt(Branch_Id, 10);
  if (Number.isNaN(branchId)) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return Boolean(branch);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateHelpSupportFaq(HelpSupportFaq.findById(identifier));
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateHelpSupportFaq(HelpSupportFaq.findOne({ Help_Support_Faq_id: numericId }));
  }
  return null;
};

const createHelpSupportFaq = asyncHandler(async (req, res) => {
  try {
    const { Branch_Id } = req.body;
    if (!(await ensureBranchExists(Branch_Id))) {
      return sendError(res, 'Business branch not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const faq = await HelpSupportFaq.create(payload);
    const populated = await populateHelpSupportFaq(HelpSupportFaq.findById(faq._id));
    sendSuccess(res, populated, 'Help support FAQ created successfully', 201);
  } catch (error) {
    console.error('Error creating help support FAQ', { error: error.message });
    throw error;
  }
});

const getAllHelpSupportFaqs = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Branch_Id,
      type,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Branch_Id, type });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [faqs, total] = await Promise.all([
      populateHelpSupportFaq(HelpSupportFaq.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportFaq.countDocuments(filter)
    ]);
    sendPaginated(res, faqs, paginateMeta(numericPage, numericLimit, total), 'Help support FAQs retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support FAQs', { error: error.message });
    throw error;
  }
});

const getHelpSupportFaqById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const faqQuery = findByIdentifier(id);
    if (!faqQuery) {
      return sendError(res, 'Invalid help support FAQ identifier', 400);
    }
    const faq = await faqQuery;
    if (!faq) {
      return sendNotFound(res, 'Help support FAQ not found');
    }
    sendSuccess(res, faq, 'Help support FAQ retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support FAQ', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateHelpSupportFaq = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Branch_Id } = req.body;
    if (Branch_Id !== undefined && !(await ensureBranchExists(Branch_Id))) {
      return sendError(res, 'Business branch not found', 400);
    }
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let faq;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      faq = await HelpSupportFaq.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid help support FAQ ID format', 400);
      }
      faq = await HelpSupportFaq.findOneAndUpdate({ Help_Support_Faq_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!faq) {
      return sendNotFound(res, 'Help support FAQ not found');
    }
    const populated = await populateHelpSupportFaq(HelpSupportFaq.findById(faq._id));
    sendSuccess(res, populated, 'Help support FAQ updated successfully');
  } catch (error) {
    console.error('Error updating help support FAQ', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteHelpSupportFaq = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let faq;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      faq = await HelpSupportFaq.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid help support FAQ ID format', 400);
      }
      faq = await HelpSupportFaq.findOneAndUpdate({ Help_Support_Faq_id: numericId }, updatePayload, { new: true });
    }
    if (!faq) {
      return sendNotFound(res, 'Help support FAQ not found');
    }
    sendSuccess(res, faq, 'Help support FAQ deleted successfully');
  } catch (error) {
    console.error('Error deleting help support FAQ', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getHelpSupportFaqsByType = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Branch_Id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const validTypes = ['Orders', 'Payments', 'Delivery', 'Account', 'Receipts', 'Other'];
    if (!validTypes.includes(type)) {
      return sendError(res, 'Invalid FAQ type', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Branch_Id });
    filter.type = type;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [faqs, total] = await Promise.all([
      populateHelpSupportFaq(HelpSupportFaq.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportFaq.countDocuments(filter)
    ]);
    sendPaginated(res, faqs, paginateMeta(numericPage, numericLimit, total), 'Help support FAQs retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support FAQs by type', { error: error.message, type: req.params.type });
    throw error;
  }
});

const getHelpSupportFaqsByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_Id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      type,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const branchId = parseInt(Branch_Id, 10);
    if (Number.isNaN(branchId)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, type });
    filter.Branch_Id = branchId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [faqs, total] = await Promise.all([
      populateHelpSupportFaq(HelpSupportFaq.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportFaq.countDocuments(filter)
    ]);
    sendPaginated(res, faqs, paginateMeta(numericPage, numericLimit, total), 'Help support FAQs retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support FAQs by branch', { error: error.message, Branch_Id: req.params.Branch_Id });
    throw error;
  }
});

const getHelpSupportFaqsByAuth = asyncHandler(async (req, res) => {
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
      Branch_Id,
      type,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Branch_Id, type });
    filter.created_by = userId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [faqs, total] = await Promise.all([
      populateHelpSupportFaq(HelpSupportFaq.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportFaq.countDocuments(filter)
    ]);
    sendPaginated(res, faqs, paginateMeta(numericPage, numericLimit, total), 'Help support FAQs retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support FAQs by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createHelpSupportFaq,
  getAllHelpSupportFaqs,
  getHelpSupportFaqById,
  updateHelpSupportFaq,
  deleteHelpSupportFaq,
  getHelpSupportFaqsByType,
  getHelpSupportFaqsByBranchId,
  getHelpSupportFaqsByAuth
};

