const DasboardList = require('../models/DasboardList.model');
const VendorProducts = require('../models/Vendor_Products.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateDasboardList = async (dashboardList) => {
  const populated = dashboardList.toObject ? dashboardList.toObject() : dashboardList;
  
  // Populate FoodYouMaylike products
  if (populated.FoodYouMaylike && populated.FoodYouMaylike.length > 0) {
    populated.FoodYouMaylike = await VendorProducts.find({
      Vendor_Products_id: { $in: populated.FoodYouMaylike },
      Status: true
    }).select('Vendor_Products_id Title Products_image Description inStock Avaliable');
  }
  
  // Populate GrabYourDeal products
  if (populated.GrabYourDeal && populated.GrabYourDeal.length > 0) {
    populated.GrabYourDeal = await VendorProducts.find({
      Vendor_Products_id: { $in: populated.GrabYourDeal },
      Status: true
    }).select('Vendor_Products_id Title Products_image Description inStock Avaliable');
  }
  
  // Populate FeaturedProductForYou products
  if (populated.FeaturedProductForYou && populated.FeaturedProductForYou.length > 0) {
    populated.FeaturedProductForYou = await VendorProducts.find({
      Vendor_Products_id: { $in: populated.FeaturedProductForYou },
      Status: true
    }).select('Vendor_Products_id Title Products_image Description inStock Avaliable');
  }
  
  return populated;
};

const buildFilter = ({ search, status }) => {
  const filter = {};

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
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

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return DasboardList.findById(identifier);
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return DasboardList.findOne({ DasboardList_id: numericId });
  }
  return null;
};

const createDasboardList = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const dashboardList = await DasboardList.create(payload);
    const populated = await populateDasboardList(dashboardList);
    
    // Also populate user references
    const result = await DasboardList.findById(dashboardList._id)
      .populate('created_by', 'user_id firstName lastName phoneNo BusinessName')
      .populate('updated_by', 'user_id firstName lastName phoneNo BusinessName');
    
    const finalResult = await populateDasboardList(result);
    sendSuccess(res, finalResult, 'Dashboard list created successfully', 201);
  } catch (error) {
    console.error('Error creating dashboard list', { error: error.message });
    throw error;
  }
});

const getAllDasboardLists = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [dashboardLists, total] = await Promise.all([
      DasboardList.find(filter)
        .populate('created_by', 'user_id firstName lastName phoneNo BusinessName')
        .populate('updated_by', 'user_id firstName lastName phoneNo BusinessName')
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      DasboardList.countDocuments(filter)
    ]);
    
    // Populate products for each dashboard list
    const populatedLists = await Promise.all(
      dashboardLists.map(list => populateDasboardList(list))
    );
    
    sendPaginated(res, populatedLists, paginateMeta(numericPage, numericLimit, total), 'Dashboard lists retrieved successfully');
  } catch (error) {
    console.error('Error retrieving dashboard lists', { error: error.message });
    throw error;
  }
});

const getDasboardListById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const dashboardListQuery = findByIdentifier(id);
    if (!dashboardListQuery) {
      return sendError(res, 'Invalid dashboard list identifier', 400);
    }
    const dashboardList = await dashboardListQuery
      .populate('created_by', 'user_id firstName lastName phoneNo BusinessName')
      .populate('updated_by', 'user_id firstName lastName phoneNo BusinessName');
    if (!dashboardList) {
      return sendNotFound(res, 'Dashboard list not found');
    }
    const populated = await populateDasboardList(dashboardList);
    sendSuccess(res, populated, 'Dashboard list retrieved successfully');
  } catch (error) {
    console.error('Error retrieving dashboard list', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateDasboardList = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let dashboardList;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      dashboardList = await DasboardList.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid dashboard list ID format', 400);
      }
      dashboardList = await DasboardList.findOneAndUpdate({ DasboardList_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!dashboardList) {
      return sendNotFound(res, 'Dashboard list not found');
    }
    const populated = await DasboardList.findById(dashboardList._id)
      .populate('created_by', 'user_id firstName lastName phoneNo BusinessName')
      .populate('updated_by', 'user_id firstName lastName phoneNo BusinessName');
    const finalResult = await populateDasboardList(populated);
    sendSuccess(res, finalResult, 'Dashboard list updated successfully');
  } catch (error) {
    console.error('Error updating dashboard list', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteDasboardList = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let dashboardList;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      dashboardList = await DasboardList.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid dashboard list ID format', 400);
      }
      dashboardList = await DasboardList.findOneAndUpdate({ DasboardList_id: numericId }, updatePayload, { new: true });
    }
    if (!dashboardList) {
      return sendNotFound(res, 'Dashboard list not found');
    }
    sendSuccess(res, dashboardList, 'Dashboard list deleted successfully');
  } catch (error) {
    console.error('Error deleting dashboard list', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getDasboardListsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ status });
    filter.created_by = req.userIdNumber || null;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [dashboardLists, total] = await Promise.all([
      DasboardList.find(filter)
        .populate('created_by', 'user_id firstName lastName phoneNo BusinessName')
        .populate('updated_by', 'user_id firstName lastName phoneNo BusinessName')
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      DasboardList.countDocuments(filter)
    ]);
    
    // Populate products for each dashboard list
    const populatedLists = await Promise.all(
      dashboardLists.map(list => populateDasboardList(list))
    );
    
    sendPaginated(res, populatedLists, paginateMeta(numericPage, numericLimit, total), 'Dashboard lists retrieved successfully');
  } catch (error) {
    console.error('Error retrieving dashboard lists by auth', { error: error.message });
    throw error;
  }
});

module.exports = {
  createDasboardList,
  getAllDasboardLists,
  getDasboardListById,
  updateDasboardList,
  deleteDasboardList,
  getDasboardListsByAuth
};

