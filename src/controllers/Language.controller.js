const Language = require('../models/Language.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


const createLanguage = asyncHandler(async (req, res) => {
  try {
    const languageData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const language = await Language.create(languageData);
    console.info('Language created successfully', { languageId: language._id, Language_id: language.Language_id });
    sendSuccess(res, language, 'Language created successfully', 201);
  } catch (error) {
    console.error('Error creating language', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllLanguages = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [languages, total] = await Promise.all([
      Language.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Language.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Languages retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, languages, pagination, 'Languages retrieved successfully');
  } catch (error) {
    console.error('Error retrieving languages', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getLanguageById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let language;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      language = await Language.findById(id);
    } else {
      const languageId = parseInt(id, 10);
      if (isNaN(languageId)) return sendNotFound(res, 'Invalid language ID format');
      language = await Language.findOne({ Language_id: languageId });
    }
    if (!language) return sendNotFound(res, 'Language not found');
    console.info('Language retrieved successfully', { languageId: language._id });
    sendSuccess(res, language, 'Language retrieved successfully');
  } catch (error) {
    console.error('Error retrieving language', { error: error.message, languageId: req.params.id });
    throw error;
  }
});

const updateLanguage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let language;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      language = await Language.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const languageId = parseInt(id, 10);
      if (isNaN(languageId)) return sendNotFound(res, 'Invalid language ID format');
      language = await Language.findOneAndUpdate({ Language_id: languageId }, updateData, { new: true, runValidators: true });
    }
    if (!language) return sendNotFound(res, 'Language not found');
    console.info('Language updated successfully', { languageId: language._id });
    sendSuccess(res, language, 'Language updated successfully');
  } catch (error) {
    console.error('Error updating language', { error: error.message, languageId: req.params.id });
    throw error;
  }
});

const deleteLanguage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let language;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      language = await Language.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const languageId = parseInt(id, 10);
      if (isNaN(languageId)) return sendNotFound(res, 'Invalid language ID format');
      language = await Language.findOneAndUpdate({ Language_id: languageId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!language) return sendNotFound(res, 'Language not found');
    console.info('Language deleted successfully', { languageId: language._id });
    sendSuccess(res, language, 'Language deleted successfully');
  } catch (error) {
    console.error('Error deleting language', { error: error.message, languageId: req.params.id });
    throw error;
  }
});

module.exports = {
  createLanguage, getAllLanguages, getLanguageById, updateLanguage, deleteLanguage
};

