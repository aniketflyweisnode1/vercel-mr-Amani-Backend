const CampaignType = require('../models/CampaignType.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population for numeric IDs
const populateCampaignType = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate created_by
      if (recordObj.created_by) {
        const createdById = typeof recordObj.created_by === 'object' ? recordObj.created_by.user_id : recordObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (createdBy) {
          recordObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (recordObj.updated_by) {
        const updatedById = typeof recordObj.updated_by === 'object' ? recordObj.updated_by.user_id : recordObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (updatedBy) {
          recordObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return recordObj;
    })
  );
  
  return Array.isArray(records) ? populatedRecords : populatedRecords[0];
};

const buildFilter = ({ search, status }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { CampaignTypeName: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  return filter;
};

const findCampaignTypeByIdentifier = async (identifier) => {
  let campaignTypeRaw;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    campaignTypeRaw = await CampaignType.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!isNaN(numericId)) {
      campaignTypeRaw = await CampaignType.findOne({ CampaignType_id: numericId });
    }
  }
  
  if (!campaignTypeRaw) {
    return null;
  }
  
  return await populateCampaignType(campaignTypeRaw);
};

const createCampaignType = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const campaignType = await CampaignType.create(payload);
    const populated = await populateCampaignType(campaignType);

    sendSuccess(res, populated, 'Campaign type created successfully', 201);
  } catch (error) {
    console.error('Error creating campaign type', { error: error.message });
    throw error;
  }
});

const getAllCampaignTypes = asyncHandler(async (req, res) => {
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

    const [campaignTypesRaw, total] = await Promise.all([
      CampaignType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      CampaignType.countDocuments(filter)
    ]);
    
    const campaignTypes = await populateCampaignType(campaignTypesRaw);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    sendPaginated(res, campaignTypes, pagination, 'Campaign types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving campaign types', { error: error.message });
    throw error;
  }
});

const getCampaignTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const campaignType = await findCampaignTypeByIdentifier(id);

    if (!campaignType) {
      return sendNotFound(res, 'Campaign type not found');
    }

    sendSuccess(res, campaignType, 'Campaign type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving campaign type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateCampaignType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let campaignType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      campaignType = await CampaignType.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendError(res, 'Invalid campaign type ID format', 400);
      }
      campaignType = await CampaignType.findOneAndUpdate(
        { CampaignType_id: numericId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!campaignType) {
      return sendNotFound(res, 'Campaign type not found');
    }

    const populated = await populateCampaignType(campaignType);
    sendSuccess(res, populated, 'Campaign type updated successfully');
  } catch (error) {
    console.error('Error updating campaign type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteCampaignType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let campaignType;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      campaignType = await CampaignType.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return sendError(res, 'Invalid campaign type ID format', 400);
      }
      campaignType = await CampaignType.findOneAndUpdate(
        { CampaignType_id: numericId },
        updateData,
        { new: true }
      );
    }

    if (!campaignType) {
      return sendNotFound(res, 'Campaign type not found');
    }

    sendSuccess(res, campaignType, 'Campaign type deleted successfully');
  } catch (error) {
    console.error('Error deleting campaign type', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getCampaignTypesByAuth = asyncHandler(async (req, res) => {
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
    filter.created_by = req.userIdNumber;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [campaignTypesRaw, total] = await Promise.all([
      CampaignType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      CampaignType.countDocuments(filter)
    ]);
    
    const campaignTypes = await populateCampaignType(campaignTypesRaw);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    sendPaginated(res, campaignTypes, pagination, 'Campaign types retrieved successfully');
  } catch (error) {
    console.error('Error retrieving campaign types by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getCampaignTypeByTypeId = asyncHandler(async (req, res) => {
  try {
    const { CampaignType_id } = req.params;
    const numericId = parseInt(CampaignType_id, 10);

    if (isNaN(numericId)) {
      return sendError(res, 'Invalid campaign type ID format', 400);
    }

    const campaignTypeRaw = await CampaignType.findOne({ CampaignType_id: numericId });

    if (!campaignTypeRaw) {
      return sendNotFound(res, 'Campaign type not found');
    }
    
    const campaignType = await populateCampaignType(campaignTypeRaw);

    sendSuccess(res, campaignType, 'Campaign type retrieved successfully');
  } catch (error) {
    console.error('Error retrieving campaign type by type ID', { error: error.message, CampaignType_id: req.params.CampaignType_id });
    throw error;
  }
});

module.exports = {
  createCampaignType,
  getAllCampaignTypes,
  getCampaignTypeById,
  updateCampaignType,
  deleteCampaignType,
  getCampaignTypesByAuth,
  getCampaignTypeByTypeId
};

