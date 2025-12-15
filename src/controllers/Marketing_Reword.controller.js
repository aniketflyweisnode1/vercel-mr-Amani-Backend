const Marketing_Reword = require('../models/Marketing_Reword.model');
const Vendor_Store = require('../models/Vendor_Store.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to ensure vendor store exists
const ensureVendorStoreExists = async (Brnach_id) => {
  if (Brnach_id === undefined || Brnach_id === null) {
    return false;
  }
  const store = await Vendor_Store.findOne({ Vendor_Store_id: Brnach_id, Status: true });
  return !!store;
};

// Manual population for numeric IDs
const populateMarketingReword = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate Brnach_id (Vendor_Store)
      if (recordObj.Brnach_id) {
        const branchId = typeof recordObj.Brnach_id === 'object' ? recordObj.Brnach_id.Vendor_Store_id : recordObj.Brnach_id;
        const store = await Vendor_Store.findOne({ Vendor_Store_id: branchId })
          .select('Vendor_Store_id StoreName StoreAddress EmailAddress');
        if (store) {
          recordObj.Brnach_id = store.toObject ? store.toObject() : store;
        }
      }
      
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

const buildFilter = ({ search, status, Brnach_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { singular: { $regex: search, $options: 'i' } },
      { plural: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Brnach_id !== undefined) {
    const branchIdNum = parseInt(Brnach_id, 10);
    if (!isNaN(branchIdNum)) {
      filter.Brnach_id = branchIdNum;
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

const findByIdentifier = async (identifier) => {
  let reward;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    reward = await Marketing_Reword.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      reward = await Marketing_Reword.findOne({ Marketing_Reword_id: numericId });
    }
  }
  if (!reward) return null;
  return await populateMarketingReword(reward);
};

const createMarketingReword = asyncHandler(async (req, res) => {
  try {
    const { Brnach_id } = req.body;
    
    // Validate vendor store exists
    if (Brnach_id !== undefined) {
      const storeExists = await ensureVendorStoreExists(Brnach_id);
      if (!storeExists) {
        return sendError(res, 'Vendor store not found or inactive', 400);
      }
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    
    const reward = await Marketing_Reword.create(payload);
    const populated = await populateMarketingReword(reward);
    sendSuccess(res, populated, 'Marketing reward created successfully', 201);
  } catch (error) {
    console.error('Error creating marketing reward', { error: error.message });
    throw error;
  }
});

const getAllMarketingRewords = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Brnach_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = buildFilter({ search, status, Brnach_id });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [rewardsRaw, total] = await Promise.all([
      Marketing_Reword.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Marketing_Reword.countDocuments(filter)
    ]);
    
    const rewards = await populateMarketingReword(rewardsRaw);
    const pagination = paginateMeta(numericPage, numericLimit, total);

    sendPaginated(res, rewards, pagination, 'Marketing rewards retrieved successfully');
  } catch (error) {
    console.error('Error retrieving marketing rewards', { error: error.message });
    throw error;
  }
});

const getMarketingRewordById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await findByIdentifier(id);

    if (!reward) {
      return sendNotFound(res, 'Marketing reward not found');
    }

    sendSuccess(res, reward, 'Marketing reward retrieved successfully');
  } catch (error) {
    console.error('Error retrieving marketing reward', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateMarketingReword = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Validate vendor store exists if being updated
    if (updateData.Brnach_id !== undefined) {
      const storeExists = await ensureVendorStoreExists(updateData.Brnach_id);
      if (!storeExists) {
        return sendError(res, 'Vendor store not found or inactive', 400);
      }
    }

    let reward;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reward = await Marketing_Reword.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid marketing reward ID format', 400);
      }
      reward = await Marketing_Reword.findOneAndUpdate(
        { Marketing_Reword_id: numericId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!reward) {
      return sendNotFound(res, 'Marketing reward not found');
    }

    const populated = await populateMarketingReword(reward);
    sendSuccess(res, populated, 'Marketing reward updated successfully');
  } catch (error) {
    console.error('Error updating marketing reward', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteMarketingReword = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let reward;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reward = await Marketing_Reword.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid marketing reward ID format', 400);
      }
      reward = await Marketing_Reword.findOneAndUpdate(
        { Marketing_Reword_id: numericId },
        updateData,
        { new: true }
      );
    }

    if (!reward) {
      return sendNotFound(res, 'Marketing reward not found');
    }

    sendSuccess(res, reward, 'Marketing reward deleted successfully');
  } catch (error) {
    console.error('Error deleting marketing reward', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getMarketingRewordsByAuth = asyncHandler(async (req, res) => {
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

    const [rewardsRaw, total] = await Promise.all([
      Marketing_Reword.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Marketing_Reword.countDocuments(filter)
    ]);
    
    const rewards = await populateMarketingReword(rewardsRaw);
    const pagination = paginateMeta(numericPage, numericLimit, total);

    sendPaginated(res, rewards, pagination, 'Marketing rewards retrieved successfully');
  } catch (error) {
    console.error('Error retrieving marketing rewards by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createMarketingReword,
  getAllMarketingRewords,
  getMarketingRewordById,
  updateMarketingReword,
  deleteMarketingReword,
  getMarketingRewordsByAuth
};
