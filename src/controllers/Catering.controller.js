const Catering = require('../models/Catering.model');
const Catering_Type = require('../models/Catering_Type.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper functions to ensure related records exist
const ensureCateringTypeExists = async (cateringTypeId) => {
  if (cateringTypeId === undefined || cateringTypeId === null) {
    return false;
  }
  const cateringType = await Catering_Type.findOne({ Catering_Type_id: cateringTypeId, Status: true });
  return !!cateringType;
};

const ensureBranchExists = async (branchId) => {
  if (branchId === undefined || branchId === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return !!branch;
};

// Manual population function for Number refs
const populateCatering = async (caterings) => {
  const cateringsArray = Array.isArray(caterings) ? caterings : [caterings];
  const populatedCaterings = await Promise.all(
    cateringsArray.map(async (catering) => {
      if (!catering) return null;
      
      const cateringObj = catering.toObject ? catering.toObject() : catering;
      
      // Populate Catering_type_id
      if (cateringObj.Catering_type_id) {
        const cateringType = await Catering_Type.findOne({ Catering_Type_id: cateringObj.Catering_type_id });
        if (cateringType) {
          cateringObj.Catering_type_id = cateringType.toObject ? cateringType.toObject() : cateringType;
        }
      }
      
      // Populate Branch_id
      if (cateringObj.Branch_id) {
        const branch = await Business_Branch.findOne({ business_Branch_id: cateringObj.Branch_id })
          .select('business_Branch_id firstName lastName Address');
        if (branch) {
          cateringObj.Branch_id = branch.toObject ? branch.toObject() : branch;
        }
      }
      
      // Populate created_by
      if (cateringObj.created_by) {
        const createdById = typeof cateringObj.created_by === 'object' ? cateringObj.created_by : cateringObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          cateringObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (cateringObj.updated_by) {
        const updatedById = typeof cateringObj.updated_by === 'object' ? cateringObj.updated_by : cateringObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          cateringObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return cateringObj;
    })
  );
  
  return Array.isArray(caterings) ? populatedCaterings : populatedCaterings[0];
};

const createCatering = asyncHandler(async (req, res) => {
  try {
    const { Catering_type_id, Branch_id } = req.body;

    // Validate catering type exists
    const cateringTypeExists = await ensureCateringTypeExists(Catering_type_id);
    if (!cateringTypeExists) {
      return sendError(res, 'Catering Type not found or inactive', 400);
    }

    // Validate branch exists
    const branchExists = await ensureBranchExists(Branch_id);
    if (!branchExists) {
      return sendError(res, 'Business Branch not found or inactive', 400);
    }

    const cateringData = {
      ...req.body,
      Tags: Array.isArray(req.body.Tags) ? req.body.Tags : (req.body.Tags ? [req.body.Tags] : []),
      created_by: req.userIdNumber || null
    };

    const catering = await Catering.create(cateringData);
    console.info('Catering created successfully', { id: catering._id, Catering_id: catering.Catering_id });

    const populated = await populateCatering(catering);
    sendSuccess(res, populated, 'Catering created successfully', 201);
  } catch (error) {
    console.error('Error creating catering', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllCaterings = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Catering_type_id,
      Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { Name: { $regex: search, $options: 'i' } },
        { Review: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (Catering_type_id) {
      const cateringTypeIdNum = parseInt(Catering_type_id, 10);
      if (!isNaN(cateringTypeIdNum)) {
        filter.Catering_type_id = cateringTypeIdNum;
      }
    }

    if (Branch_id) {
      const branchIdNum = parseInt(Branch_id, 10);
      if (!isNaN(branchIdNum)) {
        filter.Branch_id = branchIdNum;
      }
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [caterings, total] = await Promise.all([
      Catering.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Catering.countDocuments(filter)
    ]);

    const populatedCaterings = await populateCatering(caterings);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Caterings retrieved successfully', { count: populatedCaterings.length, total });
    sendPaginated(res, populatedCaterings, paginationMeta, 'Caterings retrieved successfully');
  } catch (error) {
    console.error('Error retrieving caterings', { error: error.message });
    throw error;
  }
});

const getCateringById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let catering;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      catering = await Catering.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid catering ID format', 400);
      }
      catering = await Catering.findOne({ Catering_id: numId });
    }

    if (!catering) {
      return sendNotFound(res, 'Catering not found');
    }

    const populatedCatering = await populateCatering(catering);

    console.info('Catering retrieved successfully', { id: catering._id });
    sendSuccess(res, populatedCatering, 'Catering retrieved successfully');
  } catch (error) {
    console.error('Error retrieving catering', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateCatering = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Catering_type_id, Branch_id } = req.body;

    // Validate catering type exists if being updated
    if (Catering_type_id !== undefined) {
      const cateringTypeExists = await ensureCateringTypeExists(Catering_type_id);
      if (!cateringTypeExists) {
        return sendError(res, 'Catering Type not found or inactive', 400);
      }
    }

    // Validate branch exists if being updated
    if (Branch_id !== undefined) {
      const branchExists = await ensureBranchExists(Branch_id);
      if (!branchExists) {
        return sendError(res, 'Business Branch not found or inactive', 400);
      }
    }

    const updateData = {
      ...req.body,
      Tags: req.body.Tags !== undefined ? (Array.isArray(req.body.Tags) ? req.body.Tags : [req.body.Tags]) : undefined,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    let catering;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      catering = await Catering.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid catering ID format', 400);
      }
      catering = await Catering.findOneAndUpdate({ Catering_id: numId }, updateData, { new: true, runValidators: true });
    }

    if (!catering) {
      return sendNotFound(res, 'Catering not found');
    }

    const populatedCatering = await populateCatering(catering);

    console.info('Catering updated successfully', { id: catering._id });
    sendSuccess(res, populatedCatering, 'Catering updated successfully');
  } catch (error) {
    console.error('Error updating catering', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteCatering = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let catering;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      catering = await Catering.findByIdAndUpdate(
        id,
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid catering ID format', 400);
      }
      catering = await Catering.findOneAndUpdate(
        { Catering_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    if (!catering) {
      return sendNotFound(res, 'Catering not found');
    }

    console.info('Catering deleted successfully', { id: catering._id });
    sendSuccess(res, catering, 'Catering deleted successfully');
  } catch (error) {
    console.error('Error deleting catering', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getCateringsByTypeId = asyncHandler(async (req, res) => {
  try {
    const { Catering_type_id } = req.params;
    const cateringTypeIdNum = parseInt(Catering_type_id, 10);
    
    if (isNaN(cateringTypeIdNum)) {
      return sendError(res, 'Invalid catering type ID format', 400);
    }

    // Validate catering type exists
    const cateringTypeExists = await ensureCateringTypeExists(cateringTypeIdNum);
    if (!cateringTypeExists) {
      return sendNotFound(res, 'Catering Type not found');
    }

    const {
      page = 1,
      limit = 10,
      status,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { Catering_type_id: cateringTypeIdNum };

    if (search) {
      filter.$or = [
        { Name: { $regex: search, $options: 'i' } },
        { Review: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [caterings, total] = await Promise.all([
      Catering.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Catering.countDocuments(filter)
    ]);

    const populatedCaterings = await populateCatering(caterings);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Caterings retrieved by type ID', { Catering_type_id: cateringTypeIdNum, total });
    sendPaginated(res, populatedCaterings, paginationMeta, 'Caterings retrieved successfully');
  } catch (error) {
    console.error('Error retrieving caterings by type ID', { error: error.message, Catering_type_id: req.params.Catering_type_id });
    throw error;
  }
});

const getCateringsByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;
    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    const {
      page = 1,
      limit = 10,
      status,
      Catering_type_id,
      Branch_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { created_by: userId };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (Catering_type_id) {
      const cateringTypeIdNum = parseInt(Catering_type_id, 10);
      if (!isNaN(cateringTypeIdNum)) {
        filter.Catering_type_id = cateringTypeIdNum;
      }
    }

    if (Branch_id) {
      const branchIdNum = parseInt(Branch_id, 10);
      if (!isNaN(branchIdNum)) {
        filter.Branch_id = branchIdNum;
      }
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [caterings, total] = await Promise.all([
      Catering.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Catering.countDocuments(filter)
    ]);

    const populatedCaterings = await populateCatering(caterings);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Caterings retrieved for authenticated user', { userId, total });
    sendPaginated(res, populatedCaterings, paginationMeta, 'Caterings retrieved successfully');
  } catch (error) {
    console.error('Error retrieving caterings for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createCatering,
  getAllCaterings,
  getCateringById,
  updateCatering,
  deleteCatering,
  getCateringsByTypeId,
  getCateringsByAuth
};

