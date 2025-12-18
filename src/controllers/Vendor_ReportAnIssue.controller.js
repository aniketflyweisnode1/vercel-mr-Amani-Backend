const VendorReportAnIssue = require('../models/Vendor_ReportAnIssue.model');
const VendorStore = require('../models/Vendor_Store.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { generateReferenceIssue } = require('../../utils/helpers');

// Helper function to ensure vendor store exists
const ensureStoreExists = async (Vendor_Store_id) => {
  if (Vendor_Store_id === undefined || Vendor_Store_id === null) {
    return false;
  }
  const storeId = parseInt(Vendor_Store_id, 10);
  if (Number.isNaN(storeId)) {
    return false;
  }
  const store = await VendorStore.findOne({ Vendor_Store_id: storeId, Status: true });
  return !!store;
};

// Helper function to generate unique reference issue
const generateUniqueReferenceIssue = async () => {
  let referenceIssue;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    referenceIssue = generateReferenceIssue();
    const existing = await VendorReportAnIssue.findOne({ referenceissue: referenceIssue });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    // Fallback: add timestamp to ensure uniqueness
    referenceIssue = `${generateReferenceIssue()}-${Date.now()}`;
  }

  return referenceIssue;
};

const buildFilterFromQuery = ({ search, status, Vendor_Store_id, TypeIssue }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { TypeIssue: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } },
      { referenceissue: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (Vendor_Store_id) {
    const storeIdNum = parseInt(Vendor_Store_id, 10);
    if (!Number.isNaN(storeIdNum)) {
      filter.Vendor_Store_id = storeIdNum;
    }
  }

  if (TypeIssue) {
    filter.TypeIssue = { $regex: TypeIssue, $options: 'i' };
  }

  return filter;
};

// Manual population for Number refs
const populateVendorReportAnIssue = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;

      const recordObj = record.toObject ? record.toObject() : record;

      // Populate Vendor_Store_id
      if (recordObj.Vendor_Store_id) {
        const storeId = typeof recordObj.Vendor_Store_id === 'object' ? recordObj.Vendor_Store_id : recordObj.Vendor_Store_id;
        const store = await VendorStore.findOne({ Vendor_Store_id: storeId })
          .select('Vendor_Store_id StoreName StoreAddress City State Country EmailAddress mobileno');
        if (store) {
          recordObj.Vendor_Store_id = store.toObject ? store.toObject() : store;
        }
      }

      // Populate created_by
      if (recordObj.created_by) {
        const createdById = typeof recordObj.created_by === 'object' ? recordObj.created_by : recordObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          recordObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }

      // Populate updated_by
      if (recordObj.updated_by) {
        const updatedById = typeof recordObj.updated_by === 'object' ? recordObj.updated_by : recordObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          recordObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }

      return recordObj;
    })
  );

  return Array.isArray(records) ? populatedRecords : populatedRecords[0];
};

const createVendorReportAnIssue = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Store_id } = req.body;

    // Validate store exists
    const storeExists = await ensureStoreExists(Vendor_Store_id);
    if (!storeExists) {
      return sendError(res, 'Associated vendor store not found or inactive', 400);
    }

    // Generate unique reference issue
    const referenceissue = await generateUniqueReferenceIssue();

    const payload = {
      ...req.body,
      referenceissue,
      created_by: req.userIdNumber || null
    };

    const reportAnIssue = await VendorReportAnIssue.create(payload);

    const populated = await populateVendorReportAnIssue(reportAnIssue);
    sendSuccess(res, populated, 'Vendor report an issue created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor report an issue', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllVendorReportAnIssue = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, Vendor_Store_id, TypeIssue, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = buildFilterFromQuery({ search, status, Vendor_Store_id, TypeIssue });

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reportAnIssue, total] = await Promise.all([
      VendorReportAnIssue.find(filter).sort(sort).skip(skip).limit(limitNum),
      VendorReportAnIssue.countDocuments(filter)
    ]);

    const populated = await populateVendorReportAnIssue(reportAnIssue);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    sendPaginated(res, populated, paginationMeta, 'Vendor report an issue retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor report an issue', { error: error.message });
    throw error;
  }
});

const getVendorReportAnIssueById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = VendorReportAnIssue.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (Number.isNaN(numId)) {
        return sendError(res, 'Invalid vendor report an issue ID format', 400);
      }
      query = VendorReportAnIssue.findOne({ Vendor_ReportAnIssue_id: numId });
    }

    const reportAnIssue = await populateVendorReportAnIssue(query);

    if (!reportAnIssue) {
      return sendNotFound(res, 'Vendor report an issue not found');
    }

    sendSuccess(res, reportAnIssue, 'Vendor report an issue retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor report an issue', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorReportAnIssue = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Vendor_Store_id } = req.body;

    // Validate store exists if being updated
    if (Vendor_Store_id !== undefined) {
      const storeExists = await ensureStoreExists(Vendor_Store_id);
      if (!storeExists) {
        return sendError(res, 'Associated vendor store not found or inactive', 400);
      }
    }

    // Don't allow updating referenceissue
    const updateData = { ...req.body };
    delete updateData.referenceissue;

    updateData.updated_by = req.userIdNumber || null;
    updateData.updated_at = new Date();

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = VendorReportAnIssue.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      const numId = parseInt(id, 10);
      if (Number.isNaN(numId)) {
        return sendError(res, 'Invalid vendor report an issue ID format', 400);
      }
      query = VendorReportAnIssue.findOneAndUpdate(
        { Vendor_ReportAnIssue_id: numId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    const reportAnIssue = await populateVendorReportAnIssue(query);

    if (!reportAnIssue) {
      return sendNotFound(res, 'Vendor report an issue not found');
    }

    sendSuccess(res, reportAnIssue, 'Vendor report an issue updated successfully');
  } catch (error) {
    console.error('Error updating vendor report an issue', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorReportAnIssue = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = VendorReportAnIssue.findByIdAndUpdate(
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
      if (Number.isNaN(numId)) {
        return sendError(res, 'Invalid vendor report an issue ID format', 400);
      }
      query = VendorReportAnIssue.findOneAndUpdate(
        { Vendor_ReportAnIssue_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    const reportAnIssue = await query;

    if (!reportAnIssue) {
      return sendNotFound(res, 'Vendor report an issue not found');
    }

    sendSuccess(res, reportAnIssue, 'Vendor report an issue deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor report an issue', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorReportAnIssueByType = asyncHandler(async (req, res) => {
  try {
    const { TypeIssue } = req.params;
    const { page = 1, limit = 10, search, status, Vendor_Store_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = { TypeIssue: { $regex: TypeIssue, $options: 'i' } };

    if (search) {
      filter.$or = [
        { Description: { $regex: search, $options: 'i' } },
        { referenceissue: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (Vendor_Store_id) {
      const storeIdNum = parseInt(Vendor_Store_id, 10);
      if (!Number.isNaN(storeIdNum)) {
        filter.Vendor_Store_id = storeIdNum;
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reportAnIssue, total] = await Promise.all([
      VendorReportAnIssue.find(filter).sort(sort).skip(skip).limit(limitNum),
      VendorReportAnIssue.countDocuments(filter)
    ]);

    const populated = await populateVendorReportAnIssue(reportAnIssue);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    sendPaginated(res, populated, paginationMeta, 'Vendor report an issue retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor report an issue by type', { error: error.message, TypeIssue: req.params.TypeIssue });
    throw error;
  }
});

const getVendorReportAnIssueByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, Vendor_Store_id, TypeIssue, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = { created_by: req.userIdNumber };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (Vendor_Store_id) {
      const storeIdNum = parseInt(Vendor_Store_id, 10);
      if (!Number.isNaN(storeIdNum)) {
        filter.Vendor_Store_id = storeIdNum;
      }
    }

    if (TypeIssue) {
      filter.TypeIssue = { $regex: TypeIssue, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reportAnIssue, total] = await Promise.all([
      VendorReportAnIssue.find(filter).sort(sort).skip(skip).limit(limitNum),
      VendorReportAnIssue.countDocuments(filter)
    ]);

    const populated = await populateVendorReportAnIssue(reportAnIssue);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    sendPaginated(res, populated, paginationMeta, 'Vendor report an issue retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor report an issue by auth', { error: error.message });
    throw error;
  }
});

const getVendorReportAnIssueByStoreId = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Store_id } = req.params;
    const { page = 1, limit = 10, search, status, TypeIssue, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const storeIdNum = parseInt(Vendor_Store_id, 10);
    if (Number.isNaN(storeIdNum)) {
      return sendError(res, 'Invalid vendor store ID format', 400);
    }

    const filter = { Vendor_Store_id: storeIdNum };

    if (search) {
      filter.$or = [
        { TypeIssue: { $regex: search, $options: 'i' } },
        { Description: { $regex: search, $options: 'i' } },
        { referenceissue: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (TypeIssue) {
      filter.TypeIssue = { $regex: TypeIssue, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reportAnIssue, total] = await Promise.all([
      VendorReportAnIssue.find(filter).sort(sort).skip(skip).limit(limitNum),
      VendorReportAnIssue.countDocuments(filter)
    ]);

    const populated = await populateVendorReportAnIssue(reportAnIssue);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    sendPaginated(res, populated, paginationMeta, 'Vendor report an issue retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor report an issue by store ID', { error: error.message, Vendor_Store_id: req.params.Vendor_Store_id });
    throw error;
  }
});

module.exports = {
  createVendorReportAnIssue,
  getAllVendorReportAnIssue,
  getVendorReportAnIssueById,
  updateVendorReportAnIssue,
  deleteVendorReportAnIssue,
  getVendorReportAnIssueByType,
  getVendorReportAnIssueByAuth,
  getVendorReportAnIssueByStoreId
};


