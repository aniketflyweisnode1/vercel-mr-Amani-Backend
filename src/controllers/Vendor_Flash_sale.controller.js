const Vendor_Flash_sale = require('../models/Vendor_Flash_sale.model');
const Vendor_Store = require('../models/Vendor_Store.model');
const Vendor_Products = require('../models/Vendor_Products.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to ensure vendor store exists
const ensureVendorStoreExists = async (Vendor_Store_id) => {
  if (Vendor_Store_id === undefined || Vendor_Store_id === null) {
    return false;
  }
  const store = await Vendor_Store.findOne({ Vendor_Store_id: Vendor_Store_id, Status: true });
  return !!store;
};

// Helper function to ensure vendor product exists
const ensureVendorProductExists = async (Vendor_Product_id) => {
  if (Vendor_Product_id === undefined || Vendor_Product_id === null) {
    return false;
  }
  const product = await Vendor_Products.findOne({ Vendor_Products_id: Vendor_Product_id, Status: true });
  return !!product;
};

// Helper function to convert time string (AM/PM format) to Date object
const convertTimeStringToDate = (timeString, saleDate) => {
  // If already a Date object, return as-is
  if (timeString instanceof Date) {
    return timeString;
  }

  // If not a string, return as-is
  if (!timeString || typeof timeString !== 'string') {
    return timeString;
  }

  const trimmedTime = timeString.trim();

  // Check if it's a valid ISO date string (contains T or -)
  if (trimmedTime.includes('T') || trimmedTime.includes('-')) {
    const isoDate = new Date(trimmedTime);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
  }

  // Parse time string in format "HH:MM AM/PM" (e.g., "12:01 AM", "11:30 PM", "1:30 PM")
  // Pattern matches: 1-12 hours, 00-59 minutes, optional space, AM/PM
  const timePattern = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
  const match = trimmedTime.match(timePattern);
  
  if (!match) {
    // If pattern doesn't match, try to parse as regular date
    const fallbackDate = new Date(trimmedTime);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
    // If still can't parse, return original string (will cause validation error)
    return trimmedTime;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  // Validate hours (1-12)
  if (hours < 1 || hours > 12) {
    return trimmedTime; // Invalid, return as-is
  }

  // Validate minutes (0-59)
  if (minutes < 0 || minutes > 59) {
    return trimmedTime; // Invalid, return as-is
  }

  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  // Use SaleDate as base date, or today if not provided
  const baseDate = saleDate ? new Date(saleDate) : new Date();
  const dateTime = new Date(baseDate);
  dateTime.setHours(hours, minutes, 0, 0);

  return dateTime;
};

// Manual population for numeric IDs
const populateVendorFlashSale = async (records) => {
  const recordsArray = Array.isArray(records) ? records : [records];
  const populatedRecords = await Promise.all(
    recordsArray.map(async (record) => {
      if (!record) return null;
      const recordObj = record.toObject ? record.toObject() : record;
      
      // Populate Vendor_Store_id
      if (recordObj.Vendor_Store_id) {
        const storeId = typeof recordObj.Vendor_Store_id === 'object' ? recordObj.Vendor_Store_id.Vendor_Store_id : recordObj.Vendor_Store_id;
        const store = await Vendor_Store.findOne({ Vendor_Store_id: storeId })
          .select('Vendor_Store_id StoreName StoreAddress EmailAddress');
        if (store) {
          recordObj.Vendor_Store_id = store.toObject ? store.toObject() : store;
        }
      }
      
      // Populate Vendor_Product_id
      if (recordObj.Vendor_Product_id) {
        const productId = typeof recordObj.Vendor_Product_id === 'object' ? recordObj.Vendor_Product_id.Vendor_Products_id : recordObj.Vendor_Product_id;
        const product = await Vendor_Products.findOne({ Vendor_Products_id: productId })
          .select('Vendor_Products_id Title Products_image Description');
        if (product) {
          recordObj.Vendor_Product_id = product.toObject ? product.toObject() : product;
        }
      }
      
      // Populate created_by
      if (recordObj.created_by) {
        const createdById = typeof recordObj.created_by === 'object' ? recordObj.created_by.user_id : recordObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName Email');
        if (createdBy) {
          recordObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (recordObj.updated_by) {
        const updatedById = typeof recordObj.updated_by === 'object' ? recordObj.updated_by.user_id : recordObj.updated_by;
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

const buildFilter = ({ search, status, Vendor_Store_id, Vendor_Product_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Vendor_Flash_sale_id: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (Vendor_Store_id) {
    const storeId = parseInt(Vendor_Store_id, 10);
    if (!Number.isNaN(storeId)) {
      filter.Vendor_Store_id = storeId;
    }
  }

  if (Vendor_Product_id) {
    const productId = parseInt(Vendor_Product_id, 10);
    if (!Number.isNaN(productId)) {
      filter.Vendor_Product_id = productId;
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

const findByIdentifier = async (identifier) => {
  let flashSaleData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    flashSaleData = await Vendor_Flash_sale.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      flashSaleData = await Vendor_Flash_sale.findOne({ Vendor_Flash_sale_id: numericId });
    }
  }
  
  if (!flashSaleData) {
    return null;
  }
  
  return await populateVendorFlashSale(flashSaleData);
};

const createVendorFlashSale = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Store_id, Vendor_Product_id } = req.body;

    // Validate vendor store exists
    if (Vendor_Store_id) {
      const storeExists = await ensureVendorStoreExists(Vendor_Store_id);
      if (!storeExists) {
        return sendError(res, 'Vendor store not found or inactive', 404);
      }
    }

    // Validate vendor product exists
    if (Vendor_Product_id) {
      const productExists = await ensureVendorProductExists(Vendor_Product_id);
      if (!productExists) {
        return sendError(res, 'Vendor product not found or inactive', 404);
      }
    }

    // Convert time strings to Date objects if needed
    const { SaleDate, StartTime, EndTime } = req.body;
    const convertedStartTime = convertTimeStringToDate(StartTime, SaleDate);
    const convertedEndTime = convertTimeStringToDate(EndTime, SaleDate);

    const payload = {
      ...req.body,
      StartTime: convertedStartTime,
      EndTime: convertedEndTime,
      SaleDate: SaleDate ? new Date(SaleDate) : SaleDate,
      created_by: req.userIdNumber || null
    };
    const flashSale = await Vendor_Flash_sale.create(payload);
    const populated = await populateVendorFlashSale(flashSale);
    sendSuccess(res, populated, 'Vendor flash sale created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor flash sale', { error: error.message });
    throw error;
  }
});

const getAllVendorFlashSales = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Vendor_Store_id,
      Vendor_Product_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, Vendor_Store_id, Vendor_Product_id });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [flashSalesData, total] = await Promise.all([
      Vendor_Flash_sale.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Vendor_Flash_sale.countDocuments(filter)
    ]);
    
    const flashSales = await populateVendorFlashSale(flashSalesData);
    sendPaginated(res, flashSales, paginateMeta(numericPage, numericLimit, total), 'Vendor flash sales retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor flash sales', { error: error.message });
    throw error;
  }
});

const getVendorFlashSaleById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const flashSale = await findByIdentifier(id);
    if (!flashSale) {
      return sendNotFound(res, 'Vendor flash sale not found');
    }
    sendSuccess(res, flashSale, 'Vendor flash sale retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor flash sale', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorFlashSale = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { Vendor_Store_id, Vendor_Product_id } = req.body;

    // Validate vendor store exists if provided
    if (Vendor_Store_id !== undefined) {
      const storeExists = await ensureVendorStoreExists(Vendor_Store_id);
      if (!storeExists) {
        return sendError(res, 'Vendor store not found or inactive', 404);
      }
    }

    // Validate vendor product exists if provided
    if (Vendor_Product_id !== undefined) {
      const productExists = await ensureVendorProductExists(Vendor_Product_id);
      if (!productExists) {
        return sendError(res, 'Vendor product not found or inactive', 404);
      }
    }

    // Convert time strings to Date objects if needed
    const { SaleDate, StartTime, EndTime } = req.body;
    const convertedStartTime = StartTime !== undefined ? convertTimeStringToDate(StartTime, SaleDate) : undefined;
    const convertedEndTime = EndTime !== undefined ? convertTimeStringToDate(EndTime, SaleDate) : undefined;

    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    // Only update time fields if they were provided
    if (convertedStartTime !== undefined) {
      updatePayload.StartTime = convertedStartTime;
    }
    if (convertedEndTime !== undefined) {
      updatePayload.EndTime = convertedEndTime;
    }
    if (SaleDate !== undefined) {
      updatePayload.SaleDate = new Date(SaleDate);
    }
    let flashSale;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      flashSale = await Vendor_Flash_sale.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor flash sale ID format', 400);
      }
      flashSale = await Vendor_Flash_sale.findOneAndUpdate({ Vendor_Flash_sale_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!flashSale) {
      return sendNotFound(res, 'Vendor flash sale not found');
    }
    const populated = await populateVendorFlashSale(flashSale);
    sendSuccess(res, populated, 'Vendor flash sale updated successfully');
  } catch (error) {
    console.error('Error updating vendor flash sale', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorFlashSale = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let flashSale;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      flashSale = await Vendor_Flash_sale.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor flash sale ID format', 400);
      }
      flashSale = await Vendor_Flash_sale.findOneAndUpdate({ Vendor_Flash_sale_id: numericId }, updatePayload, { new: true });
    }
    if (!flashSale) {
      return sendNotFound(res, 'Vendor flash sale not found');
    }
    sendSuccess(res, flashSale, 'Vendor flash sale deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor flash sale', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorFlashSalesByProductId = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Product_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const productId = parseInt(Vendor_Product_id, 10);
    if (Number.isNaN(productId)) {
      return sendError(res, 'Invalid vendor product ID format', 400);
    }

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status });
    filter.Vendor_Product_id = productId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [flashSalesData, total] = await Promise.all([
      Vendor_Flash_sale.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Vendor_Flash_sale.countDocuments(filter)
    ]);
    
    const flashSales = await populateVendorFlashSale(flashSalesData);
    sendPaginated(res, flashSales, paginateMeta(numericPage, numericLimit, total), 'Vendor flash sales retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor flash sales by product ID', { error: error.message, Vendor_Product_id: req.params.Vendor_Product_id });
    throw error;
  }
});

const getVendorFlashSalesByAuth = asyncHandler(async (req, res) => {
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
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status });
    filter.created_by = userId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [flashSalesData, total] = await Promise.all([
      Vendor_Flash_sale.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Vendor_Flash_sale.countDocuments(filter)
    ]);
    
    const flashSales = await populateVendorFlashSale(flashSalesData);
    sendPaginated(res, flashSales, paginateMeta(numericPage, numericLimit, total), 'Vendor flash sales retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor flash sales by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createVendorFlashSale,
  getAllVendorFlashSales,
  getVendorFlashSaleById,
  updateVendorFlashSale,
  deleteVendorFlashSale,
  getVendorFlashSalesByProductId,
  getVendorFlashSalesByAuth
};
