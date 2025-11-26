const Template = require('../models/Restaurant_website_Template.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateTemplate = (query) => query
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { TempleteName: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
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

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateTemplate(Template.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateTemplate(Template.findOne({ Restaurant_website_Template_id: numericId }));
  }

  return null;
};

const createTemplate = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const template = await Template.create(payload);
    const populated = await populateTemplate(Template.findById(template._id));

    sendSuccess(res, populated, 'Restaurant website template created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant website template', { error: error.message });
    throw error;
  }
});

const getAllTemplates = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateTemplate(Template.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Template.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant website templates retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant website templates', { error: error.message });
    throw error;
  }
});

const getTemplateById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const query = findByIdentifier(id);

    if (!query) {
      return sendError(res, 'Invalid template identifier', 400);
    }

    const template = await query;

    if (!template) {
      return sendNotFound(res, 'Restaurant website template not found');
    }

    sendSuccess(res, template, 'Restaurant website template retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant website template', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateTemplate = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let template;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      template = await Template.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid template ID format', 400);
      }
      template = await Template.findOneAndUpdate({ Restaurant_website_Template_id: numericId }, updatePayload, { new: true, runValidators: true });
    }

    if (!template) {
      return sendNotFound(res, 'Restaurant website template not found');
    }

    const populated = await populateTemplate(Template.findById(template._id));
    sendSuccess(res, populated, 'Restaurant website template updated successfully');
  } catch (error) {
    console.error('Error updating restaurant website template', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteTemplate = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let template;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      template = await Template.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid template ID format', 400);
      }
      template = await Template.findOneAndUpdate({ Restaurant_website_Template_id: numericId }, updatePayload, { new: true });
    }

    if (!template) {
      return sendNotFound(res, 'Restaurant website template not found');
    }

    sendSuccess(res, template, 'Restaurant website template deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant website template', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getTemplatesByAuth = asyncHandler(async (req, res) => {
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
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status });
    filter.created_by = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      populateTemplate(Template.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Template.countDocuments(filter)
    ]);

    sendPaginated(res, items, paginateMeta(numericPage, numericLimit, total), 'Restaurant website templates retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant website templates by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getTemplatesByAuth
};


