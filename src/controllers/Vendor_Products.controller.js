const VendorProducts = require('../models/Vendor_Products.model');
const User = require('../models/User.model');
const VendorProductCategory = require('../models/Vendor_Product_Category.model');
const VendorProductSubCategory = require('../models/Vendor_Product_SubCategory.model');
const VendorProductsBrand = require('../models/Vendor_Products_brand.model');
const VendorProductsTypes = require('../models/Vendor_Products_types.model');
const VendorProductsFeatures = require('../models/Vendor_Products_features.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateVendorProducts = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate user_id
      if (recordObj.user_id) {
        const userId = typeof recordObj.user_id === 'object' ? recordObj.user_id : recordObj.user_id;
        const user = await User.findOne({ user_id: userId })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (user) {
          recordObj.user_id = user.toObject ? user.toObject() : user;
        }
      }
      
      // Populate Category_id
      if (recordObj.Category_id) {
        const categoryId = typeof recordObj.Category_id === 'object' ? recordObj.Category_id : recordObj.Category_id;
        const category = await VendorProductCategory.findOne({ Vendor_Product_Category_id: categoryId })
          .select('Vendor_Product_Category_id CategoryName');
        if (category) {
          recordObj.Category_id = category.toObject ? category.toObject() : category;
        }
      }
      
      // Populate Subcategory_id
      if (recordObj.Subcategory_id) {
        const subcategoryId = typeof recordObj.Subcategory_id === 'object' ? recordObj.Subcategory_id : recordObj.Subcategory_id;
        const subcategory = await VendorProductSubCategory.findOne({ Vendor_Product_SubCategory_id: subcategoryId })
          .select('Vendor_Product_SubCategory_id SubCategoryName');
        if (subcategory) {
          recordObj.Subcategory_id = subcategory.toObject ? subcategory.toObject() : subcategory;
        }
      }
      
      // Populate brand (Vendor_Products_brand_id)
      if (recordObj.brand) {
        const brandId = typeof recordObj.brand === 'object' ? recordObj.brand : recordObj.brand;
        const brand = await VendorProductsBrand.findOne({ Vendor_Products_brand_id: brandId })
          .select('Vendor_Products_brand_id name');
        if (brand) {
          recordObj.brand = brand.toObject ? brand.toObject() : brand;
        }
      }
      
      // Populate type (Vendor_Products_types_id)
      if (recordObj.type) {
        const typeId = typeof recordObj.type === 'object' ? recordObj.type : recordObj.type;
        const type = await VendorProductsTypes.findOne({ Vendor_Products_types_id: typeId })
          .select('Vendor_Products_types_id name');
        if (type) {
          recordObj.type = type.toObject ? type.toObject() : type;
        }
      }
      
      // Populate features (Vendor_Products_features_id)
      if (recordObj.features) {
        const featuresId = typeof recordObj.features === 'object' ? recordObj.features : recordObj.features;
        const features = await VendorProductsFeatures.findOne({ Vendor_Products_features_id: featuresId })
          .select('Vendor_Products_features_id name');
        if (features) {
          recordObj.features = features.toObject ? features.toObject() : features;
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

const buildFilter = ({ search, status, user_id, Category_id, Subcategory_id, Coupontype, Avaliable }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Title: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } },
      { Color: { $regex: search, $options: 'i' } },
      { Material: { $regex: search, $options: 'i' } }
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

  if (Subcategory_id !== undefined) {
    const subcategoryId = parseInt(Subcategory_id, 10);
    if (!Number.isNaN(subcategoryId)) {
      filter.Subcategory_id = subcategoryId;
    }
  }

  if (Coupontype) {
    filter.Coupontype = Coupontype;
  }

  if (Avaliable !== undefined) {
    filter.Avaliable = Avaliable === 'true' || Avaliable === true;
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
  if (Category_id === undefined) {
    return true;
  }
  const categoryId = parseInt(Category_id, 10);
  if (Number.isNaN(categoryId)) {
    return false;
  }
  const category = await VendorProductCategory.findOne({ Vendor_Product_Category_id: categoryId, Status: true });
  return Boolean(category);
};

const ensureSubCategoryExists = async (Subcategory_id) => {
  if (Subcategory_id === undefined || Subcategory_id === null) {
    return true;
  }
  const subcategoryId = parseInt(Subcategory_id, 10);
  if (Number.isNaN(subcategoryId)) {
    return false;
  }
  const subcategory = await VendorProductSubCategory.findOne({ Vendor_Product_SubCategory_id: subcategoryId, Status: true });
  return Boolean(subcategory);
};

const ensureBrandExists = async (brand) => {
  if (brand === undefined || brand === null) {
    return true;
  }
  const brandId = parseInt(brand, 10);
  if (Number.isNaN(brandId)) {
    return false;
  }
  const brandRecord = await VendorProductsBrand.findOne({ Vendor_Products_brand_id: brandId, Status: true });
  return Boolean(brandRecord);
};

const ensureTypeExists = async (type) => {
  if (type === undefined || type === null) {
    return true;
  }
  const typeId = parseInt(type, 10);
  if (Number.isNaN(typeId)) {
    return false;
  }
  const typeRecord = await VendorProductsTypes.findOne({ Vendor_Products_types_id: typeId, Status: true });
  return Boolean(typeRecord);
};

const ensureFeaturesExists = async (features) => {
  if (features === undefined || features === null) {
    return true;
  }
  const featuresId = parseInt(features, 10);
  if (Number.isNaN(featuresId)) {
    return false;
  }
  const featuresRecord = await VendorProductsFeatures.findOne({ Vendor_Products_features_id: featuresId, Status: true });
  return Boolean(featuresRecord);
};

const findByIdentifier = async (identifier) => {
  let productData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    productData = await VendorProducts.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      productData = await VendorProducts.findOne({ Vendor_Products_id: numericId });
    }
  }
  
  if (!productData) {
    return null;
  }
  
  return await populateVendorProducts(productData);
};

const createVendorProducts = asyncHandler(async (req, res) => {
  try {
    const { user_id, Category_id, Subcategory_id } = req.body;
    if (!(await ensureUserExists(user_id))) {
      return sendError(res, 'User not found', 400);
    }
    if (!(await ensureCategoryExists(Category_id))) {
      return sendError(res, 'Category not found', 400);
    }
    if (Subcategory_id !== null && Subcategory_id !== undefined && !(await ensureSubCategoryExists(Subcategory_id))) {
      return sendError(res, 'Subcategory not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const product = await VendorProducts.create(payload);
    const populated = await populateVendorProducts(product);
    sendSuccess(res, populated, 'Vendor product created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor product', { error: error.message });
    throw error;
  }
});

const getAllVendorProducts = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      Category_id,
      Subcategory_id,
      Coupontype,
      Avaliable,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id, Category_id, Subcategory_id, Coupontype, Avaliable });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [productsData, total] = await Promise.all([
      VendorProducts.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProducts.countDocuments(filter)
    ]);
    
    const products = await populateVendorProducts(productsData);
    sendPaginated(res, products, paginateMeta(numericPage, numericLimit, total), 'Vendor products retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor products', { error: error.message });
    throw error;
  }
});

const getVendorProductsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const product = await findByIdentifier(id);
    if (!product) {
      return sendNotFound(res, 'Vendor product not found');
    }
    if (!product) {
      return sendNotFound(res, 'Vendor product not found');
    }
    sendSuccess(res, product, 'Vendor product retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor product', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorProducts = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, Category_id, Subcategory_id, brand, type, features } = req.body;
    if (user_id !== undefined && !(await ensureUserExists(user_id))) {
      return sendError(res, 'User not found', 400);
    }
    if (Category_id !== undefined && !(await ensureCategoryExists(Category_id))) {
      return sendError(res, 'Category not found', 400);
    }
    if (Subcategory_id !== null && Subcategory_id !== undefined && !(await ensureSubCategoryExists(Subcategory_id))) {
      return sendError(res, 'Subcategory not found', 400);
    }
    if (brand !== null && brand !== undefined && !(await ensureBrandExists(brand))) {
      return sendError(res, 'Brand not found or inactive', 400);
    }
    if (type !== null && type !== undefined && !(await ensureTypeExists(type))) {
      return sendError(res, 'Type not found or inactive', 400);
    }
    if (features !== null && features !== undefined && !(await ensureFeaturesExists(features))) {
      return sendError(res, 'Features not found or inactive', 400);
    }
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await VendorProducts.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor product ID format', 400);
      }
      product = await VendorProducts.findOneAndUpdate({ Vendor_Products_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!product) {
      return sendNotFound(res, 'Vendor product not found');
    }
    const populated = await populateVendorProducts(product);
    sendSuccess(res, populated, 'Vendor product updated successfully');
  } catch (error) {
    console.error('Error updating vendor product', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorProducts = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await VendorProducts.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor product ID format', 400);
      }
      product = await VendorProducts.findOneAndUpdate({ Vendor_Products_id: numericId }, updatePayload, { new: true });
    }
    if (!product) {
      return sendNotFound(res, 'Vendor product not found');
    }
    sendSuccess(res, product, 'Vendor product deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor product', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorProductsByAuth = asyncHandler(async (req, res) => {
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
      Subcategory_id,
      Coupontype,
      Avaliable,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Category_id, Subcategory_id, Coupontype, Avaliable });
    filter.created_by = userId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [productsData, total] = await Promise.all([
      VendorProducts.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProducts.countDocuments(filter)
    ]);
    
    const products = await populateVendorProducts(productsData);
    sendPaginated(res, products, paginateMeta(numericPage, numericLimit, total), 'Vendor products retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor products by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getVendorProductsByCategoryId = asyncHandler(async (req, res) => {
  try {
    const { Category_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      Subcategory_id,
      Coupontype,
      Avaliable,
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
    const filter = buildFilter({ search, status, user_id, Subcategory_id, Coupontype, Avaliable });
    filter.Category_id = categoryId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [productsData, total] = await Promise.all([
      VendorProducts.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProducts.countDocuments(filter)
    ]);
    
    const products = await populateVendorProducts(productsData);
    sendPaginated(res, products, paginateMeta(numericPage, numericLimit, total), 'Vendor products retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor products by category', { error: error.message, Category_id: req.params.Category_id });
    throw error;
  }
});

const getVendorProductsBySubCategoryId = asyncHandler(async (req, res) => {
  try {
    const { Subcategory_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      Category_id,
      Coupontype,
      Avaliable,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const subcategoryId = parseInt(Subcategory_id, 10);
    if (Number.isNaN(subcategoryId)) {
      return sendError(res, 'Invalid subcategory ID format', 400);
    }
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id, Category_id, Coupontype, Avaliable });
    filter.Subcategory_id = subcategoryId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [productsData, total] = await Promise.all([
      VendorProducts.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorProducts.countDocuments(filter)
    ]);
    
    const products = await populateVendorProducts(productsData);
    sendPaginated(res, products, paginateMeta(numericPage, numericLimit, total), 'Vendor products retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor products by subcategory', { error: error.message, Subcategory_id: req.params.Subcategory_id });
    throw error;
  }
});

module.exports = {
  createVendorProducts,
  getAllVendorProducts,
  getVendorProductsById,
  updateVendorProducts,
  deleteVendorProducts,
  getVendorProductsByAuth,
  getVendorProductsByCategoryId,
  getVendorProductsBySubCategoryId
};

