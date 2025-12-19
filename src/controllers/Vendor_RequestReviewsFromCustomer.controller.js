const VendorRequestReviewsFromCustomer = require('../models/Vendor_RequestReviewsFromCustomer.model');
const Country = require('../models/country.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population for Number refs
const populateVendorRequestReviewsFromCustomer = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;

      const recordObj = record.toObject ? record.toObject() : record;

      // Populate country_id
      if (recordObj.country_id) {
        const countryId = typeof recordObj.country_id === 'object' ? recordObj.country_id : recordObj.country_id;
        const country = await Country.findOne({ country_id: countryId })
          .select('country_id name isoCode code2 code3 phonecode capital currency flag');
        if (country) {
          recordObj.country_id = country.toObject ? country.toObject() : country;
        }
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

const buildFilterFromQuery = ({ search, status, country_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phoneno: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (country_id) {
    const countryIdNum = parseInt(country_id, 10);
    if (!Number.isNaN(countryIdNum)) {
      filter.country_id = countryIdNum;
    }
  }

  return filter;
};

const createVendorRequestReviewsFromCustomer = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const vendorRequestReviewsFromCustomer = await VendorRequestReviewsFromCustomer.create(payload);

    const populated = await populateVendorRequestReviewsFromCustomer(vendorRequestReviewsFromCustomer);
    sendSuccess(res, populated, 'Vendor request reviews from customer created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor request reviews from customer', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllVendorRequestReviewsFromCustomer = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, country_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = buildFilterFromQuery({ search, status, country_id });

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [vendorRequestReviewsFromCustomers, total] = await Promise.all([
      VendorRequestReviewsFromCustomer.find(filter).sort(sort).skip(skip).limit(limitNum),
      VendorRequestReviewsFromCustomer.countDocuments(filter)
    ]);

    const populated = await populateVendorRequestReviewsFromCustomer(vendorRequestReviewsFromCustomers);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    sendPaginated(res, populated, paginationMeta, 'Vendor request reviews from customer retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor request reviews from customer', { error: error.message });
    throw error;
  }
});

const getVendorRequestReviewsFromCustomerById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = VendorRequestReviewsFromCustomer.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (Number.isNaN(numId)) {
        return sendError(res, 'Invalid vendor request reviews from customer ID format', 400);
      }
      query = VendorRequestReviewsFromCustomer.findOne({ Vendor_RequestReviewsFromCustomer_id: numId });
    }

    const vendorRequestReviewsFromCustomer = await query;

    if (!vendorRequestReviewsFromCustomer) {
      return sendNotFound(res, 'Vendor request reviews from customer not found');
    }

    const populated = await populateVendorRequestReviewsFromCustomer(vendorRequestReviewsFromCustomer);

    sendSuccess(res, populated, 'Vendor request reviews from customer retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor request reviews from customer', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorRequestReviewsFromCustomer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = { ...req.body };
    updateData.updated_by = req.userIdNumber || null;
    updateData.updated_at = new Date();

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = VendorRequestReviewsFromCustomer.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      const numId = parseInt(id, 10);
      if (Number.isNaN(numId)) {
        return sendError(res, 'Invalid vendor request reviews from customer ID format', 400);
      }
      query = VendorRequestReviewsFromCustomer.findOneAndUpdate(
        { Vendor_RequestReviewsFromCustomer_id: numId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    const vendorRequestReviewsFromCustomer = await query;

    if (!vendorRequestReviewsFromCustomer) {
      return sendNotFound(res, 'Vendor request reviews from customer not found');
    }

    const populated = await populateVendorRequestReviewsFromCustomer(vendorRequestReviewsFromCustomer);

    sendSuccess(res, populated, 'Vendor request reviews from customer updated successfully');
  } catch (error) {
    console.error('Error updating vendor request reviews from customer', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorRequestReviewsFromCustomer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = VendorRequestReviewsFromCustomer.findByIdAndUpdate(
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
        return sendError(res, 'Invalid vendor request reviews from customer ID format', 400);
      }
      query = VendorRequestReviewsFromCustomer.findOneAndUpdate(
        { Vendor_RequestReviewsFromCustomer_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    const vendorRequestReviewsFromCustomer = await query;

    if (!vendorRequestReviewsFromCustomer) {
      return sendNotFound(res, 'Vendor request reviews from customer not found');
    }

    sendSuccess(res, vendorRequestReviewsFromCustomer, 'Vendor request reviews from customer deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor request reviews from customer', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorRequestReviewsFromCustomerByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, country_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = { created_by: req.userIdNumber };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (country_id) {
      const countryIdNum = parseInt(country_id, 10);
      if (!Number.isNaN(countryIdNum)) {
        filter.country_id = countryIdNum;
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [vendorRequestReviewsFromCustomers, total] = await Promise.all([
      VendorRequestReviewsFromCustomer.find(filter).sort(sort).skip(skip).limit(limitNum),
      VendorRequestReviewsFromCustomer.countDocuments(filter)
    ]);

    const populated = await populateVendorRequestReviewsFromCustomer(vendorRequestReviewsFromCustomers);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    sendPaginated(res, populated, paginationMeta, 'Vendor request reviews from customer retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor request reviews from customer by auth', { error: error.message });
    throw error;
  }
});

module.exports = {
  createVendorRequestReviewsFromCustomer,
  getAllVendorRequestReviewsFromCustomer,
  getVendorRequestReviewsFromCustomerById,
  updateVendorRequestReviewsFromCustomer,
  deleteVendorRequestReviewsFromCustomer,
  getVendorRequestReviewsFromCustomerByAuth
};

