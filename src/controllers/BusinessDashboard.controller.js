const Transaction = require('../models/transaction.model');
const Restaurant_Items = require('../models/Restaurant_Items.model');
const Business_Branch = require('../models/business_Branch.model');
const Order_Now = require('../models/Order_Now.model');
const Restaurant_Items_Reviews = require('../models/Restaurant_Items_Reviews.model');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined) {
    return false;
  }
  const branchId = parseInt(business_Branch_id, 10);
  if (Number.isNaN(branchId)) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return Boolean(branch);
};

// Helper function to get date range based on filter
const getDateRange = (filter) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case 'Today':
      return { start: today, end: now };
    case 'Yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: today };
    case 'LastSevenDay':
      const lastSevenDays = new Date(today);
      lastSevenDays.setDate(lastSevenDays.getDate() - 7);
      return { start: lastSevenDays, end: now };
    case 'LastMonthDays':
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return { start: lastMonth, end: now };
    default:
      return { start: null, end: null };
  }
};

// Helper function to get sales chart data
const getSalesChartData = async (branchId, filter) => {
  const { start, end } = getDateRange(filter);
  const matchQuery = {
    business_Branch_id: branchId,
    Status: true,
    status: 'completed'
  };
  
  if (start && end) {
    matchQuery.transaction_date = { $gte: start, $lte: end };
  }

  const salesData = await Transaction.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$transaction_date' } },
        OrderCount: { $sum: 1 },
        Costcount: { $sum: '$amount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const GrossSalesCostCount = salesData.reduce((sum, item) => sum + item.Costcount, 0);

  return {
    GrossSalesCostCount,
    Chart: salesData.map(item => ({
      OrderCount: item.OrderCount,
      Costcount: item.Costcount
    }))
  };
};

// Helper function to get product mix chart data
const getProductMixChartData = async (branchId, filter) => {
  const { start, end } = getDateRange(filter);
  
  // Get transactions for this branch to find related orders
  const transactionMatch = {
    business_Branch_id: branchId,
    Status: true
  };
  if (start && end) {
    transactionMatch.transaction_date = { $gte: start, $lte: end };
  }
  
  const transactions = await Transaction.find(transactionMatch).select('transaction_id');
  const transactionIds = transactions.map(t => t.transaction_id);
  
  // Get orders linked to these transactions
  const orderMatch = {
    Trangection_Id: { $in: transactionIds },
    Status: true,
    OrderStatus: { $in: ['Confirmed', 'Out for Delivery', 'Placed'] }
  };
  if (start && end) {
    orderMatch.created_at = { $gte: start, $lte: end };
  }

  const orders = await Order_Now.find(orderMatch).select('Product');

  const productMap = new Map();
  let Total_OrdersCount = 0;
  let TotalPriceCollected = 0;

  orders.forEach(order => {
    Total_OrdersCount++;
    order.Product.forEach(product => {
      const itemId = product.Item_id;
      const itemPrice = (product.Price - (product.DiscountPrice || 0)) * product.Quantity;
      TotalPriceCollected += itemPrice;

      if (productMap.has(itemId)) {
        const existing = productMap.get(itemId);
        existing.totalQuantity += product.Quantity;
        existing.totalPrice += itemPrice;
      } else {
        productMap.set(itemId, {
          Item_id: itemId,
          totalQuantity: product.Quantity,
          totalPrice: itemPrice
        });
      }
    });
  });

  // Get product details
  const productIds = Array.from(productMap.keys());
  const products = await Restaurant_Items.find({
    Restaurant_Items_id: { $in: productIds },
    Status: true
  }).select('Restaurant_Items_id name Description Price');

  const Product = products.map(product => {
    const stats = productMap.get(product.Restaurant_Items_id);
    return {
      ProductDetails: {
        Restaurant_Items_id: product.Restaurant_Items_id,
        name: product.name,
        Description: product.Description,
        Price: product.Price,
        totalQuantity: stats.totalQuantity,
        totalPrice: stats.totalPrice
      }
    };
  });

  return {
    Product,
    Total_OrdersCount,
    TotalPriceCollected
  };
};

// Helper function to get operations chart data
const getOperationsChartData = async (branchId, filter) => {
  const { start, end } = getDateRange(filter);
  
  // Get transactions for this branch to find related orders
  const transactionMatch = {
    business_Branch_id: branchId,
    Status: true
  };
  if (start && end) {
    transactionMatch.transaction_date = { $gte: start, $lte: end };
  }
  
  const transactions = await Transaction.find(transactionMatch).select('transaction_id');
  const transactionIds = transactions.map(t => t.transaction_id);
  
  // Get orders linked to these transactions
  const orderMatch = {
    Trangection_Id: { $in: transactionIds },
    Status: true
  };
  if (start && end) {
    orderMatch.created_at = { $gte: start, $lte: end };
  }

  const orders = await Order_Now.find(orderMatch);
  const totalOrders = orders.length;
  
  // Avoidable cancellations (cancelled orders that could have been prevented)
  const cancelledOrders = orders.filter(o => o.OrderStatus === 'Cancelled').length;
  const AvoidableCancellationsRate = totalOrders > 0 
    ? ((cancelledOrders / totalOrders) * 100).toFixed(2) 
    : 0;

  // Average wait time (simplified - would need actual wait time data)
  // Assuming average wait time based on order status transitions
  const confirmedOrders = orders.filter(o => 
    ['Confirmed', 'Out for Delivery', 'Placed'].includes(o.OrderStatus)
  ).length;
  const AvoidableWaitMins = confirmedOrders > 0 ? Math.round((totalOrders / confirmedOrders) * 15) : 0;

  // Downtime % (orders that couldn't be fulfilled due to issues)
  const unDeliveredOrders = orders.filter(o => o.OrderStatus === 'Un-Delivered').length;
  const Downtime = totalOrders > 0 
    ? ((unDeliveredOrders / totalOrders) * 100).toFixed(2) 
    : 0;

  // Ratings % (average rating from reviews)
  const reviews = await Restaurant_Items_Reviews.find({
    business_Branch_id: branchId,
    Status: true
  }).select('Reating');
  
  const totalRatings = reviews.length;
  const avgRating = totalRatings > 0
    ? (reviews.reduce((sum, r) => sum + (r.Reating || 0), 0) / totalRatings).toFixed(2)
    : 0;
  const Ratings = totalRatings > 0 ? ((avgRating / 5) * 100).toFixed(2) : 0;

  return {
    AvoidableCancellationsRate: parseFloat(AvoidableCancellationsRate),
    AvoidableWaitMins,
    Downtime: parseFloat(Downtime),
    Ratings: parseFloat(Ratings)
  };
};

// Helper function to calculate optimization score
const calculateOptimizationScore = (operationsData) => {
  const cancellationScore = Math.max(0, 100 - operationsData.AvoidableCancellationsRate);
  const waitTimeScore = Math.max(0, 100 - (operationsData.AvoidableWaitMins / 2));
  const downtimeScore = Math.max(0, 100 - operationsData.Downtime);
  const ratingScore = operationsData.Ratings;

  const totalScore = (cancellationScore + waitTimeScore + downtimeScore + ratingScore) / 4;
  
  let description = '';
  if (totalScore >= 80) {
    description = 'Excellent performance! Your branch is operating at optimal levels.';
  } else if (totalScore >= 60) {
    description = 'Good performance with room for improvement in some areas.';
  } else if (totalScore >= 40) {
    description = 'Moderate performance. Consider focusing on key operational areas.';
  } else {
    description = 'Needs improvement. Review operational processes and customer service.';
  }

  return {
    percentage: parseFloat(totalScore.toFixed(2)),
    Description: description
  };
};

// Helper function to get sales report data
const getSalesReportData = async (branchId, date, filter) => {
  let start, end;
  const filterDate = date ? new Date(date) : new Date();
  
  switch (filter) {
    case 'day':
      start = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
      end = new Date(start);
      end.setDate(end.getDate() + 1);
      break;
    case 'week':
      start = new Date(filterDate);
      start.setDate(start.getDate() - 7);
      end = new Date(filterDate);
      break;
    case 'monthly':
      start = new Date(filterDate.getFullYear(), filterDate.getMonth(), 1);
      end = new Date(filterDate.getFullYear(), filterDate.getMonth() + 1, 1);
      break;
    case 'threemonth':
      start = new Date(filterDate);
      start.setMonth(start.getMonth() - 3);
      end = new Date(filterDate);
      break;
    case 'year':
      start = new Date(filterDate.getFullYear(), 0, 1);
      end = new Date(filterDate.getFullYear() + 1, 0, 1);
      break;
    default:
      start = null;
      end = null;
  }

  const matchQuery = {
    business_Branch_id: branchId,
    Status: true
  };

  if (start && end) {
    matchQuery.transaction_date = { $gte: start, $lt: end };
  }

  const transactions = await Transaction.find(matchQuery);
  
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const refundTransactions = transactions.filter(t => t.transactionType === 'refund');
  
  const GrossSalesPriceCount = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const ReturnsPriceCount = refundTransactions.reduce((sum, t) => sum + t.amount, 0);
  const NetSalesPriceCount = GrossSalesPriceCount - ReturnsPriceCount;
  
  // Get discount amount from orders via transactions
  const orderTransactions = await Transaction.find(matchQuery).select('transaction_id');
  const orderTransactionIds = orderTransactions.map(t => t.transaction_id);
  
  const orders = await Order_Now.find({
    Trangection_Id: { $in: orderTransactionIds },
    Status: true,
    created_at: start && end ? { $gte: start, $lt: end } : {}
  });
  
  const Discounts_PriceCount = orders.reduce((sum, order) => {
    return sum + order.Product.reduce((pSum, product) => {
      return pSum + (product.DiscountPrice || 0) * product.Quantity;
    }, 0);
  }, 0);

  const SalesPriceCount = completedTransactions.length;
  const AverageSalesPriceCount = SalesPriceCount > 0 
    ? (GrossSalesPriceCount / SalesPriceCount).toFixed(2) 
    : 0;

  return {
    GrossSalesPriceCount,
    NetSalesPriceCount,
    SalesPriceCount,
    AverageSalesPriceCount: parseFloat(AverageSalesPriceCount),
    ReturnsPriceCount,
    Discounts_PriceCount
  };
};

// Helper function to get monthly sales performance
const getMonthlySalesPerformance = async (branchId, filter) => {
  let start, end;
  const now = new Date();
  
  switch (filter) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now);
      break;
    case 'week':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      end = new Date(now);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
      break;
    case 'alltime':
      start = null;
      end = null;
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
  }

  const matchQuery = {
    business_Branch_id: branchId,
    Status: true,
    status: 'completed'
  };

  if (start && end) {
    matchQuery.transaction_date = { $gte: start, $lte: end };
  }

  const monthlyData = await Transaction.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$transaction_date' } },
        countPrice: { $sum: '$amount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const CountPrice = monthlyData.reduce((sum, item) => sum + item.countPrice, 0);

  return {
    CountPrice,
    chart: monthlyData.map(item => ({
      month: item._id,
      countPrice: item.countPrice
    }))
  };
};

// Helper function to get top products
const getTopProducts = async (branchId) => {
  // Get transactions for this branch to find related orders
  const transactions = await Transaction.find({
    business_Branch_id: branchId,
    Status: true
  }).select('transaction_id');
  
  const transactionIds = transactions.map(t => t.transaction_id);
  
  const orders = await Order_Now.find({
    Trangection_Id: { $in: transactionIds },
    Status: true,
    OrderStatus: { $in: ['Confirmed', 'Out for Delivery', 'Placed'] }
  }).select('Product');

  const productMap = new Map();

  orders.forEach(order => {
    order.Product.forEach(product => {
      const itemId = product.Item_id;
      const itemPrice = (product.Price - (product.DiscountPrice || 0)) * product.Quantity;

      if (productMap.has(itemId)) {
        const existing = productMap.get(itemId);
        existing.totalSalePricecount += itemPrice;
        existing.quantity += product.Quantity;
      } else {
        productMap.set(itemId, {
          Item_id: itemId,
          totalSalePricecount: itemPrice,
          quantity: product.Quantity
        });
      }
    });
  });

  const productIds = Array.from(productMap.keys());
  const products = await Restaurant_Items.find({
    Restaurant_Items_id: { $in: productIds },
    Status: true
  }).select('Restaurant_Items_id name Description Price image');

  const topProducts = products.map(product => {
    const stats = productMap.get(product.Restaurant_Items_id);
    return {
      product_details: {
        Restaurant_Items_id: product.Restaurant_Items_id,
        name: product.name,
        Description: product.Description,
        Price: product.Price,
        image: product.image
      },
      totalSalePricecount: stats.totalSalePricecount
    };
  }).sort((a, b) => b.totalSalePricecount - a.totalSalePricecount).slice(0, 10);

  return topProducts;
};

/**
 * Get Business Dashboard
 * @route GET /api/v2/businessDashboard/getDashboard
 */
const getBusinessDashboard = asyncHandler(async (req, res) => {
  try {
    const {
      business_Branch_id,
      saleChartFilter = 'LastSevenDay',
      productMixFilter = 'LastSevenDay',
      operationsFilter = 'LastSevenDay',
      salesReportDate,
      salesReportFilter = 'monthly',
      monthlyPerformanceFilter = 'month'
    } = req.query;

    if (!business_Branch_id) {
      return sendError(res, 'Business branch ID is required', 400);
    }

    const branchId = parseInt(business_Branch_id, 10);
    if (Number.isNaN(branchId)) {
      return sendError(res, 'Invalid business branch ID format', 400);
    }

    if (!(await ensureBranchExists(branchId))) {
      return sendError(res, 'Business branch not found', 404);
    }

    // Calculate branch wallet balance from transactions
    const walletTransactions = await Transaction.aggregate([
      {
        $match: {
          business_Branch_id: branchId,
          Status: true,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalDeposits: {
            $sum: {
              $cond: [
                { $in: ['$transactionType', ['deposit', 'Recharge', 'Order_Now_Payment']] },
                '$amount',
                0
              ]
            }
          },
          totalWithdrawals: {
            $sum: {
              $cond: [
                { $in: ['$transactionType', ['withdraw', 'refund', 'ChargeBack', 'Payout']] },
                '$amount',
                0
              ]
            }
          }
        }
      }
    ]);

    const BranchwalletBalance = walletTransactions.length > 0
      ? (walletTransactions[0].totalDeposits - walletTransactions[0].totalWithdrawals)
      : 0;

    // Get Branch Overview
    const SaleChart = await getSalesChartData(branchId, saleChartFilter);
    const ProductMixChart = await getProductMixChartData(branchId, productMixFilter);
    const OperationsChart = await getOperationsChartData(branchId, operationsFilter);

    const Branch_OverView = {
      SaleChart: {
        filter: saleChartFilter,
        ...SaleChart
      },
      ProductMixChart: {
        filter: productMixFilter,
        ...ProductMixChart
      },
      OperationsChart: {
        filter: operationsFilter,
        ...OperationsChart
      }
    };

    // Calculate Optimization Score
    const YourOptimizationScore = calculateOptimizationScore(OperationsChart);

    // Insights and Actions (simplified - would need more business logic)
    const insightsandActions = {
      All: [
        OperationsChart.AvoidableCancellationsRate > 10 
          ? 'High cancellation rate detected. Review order fulfillment process.'
          : 'Cancellation rate is within acceptable limits.',
        OperationsChart.Downtime > 5
          ? 'Downtime percentage is high. Check delivery and preparation processes.'
          : 'Downtime is well managed.',
        OperationsChart.Ratings < 70
          ? 'Customer ratings need improvement. Focus on service quality.'
          : 'Customer ratings are good.'
      ],
      Growth: [
        ProductMixChart.Total_OrdersCount > 0
          ? `Total orders: ${ProductMixChart.Total_OrdersCount}. Continue marketing efforts.`
          : 'No orders found. Consider promotional campaigns.',
        SaleChart.GrossSalesCostCount > 0
          ? `Gross sales: ${SaleChart.GrossSalesCostCount}. Sales are performing well.`
          : 'Sales need improvement. Review pricing and marketing strategies.'
      ],
      Operations: [
        OperationsChart.AvoidableWaitMins > 30
          ? `Average wait time: ${OperationsChart.AvoidableWaitMins} minutes. Optimize preparation time.`
          : 'Wait times are acceptable.',
        OperationsChart.AvoidableCancellationsRate > 15
          ? 'High cancellation rate. Review order management system.'
          : 'Cancellation rate is manageable.'
      ],
      Announcements: [
        'Regular maintenance scheduled for next week.',
        'New menu items available for promotion.'
      ]
    };

    // Action Required
    const ActionRequired = 
      OperationsChart.AvoidableCancellationsRate > 15 ||
      OperationsChart.Downtime > 10 ||
      OperationsChart.Ratings < 60 ||
      YourOptimizationScore.percentage < 50;

    // Optimization details
    const optimizationDetails = {
      Item_Optimization: {
        Details: ProductMixChart.Product.length < 10
          ? 'Consider adding more items to your menu to increase sales opportunities.'
          : 'Product mix is well diversified.'
      },
      Item_Growth: {
        Details: ProductMixChart.Total_OrdersCount > 0
          ? `Current order count: ${ProductMixChart.Total_OrdersCount}. Focus on repeat customers.`
          : 'No orders yet. Implement marketing campaigns.'
      },
      MissingSales_Optimization: {
        Details: SaleChart.GrossSalesCostCount === 0
          ? 'No sales recorded. Review pricing strategy and marketing efforts.'
          : 'Sales are being tracked properly.'
      },
      MissingSales_Operations: {
        Details: OperationsChart.AvoidableCancellationsRate > 10
          ? 'High cancellation rate affecting sales. Improve order fulfillment process.'
          : 'Operations are running smoothly.'
      },
      Downtime: {
        percentage: OperationsChart.Downtime,
        time: `${OperationsChart.AvoidableWaitMins} minutes average wait time`
      },
      AddMorePhoto_Optimization: {
        Details: 'Add high-quality photos to menu items to increase customer engagement and sales.'
      },
      AddMorePhoto_Operations: {
        Details: 'Ensure all menu items have clear, appetizing photos for better customer experience.'
      },
      AccessPin_Announcements: {
        Details: 'Ensure all staff members have access to the management system with proper PIN authentication.'
      }
    };

    // Sales Report
    const SalesReport = await getSalesReportData(branchId, salesReportDate, salesReportFilter);

    // Total Sales, Orders, Taxes
    const totalSalesTransactions = await Transaction.find({
      business_Branch_id: branchId,
      Status: true,
      status: 'completed'
    });

    const TotalSales = {
      app: totalSalesTransactions.reduce((sum, t) => sum + t.amount, 0),
      Details: `Total sales from ${totalSalesTransactions.length} completed transactions`
    };

    // Get orders via transactions
    const orderTransactions = await Transaction.find({
      business_Branch_id: branchId,
      Status: true
    }).select('transaction_id');
    const orderTransactionIds = orderTransactions.map(t => t.transaction_id);
    
    const totalOrders = await Order_Now.find({
      Trangection_Id: { $in: orderTransactionIds },
      Status: true
    });

    const TotalOrder = {
      app: totalOrders.length,
      Details: `Total orders placed: ${totalOrders.length}`
    };

    const totalTaxes = totalSalesTransactions.reduce((sum, t) => {
      return sum + (t.TotalGST || 0);
    }, 0);

    const TotalTaxes = {
      app: totalTaxes,
      Details: `Total taxes collected: ${totalTaxes}`
    };

    // Monthly Sales Performance
    const MonthlySalesPerformance = await getMonthlySalesPerformance(branchId, monthlyPerformanceFilter);

    // Top Products
    const topProducts = await getTopProducts(branchId);

    const dashboardData = {
      Branch_OverView,
      YourOptimizationScore,
      insightsandActions,
      ActionRequired,
      ...optimizationDetails,
      SalesReport: {
        date: salesReportDate || new Date().toISOString().split('T')[0],
        filter: salesReportFilter,
        ...SalesReport
      },
      TotalSales,
      TotalOrder,
      TotalTaxes,
      MonthlySalesPerformance: {
        filter: monthlyPerformanceFilter,
        ...MonthlySalesPerformance
      },
      topProducts,
      BranchwalletBalance
    };

    sendSuccess(res, dashboardData, 'Business dashboard retrieved successfully');
  } catch (error) {
    console.error('Error retrieving business dashboard', { error: error.message, stack: error.stack });
    throw error;
  }
});

module.exports = {
  getBusinessDashboard
};

