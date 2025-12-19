const VendorReviewsFormConttentCreator = require('../models/Vendor_ReviewsFormConttentCreator.model');
const PaymentMethods = require('../models/payment_method.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population for Number refs
const populateVendorReviewsFormConttentCreator = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;

      const recordObj = record.toObject ? record.toObject() : record;

      // Populate Payment_Options
      if (recordObj.Payment_Options && Array.isArray(recordObj.Payment_Options) && recordObj.Payment_Options.length > 0) {
        const paymentMethods = await PaymentMethods.find({
          payment_method_id: { $in: recordObj.Payment_Options },
          Status: true
        }).select('payment_method_id payment_method emoji Status');
        
        recordObj.Payment_Options = paymentMethods.map(pm => pm.toObject ? pm.toObject() : pm);
      }

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

const buildFilterFromQuery = ({ search, status }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { linkAccountURL: { $regex: search, $options: 'i' } },
      { ConttentCreators: { $elemMatch: { $regex: search, $options: 'i' } } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  return filter;
};

const createVendorReviewsFormConttentCreator = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const vendorReviewsFormConttentCreator = await VendorReviewsFormConttentCreator.create(payload);

    const populated = await populateVendorReviewsFormConttentCreator(vendorReviewsFormConttentCreator);
    sendSuccess(res, populated, 'Vendor reviews form content creator created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor reviews form content creator', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllVendorReviewsFormConttentCreator = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = buildFilterFromQuery({ search, status });

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [vendorReviewsFormConttentCreators, total] = await Promise.all([
      VendorReviewsFormConttentCreator.find(filter).sort(sort).skip(skip).limit(limitNum),
      VendorReviewsFormConttentCreator.countDocuments(filter)
    ]);

    const populated = await populateVendorReviewsFormConttentCreator(vendorReviewsFormConttentCreators);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    sendPaginated(res, populated, paginationMeta, 'Vendor reviews form content creator retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor reviews form content creator', { error: error.message });
    throw error;
  }
});

const getVendorReviewsFormConttentCreatorById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = VendorReviewsFormConttentCreator.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (Number.isNaN(numId)) {
        return sendError(res, 'Invalid vendor reviews form content creator ID format', 400);
      }
      query = VendorReviewsFormConttentCreator.findOne({ Vendor_ReviewsFormConttentCreator_id: numId });
    }

    const vendorReviewsFormConttentCreator = await query;

    if (!vendorReviewsFormConttentCreator) {
      return sendNotFound(res, 'Vendor reviews form content creator not found');
    }

    const populated = await populateVendorReviewsFormConttentCreator(vendorReviewsFormConttentCreator);

    sendSuccess(res, populated, 'Vendor reviews form content creator retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor reviews form content creator', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorReviewsFormConttentCreator = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = { ...req.body };
    updateData.updated_by = req.userIdNumber || null;
    updateData.updated_at = new Date();

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = VendorReviewsFormConttentCreator.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      const numId = parseInt(id, 10);
      if (Number.isNaN(numId)) {
        return sendError(res, 'Invalid vendor reviews form content creator ID format', 400);
      }
      query = VendorReviewsFormConttentCreator.findOneAndUpdate(
        { Vendor_ReviewsFormConttentCreator_id: numId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    const vendorReviewsFormConttentCreator = await query;

    if (!vendorReviewsFormConttentCreator) {
      return sendNotFound(res, 'Vendor reviews form content creator not found');
    }

    const populated = await populateVendorReviewsFormConttentCreator(vendorReviewsFormConttentCreator);

    sendSuccess(res, populated, 'Vendor reviews form content creator updated successfully');
  } catch (error) {
    console.error('Error updating vendor reviews form content creator', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorReviewsFormConttentCreator = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = VendorReviewsFormConttentCreator.findByIdAndUpdate(
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
        return sendError(res, 'Invalid vendor reviews form content creator ID format', 400);
      }
      query = VendorReviewsFormConttentCreator.findOneAndUpdate(
        { Vendor_ReviewsFormConttentCreator_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    const vendorReviewsFormConttentCreator = await query;

    if (!vendorReviewsFormConttentCreator) {
      return sendNotFound(res, 'Vendor reviews form content creator not found');
    }

    sendSuccess(res, vendorReviewsFormConttentCreator, 'Vendor reviews form content creator deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor reviews form content creator', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorReviewsFormConttentCreatorByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = { created_by: req.userIdNumber };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [vendorReviewsFormConttentCreators, total] = await Promise.all([
      VendorReviewsFormConttentCreator.find(filter).sort(sort).skip(skip).limit(limitNum),
      VendorReviewsFormConttentCreator.countDocuments(filter)
    ]);

    const populated = await populateVendorReviewsFormConttentCreator(vendorReviewsFormConttentCreators);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    sendPaginated(res, populated, paginationMeta, 'Vendor reviews form content creator retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor reviews form content creator by auth', { error: error.message });
    throw error;
  }
});

module.exports = {
  createVendorReviewsFormConttentCreator,
  getAllVendorReviewsFormConttentCreator,
  getVendorReviewsFormConttentCreatorById,
  updateVendorReviewsFormConttentCreator,
  deleteVendorReviewsFormConttentCreator,
  getVendorReviewsFormConttentCreatorByAuth
};

