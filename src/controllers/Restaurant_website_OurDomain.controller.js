const OurDomain = require('../models/Restaurant_website_OurDomain.model');
const Business_Branch = require('../models/business_Branch.model');
const Template = require('../models/Restaurant_website_Template.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateOurDomain = async (domains) => {
  const domainsArray = Array.isArray(domains) ? domains : [domains];
  const populatedDomains = await Promise.all(
    domainsArray.map(async (domain) => {
      if (!domain) return null;
      
      const domainObj = domain.toObject ? domain.toObject() : domain;
      
      // Populate business_Branch_id
      if (domainObj.business_Branch_id) {
        const branchId = typeof domainObj.business_Branch_id === 'object' ? domainObj.business_Branch_id : domainObj.business_Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id firstName lastName BusinessName Address City state country');
        if (branch) {
          domainObj.business_Branch_id = branch.toObject ? branch.toObject() : branch;
        }
      }
      
      // Populate Restaurant_website_Template_id
      if (domainObj.Restaurant_website_Template_id) {
        const templateId = typeof domainObj.Restaurant_website_Template_id === 'object' ? domainObj.Restaurant_website_Template_id : domainObj.Restaurant_website_Template_id;
        const template = await Template.findOne({ Restaurant_website_Template_id: templateId })
          .select('Restaurant_website_Template_id TempleteName');
        if (template) {
          domainObj.Restaurant_website_Template_id = template.toObject ? template.toObject() : template;
        }
      }
      
      // Populate created_by
      if (domainObj.created_by) {
        const createdById = typeof domainObj.created_by === 'object' ? domainObj.created_by : domainObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          domainObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (domainObj.updated_by) {
        const updatedById = typeof domainObj.updated_by === 'object' ? domainObj.updated_by : domainObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          domainObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return domainObj;
    })
  );
  
  return Array.isArray(domains) ? populatedDomains : populatedDomains[0];
};

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

const findByIdentifier = async (identifier) => {
  let domain;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    domain = await OurDomain.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      domain = await OurDomain.findOne({ Restaurant_website_id: numericId });
    }
  }
  
  if (!domain) return null;
  return await populateOurDomain(domain);
};

const createOurDomain = asyncHandler(async (req, res) => {
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

    const website = await OurDomain.create(payload);
    const populated = await populateOurDomain(website);

    sendSuccess(res, populated, 'Restaurant website (our domain) created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant website (our domain)', { error: error.message });
    throw error;
  }
});

const getAllOurDomains = asyncHandler(async (req, res) => {
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
      OurDomain.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OurDomain.countDocuments(filter)
    ]);

    const populatedItems = await populateOurDomain(items);

    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Restaurant websites (our domain) retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant websites (our domain)', { error: error.message });
    throw error;
  }
});

const getOurDomainById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const website = await findByIdentifier(id);

    if (!website) {
      return sendNotFound(res, 'Restaurant website (our domain) not found');
    }

    sendSuccess(res, website, 'Restaurant website (our domain) retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant website (our domain)', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateOurDomain = asyncHandler(async (req, res) => {
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
      website = await OurDomain.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant website ID format', 400);
      }
      website = await OurDomain.findOneAndUpdate({ Restaurant_website_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!website) {
      return sendNotFound(res, 'Restaurant website (our domain) not found');
    }

    const populated = await populateOurDomain(website);
    sendSuccess(res, populated, 'Restaurant website (our domain) updated successfully');
  } catch (error) {
    console.error('Error updating restaurant website (our domain)', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteOurDomain = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let website;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      website = await OurDomain.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid restaurant website ID format', 400);
      }
      website = await OurDomain.findOneAndUpdate({ Restaurant_website_id: numericId }, updatePayload, { new: true });
    }

    if (!website) {
      return sendNotFound(res, 'Restaurant website (our domain) not found');
    }

    sendSuccess(res, website, 'Restaurant website (our domain) deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant website (our domain)', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getOurDomainsByAuth = asyncHandler(async (req, res) => {
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
      OurDomain.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OurDomain.countDocuments(filter)
    ]);

    const populatedItems = await populateOurDomain(items);

    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Restaurant websites (our domain) retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant websites (our domain) by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getOurDomainsByBranchId = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.params;
    const branchId = parseInt(business_Branch_id, 10);

    if (Number.isNaN(branchId)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }

    if (!(await ensureBranchExists(branchId))) {
      return sendNotFound(res, 'Business branch not found');
    }

    const websites = await OurDomain.find({ business_Branch_id: branchId, Status: true });
    const populatedWebsites = await populateOurDomain(websites);

    sendSuccess(res, populatedWebsites, 'Restaurant websites (our domain) retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant websites (our domain) by branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

const getOurDomainsByReviewsStatus = asyncHandler(async (req, res) => {
  try {
    const { ReviewsStatus } = req.params;
    const statusValue = ReviewsStatus === 'true' || ReviewsStatus === '1' || ReviewsStatus === 'active';

    const websites = await OurDomain.find({ Status: statusValue });
    const populatedWebsites = await populateOurDomain(websites);

    sendSuccess(res, populatedWebsites, 'Restaurant websites (our domain) retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant websites (our domain) by status', { error: error.message, ReviewsStatus: req.params.ReviewsStatus });
    throw error;
  }
});

module.exports = {
  createOurDomain,
  getAllOurDomains,
  getOurDomainById,
  updateOurDomain,
  deleteOurDomain,
  getOurDomainsByAuth,
  getOurDomainsByBranchId,
  getOurDomainsByReviewsStatus
};


