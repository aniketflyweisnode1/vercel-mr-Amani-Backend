const VendorDiscountCoupon = require('../models/Vendor_Discount_Coupon.model');
const User = require('../models/User.model');
const VendorProductCategory = require('../models/Vendor_Product_Category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const populateVendorDiscountCoupon = (query) => query
  .populate('user_id', 'user_id firstName lastName phoneNo BusinessName Email')
  .populate('Category_id', 'Vendor_Product_Category_id CategoryName')
  .populate('created_by', 'user_id firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'user_id firstName lastName phoneNo BusinessName');

const buildFilter = ({ search, status, user_id, Category_id, DiscountType, Coupontype }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { offerName: { $regex: search, $options: 'i' } },
      { Discountcode: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (user_id !== undefined) {
    const userId = parseInt(user_id, 10);
    if (!Number.isNaN(userId)) {
      filter.user_id = userId;
    }
  }

  if (Category_id !== undefined) {
    const categoryId = parseInt(Category_id, 10);
    if (!Number.isNaN(categoryId)) {
      filter.Category_id = categoryId;
    }
  }

  if (DiscountType) {
    filter.DiscountType = DiscountType;
  }

  if (Coupontype) {
    filter.Coupontype = Coupontype;
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

const ensureUserExists = async (user_id) => {
  if (user_id === undefined) {
    return true;
  }
  const userId = parseInt(user_id, 10);
  if (Number.isNaN(userId)) {
    return false;
  }
  const user = await User.findOne({ user_id: userId, status: true });
  return Boolean(user);
};

const ensureCategoryExists = async (Category_id) => {
  if (Category_id === undefined || Category_id === null) {
    return true;
  }
  const categoryId = parseInt(Category_id, 10);
  if (Number.isNaN(categoryId)) {
    return false;
  }
  const category = await VendorProductCategory.findOne({ Vendor_Product_Category_id: categoryId, Status: true });
  return Boolean(category);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateVendorDiscountCoupon(VendorDiscountCoupon.findById(identifier));
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateVendorDiscountCoupon(VendorDiscountCoupon.findOne({ Vendor_Discount_Coupon_id: numericId }));
  }
  return null;
};

const createVendorDiscountCoupon = asyncHandler(async (req, res) => {
  try {
    const { user_id, Category_id } = req.body;
    if (!(await ensureUserExists(user_id))) {
      return sendError(res, 'User not found', 400);
    }
    if (Category_id !== null && Category_id !== undefined && !(await ensureCategoryExists(Category_id))) {
      return sendError(res, 'Category not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const coupon = await VendorDiscountCoupon.create(payload);
    const populated = await populateVendorDiscountCoupon(VendorDiscountCoupon.findById(coupon._id));
    sendSuccess(res, populated, 'Vendor discount coupon created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor discount coupon', { error: error.message });
    throw error;
  }
});

const getAllVendorDiscountCoupons = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      Category_id,
      DiscountType,
      Coupontype,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id, Category_id, DiscountType, Coupontype });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [coupons, total] = await Promise.all([
      populateVendorDiscountCoupon(VendorDiscountCoupon.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorDiscountCoupon.countDocuments(filter)
    ]);
    sendPaginated(res, coupons, paginateMeta(numericPage, numericLimit, total), 'Vendor discount coupons retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor discount coupons', { error: error.message });
    throw error;
  }
});

const getVendorDiscountCouponById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const couponQuery = findByIdentifier(id);
    if (!couponQuery) {
      return sendError(res, 'Invalid vendor discount coupon identifier', 400);
    }
    const coupon = await couponQuery;
    if (!coupon) {
      return sendNotFound(res, 'Vendor discount coupon not found');
    }
    sendSuccess(res, coupon, 'Vendor discount coupon retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor discount coupon', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorDiscountCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, Category_id } = req.body;
    if (user_id !== undefined && !(await ensureUserExists(user_id))) {
      return sendError(res, 'User not found', 400);
    }
    if (Category_id !== null && Category_id !== undefined && !(await ensureCategoryExists(Category_id))) {
      return sendError(res, 'Category not found', 400);
    }
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let coupon;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      coupon = await VendorDiscountCoupon.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor discount coupon ID format', 400);
      }
      coupon = await VendorDiscountCoupon.findOneAndUpdate({ Vendor_Discount_Coupon_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!coupon) {
      return sendNotFound(res, 'Vendor discount coupon not found');
    }
    const populated = await populateVendorDiscountCoupon(VendorDiscountCoupon.findById(coupon._id));
    sendSuccess(res, populated, 'Vendor discount coupon updated successfully');
  } catch (error) {
    console.error('Error updating vendor discount coupon', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorDiscountCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let coupon;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      coupon = await VendorDiscountCoupon.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor discount coupon ID format', 400);
      }
      coupon = await VendorDiscountCoupon.findOneAndUpdate({ Vendor_Discount_Coupon_id: numericId }, updatePayload, { new: true });
    }
    if (!coupon) {
      return sendNotFound(res, 'Vendor discount coupon not found');
    }
    sendSuccess(res, coupon, 'Vendor discount coupon deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor discount coupon', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorDiscountCouponsByAuth = asyncHandler(async (req, res) => {
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
      Category_id,
      DiscountType,
      Coupontype,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Category_id, DiscountType, Coupontype });
    filter.created_by = userId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [coupons, total] = await Promise.all([
      populateVendorDiscountCoupon(VendorDiscountCoupon.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorDiscountCoupon.countDocuments(filter)
    ]);
    sendPaginated(res, coupons, paginateMeta(numericPage, numericLimit, total), 'Vendor discount coupons retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor discount coupons by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getVendorDiscountCouponsByCategoryId = asyncHandler(async (req, res) => {
  try {
    const { Category_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      DiscountType,
      Coupontype,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const categoryId = parseInt(Category_id, 10);
    if (Number.isNaN(categoryId)) {
      return sendError(res, 'Invalid category ID format', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id, DiscountType, Coupontype });
    filter.Category_id = categoryId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [coupons, total] = await Promise.all([
      populateVendorDiscountCoupon(VendorDiscountCoupon.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorDiscountCoupon.countDocuments(filter)
    ]);
    sendPaginated(res, coupons, paginateMeta(numericPage, numericLimit, total), 'Vendor discount coupons retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor discount coupons by category', { error: error.message, Category_id: req.params.Category_id });
    throw error;
  }
});

const getVendorDiscountCouponsByDiscountType = asyncHandler(async (req, res) => {
  try {
    const { DiscountType } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      Category_id,
      Coupontype,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    if (!['Flat', 'Percentage'].includes(DiscountType)) {
      return sendError(res, 'Invalid discount type. Must be Flat or Percentage', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id, Category_id, Coupontype });
    filter.DiscountType = DiscountType;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [coupons, total] = await Promise.all([
      populateVendorDiscountCoupon(VendorDiscountCoupon.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorDiscountCoupon.countDocuments(filter)
    ]);
    sendPaginated(res, coupons, paginateMeta(numericPage, numericLimit, total), 'Vendor discount coupons retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor discount coupons by discount type', { error: error.message, DiscountType: req.params.DiscountType });
    throw error;
  }
});

const getVendorDiscountCouponsByCouponType = asyncHandler(async (req, res) => {
  try {
    const { Coupontype } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      Category_id,
      DiscountType,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    if (!['Public', 'Private'].includes(Coupontype)) {
      return sendError(res, 'Invalid coupon type. Must be Public or Private', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id, Category_id, DiscountType });
    filter.Coupontype = Coupontype;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [coupons, total] = await Promise.all([
      populateVendorDiscountCoupon(VendorDiscountCoupon.find(filter))
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorDiscountCoupon.countDocuments(filter)
    ]);
    sendPaginated(res, coupons, paginateMeta(numericPage, numericLimit, total), 'Vendor discount coupons retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor discount coupons by coupon type', { error: error.message, Coupontype: req.params.Coupontype });
    throw error;
  }
});

module.exports = {
  createVendorDiscountCoupon,
  getAllVendorDiscountCoupons,
  getVendorDiscountCouponById,
  updateVendorDiscountCoupon,
  deleteVendorDiscountCoupon,
  getVendorDiscountCouponsByAuth,
  getVendorDiscountCouponsByCategoryId,
  getVendorDiscountCouponsByDiscountType,
  getVendorDiscountCouponsByCouponType
};

