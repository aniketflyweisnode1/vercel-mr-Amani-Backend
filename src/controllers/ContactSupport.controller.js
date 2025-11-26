const ContactSupport = require('../models/ContactSupport.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to ensure business branch exists
const ensureBusinessBranchExists = async (Branch_id) => {
  if (Branch_id === undefined || Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: Branch_id, Status: true });
  return !!branch;
};

const buildFilterFromQuery = ({ search, status, Branch_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { chat_supportNo: { $regex: search, $options: 'i' } },
      { CallUsNo: { $regex: search, $options: 'i' } },
      { EmailSupport: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true';
  }

  if (Branch_id) {
    const branchIdNum = parseInt(Branch_id, 10);
    if (!isNaN(branchIdNum)) {
      filter.Branch_id = branchIdNum;
    }
  }

  return filter;
};

const populateContactSupport = (query) => query
  .populate('Branch_id', 'business_Branch_id firstName lastName Address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const createContactSupport = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.body;

    // Validate branch exists
    const branchExists = await ensureBusinessBranchExists(Branch_id);
    if (!branchExists) {
      return sendError(res, 'Associated business branch not found or inactive', 400);
    }

    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const contactSupport = await ContactSupport.create(payload);
    console.info('Contact support created successfully', { id: contactSupport._id, ContactSupport_id: contactSupport.ContactSupport_id });

    const populated = await populateContactSupport(ContactSupport.findById(contactSupport._id));
    sendSuccess(res, populated, 'Contact support created successfully', 201);
  } catch (error) {
    console.error('Error creating contact support', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllContactSupport = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, Branch_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = buildFilterFromQuery({ search, status, Branch_id });

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [contactSupport, total] = await Promise.all([
      populateContactSupport(ContactSupport.find(filter).sort(sort).skip(skip).limit(limitNum)),
      ContactSupport.countDocuments(filter)
    ]);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Contact support retrieved successfully', { count: contactSupport.length, total });
    sendPaginated(res, contactSupport, paginationMeta, 'Contact support retrieved successfully');
  } catch (error) {
    console.error('Error retrieving contact support', { error: error.message });
    throw error;
  }
});

const getContactSupportById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = ContactSupport.findById(id);
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid contact support ID format', 400);
      }
      query = ContactSupport.findOne({ ContactSupport_id: numId });
    }

    const contactSupport = await populateContactSupport(query);

    if (!contactSupport) {
      return sendNotFound(res, 'Contact support not found');
    }

    console.info('Contact support retrieved successfully', { id: contactSupport._id });
    sendSuccess(res, contactSupport, 'Contact support retrieved successfully');
  } catch (error) {
    console.error('Error retrieving contact support', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateContactSupport = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Branch_id } = req.body;

    // Validate branch exists if being updated
    if (Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(Branch_id);
      if (!branchExists) {
        return sendError(res, 'Associated business branch not found or inactive', 400);
      }
    }

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = ContactSupport.findByIdAndUpdate(
        id,
        {
          ...req.body,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true, runValidators: true }
      );
    } else {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return sendError(res, 'Invalid contact support ID format', 400);
      }
      query = ContactSupport.findOneAndUpdate(
        { ContactSupport_id: numId },
        {
          ...req.body,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true, runValidators: true }
      );
    }

    const contactSupport = await populateContactSupport(query);

    if (!contactSupport) {
      return sendNotFound(res, 'Contact support not found');
    }

    console.info('Contact support updated successfully', { id: contactSupport._id });
    sendSuccess(res, contactSupport, 'Contact support updated successfully');
  } catch (error) {
    console.error('Error updating contact support', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteContactSupport = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = ContactSupport.findByIdAndUpdate(
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
        return sendError(res, 'Invalid contact support ID format', 400);
      }
      query = ContactSupport.findOneAndUpdate(
        { ContactSupport_id: numId },
        {
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    const contactSupport = await query;

    if (!contactSupport) {
      return sendNotFound(res, 'Contact support not found');
    }

    console.info('Contact support deleted successfully', { id: contactSupport._id });
    sendSuccess(res, contactSupport, 'Contact support deleted successfully');
  } catch (error) {
    console.error('Error deleting contact support', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getContactSupportByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, Branch_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const filter = { created_by: req.userIdNumber };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    if (Branch_id) {
      const branchIdNum = parseInt(Branch_id, 10);
      if (!isNaN(branchIdNum)) {
        filter.Branch_id = branchIdNum;
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [contactSupport, total] = await Promise.all([
      populateContactSupport(ContactSupport.find(filter).sort(sort).skip(skip).limit(limitNum)),
      ContactSupport.countDocuments(filter)
    ]);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Contact support retrieved by auth successfully', { count: contactSupport.length, total });
    sendPaginated(res, contactSupport, paginationMeta, 'Contact support retrieved successfully');
  } catch (error) {
    console.error('Error retrieving contact support by auth', { error: error.message });
    throw error;
  }
});

const getContactSupportByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.params;
    const { page = 1, limit = 10, search, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const branchIdNum = parseInt(Branch_id, 10);
    if (isNaN(branchIdNum)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }

    const filter = { Branch_id: branchIdNum };

    if (search) {
      filter.$or = [
        { chat_supportNo: { $regex: search, $options: 'i' } },
        { CallUsNo: { $regex: search, $options: 'i' } },
        { EmailSupport: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [contactSupport, total] = await Promise.all([
      populateContactSupport(ContactSupport.find(filter).sort(sort).skip(skip).limit(limitNum)),
      ContactSupport.countDocuments(filter)
    ]);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    console.info('Contact support retrieved by branch ID successfully', { count: contactSupport.length, total, Branch_id: branchIdNum });
    sendPaginated(res, contactSupport, paginationMeta, 'Contact support retrieved successfully');
  } catch (error) {
    console.error('Error retrieving contact support by branch ID', { error: error.message, Branch_id: req.params.Branch_id });
    throw error;
  }
});

module.exports = {
  createContactSupport,
  getAllContactSupport,
  getContactSupportById,
  updateContactSupport,
  deleteContactSupport,
  getContactSupportByAuth,
  getContactSupportByBranchId
};

