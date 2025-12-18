const Transaction = require('../models/transaction.model');
const VendorStore = require('../models/Vendor_Store.model');
const VendorProducts = require('../models/Vendor_Products.model');
const VendorExpenses = require('../models/Vendor_Expenses.model');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper: ensure vendor store exists and return store document
const ensureStoreExists = async (Vendor_Store_id) => {
  if (Vendor_Store_id === undefined || Vendor_Store_id === null) {
    return null;
  }
  const storeId = parseInt(Vendor_Store_id, 10);
  if (Number.isNaN(storeId)) {
    return null;
  }
  const store = await VendorStore.findOne({ Vendor_Store_id: storeId, Status: true });
  return store || null;
};

// Helper: get season name from month index (0-11)
const getSeasonFromMonth = (monthIndex) => {
  // Define simple seasons based on month index
  // Winter: Dec-Feb (11, 0, 1), Spring: Mar-May (2-4), Summer: Jun-Aug (5-7), Autumn: Sep-Nov (8-10)
  if (monthIndex === 11 || monthIndex === 0 || monthIndex === 1) return 'Winter';
  if (monthIndex >= 2 && monthIndex <= 4) return 'Spring';
  if (monthIndex >= 5 && monthIndex <= 7) return 'Summer';
  return 'Autumn';
};

const getVendorReportandanalytics = asyncHandler(async (req, res) => {
  try {
    const { Vender_store_id } = req.query;

    if (!Vender_store_id) {
      return sendError(res, 'Vendor store ID is required', 400);
    }

    const vendorStore = await ensureStoreExists(Vender_store_id);
    if (!vendorStore) {
      return sendNotFound(res, 'Vendor store not found or inactive');
    }

    const vendorUserId = vendorStore.user_id;
    const now = new Date();

    const startOfCurrentYear = new Date(now.getFullYear(), 0, 1);
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // last 7 days including today

    // Fetch core data in parallel
    const [
      allOrderTransactions,
      refundTransactions,
      vendorProducts,
      vendorExpenses
    ] = await Promise.all([
      // All order-related transactions for this vendor user
      Transaction.find({
        user_id: vendorUserId,
        Status: true,
        transactionType: 'Order_Now_Payment'
      }).lean(),
      // Refunds for this vendor user
      Transaction.find({
        user_id: vendorUserId,
        Status: true,
        transactionType: 'refund'
      }).lean(),
      // Active products for this vendor user
      VendorProducts.find({ user_id: vendorUserId, Status: true }).lean(),
      // Active expenses for this vendor user
      VendorExpenses.find({ user_id: vendorUserId, Status: true }).lean()
    ]);

    const completedOrderTransactions = allOrderTransactions.filter(t => t.status === 'completed');
    const totalOrderTransactions = allOrderTransactions.length;

    // --- Top level counters ---
    const SalescountRs = completedOrderTransactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );

    const OrdersCount = completedOrderTransactions.length;

    const totalExpenses = vendorExpenses.reduce(
      (sum, e) => sum + (e.Amount || 0),
      0
    );

    // Net earning = total sales - total expenses
    const EarningCountRs = SalescountRs - totalExpenses;

    const ReturnsCount = refundTransactions.length;

    const FulfilmentRateCount = totalOrderTransactions > 0
      ? parseFloat(((completedOrderTransactions.length / totalOrderTransactions) * 100).toFixed(2))
      : 0;

    const ProductsCount = vendorProducts.length;

    // --- Charts: Customer Counts (by days & months) ---
    const dailyCustomerCountsMap = {};
    const monthlyCustomerCountsMap = {};

    completedOrderTransactions.forEach((tx) => {
      const txDate = new Date(tx.transaction_date || tx.created_at || tx.updated_at || now);

      // Daily counts (last 7 days)
      if (txDate >= sevenDaysAgo && txDate <= now) {
        const dayKey = txDate.toISOString().split('T')[0];
        dailyCustomerCountsMap[dayKey] = (dailyCustomerCountsMap[dayKey] || 0) + 1;
      }

      // Monthly counts (current year)
      if (txDate >= startOfCurrentYear && txDate <= now) {
        const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyCustomerCountsMap[monthKey] = (monthlyCustomerCountsMap[monthKey] || 0) + 1;
      }
    });

    const CustomerCounts = {
      days: Object.entries(dailyCustomerCountsMap)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([date, count]) => ({ date, count })),
      Month: Object.entries(monthlyCustomerCountsMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, count]) => ({ month, count }))
    };

    // --- Monthly Earning (sales by month for current year) ---
    const monthlyEarningMap = {};
    completedOrderTransactions.forEach((tx) => {
      const txDate = new Date(tx.transaction_date || tx.created_at || tx.updated_at || now);
      if (txDate >= startOfCurrentYear && txDate <= now) {
        const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyEarningMap[monthKey] = (monthlyEarningMap[monthKey] || 0) + (tx.amount || 0);
      }
    });

    const MonthlyEarning = Object.entries(monthlyEarningMap)
      .map(([month, amount]) => ({
        month,
        Rs: parseFloat(amount.toFixed(2))
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // --- Orders By Region ---
    // We don't have per-order region mapping yet, so approximate using store country and total orders.
    const OrdersByRegion = [{
      country: vendorStore.Country || 'Unknown',
      ordercount: OrdersCount
    }];

    // --- Earnings By Product (approximation using product price) ---
    const lastMonthCompletedTx = completedOrderTransactions.filter((tx) => {
      const txDate = new Date(tx.transaction_date || tx.created_at || tx.updated_at || now);
      return txDate >= startOfLastMonth && txDate <= endOfLastMonth;
    });

    const forlastMohthCount = lastMonthCompletedTx.length;

    // Approximate earnings per product using its price (no direct order-product mapping available)
    const bestSellingProductsBase = vendorProducts
      .slice()
      .sort((a, b) => (b.inStock || 0) - (a.inStock || 0))
      .slice(0, 10);

    const EarningsByProduct = {
      forlastMohthCount,
      products: bestSellingProductsBase.map((p) => ({
        Vendor_Products_id: p.Vendor_Products_id,
        Title: p.Title,
        Rs: parseFloat((p.price || 0).toFixed(2))
      }))
    };

    // --- Returns By Reason (placeholder counts) ---
    // We don't have structured return reasons yet, so we expose total last-month returns and zeroed reason buckets.
    const lastMonthRefunds = refundTransactions.filter((tx) => {
      const txDate = new Date(tx.transaction_date || tx.created_at || tx.updated_at || now);
      return txDate >= startOfLastMonth && txDate <= endOfLastMonth;
    });

    const ReturnsByReason = {
      FormLastMonthCount: lastMonthRefunds.length,
      DamagedCount: 0,
      WrongItemCount: 0,
      PoorQualityCount: 0,
      OtherCount: lastMonthRefunds.length // treat all as "Other" for now
    };

    // --- Best Selling Products List (same heuristic as vendor dashboard) ---
    const BestSellingProdcutsList = bestSellingProductsBase.map((p) => ({
      Vendor_Products_id: p.Vendor_Products_id,
      Title: p.Title,
      Products_image: p.Products_image,
      price: p.price || 0,
      inStock: p.inStock || 0,
      Avaliable: p.Avaliable
    }));

    // --- Customer Buying Trends (time-of-day buckets) ---
    const buyingBuckets = {
      tenAMToTwoPM: 0, // 10:00 - 13:59
      twoPMToThreePM: 0, // 14:00 - 14:59
      threePMToEightPM: 0, // 15:00 - 19:59
      eightPMToMidnight: 0 // 20:00 - 23:59
    };

    completedOrderTransactions.forEach((tx) => {
      const txDate = new Date(tx.transaction_date || tx.created_at || tx.updated_at || now);
      const hour = txDate.getHours();

      if (hour >= 10 && hour < 14) {
        buyingBuckets.tenAMToTwoPM += 1;
      } else if (hour >= 14 && hour < 15) {
        buyingBuckets.twoPMToThreePM += 1;
      } else if (hour >= 15 && hour < 20) {
        buyingBuckets.threePMToEightPM += 1;
      } else if (hour >= 20 && hour < 24) {
        buyingBuckets.eightPMToMidnight += 1;
      }
    });

    const totalBuyingCount = Object.values(buyingBuckets).reduce((sum, val) => sum + val, 0);

    const CustomerBuyingRrends = {
      counts: totalBuyingCount,
      '10_AM_2_PM_count': buyingBuckets.tenAMToTwoPM,
      '2_PM_3_PM_count': buyingBuckets.twoPMToThreePM,
      '3_PM_8_PM_count': buyingBuckets.threePMToEightPM,
      '8_PM_12_AM_count': buyingBuckets.eightPMToMidnight
    };

    // --- Profit & Loss (overall + monthly for last 12 months) ---
    const totalProfit = EarningCountRs;

    const monthlyProfitLoss = [];
    for (let i = 11; i >= 0; i -= 1) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

      const monthRevenue = completedOrderTransactions
        .filter((tx) => {
          const txDate = new Date(tx.transaction_date || tx.created_at || tx.updated_at || now);
          return txDate >= monthStart && txDate <= monthEnd;
        })
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);

      const monthExpenses = vendorExpenses
        .filter((e) => {
          const eDate = new Date(e.Date || e.created_at || e.updated_at || now);
          return eDate >= monthStart && eDate <= monthEnd;
        })
        .reduce((sum, e) => sum + (e.Amount || 0), 0);

      const diff = monthRevenue - monthExpenses;
      monthlyProfitLoss.push({
        month: monthKey,
        Profitcount: diff > 0 ? parseFloat(diff.toFixed(2)) : 0,
        Losscount: diff < 0 ? parseFloat(Math.abs(diff).toFixed(2)) : 0
      });
    }

    const Profit_Lost = {
      Rs: parseFloat(totalProfit.toFixed(2)),
      month: monthlyProfitLoss
    };

    // --- Seasonal Demand (group revenue by season for current year) ---
    const seasonalDemandMap = {};
    completedOrderTransactions.forEach((tx) => {
      const txDate = new Date(tx.transaction_date || tx.created_at || tx.updated_at || now);
      if (txDate >= startOfCurrentYear && txDate <= now) {
        const season = getSeasonFromMonth(txDate.getMonth());
        seasonalDemandMap[season] = (seasonalDemandMap[season] || 0) + 1;
      }
    });

    const SeasonalDemand = Object.entries(seasonalDemandMap).map(([season, count]) => ({
      label: season,
      count
    }));

    const responseData = {
      SalescountRs: parseFloat(SalescountRs.toFixed(2)),
      OrdersCount,
      EarningCountRs: parseFloat(EarningCountRs.toFixed(2)),
      ReturnsCount,
      FulfilmentRateCount,
      ProductsCount,
      Charts: {
        CustomerCounts,
        MonthlyEarning,
        OrdersByRegion,
        EarningsByProduct,
        ReturnsByReason,
        BastSellingProdcutsList: BestSellingProdcutsList,
        CustomerBuyingRrends,
        Profit_Lost,
        SeasonalDemand
      }
    };

    sendSuccess(res, responseData, 'Vendor report and analytics data retrieved successfully');
  } catch (error) {
    console.error('Error retrieving vendor report and analytics data', { error: error.message, stack: error.stack });
    throw error;
  }
});

module.exports = {
  getVendorReportandanalytics
};


