const VendorProductDispute = require('../models/Vendor_Prdocut_Dispute.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population for Number refs
const populateVendorProductDispute = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;

      const recordObj = record.toObject ? record.toObject() : record;

      // Populate created_by
      if (recordObj.created_by) {
        const createdById = typeof recordObj.created_by === 'object' ? recordObj.created_by : recordObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (createdBy) {
          recordObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }

      // Populate updated_by
      if (recordObj.updated_by) {
        const updatedById = typeof recordObj.updated_by === 'object' ? recordObj.updated_by : recordObj.updated_by;
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

const buildFilterFromQuery = ({ search, status, order_id, DisputeType }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { DisputeType: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (order_id) {
    const orderIdNum = parseInt(order_id, 10);
    if (!Number.isNaN(orderIdNum)) {
      filter.order_id = orderIdNum;
    }
  }

  if (DisputeType) {
    filter.DisputeType = { $regex: DisputeType, $options: 'i' };
  }

  return filter;
};

const createVendorProductDispute = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const vendorProductDispute = await VendorProductDispute.create(payload);

    const populated = await populateVendorProductDispute(vendorProductDispute);
    sendSuccess(res, populated, 'Vendor product dispute created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor product dispute', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllVendorProductDispute = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, order_id, DisputeType, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = buildFilterFromQuery({ search, status, order_id, DisputeType });

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [vendorProductDisputes, total] = await Promise.all([
      VendorProductDispute.find(filter).sort(sort).skip(skip).limit(limitNum),
      VendorProductDispute.countDocuments(filter)
    ]);

    const populated = await populateVendorProductDispute(vendorProductDisputes);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    sendPaginated(res, populated, paginationMeta, 'Vendor product disputes retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product disputes', { error: error.message });
    throw error;
  }
});

const getVendorProductDisputeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = VendorProductDispute.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (Number.isNaN(numId)) {
        return sendError(res, 'Invalid vendor product dispute ID format', 400);
      }
      query = VendorProductDispute.findOne({ Vendor_Prdocut_Dispute_id: numId });
    }

    const vendorProductDispute = await query;

    if (!vendorProductDispute) {
      return sendNotFound(res, 'Vendor product dispute not found');
    }

    const populated = await populateVendorProductDispute(vendorProductDispute);

    sendSuccess(res, populated, 'Vendor product dispute retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product dispute', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorProductDispute = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = { ...req.body };
    updateData.updated_by = req.userIdNumber || null;
    updateData.updated_at = new Date();

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = VendorProductDispute.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      const numId = parseInt(id, 10);
      if (Number.isNaN(numId)) {
        return sendError(res, 'Invalid vendor product dispute ID format', 400);
      }
      query = VendorProductDispute.findOneAndUpdate(
        { Vendor_Prdocut_Dispute_id: numId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    const vendorProductDispute = await query;

    if (!vendorProductDispute) {
      return sendNotFound(res, 'Vendor product dispute not found');
    }

    const populated = await populateVendorProductDispute(vendorProductDispute);

    sendSuccess(res, populated, 'Vendor product dispute updated successfully');
  } catch (error) {
    console.error('Error updating vendor product dispute', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorProductDispute = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = VendorProductDispute.findByIdAndUpdate(
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
        return sendError(res, 'Invalid vendor product dispute ID format', 400);
      }
      query = VendorProductDispute.findOneAndUpdate(
        { Vendor_Prdocut_Dispute_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    const vendorProductDispute = await query;

    if (!vendorProductDispute) {
      return sendNotFound(res, 'Vendor product dispute not found');
    }

    sendSuccess(res, vendorProductDispute, 'Vendor product dispute deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor product dispute', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorProductDisputeByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, order_id, DisputeType, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = { created_by: req.userIdNumber };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (order_id) {
      const orderIdNum = parseInt(order_id, 10);
      if (!Number.isNaN(orderIdNum)) {
        filter.order_id = orderIdNum;
      }
    }

    if (DisputeType) {
      filter.DisputeType = { $regex: DisputeType, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [vendorProductDisputes, total] = await Promise.all([
      VendorProductDispute.find(filter).sort(sort).skip(skip).limit(limitNum),
      VendorProductDispute.countDocuments(filter)
    ]);

    const populated = await populateVendorProductDispute(vendorProductDisputes);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    sendPaginated(res, populated, paginationMeta, 'Vendor product disputes retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product disputes by auth', { error: error.message });
    throw error;
  }
});

module.exports = {
  createVendorProductDispute,
  getAllVendorProductDispute,
  getVendorProductDisputeById,
  updateVendorProductDispute,
  deleteVendorProductDispute,
  getVendorProductDisputeByAuth
};

