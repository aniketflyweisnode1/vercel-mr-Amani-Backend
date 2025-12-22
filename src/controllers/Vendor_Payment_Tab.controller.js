const Transaction = require('../models/transaction.model');
const VendorStore = require('../models/Vendor_Store.model');
const VendorProducts = require('../models/Vendor_Products.model');
const VendorProductDispute = require('../models/Vendor_Prdocut_Dispute.model');
const Order_Now = require('../models/Order_Now.model');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper: ensure vendor store exists and return store document
const ensureStoreExists = async (Vender_store_id) => {
  if (!Vender_store_id) return null;
  const storeId = parseInt(Vender_store_id, 10);
  if (Number.isNaN(storeId)) return null;
  const store = await VendorStore.findOne({ Vendor_Store_id: storeId, Status: true });
  return store || null;
};

// Helper: calculate percentage growth
const calculatePercentageGrowth = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Helper: get date range for period
const getDateRange = (period, now = new Date()) => {
  const startOfCurrent = new Date(now);
  const startOfPrevious = new Date(now);
  
  switch (period) {
    case 'Daily':
      startOfCurrent.setHours(0, 0, 0, 0);
      startOfPrevious.setDate(startOfPrevious.getDate() - 1);
      startOfPrevious.setHours(0, 0, 0, 0);
      const endOfPrevious = new Date(startOfPrevious);
      endOfPrevious.setHours(23, 59, 59, 999);
      return { currentStart: startOfCurrent, previousStart: startOfPrevious, previousEnd: endOfPrevious };
    
    case 'Weekly':
      const dayOfWeek = now.getDay();
      startOfCurrent.setDate(now.getDate() - dayOfWeek);
      startOfCurrent.setHours(0, 0, 0, 0);
      startOfPrevious.setDate(now.getDate() - dayOfWeek - 7);
      startOfPrevious.setHours(0, 0, 0, 0);
      const endOfPreviousWeek = new Date(startOfPrevious);
      endOfPreviousWeek.setDate(endOfPreviousWeek.getDate() + 6);
      endOfPreviousWeek.setHours(23, 59, 59, 999);
      return { currentStart: startOfCurrent, previousStart: startOfPrevious, previousEnd: endOfPreviousWeek };
    
    case 'Monthly':
      startOfCurrent.setDate(1);
      startOfCurrent.setHours(0, 0, 0, 0);
      startOfPrevious.setMonth(now.getMonth() - 1);
      startOfPrevious.setDate(1);
      startOfPrevious.setHours(0, 0, 0, 0);
      const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { currentStart: startOfCurrent, previousStart: startOfPrevious, previousEnd: endOfPreviousMonth };
    
    default:
      return { currentStart: startOfCurrent, previousStart: startOfPrevious, previousEnd: now };
  }
};

// Taxes_tab API
const getTaxesTab = asyncHandler(async (req, res) => {
  try {
    const { Vender_store_id } = req.query;
    if (!Vender_store_id) {
      return sendError(res, 'Vendor store ID is required', 400);
    }

    const vendorStore = await ensureStoreExists(Vender_store_id);
    if (!vendorStore) {
      return sendError(res, 'Vendor store not found or inactive', 404);
    }

    const vendorUserId = vendorStore.user_id;
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Get transactions for current and last month
    const [currentMonthTransactions, lastMonthTransactions] = await Promise.all([
      Transaction.find({
        user_id: vendorUserId,
        transactionType: 'Order_Now_Payment',
        status: 'completed',
        transaction_date: { $gte: startOfCurrentMonth }
      }).lean(),
      Transaction.find({
        user_id: vendorUserId,
        transactionType: 'Order_Now_Payment',
        status: 'completed',
        transaction_date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }).lean()
    ]);

    // Calculate Total Tax Collected (CGST + SGST)
    const currentTotalTax = currentMonthTransactions.reduce((sum, t) => sum + (t.TotalGST || 0), 0);
    const lastTotalTax = lastMonthTransactions.reduce((sum, t) => sum + (t.TotalGST || 0), 0);

    // Tax Liability (same as tax collected for now, can be adjusted)
    const currentTaxLiability = currentTotalTax;
    const lastTaxLiability = lastTotalTax;

    // Tax Rates (aggregate by sales tax count and percentage)
    const taxRates = {
      SalesTaxCount: currentTotalTax,
      Parsanteg: calculatePercentageGrowth(currentTotalTax, lastTotalTax)
    };

    sendSuccess(res, {
      TotalTaxCollected: {
        count: currentTotalTax,
        percentageGrowth: calculatePercentageGrowth(currentTotalTax, lastTotalTax)
      },
      taxLiability: {
        count: currentTaxLiability,
        percentageGrowth: calculatePercentageGrowth(currentTaxLiability, lastTaxLiability)
      },
      TaxRates: taxRates,
      Reports: [] // Add detailed reports if needed
    }, 'Taxes tab data retrieved successfully');
  } catch (error) {
    console.error('Error retrieving taxes tab', { error: error.message });
    throw error;
  }
});

// inCamp API
const getInCamp = asyncHandler(async (req, res) => {
  try {
    const { Vender_store_id } = req.query;
    if (!Vender_store_id) {
      return sendError(res, 'Vendor store ID is required', 400);
    }

    const vendorStore = await ensureStoreExists(Vender_store_id);
    if (!vendorStore) {
      return sendError(res, 'Vendor store not found or inactive', 404);
    }

    // Placeholder for campaign data - can be extended with actual campaign model
    sendSuccess(res, {
      Incampcount: 0,
      Reports: []
    }, 'Campaign data retrieved successfully');
  } catch (error) {
    console.error('Error retrieving campaign data', { error: error.message });
    throw error;
  }
});

// SalesReports API
const getSalesReports = asyncHandler(async (req, res) => {
  try {
    const { Vender_store_id, period = 'Monthly' } = req.query;
    if (!Vender_store_id) {
      return sendError(res, 'Vendor store ID is required', 400);
    }

    const vendorStore = await ensureStoreExists(Vender_store_id);
    if (!vendorStore) {
      return sendError(res, 'Vendor store not found or inactive', 404);
    }

    const vendorUserId = vendorStore.user_id;
    const now = new Date();
    const { currentStart, previousStart, previousEnd } = getDateRange(period, now);

    // Get transactions for current and previous period
    const [currentTransactions, previousTransactions] = await Promise.all([
      Transaction.find({
        user_id: vendorUserId,
        transactionType: 'Order_Now_Payment',
        status: 'completed',
        transaction_date: { $gte: currentStart }
      }).lean(),
      Transaction.find({
        user_id: vendorUserId,
        transactionType: 'Order_Now_Payment',
        status: 'completed',
        transaction_date: { $gte: previousStart, $lte: previousEnd }
      }).lean()
    ]);

    const currentTotalSales = currentTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const previousTotalSales = previousTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const currentOrdersCount = currentTransactions.length;
    const previousOrdersCount = previousTransactions.length;

    // Generate chart data for the period (last 7/14/30 days based on period)
    const daysCount = period === 'Daily' ? 1 : period === 'Weekly' ? 7 : 30;
    const chart = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTransactions = currentTransactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate >= date && tDate < nextDate;
      });

      const daySales = dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const prevDayDate = new Date(date);
      prevDayDate.setDate(prevDayDate.getDate() - daysCount);
      const prevDayNextDate = new Date(prevDayDate);
      prevDayNextDate.setDate(prevDayNextDate.getDate() + 1);

      const prevDayTransactions = previousTransactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate >= prevDayDate && tDate < prevDayNextDate;
      });

      const prevDaySales = prevDayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      chart.push({
        Days: date.toISOString().split('T')[0],
        Groth: calculatePercentageGrowth(daySales, prevDaySales)
      });
    }

    // Average Order Value
    const AverageOrderValue = currentOrdersCount > 0 ? currentTotalSales / currentOrdersCount : 0;

    // Conversion Rate (placeholder - would need actual visitor data)
    const ConvesionRateinpercentage = 0;

    sendSuccess(res, {
      TotalSalesCount: {
        count: currentTotalSales,
        percentageGorth: calculatePercentageGrowth(currentTotalSales, previousTotalSales)
      },
      OrdersCount: {
        count: currentOrdersCount,
        percentageGorth: calculatePercentageGrowth(currentOrdersCount, previousOrdersCount)
      },
      SalesTrendCount: currentTotalSales,
      chart,
      AverageOrderValue,
      ConvesionRateinpercentage
    }, 'Sales reports retrieved successfully');
  } catch (error) {
    console.error('Error retrieving sales reports', { error: error.message });
    throw error;
  }
});

// Payoutes API
const getPayoutes = asyncHandler(async (req, res) => {
  try {
    const { Vender_store_id, status = 'Panding' } = req.query;
    if (!Vender_store_id) {
      return sendError(res, 'Vendor store ID is required', 400);
    }

    const vendorStore = await ensureStoreExists(Vender_store_id);
    if (!vendorStore) {
      return sendError(res, 'Vendor store not found or inactive', 404);
    }

    const vendorUserId = vendorStore.user_id;

    // Filter transactions based on status
    const filter = {
      user_id: vendorUserId,
      transactionType: 'withdraw'
    };

    if (status === 'Completed') {
      filter.status = 'completed';
    } else {
      filter.status = { $in: ['pending', 'processing'] };
    }

    const transactions = await Transaction.find(filter)
      .sort({ transaction_date: -1 })
      .lean();

    const payouts = transactions.map(t => ({
      payoutDate: t.transaction_date,
      amount: t.amount || 0,
      orderNo: t.reference_number || '',
      orderdetails: t.metadata || ''
    }));

    sendSuccess(res, payouts, 'Payouts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving payouts', { error: error.message });
    throw error;
  }
});

// Commission API
const getCommission = asyncHandler(async (req, res) => {
  try {
    const { Vender_store_id } = req.query;
    if (!Vender_store_id) {
      return sendError(res, 'Vendor store ID is required', 400);
    }

    const vendorStore = await ensureStoreExists(Vender_store_id);
    if (!vendorStore) {
      return sendError(res, 'Vendor store not found or inactive', 404);
    }

    const vendorUserId = vendorStore.user_id;
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Get transactions for current and last month
    const [currentMonthTransactions, lastMonthTransactions, vendorProducts] = await Promise.all([
      Transaction.find({
        user_id: vendorUserId,
        transactionType: 'Order_Now_Payment',
        status: 'completed',
        transaction_date: { $gte: startOfCurrentMonth }
      }).lean(),
      Transaction.find({
        user_id: vendorUserId,
        transactionType: 'Order_Now_Payment',
        status: 'completed',
        transaction_date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }).lean(),
      VendorProducts.find({ user_id: vendorUserId, Status: true }).lean()
    ]);

    // Calculate commission (assuming a percentage of sales, e.g., 5%)
    const commissionRate = 0.05; // 5% commission
    const currentCommission = currentMonthTransactions.reduce((sum, t) => sum + ((t.amount || 0) * commissionRate), 0);
    const lastCommission = lastMonthTransactions.reduce((sum, t) => sum + ((t.amount || 0) * commissionRate), 0);

    // Commission by product
    const productCommissionMap = {};
    currentMonthTransactions.forEach(t => {
      // This is simplified - in reality, you'd need to link transactions to products
      const commission = (t.amount || 0) * commissionRate;
      productCommissionMap['Product'] = (productCommissionMap['Product'] || 0) + commission;
    });

    const Commission = vendorProducts.map(product => ({
      Product: product.Title || 'Unknown Product',
      amount: (productCommissionMap['Product'] || 0) / vendorProducts.length,
      TotalSales: currentMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0) / vendorProducts.length
    }));

    sendSuccess(res, {
      TotalCommissionCount: currentCommission,
      percentageGorth: calculatePercentageGrowth(currentCommission, lastCommission),
      Commission
    }, 'Commission data retrieved successfully');
  } catch (error) {
    console.error('Error retrieving commission data', { error: error.message });
    throw error;
  }
});

// Revenue API
const getRevenue = asyncHandler(async (req, res) => {
  try {
    const { Vender_store_id, view = 'overview' } = req.query;
    if (!Vender_store_id) {
      return sendError(res, 'Vendor store ID is required', 400);
    }

    const vendorStore = await ensureStoreExists(Vender_store_id);
    if (!vendorStore) {
      return sendError(res, 'Vendor store not found or inactive', 404);
    }

    const vendorUserId = vendorStore.user_id;
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const startOfCurrentYear = new Date(now.getFullYear(), 0, 1);

    // Get transactions
    const [currentMonthTransactions, lastMonthTransactions, allYearTransactions] = await Promise.all([
      Transaction.find({
        user_id: vendorUserId,
        transactionType: 'Order_Now_Payment',
        status: 'completed',
        transaction_date: { $gte: startOfCurrentMonth }
      }).lean(),
      Transaction.find({
        user_id: vendorUserId,
        transactionType: 'Order_Now_Payment',
        status: 'completed',
        transaction_date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }).lean(),
      Transaction.find({
        user_id: vendorUserId,
        transactionType: 'Order_Now_Payment',
        status: 'completed',
        transaction_date: { $gte: startOfCurrentYear }
      }).lean()
    ]);

    const currentRevenue = currentMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const lastRevenue = lastMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const currentOrdersCount = currentMonthTransactions.length;
    const lastOrdersCount = lastMonthTransactions.length;

    // Unique customers (simplified - would need actual user tracking)
    const currentCustomers = new Set(currentMonthTransactions.map(t => t.user_id?.toString())).size;
    const lastCustomers = new Set(lastMonthTransactions.map(t => t.user_id?.toString())).size;

    const AvgOrderRsCount = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;

    // Revenue trend chart (monthly for last 12 months)
    const chart = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const monthTransactions = allYearTransactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const monthRevenue = monthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const prevMonthStart = new Date(monthStart);
      prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
      const prevMonthEnd = new Date(prevMonthStart);
      prevMonthEnd.setMonth(prevMonthEnd.getMonth() + 1);
      prevMonthEnd.setDate(0);

      const prevMonthTransactions = allYearTransactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate >= prevMonthStart && tDate <= prevMonthEnd;
      });

      const prevMonthRevenue = prevMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      chart.push({
        day: monthStart.getDate(),
        month: monthStart.toLocaleString('default', { month: 'short' })
      });
    }

    // Revenue by category (simplified - would need product category mapping)
    const RevenueByCategory = {
      ElectronicspercentageCount: 0,
      ClothingpercentageCount: 0,
      HomeGardenpercentageCount: 0,
      SportspercentageCount: 0,
      OtherpercentageCount: 100
    };

    sendSuccess(res, {
      TotalRevenuecount: {
        count: currentRevenue,
        percentageGorth: calculatePercentageGrowth(currentRevenue, lastRevenue)
      },
      ordercount: {
        count: currentOrdersCount,
        percentageGorth: calculatePercentageGrowth(currentOrdersCount, lastOrdersCount)
      },
      customersCount: {
        count: currentCustomers,
        percentageGorth: calculatePercentageGrowth(currentCustomers, lastCustomers)
      },
      AvgOrderRsCount: {
        count: AvgOrderRsCount,
        percentageGorth: calculatePercentageGrowth(AvgOrderRsCount, lastOrdersCount > 0 ? lastRevenue / lastOrdersCount : 0)
      },
      chart: {
        RevenueTrendCountRs: currentRevenue,
        percentageGorth: calculatePercentageGrowth(currentRevenue, lastRevenue),
        data: chart
      },
      RevenueByCategory
    }, 'Revenue data retrieved successfully');
  } catch (error) {
    console.error('Error retrieving revenue data', { error: error.message });
    throw error;
  }
});

// RefundsDisputes API
const getRefundsDisputes = asyncHandler(async (req, res) => {
  try {
    const { Vender_store_id } = req.query;
    if (!Vender_store_id) {
      return sendError(res, 'Vendor store ID is required', 400);
    }

    const vendorStore = await ensureStoreExists(Vender_store_id);
    if (!vendorStore) {
      return sendError(res, 'Vendor store not found or inactive', 404);
    }

    const vendorUserId = vendorStore.user_id;
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Get refund transactions and disputes
    const [currentMonthRefunds, lastMonthRefunds, disputes] = await Promise.all([
      Transaction.find({
        user_id: vendorUserId,
        transactionType: 'refund',
        transaction_date: { $gte: startOfCurrentMonth }
      }).lean(),
      Transaction.find({
        user_id: vendorUserId,
        transactionType: 'refund',
        transaction_date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }).lean(),
      VendorProductDispute.find({ created_by: vendorUserId, Status: true }).lean()
    ]);

    const currentRefundsCount = currentMonthRefunds.length;
    const lastRefundsCount = lastMonthRefunds.length;

    const PastRefunds = currentMonthRefunds.map(r => ({
      ProductDetails: r.metadata || 'N/A',
      Refundedamount: r.amount || 0,
      Status: r.status || 'completed'
    }));

    const OngoinDisputes = disputes
      .filter(d => d.Status === true)
      .map(d => ({
        ProductDetails: d.Description || 'N/A',
        Refundedamount: 0, // Would need to link to actual refund amount
        Status: d.Status ? 'active' : 'resolved'
      }));

    sendSuccess(res, {
      TotalCommissionCount: currentRefundsCount,
      percentageGorth: calculatePercentageGrowth(currentRefundsCount, lastRefundsCount),
      PastRefunds,
      OngoinDisputes
    }, 'Refunds and disputes data retrieved successfully');
  } catch (error) {
    console.error('Error retrieving refunds and disputes', { error: error.message });
    throw error;
  }
});

module.exports = {
  getTaxesTab,
  getInCamp,
  getSalesReports,
  getPayoutes,
  getCommission,
  getRevenue,
  getRefundsDisputes
};

