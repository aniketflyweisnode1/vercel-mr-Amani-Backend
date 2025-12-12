const MarketingCoupon = require('../models/Marketing_Promotions_coupon.model');
const MarketingCouponCategory = require('../models/Marketing_Promotions_coupon_Category.model');
const Business_Branch = require('../models/business_Branch.model');
const RestaurantItems = require('../models/Restaurant_Items.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const getBusinessBranchIdByAuth = async (userIdNumber) => {
  if (!userIdNumber) {
    return null;
  }
  const branch = await Business_Branch.findOne({ created_by: userIdNumber, Status: true });
  return branch ? branch.business_Branch_id : null;
};

const ensureBusinessBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined || business_Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id, Status: true });
  return !!branch;
};

const normalizeBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  return defaultValue;
};

const parseDateInput = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return value;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sanitizeProductIds = (productIds = []) => {
  if (!Array.isArray(productIds)) {
    return [];
  }
  const uniqueValues = [...new Set(productIds.map(id => parseInt(id, 10)))];
  return uniqueValues.filter(id => Number.isInteger(id) && id > 0);
};

const ensureCategoryExists = async (categoryId) => {
  if (categoryId === undefined || categoryId === null) {
    return false;
  }
  const category = await MarketingCouponCategory.findOne({
    Marketing_Promotions_coupon_Category_id: categoryId,
    Status: true
  });
  return !!category;
};

const validateProductsExist = async (productIds = []) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return { valid: true };
  }

  for (const productId of productIds) {
    const product = await RestaurantItems.findOne({ Restaurant_Items_id: productId, Status: true });
    if (!product) {
      return {
        valid: false,
        message: `Product with ID ${productId} not found or inactive`
      };
    }
  }

  return { valid: true };
};

const buildCouponTypePayload = (input = {}) => ({
  PublicCoupon: normalizeBoolean(input?.PublicCoupon, false),
  PrivateCoupon: normalizeBoolean(input?.PrivateCoupon, false)
});

const buildDiscountTypePayload = (input = {}) => ({
  FlatDiscount: normalizeBoolean(input?.FlatDiscount, false),
  PercentageDiscoount: normalizeBoolean(input?.PercentageDiscoount, false)
});

// Manual population function for Number refs
const populateCoupon = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate Marketing_Promotions_coupon_Category_id
      if (recordObj.Marketing_Promotions_coupon_Category_id) {
        const categoryId = typeof recordObj.Marketing_Promotions_coupon_Category_id === 'object' ? recordObj.Marketing_Promotions_coupon_Category_id : recordObj.Marketing_Promotions_coupon_Category_id;
        const category = await MarketingCouponCategory.findOne({ Marketing_Promotions_coupon_Category_id: categoryId })
          .select('Marketing_Promotions_coupon_Category_id CategoryName');
        if (category) {
          recordObj.Marketing_Promotions_coupon_Category_id = category.toObject ? category.toObject() : category;
        }
      }
      
      // Populate business_Branch_id
      if (recordObj.business_Branch_id) {
        const branchId = typeof recordObj.business_Branch_id === 'object' ? recordObj.business_Branch_id : recordObj.business_Branch_id;
        const branch = await Business_Branch.findOne({ business_Branch_id: branchId })
          .select('business_Branch_id BusinessName Address');
        if (branch) {
          recordObj.business_Branch_id = branch.toObject ? branch.toObject() : branch;
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

const buildFilterFromQuery = ({
  search,
  status,
  categoryId,
  couponType,
  discountType,
  visibility,
  startDate,
  endDate,
  product_id,
  business_Branch_id
}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Offername: { $regex: search, $options: 'i' } },
      { DiscountCode: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    const statusValue = normalizeBoolean(status, true);
    filter.Status = statusValue;
  }

  if (categoryId !== undefined && categoryId !== null) {
    const numericCategoryId = parseInt(categoryId, 10);
    if (!Number.isNaN(numericCategoryId)) {
      filter.Marketing_Promotions_coupon_Category_id = numericCategoryId;
    }
  }

  if (couponType) {
    filter[`CouponType.${couponType}`] = true;
  }

  if (discountType) {
    filter[`DiscountType.${discountType}`] = true;
  }

  if (visibility !== undefined) {
    filter.Visibility = normalizeBoolean(visibility, false);
  }

  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);
  if (start || end) {
    filter.StartDate = {};
    if (start) {
      filter.StartDate.$gte = start;
    }
    if (end) {
      filter.StartDate.$lte = end;
    }
  }

  if (product_id !== undefined && product_id !== null) {
    const numericProduct = parseInt(product_id, 10);
    if (!Number.isNaN(numericProduct)) {
      filter.SelectanyProduct = numericProduct;
    }
  }

  if (business_Branch_id !== undefined && business_Branch_id !== null) {
    const numericBranch = parseInt(business_Branch_id, 10);
    if (!Number.isNaN(numericBranch)) {
      filter.business_Branch_id = numericBranch;
    }
  }

  return filter;
};

const buildListingOptions = (query = {}) => ({
  page: query.page ?? 1,
  limit: query.limit ?? 10,
  search: query.search ?? '',
  status: query.status,
  categoryId: query.categoryId,
  couponType: query.couponType,
  discountType: query.discountType,
  visibility: query.visibility,
  startDate: query.startDate,
  endDate: query.endDate,
  product_id: query.product_id,
  business_Branch_id: query.business_Branch_id,
  sortBy: query.sortBy ?? 'created_at',
  sortOrder: query.sortOrder ?? 'desc'
});

const listCoupons = async ({
  query,
  res,
  successMessage,
  filterOverrides = {}
}) => {
  const options = buildListingOptions(query);
  const numericLimit = Math.min(parseInt(options.limit, 10) || 10, 100);
  const numericPage = Math.max(parseInt(options.page, 10) || 1, 1);
  const skip = (numericPage - 1) * numericLimit;

  const filter = buildFilterFromQuery(options);
  Object.assign(filter, filterOverrides);

  const sort = {};
  sort[options.sortBy] = options.sortOrder === 'asc' ? 1 : -1;

  const [couponsData, total] = await Promise.all([
    MarketingCoupon.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(numericLimit),
    MarketingCoupon.countDocuments(filter)
  ]);
  
  const coupons = await populateCoupon(couponsData);

  const totalPages = Math.ceil(total / numericLimit) || 1;
  const pagination = {
    currentPage: numericPage,
    totalPages,
    totalItems: total,
    itemsPerPage: numericLimit,
    hasNextPage: numericPage < totalPages,
    hasPrevPage: numericPage > 1
  };

  sendPaginated(res, coupons, pagination, successMessage);
};

const findCouponByIdentifier = async (identifier) => {
  let couponData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    couponData = await MarketingCoupon.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      couponData = await MarketingCoupon.findOne({ Marketing_Promotions_coupon_id: numericId });
    }
  }

  if (!couponData) {
    return null;
  }

  return await populateCoupon(couponData);
};

const createMarketingCoupon = asyncHandler(async (req, res) => {
  try {
    const {
      Marketing_Promotions_coupon_Category_id,
      SelectanyProduct = [],
      business_Branch_id: bodyBusinessBranchId
    } = req.body;

    const categoryExists = await ensureCategoryExists(Marketing_Promotions_coupon_Category_id);
    if (!categoryExists) {
      return sendError(res, 'Associated coupon category not found or inactive', 400);
    }

    let business_Branch_id = bodyBusinessBranchId;
    if (business_Branch_id === undefined || business_Branch_id === null) {
      business_Branch_id = await getBusinessBranchIdByAuth(req.userIdNumber);
    }

    if (!business_Branch_id) {
      return sendError(res, 'Unable to determine business branch for authenticated user', 400);
    }

    const branchExists = await ensureBusinessBranchExists(business_Branch_id);
    if (!branchExists) {
      return sendError(res, 'Associated business branch not found or inactive', 400);
    }

    const sanitizedProducts = sanitizeProductIds(SelectanyProduct);
    const productValidation = await validateProductsExist(sanitizedProducts);
    if (!productValidation.valid) {
      return sendError(res, productValidation.message, 400);
    }

    const payload = {
      ...req.body,
      business_Branch_id,
      SelectanyProduct: sanitizedProducts,
      CouponType: buildCouponTypePayload(req.body.CouponType),
      DiscountType: buildDiscountTypePayload(req.body.DiscountType),
      setUnlimitedTimeUse: normalizeBoolean(req.body.setUnlimitedTimeUse, false),
      Visibility: normalizeBoolean(req.body.Visibility, false),
      ValidityLifeTime: normalizeBoolean(req.body.ValidityLifeTime, false),
      created_by: req.userIdNumber || null,
      StartDate: parseDateInput(req.body.StartDate),
      ExpirationDate: parseDateInput(req.body.ExpirationDate)
    };

    const coupon = await MarketingCoupon.create(payload);
    const populated = await populateCoupon(coupon);

    sendSuccess(res, populated, 'Marketing promotion coupon created successfully', 201);
  } catch (error) {
    console.error('Error creating marketing coupon', { error: error.message });
    throw error;
  }
});

const getAllMarketingCoupons = asyncHandler(async (req, res) => {
  try {
    await listCoupons({
      query: req.query,
      res,
      successMessage: 'Marketing promotion coupons retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving marketing coupons', { error: error.message });
    throw error;
  }
});

const getMarketingCouponById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const couponQuery = await findCouponByIdentifier(id);

    if (!couponQuery) {
      return sendNotFound(res, 'Marketing promotion coupon not found');
    }

    const coupon = await couponQuery;
    if (!coupon) {
      return sendNotFound(res, 'Marketing promotion coupon not found');
    }

    sendSuccess(res, coupon, 'Marketing promotion coupon retrieved successfully');
  } catch (error) {
    console.error('Error retrieving marketing coupon', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateMarketingCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.Marketing_Promotions_coupon_Category_id !== undefined) {
      const categoryExists = await ensureCategoryExists(updateData.Marketing_Promotions_coupon_Category_id);
      if (!categoryExists) {
        return sendError(res, 'Associated coupon category not found or inactive', 400);
      }
    }

    if (updateData.SelectanyProduct !== undefined) {
      const sanitizedProducts = sanitizeProductIds(updateData.SelectanyProduct);
      const productValidation = await validateProductsExist(sanitizedProducts);
      if (!productValidation.valid) {
        return sendError(res, productValidation.message, 400);
      }
      updateData.SelectanyProduct = sanitizedProducts;
    }

    if (updateData.CouponType !== undefined) {
      updateData.CouponType = buildCouponTypePayload(updateData.CouponType);
    }

    if (updateData.DiscountType !== undefined) {
      updateData.DiscountType = buildDiscountTypePayload(updateData.DiscountType);
    }

    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Associated business branch not found or inactive', 400);
      }
    }

    if (updateData.setUnlimitedTimeUse !== undefined) {
      updateData.setUnlimitedTimeUse = normalizeBoolean(updateData.setUnlimitedTimeUse, false);
    }

    if (updateData.Visibility !== undefined) {
      updateData.Visibility = normalizeBoolean(updateData.Visibility, false);
    }

    if (updateData.ValidityLifeTime !== undefined) {
      updateData.ValidityLifeTime = normalizeBoolean(updateData.ValidityLifeTime, false);
    }

    if (updateData.StartDate !== undefined) {
      updateData.StartDate = parseDateInput(updateData.StartDate);
    }

    if (updateData.ExpirationDate !== undefined) {
      updateData.ExpirationDate = parseDateInput(updateData.ExpirationDate);
    }

    let coupon;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      coupon = await MarketingCoupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid coupon ID format', 400);
      }
      coupon = await MarketingCoupon.findOneAndUpdate(
        { Marketing_Promotions_coupon_id: numericId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!coupon) {
      return sendNotFound(res, 'Marketing promotion coupon not found');
    }

    const populated = await populateCoupon(coupon);
    sendSuccess(res, populated, 'Marketing promotion coupon updated successfully');
  } catch (error) {
    console.error('Error updating marketing coupon', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteMarketingCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let coupon;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      coupon = await MarketingCoupon.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid coupon ID format', 400);
      }
      coupon = await MarketingCoupon.findOneAndUpdate(
        { Marketing_Promotions_coupon_id: numericId },
        updateData,
        { new: true }
      );
    }

    if (!coupon) {
      return sendNotFound(res, 'Marketing promotion coupon not found');
    }

    sendSuccess(res, coupon, 'Marketing promotion coupon deleted successfully');
  } catch (error) {
    console.error('Error deleting marketing coupon', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getMarketingCouponsByAuth = asyncHandler(async (req, res) => {
  try {
    await listCoupons({
      query: req.query,
      res,
      successMessage: 'Marketing promotion coupons retrieved successfully',
      filterOverrides: { created_by: req.userIdNumber }
    });
  } catch (error) {
    console.error('Error retrieving marketing coupons by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getMarketingCouponsByDiscountType = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    await listCoupons({
      query: req.query,
      res,
      successMessage: `Marketing promotion coupons filtered by discount type ${type} retrieved successfully`,
      filterOverrides: { [`DiscountType.${type}`]: true }
    });
  } catch (error) {
    console.error('Error retrieving marketing coupons by discount type', { error: error.message, type: req.params.type });
    throw error;
  }
});

const getMarketingCouponsByCouponType = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    await listCoupons({
      query: req.query,
      res,
      successMessage: `Marketing promotion coupons filtered by coupon type ${type} retrieved successfully`,
      filterOverrides: { [`CouponType.${type}`]: true }
    });
  } catch (error) {
    console.error('Error retrieving marketing coupons by coupon type', { error: error.message, type: req.params.type });
    throw error;
  }
});

const getMarketingCouponsByCategoryId = asyncHandler(async (req, res) => {
  try {
    const { Marketing_Promotions_coupon_Category_id } = req.params;
    const numericCategoryId = parseInt(Marketing_Promotions_coupon_Category_id, 10);

    if (Number.isNaN(numericCategoryId)) {
      return sendError(res, 'Invalid coupon category ID format', 400);
    }

    const categoryExists = await ensureCategoryExists(numericCategoryId);
    if (!categoryExists) {
      return sendNotFound(res, 'Coupon category not found');
    }

    await listCoupons({
      query: req.query,
      res,
      successMessage: 'Marketing promotion coupons filtered by category retrieved successfully',
      filterOverrides: { Marketing_Promotions_coupon_Category_id: numericCategoryId }
    });
  } catch (error) {
    console.error('Error retrieving marketing coupons by category', {
      error: error.message,
      Marketing_Promotions_coupon_Category_id: req.params.Marketing_Promotions_coupon_Category_id
    });
    throw error;
  }
});

module.exports = {
  createMarketingCoupon,
  getAllMarketingCoupons,
  getMarketingCouponById,
  updateMarketingCoupon,
  deleteMarketingCoupon,
  getMarketingCouponsByAuth,
  getMarketingCouponsByDiscountType,
  getMarketingCouponsByCouponType,
  getMarketingCouponsByCategoryId
};

