const Supplier = require('../models/Supplier.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateSupplier = async (suppliers) => {
  const suppliersArray = Array.isArray(suppliers) ? suppliers : [suppliers];
  const populatedSuppliers = await Promise.all(
    suppliersArray.map(async (supplier) => {
      if (!supplier) return null;
      
      const supplierObj = supplier.toObject ? supplier.toObject() : supplier;
      
      // Populate created_by
      if (supplierObj.created_by) {
        const createdById = typeof supplierObj.created_by === 'object' ? supplierObj.created_by : supplierObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          supplierObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (supplierObj.updated_by) {
        const updatedById = typeof supplierObj.updated_by === 'object' ? supplierObj.updated_by : supplierObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          supplierObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return supplierObj;
    })
  );
  
  return Array.isArray(suppliers) ? populatedSuppliers : populatedSuppliers[0];
};

const createSupplier = asyncHandler(async (req, res) => {
  try {
    const supplierData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const supplier = await Supplier.create(supplierData);
    console.info('Supplier created successfully', { supplierId: supplier._id, Supplier_id: supplier.Supplier_id });

    const populated = await populateSupplier(supplier);
    sendSuccess(res, populated, 'Supplier created successfully', 201);
  } catch (error) {
    console.error('Error creating supplier', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllSuppliers = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { Name: { $regex: search, $options: 'i' } },
        { Email: { $regex: search, $options: 'i' } },
        { Mobile: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      if (typeof status === 'string') {
        filter.Status = status === 'true' || status === '1';
      } else {
        filter.Status = Boolean(status);
      }
    }

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [suppliersData, total] = await Promise.all([
      Supplier.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Supplier.countDocuments(filter)
    ]);

    const suppliers = await populateSupplier(suppliersData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Suppliers retrieved successfully', { total, page: numericPage });
    sendPaginated(res, suppliers, pagination, 'Suppliers retrieved successfully');
  } catch (error) {
    console.error('Error retrieving suppliers', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getSupplierById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let supplierData;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      supplierData = await Supplier.findById(id);
    } else {
      const supplierId = parseInt(id, 10);
      if (isNaN(supplierId)) {
        return sendNotFound(res, 'Invalid supplier ID format');
      }
      supplierData = await Supplier.findOne({ Supplier_id: supplierId });
    }

    if (!supplierData) {
      return sendNotFound(res, 'Supplier not found');
    }

    const supplier = await populateSupplier(supplierData);
    console.info('Supplier retrieved successfully', { id: supplierData._id });
    sendSuccess(res, supplier, 'Supplier retrieved successfully');
  } catch (error) {
    console.error('Error retrieving supplier', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateSupplier = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let supplier;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      supplier = await Supplier.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const supplierId = parseInt(id, 10);
      if (isNaN(supplierId)) {
        return sendNotFound(res, 'Invalid supplier ID format');
      }
      supplier = await Supplier.findOneAndUpdate({ Supplier_id: supplierId }, updateData, { new: true, runValidators: true });
    }

    if (!supplier) {
      return sendNotFound(res, 'Supplier not found');
    }

    const populated = await populateSupplier(supplier);
    console.info('Supplier updated successfully', { id: supplier._id });
    sendSuccess(res, populated, 'Supplier updated successfully');
  } catch (error) {
    console.error('Error updating supplier', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteSupplier = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let supplier;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      supplier = await Supplier.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const supplierId = parseInt(id, 10);
      if (isNaN(supplierId)) {
        return sendNotFound(res, 'Invalid supplier ID format');
      }
      supplier = await Supplier.findOneAndUpdate({ Supplier_id: supplierId }, updateData, { new: true });
    }

    if (!supplier) {
      return sendNotFound(res, 'Supplier not found');
    }

    console.info('Supplier deleted successfully', { id: supplier._id });
    sendSuccess(res, supplier, 'Supplier deleted successfully');
  } catch (error) {
    console.error('Error deleting supplier', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getSuppliersByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { created_by: req.userIdNumber };

    if (search) {
      filter.$or = [
        { Name: { $regex: search, $options: 'i' } },
        { Email: { $regex: search, $options: 'i' } },
        { Mobile: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      if (typeof status === 'string') {
        filter.Status = status === 'true' || status === '1';
      } else {
        filter.Status = Boolean(status);
      }
    }

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [suppliersData, total] = await Promise.all([
      Supplier.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Supplier.countDocuments(filter)
    ]);

    const suppliers = await populateSupplier(suppliersData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Suppliers retrieved for authenticated user', { userId: req.userIdNumber, total });
    sendPaginated(res, suppliers, pagination, 'Suppliers retrieved successfully');
  } catch (error) {
    console.error('Error retrieving suppliers for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSuppliersByAuth
};
