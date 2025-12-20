const Transaction = require('../models/transaction.model');
const Restaurant_Items = require('../models/Restaurant_Items.model');
const Business_Branch = require('../models/business_Branch.model');
const Customer = require('../models/Customer.model');
const Order_Now = require('../models/Order_Now.model');
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

const getAnalyticsOperationsReports = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.query;

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

    // Calculate sales count (completed transactions)
    const salesCount = await Transaction.countDocuments({
      business_Branch_id: branchId,
      Status: true,
      status: 'completed',
      transactionType: { $in: ['deposit', 'Recharge'] }
    });

    // Calculate orders count (all transactions that represent orders)
    // Note: Adjust transactionType based on your business logic
    const OrdersCount = await Transaction.countDocuments({
      business_Branch_id: branchId,
      Status: true,
      transactionType: { $in: ['deposit', 'Recharge'] }
    });

    // Calculate total earnings (sum of completed transaction amounts)
    const earningsResult = await Transaction.aggregate([
      {
        $match: {
          business_Branch_id: branchId,
          Status: true,
          status: 'completed',
          transactionType: { $in: ['deposit', 'Recharge'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const EarningCount = earningsResult[0]?.total || 0;

    // Calculate returns/canceled (failed or refunded transactions)
    const Returns_Canceled = await Transaction.countDocuments({
      business_Branch_id: branchId,
      Status: true,
      $or: [
        { status: 'failed' },
        { transactionType: 'refund' }
      ]
    });

    // Calculate fulfillment rate (completed / total orders)
    const totalOrders = await Transaction.countDocuments({
      business_Branch_id: branchId,
      Status: true,
      transactionType: { $in: ['deposit', 'Recharge'] }
    });
    const fulfilledOrders = await Transaction.countDocuments({
      business_Branch_id: branchId,
      Status: true,
      status: 'completed',
      transactionType: { $in: ['deposit', 'Recharge'] }
    });
    const FulfillmentRate = totalOrders > 0 ? ((fulfilledOrders / totalOrders) * 100).toFixed(2) : 0;

    // Calculate items/products count
    const Items_Products = await Restaurant_Items.countDocuments({
      business_Branch_id: branchId,
      Status: true
    });

    // Chart 1: CustomerCount - Daily customer count by month
    const customerCountData = await Customer.aggregate([
      {
        $match: {
          Branch_id: branchId,
          Status: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' },
            day: { $dayOfMonth: '$created_at' }
          },
          DayCustomerCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          DayCustomerCount: 1,
          Months: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] },
              '-',
              { $cond: [{ $lt: ['$_id.day', 10] }, { $concat: ['0', { $toString: '$_id.day' }] }, { $toString: '$_id.day' }] }
            ]
          }
        }
      },
      {
        $sort: { Months: 1 }
      }
    ]);

    // Chart 2: MonthlyEarning - Earnings by month
    const currentDate = new Date();
    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      last12Months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        monthName: date.toLocaleString('default', { month: 'short', year: 'numeric' })
      });
    }

    const monthlyEarnings = await Transaction.aggregate([
      {
        $match: {
          business_Branch_id: branchId,
          Status: true,
          status: 'completed',
          transactionType: { $in: ['deposit', 'Recharge'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$transaction_date' },
            month: { $month: '$transaction_date' }
          },
          Earnings: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          Earnings: 1,
          Months: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] }
            ]
          }
        }
      }
    ]);

    // Fill in missing months with 0 earnings
    const monthlyEarningsMap = new Map(monthlyEarnings.map(item => [item.Months, item.Earnings]));
    const completeMonthlyEarnings = last12Months.map(({ year, month, monthName }) => ({
      Earnings: monthlyEarningsMap.get(`${year}-${month.toString().padStart(2, '0')}`) || 0,
      Months: monthName
    }));

    // Chart 3: OrderByBranch - Orders by branch
    const allBranches = await Business_Branch.find({ Status: true }).select('business_Branch_id name');
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const orderByBranchData = await Promise.all(
      allBranches.map(async (branch) => {
        const currentMonthOrders = await Transaction.countDocuments({
          business_Branch_id: branch.business_Branch_id,
          Status: true,
          transactionType: { $in: ['deposit', 'Recharge'] },
          transaction_date: { $gte: currentMonth }
        });

        const lastMonthOrders = await Transaction.countDocuments({
          business_Branch_id: branch.business_Branch_id,
          Status: true,
          transactionType: { $in: ['deposit', 'Recharge'] },
          transaction_date: { $gte: lastMonth, $lt: currentMonth }
        });

        const totalOrders = await Transaction.countDocuments({
          business_Branch_id: branch.business_Branch_id,
          Status: true,
          transactionType: { $in: ['deposit', 'Recharge'] }
        });

        const lastMonthGrowth = lastMonthOrders > 0 
          ? (((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(2)
          : (currentMonthOrders > 0 ? 100 : 0);

        return {
          Branch: branch.name || `Branch ${branch.business_Branch_id}`,
          CountOrder: totalOrders,
          LastmonthGrowth: parseFloat(lastMonthGrowth)
        };
      })
    );

    // Chart 4: EarningsByProduct - Earnings by product
    const products = await Restaurant_Items.find({
      business_Branch_id: branchId,
      Status: true
    }).select('Restaurant_Items_id name').limit(50); // Limit to top 50 products for performance

    const earningsByProductData = await Promise.all(
      products.map(async (product) => {
        // Get orders containing this product and calculate earnings from product prices
        const ordersWithProduct = await Order_Now.find({
          'Product.Item_id': product.Restaurant_Items_id,
          OrderStatus: { $ne: 'canceled' }
        }).select('Product Trangection_Id created_at');

        // Calculate earnings from product prices in orders
        let currentMonthEarnings = 0;
        let lastMonthEarnings = 0;
        let totalEarnings = 0;

        ordersWithProduct.forEach(order => {
          const productInOrder = order.Product.find(p => p.Item_id === product.Restaurant_Items_id);
          if (productInOrder) {
            const productEarning = (productInOrder.Price - (productInOrder.DiscountPrice || 0)) * productInOrder.Quantity;
            totalEarnings += productEarning;

            if (order.created_at >= currentMonth) {
              currentMonthEarnings += productEarning;
            } else if (order.created_at >= lastMonth && order.created_at < currentMonth) {
              lastMonthEarnings += productEarning;
            }
          }
        });

        const lastMonthGrowth = lastMonthEarnings > 0
          ? (((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100).toFixed(2)
          : (currentMonthEarnings > 0 ? 100 : 0);

        return {
          Product: product.name || `Product ${product.Restaurant_Items_id}`,
          Earnings: totalEarnings,
          LastmonthGrowth: parseFloat(lastMonthGrowth)
        };
      })
    );

    // Sort by earnings descending
    earningsByProductData.sort((a, b) => b.Earnings - a.Earnings);

    // Calculate total earnings and last month growth for OrderByBranch
    const totalOrderCount = orderByBranchData.reduce((sum, item) => sum + item.CountOrder, 0);
    const currentMonthTotalOrders = orderByBranchData.reduce((sum, item) => {
      return sum + (item.CountOrder || 0);
    }, 0);

    // Calculate total earnings and last month growth for EarningsByProduct
    const totalEarnings = earningsByProductData.reduce((sum, item) => sum + item.Earnings, 0);
    const currentMonthTotalEarnings = earningsByProductData.reduce((sum, item) => {
      const currentEarnings = item.Earnings || 0;
      return sum + currentEarnings;
    }, 0);

    const analyticsData = {
      salesCount,
      OrdersCount,
      EarningCount,
      Returns_Canceled,
      FulfillmentRate: parseFloat(FulfillmentRate),
      Items_Products,
      charts: [
        {
          Name: 'CustomerCount',
          data: customerCountData
        },
        {
          Name: 'MonthlyEarning',
          data: completeMonthlyEarnings
        },
        {
          Name: 'OrderByBranch',
          TotalOrder: totalOrderCount,
          LastmonthGrowth: orderByBranchData.length > 0 
            ? parseFloat((orderByBranchData.reduce((sum, item) => sum + item.LastmonthGrowth, 0) / orderByBranchData.length).toFixed(2))
            : 0,
          data: orderByBranchData
        },
        {
          Name: 'EarningsByProduct',
          Totalearning: totalEarnings,
          LastmonthGrowth: earningsByProductData.length > 0
            ? parseFloat((earningsByProductData.reduce((sum, item) => sum + item.LastmonthGrowth, 0) / earningsByProductData.length).toFixed(2))
            : 0,
          data: earningsByProductData
        }
      ]
    };

    sendSuccess(res, analyticsData, 'Analytics operations reports retrieved successfully');
  } catch (error) {
    console.error('Error retrieving analytics operations reports', { error: error.message });
    throw error;
  }
});

module.exports = {
  getAnalyticsOperationsReports
};

