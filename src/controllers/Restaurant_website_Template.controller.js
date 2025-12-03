const Template = require('../models/Restaurant_website_Template.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateTemplate = async (templates) => {
  const templatesArray = Array.isArray(templates) ? templates : [templates];
  const populatedTemplates = await Promise.all(
    templatesArray.map(async (template) => {
      if (!template) return null;
      
      const templateObj = template.toObject ? template.toObject() : template;
      
      // Populate created_by
      if (templateObj.created_by) {
        const createdById = typeof templateObj.created_by === 'object' ? templateObj.created_by : templateObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          templateObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (templateObj.updated_by) {
        const updatedById = typeof templateObj.updated_by === 'object' ? templateObj.updated_by : templateObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          templateObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return templateObj;
    })
  );
  
  return Array.isArray(templates) ? populatedTemplates : populatedTemplates[0];
};

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

const findByIdentifier = async (identifier) => {
  let template;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    template = await Template.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      template = await Template.findOne({ Restaurant_website_Template_id: numericId });
    }
  }
  
  if (!template) return null;
  return await populateTemplate(template);
};

const createTemplate = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const template = await Template.create(payload);
    const populated = await populateTemplate(template);

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
      Template.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Template.countDocuments(filter)
    ]);

    const populatedItems = await populateTemplate(items);

    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Restaurant website templates retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant website templates', { error: error.message });
    throw error;
  }
});

const getTemplateById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const template = await findByIdentifier(id);

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

    const populated = await populateTemplate(template);
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
      Template.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Template.countDocuments(filter)
    ]);

    const populatedItems = await populateTemplate(items);

    sendPaginated(res, populatedItems, paginateMeta(numericPage, numericLimit, total), 'Restaurant website templates retrieved successfully');
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


