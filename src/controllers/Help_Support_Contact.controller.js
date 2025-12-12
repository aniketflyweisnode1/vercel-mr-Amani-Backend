const HelpSupportContact = require('../models/Help_Support_Contact.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateHelpSupportContact = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate Branch_Id
      if (recordObj.Branch_Id) {
        const branchId = typeof recordObj.Branch_Id === 'object' ? recordObj.Branch_Id : recordObj.Branch_Id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id firstName lastName BusinessName Address City state country');
        if (branch) {
          recordObj.Branch_Id = branch.toObject ? branch.toObject() : branch;
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

const buildFilter = ({ search, status, Branch_Id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { MobileNo: { $regex: search, $options: 'i' } },
      { Callus: { $regex: search, $options: 'i' } },
      { Emailaddress: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Branch_Id !== undefined) {
    const branchId = parseInt(Branch_Id, 10);
    if (!Number.isNaN(branchId)) {
      filter.Branch_Id = branchId;
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

const ensureBranchExists = async (Branch_Id) => {
  if (Branch_Id === undefined) {
    return true;
  }
  const branchId = parseInt(Branch_Id, 10);
  if (Number.isNaN(branchId)) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return Boolean(branch);
};

const findByIdentifier = async (identifier) => {
  let contactData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    contactData = await HelpSupportContact.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      contactData = await HelpSupportContact.findOne({ Help_Support_Contact_id: numericId });
    }
  }
  
  if (!contactData) {
    return null;
  }
  
  return await populateHelpSupportContact(contactData);
};

const createHelpSupportContact = asyncHandler(async (req, res) => {
  try {
    const { Branch_Id } = req.body;
    if (!(await ensureBranchExists(Branch_Id))) {
      return sendError(res, 'Business branch not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const contact = await HelpSupportContact.create(payload);
    const populated = await populateHelpSupportContact(contact);
    sendSuccess(res, populated, 'Help support contact created successfully', 201);
  } catch (error) {
    console.error('Error creating help support contact', { error: error.message });
    throw error;
  }
});

const getAllHelpSupportContacts = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Branch_Id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Branch_Id });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [contactsData, total] = await Promise.all([
      HelpSupportContact.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportContact.countDocuments(filter)
    ]);
    
    const contacts = await populateHelpSupportContact(contactsData);
    sendPaginated(res, contacts, paginateMeta(numericPage, numericLimit, total), 'Help support contacts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support contacts', { error: error.message });
    throw error;
  }
});

const getHelpSupportContactById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await findByIdentifier(id);
    if (!contact) {
      return sendNotFound(res, 'Help support contact not found');
    }
    sendSuccess(res, contact, 'Help support contact retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support contact', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateHelpSupportContact = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Branch_Id } = req.body;
    if (Branch_Id !== undefined && !(await ensureBranchExists(Branch_Id))) {
      return sendError(res, 'Business branch not found', 400);
    }
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let contact;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      contact = await HelpSupportContact.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid help support contact ID format', 400);
      }
      contact = await HelpSupportContact.findOneAndUpdate({ Help_Support_Contact_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!contact) {
      return sendNotFound(res, 'Help support contact not found');
    }
    const populated = await populateHelpSupportContact(contact);
    sendSuccess(res, populated, 'Help support contact updated successfully');
  } catch (error) {
    console.error('Error updating help support contact', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteHelpSupportContact = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let contact;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      contact = await HelpSupportContact.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid help support contact ID format', 400);
      }
      contact = await HelpSupportContact.findOneAndUpdate({ Help_Support_Contact_id: numericId }, updatePayload, { new: true });
    }
    if (!contact) {
      return sendNotFound(res, 'Help support contact not found');
    }
    sendSuccess(res, contact, 'Help support contact deleted successfully');
  } catch (error) {
    console.error('Error deleting help support contact', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getHelpSupportContactsByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_Id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const branchId = parseInt(Branch_Id, 10);
    if (Number.isNaN(branchId)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status });
    filter.Branch_Id = branchId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [contactsData, total] = await Promise.all([
      HelpSupportContact.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportContact.countDocuments(filter)
    ]);
    
    const contacts = await populateHelpSupportContact(contactsData);
    sendPaginated(res, contacts, paginateMeta(numericPage, numericLimit, total), 'Help support contacts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support contacts by branch', { error: error.message, Branch_Id: req.params.Branch_Id });
    throw error;
  }
});

const getHelpSupportContactsByAuth = asyncHandler(async (req, res) => {
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
      Branch_Id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Branch_Id });
    filter.created_by = userId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [contactsData, total] = await Promise.all([
      HelpSupportContact.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      HelpSupportContact.countDocuments(filter)
    ]);
    
    const contacts = await populateHelpSupportContact(contactsData);
    sendPaginated(res, contacts, paginateMeta(numericPage, numericLimit, total), 'Help support contacts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving help support contacts by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createHelpSupportContact,
  getAllHelpSupportContacts,
  getHelpSupportContactById,
  updateHelpSupportContact,
  deleteHelpSupportContact,
  getHelpSupportContactsByBranchId,
  getHelpSupportContactsByAuth
};

