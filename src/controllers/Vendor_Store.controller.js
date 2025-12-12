const VendorStore = require('../models/Vendor_Store.model');
const Vendor_Products = require('../models/Vendor_Products.model');
const Order_Now = require('../models/Order_Now.model');
const transaction = require('../models/transaction.model');
const RecentAcitvitys = require('../models/RecentAcitvitys.model');
const Marketing_Promotions_EmailCampaign = require('../models/Marketing_Promotions_EmailCampaign.model');
const Marketing_Promotions_SMSCampaign = require('../models/Marketing_Promotions_SMSCampaign.model');
const CampaignAllneedaPost = require('../models/CampaignAllneedaPost.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs
const populateVendorStore = async (records) => {
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

const buildFilter = ({ search, status, user_id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { StoreName: { $regex: search, $options: 'i' } },
      { StoreAddress: { $regex: search, $options: 'i' } },
      { EmailAddress: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } },
      { mobileno: { $regex: search, $options: 'i' } },
      { StoreNumber: { $regex: search, $options: 'i' } },
      { KYC_BusinessLicenceNo: { $regex: search, $options: 'i' } },
      { KYC_EINNo: { $regex: search, $options: 'i' } },
      { LocationName: { $regex: search, $options: 'i' } },
      { StreetNo: { $regex: search, $options: 'i' } },
      { StreetName: { $regex: search, $options: 'i' } },
      { City: { $regex: search, $options: 'i' } },
      { Country: { $regex: search, $options: 'i' } },
      { State: { $regex: search, $options: 'i' } },
      { ZipCode: { $regex: search, $options: 'i' } }
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

const findByIdentifier = async (identifier) => {
  let recordData;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    recordData = await VendorStore.findById(identifier);
  } else {
    const numericId = parseInt(identifier, 10);
    if (!Number.isNaN(numericId)) {
      recordData = await VendorStore.findOne({ Vendor_Store_id: numericId });
    }
  }

  if (!recordData) {
    return null;
  }

  return await populateVendorStore(recordData);
};

const createVendorStore = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!(await ensureUserExists(user_id))) {
      return sendError(res, 'User not found', 400);
    }
    const payload = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    const vendorStore = await VendorStore.create(payload);
    const populated = await populateVendorStore(vendorStore);
    sendSuccess(res, populated, 'Vendor store created successfully', 201);
  } catch (error) {
    console.error('Error creating vendor store', { error: error.message });
    throw error;
  }
});

const getAllVendorStores = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [vendorStoresData, total] = await Promise.all([
      VendorStore.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorStore.countDocuments(filter)
    ]);
    
    const vendorStores = await populateVendorStore(vendorStoresData);
    sendPaginated(res, vendorStores, paginateMeta(numericPage, numericLimit, total), 'Vendor stores retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor stores', { error: error.message });
    throw error;
  }
});

const getVendorStoreById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const vendorStoreQuery = findByIdentifier(id);
    if (!vendorStoreQuery) {
      return sendError(res, 'Invalid vendor store identifier', 400);
    }
    const vendorStore = await vendorStoreQuery;
    if (!vendorStore) {
      return sendNotFound(res, 'Vendor store not found');
    }
    sendSuccess(res, vendorStore, 'Vendor store retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor store', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateVendorStore = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    if (user_id !== undefined && !(await ensureUserExists(user_id))) {
      return sendError(res, 'User not found', 400);
    }
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let vendorStore;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      vendorStore = await VendorStore.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor store ID format', 400);
      }
      vendorStore = await VendorStore.findOneAndUpdate({ Vendor_Store_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!vendorStore) {
      return sendNotFound(res, 'Vendor store not found');
    }
    const populated = await populateVendorStore(vendorStore);
    sendSuccess(res, populated, 'Vendor store updated successfully');
  } catch (error) {
    console.error('Error updating vendor store', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteVendorStore = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let vendorStore;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      vendorStore = await VendorStore.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid vendor store ID format', 400);
      }
      vendorStore = await VendorStore.findOneAndUpdate({ Vendor_Store_id: numericId }, updatePayload, { new: true });
    }
    if (!vendorStore) {
      return sendNotFound(res, 'Vendor store not found');
    }
    sendSuccess(res, vendorStore, 'Vendor store deleted successfully');
  } catch (error) {
    console.error('Error deleting vendor store', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getVendorStoresByAuth = asyncHandler(async (req, res) => {
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
      user_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id });
    filter.created_by = userId;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [vendorStoresData, total] = await Promise.all([
      VendorStore.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      VendorStore.countDocuments(filter)
    ]);
    
    const vendorStores = await populateVendorStore(vendorStoresData);
    sendPaginated(res, vendorStores, paginateMeta(numericPage, numericLimit, total), 'Vendor stores retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor stores by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getVendorDashboard = asyncHandler(async (req, res) => {
  try {
    const { Vender_store_id } = req.query;

    if (!Vender_store_id) {
      return sendError(res, 'Vendor store ID is required', 400);
    }

    const storeId = parseInt(Vender_store_id, 10);
    if (Number.isNaN(storeId)) {
      return sendError(res, 'Invalid vendor store ID format', 400);
    }

    const vendorStore = await VendorStore.findOne({ Vendor_Store_id: storeId, Status: true });
    if (!vendorStore) {
      return sendNotFound(res, 'Vendor store not found or inactive');
    }

    const vendorUserId = vendorStore.user_id;

    // Get all vendor products for this store (linked through user_id)
    const vendorProducts = await Vendor_Products.find({ user_id: vendorUserId, Status: true });
    const productIds = vendorProducts.map(p => p.Vendor_Products_id);

    // 1. TotalSales - Calculate from transactions with Order_Now_Payment type for this vendor
    const salesTransactions = await transaction.find({
      user_id: vendorUserId,
      transactionType: 'Order_Now_Payment',
      status: 'completed'
    });
    const TotalSales = salesTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    // 2. ListedProducts - Count of active vendor products
    const ListedProducts = vendorProducts.length;

    // 3. PendingOrders - Count orders with Pending status for this vendor
    // Since Order_Now doesn't directly link to vendor stores, we'll count orders where
    // the order might be related to vendor products (this is a limitation - in production you'd need proper linking)
    // For now, we'll use a simplified approach: count pending orders
    // In a real scenario, you'd link orders to vendor products through a junction table or product reference
    const allOrders = await Order_Now.find({ Status: true }).lean();
    const PendingOrders = allOrders.filter(order => order.OrderStatus === 'Pending').length;

    // 4. Peviews_Qualification - Reviews for vendor products
    // Since there's no direct vendor product review model, we'll use a placeholder structure
    // In production, you'd query actual vendor product reviews
    const Peviews_Qualification = {
      NagtiveCount: 0, // Poor reviews
      Naturalcount: 0, // Average reviews
      PositiveCount: 0 // Excellent + Good reviews
    };

    // 5. MonthlySalseChart - Sales by month and days
    const now = new Date();
    const currentYear = now.getFullYear();
    const MonthlySalseChart = [];
    
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0, 23, 59, 59, 999);
      
      const monthTransactions = salesTransactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate >= monthStart && tDate <= monthEnd;
      });
      
      const monthTotal = monthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      
      MonthlySalseChart.push({
        Month: month + 1,
        Days: daysInMonth
      });
    }

    // 6. OrderStausDistrbutionChart - Distribution of order statuses in percentage (4 main types)
    const mainOrderStatuses = ['Pending', 'Confirmed', 'Out for Delivery', 'Cancelled'];
    const orderCounts = await Promise.all(
      mainOrderStatuses.map(status => 
        Order_Now.countDocuments({ OrderStatus: status, Status: true })
      )
    );
    const totalOrders = orderCounts.reduce((sum, count) => sum + count, 0);
    
    const OrderStausDistrbutionChart = mainOrderStatuses.map((status, index) => ({
      Status: status,
      Percentage: totalOrders > 0 ? parseFloat(((orderCounts[index] / totalOrders) * 100).toFixed(2)) : 0
    }));

    // 7. MonthlyRevenue - Revenue by date for current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const monthlyRevenueMap = {};
    salesTransactions.forEach(t => {
      const tDate = new Date(t.transaction_date);
      if (tDate >= currentMonthStart && tDate <= currentMonthEnd) {
        const dateKey = tDate.toISOString().split('T')[0];
        monthlyRevenueMap[dateKey] = (monthlyRevenueMap[dateKey] || 0) + (t.amount || 0);
      }
    });
    
    const MonthlyRevenue = Object.entries(monthlyRevenueMap).map(([Date, Price]) => ({
      Date,
      Price: parseFloat(Price.toFixed(2))
    })).sort((a, b) => new Date(a.Date) - new Date(b.Date));

    // 8. RecentAcitvitysListbyVendorStore
    const recentActivities = await RecentAcitvitys.find({
      Vender_store_id: storeId,
      Status: true
    })
      .sort({ created_at: -1 })
      .limit(10)
      .lean();
    
    const RecentAcitvitysListbyVendorStore = await Promise.all(
      recentActivities.map(async (activity) => {
        const activityObj = activity;
        if (activityObj.created_by) {
          const createdBy = await User.findOne({ user_id: activityObj.created_by })
            .select('user_id firstName lastName phoneNo BusinessName');
          if (createdBy) {
            activityObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
          }
        }
        return activityObj;
      })
    );

    // 9. TotpSellingProductslist - Top selling products (by quantity sold)
    // Since we don't have direct order-product linking, we'll use products sorted by some criteria
    // In production, you'd aggregate from actual order data
    const TotpSellingProductslist = vendorProducts
      .sort((a, b) => (b.inStock || 0) - (a.inStock || 0))
      .slice(0, 10)
      .map(p => ({
        Vendor_Products_id: p.Vendor_Products_id,
        Title: p.Title,
        Products_image: p.Products_image,
        inStock: p.inStock,
        Avaliable: p.Avaliable
      }));

    // 10. MonthlyCampaingPerormace - Campaign performance by weeks
    // Link campaigns through created_by (user_id) since Vendor_Store doesn't have Branch_id
    const currentMonthCampaigns = await Promise.all([
      Marketing_Promotions_EmailCampaign.find({
        created_by: vendorUserId,
        Status: true,
        created_at: { $gte: currentMonthStart, $lte: currentMonthEnd }
      }).lean(),
      Marketing_Promotions_SMSCampaign.find({
        created_by: vendorUserId,
        Status: true,
        created_at: { $gte: currentMonthStart, $lte: currentMonthEnd }
      }).lean()
    ]);

    const allCampaigns = [...currentMonthCampaigns[0], ...currentMonthCampaigns[1]];
    const weeks = [];
    for (let week = 1; week <= 4; week++) {
      const weekStart = new Date(now.getFullYear(), now.getMonth(), (week - 1) * 7 + 1);
      const weekEnd = new Date(now.getFullYear(), now.getMonth(), week * 7, 23, 59, 59, 999);
      
      const weekCampaigns = allCampaigns.filter(c => {
        const cDate = new Date(c.created_at);
        return cDate >= weekStart && cDate <= weekEnd;
      });
      
      // Assuming each campaign has a price/cost (you may need to adjust based on actual model)
      const weekPrice = weekCampaigns.length * 100; // Placeholder - adjust based on actual campaign pricing
      
      weeks.push({
        week,
        Price: parseFloat(weekPrice.toFixed(2))
      });
    }

    const MonthlyCampaingPerormace = { weeks };

    // 11. CampaignDistribution - Distribution by campaign type
    const emailCampaigns = await Marketing_Promotions_EmailCampaign.countDocuments({
      created_by: vendorUserId,
      Status: true
    });
    
    const smsCampaigns = await Marketing_Promotions_SMSCampaign.countDocuments({
      created_by: vendorUserId,
      Status: true
    });
    
    // For banner campaigns, we'll use CampaignAllneedaPost linked through created_by
    const bannerCampaigns = await CampaignAllneedaPost.countDocuments({
      created_by: vendorUserId,
      Status: true
    });

    const campaignPrice = 100; // Placeholder price per campaign

    const CampaignDistribution = [
      {
        Type: 'Banner Adds',
        Price: parseFloat((bannerCampaigns * campaignPrice).toFixed(2)),
        Count: bannerCampaigns
      },
      {
        Type: 'Email Marketing',
        Price: parseFloat((emailCampaigns * campaignPrice).toFixed(2)),
        Count: emailCampaigns
      },
      {
        Type: 'Text Marketing',
        Price: parseFloat((smsCampaigns * campaignPrice).toFixed(2)),
        Count: smsCampaigns
      }
    ];

    const dashboardData = {
      TotalSales: parseFloat(TotalSales.toFixed(2)),
      ListedProducts,
      PendingOrders,
      Peviews_Qualification,
      MonthlySalseChart,
      OrderStausDistrbutionChart,
      MonthlyRevenue,
      RecentAcitvitysListbyVendorStore,
      TotpSellingProductslist,
      MonthlyCampaingPerormace,
      CampaignDistribution
    };

    sendSuccess(res, dashboardData, 'Vendor dashboard data retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor dashboard', { error: error.message, stack: error.stack });
    throw error;
  }
});

module.exports = {
  createVendorStore,
  getAllVendorStores,
  getVendorStoreById,
  updateVendorStore,
  deleteVendorStore,
  getVendorStoresByAuth,
  getVendorDashboard
};

