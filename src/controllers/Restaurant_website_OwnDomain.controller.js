const OwnDomain = require('../models/Restaurant_website_OwnDomain.model');
const Business_Branch = require('../models/business_Branch.model');
const Template = require('../models/Restaurant_website_Template.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateOwnDomain = (query) => query
  .populate('business_Branch_id', 'business_Branch_id firstName lastName BusinessName Address City state country')
  .populate('Restaurant_website_Template_id', 'Restaurant_website_Template_id TempleteName')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, business_Branch_id, Restaurant_website_Template_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { websiteName: { $regex: search, $options: 'i' } },
      { subdomain: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (business_Branch_id !== undefined) {
    const branchId = parseInt(business_Branch_id, 10);
    if (!Number.isNaN(branchId)) {
      filter.business_Branch_id = branchId;
    }
  }

  if (Restaurant_website_Template_id !== undefined) {
    const templateId = parseInt(Restaurant_website_Template_id, 10);
    if (!Number.isNaN(templateId)) {
      filter.Restaurant_website_Template_id = templateId;
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

const ensureBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined) {
    return true;
  }
  const branchId = parseInt(business_Branch_id, 10);
  if (Number.isNaN(branchId)) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return Boolean(branch);
};

const ensureTemplateExists = async (templateId) => {
  if (templateId === undefined) {
    return true;
  }
  const parsed = parseInt(templateId, 10);
  if (Number.isNaN(parsed)) {
    return false;
  }
  const template = await Template.findOne({ Restaurant_website_Template_id: parsed, Status: true });
  return Boolean(template);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateOwnDomain(OwnDomain.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateOwnDomain(OwnDomain.findOne({ Restaurant_website_OwnDomain_id: numericId }));
  }

  return null;
};

const createOwnDomain = asyncHandler(async (req, res) => {
  try {
    const {
      business_Branch_id,
      Restaurant_website_Template_id
    } = req.body;

    const [branchExists, templateExists] = await Promise.all([
      ensureBranchExists(business_Branch_id),
      ensureTemplateExists(Restaurant_website_Template_id)
    ]);

    if (!branchExists) {
      return sendError(res, 'Business branch not found', 400);
    }

    if (!templateExists) {
      return sendError(res, 'Restaurant website template not found', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const website = await OwnDomain.create(payload);
    const populated = await populateOwnDomain(OwnDomain.findById(website._id));

    sendSuccess(res, populated, 'Restaurant website (own domain) created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant website (own domain)', { error: error.message });
    throw error;
  }
});

const getAllOwnDomains = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      business_Branch_id,
      Restaurant_website_Template_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Restaurant_website_Template_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateOwnDomain(OwnDomain.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OwnDomain.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant websites (own domain) retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant websites (own domain)', { error: error.message });
    throw error;
  }
});

const getOwnDomainById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const query = findByIdentifier(id);

    if (!query) {
      return sendError(res, 'Invalid restaurant website identifier', 400);
    }

    const website = await query;

    if (!website) {
      return sendNotFound(res, 'Restaurant website (own domain) not found');
    }

    sendSuccess(res, website, 'Restaurant website (own domain) retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant website (own domain)', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateOwnDomain = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      business_Branch_id,
      Restaurant_website_Template_id
    } = req.body;

    const [branchExists, templateExists] = await Promise.all([
      ensureBranchExists(business_Branch_id),
      ensureTemplateExists(Restaurant_website_Template_id)
    ]);

    if (business_Branch_id !== undefined && !branchExists) {
      return sendError(res, 'Business branch not found', 400);
    }

    if (Restaurant_website_Template_id !== undefined && !templateExists) {
      return sendError(res, 'Restaurant website template not found', 400);
    }

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let website;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      website = await OwnDomain.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant website ID format', 400);
      }
      website = await OwnDomain.findOneAndUpdate({ Restaurant_website_OwnDomain_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!website) {
      return sendNotFound(res, 'Restaurant website (own domain) not found');
    }

    const populated = await populateOwnDomain(OwnDomain.findById(website._id));
    sendSuccess(res, populated, 'Restaurant website (own domain) updated successfully');
  } catch (error) {
    console.error('Error updating restaurant website (own domain)', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteOwnDomain = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let website;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      website = await OwnDomain.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant website ID format', 400);
      }
      website = await OwnDomain.findOneAndUpdate({ Restaurant_website_OwnDomain_id: numericId }, updatePayload, { new: true });
    }

    if (!website) {
      return sendNotFound(res, 'Restaurant website (own domain) not found');
    }

    sendSuccess(res, website, 'Restaurant website (own domain) deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant website (own domain)', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getOwnDomainsByAuth = asyncHandler(async (req, res) => {
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
      business_Branch_id,
      Restaurant_website_Template_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, business_Branch_id, Restaurant_website_Template_id });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateOwnDomain(OwnDomain.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OwnDomain.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant websites (own domain) retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant websites (own domain) by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createOwnDomain,
  getAllOwnDomains,
  getOwnDomainById,
  updateOwnDomain,
  deleteOwnDomain,
  getOwnDomainsByAuth
};


