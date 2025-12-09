const Business_Branch = require('../models/business_Branch.model');
const Transaction = require('../models/transaction.model');
const Order_Now = require('../models/Order_Now.model');
const Delivery = require('../models/Delivery.model');
const Restaurant_Items = require('../models/Restaurant_Items.model');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureBusinessBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined || business_Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id, Status: true });
  return !!branch;
};

const getReportListRestaurant = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.query;

    if (!business_Branch_id) {
      return sendError(res, 'Business branch ID is required', 400);
    }

    const branchId = parseInt(business_Branch_id, 10);
    if (Number.isNaN(branchId)) {
      return sendError(res, 'Invalid business branch ID format', 400);
    }

    const branchExists = await ensureBusinessBranchExists(branchId);
    if (!branchExists) {
      return sendError(res, 'Business branch not found or inactive', 404);
    }

    // Get branch details
    const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true })
      .select('business_Branch_id BusinessName Address Status');

    if (!branch) {
      return sendError(res, 'Business branch not found', 404);
    }

    // Get all restaurant items with branch mapping for order counting
    const restaurantItems = await Restaurant_Items.find({ Status: true })
      .select('Restaurant_Items_id business_Branch_id')
      .lean();

    // Create a map of item_id to branch_id for quick lookup
    const itemToBranchMap = {};
    restaurantItems.forEach(item => {
      itemToBranchMap[item.Restaurant_Items_id] = item.business_Branch_id;
    });

    // Get all orders
    const allOrders = await Order_Now.find({ Status: true })
      .select('Order_Now_id Product OrderStatus')
      .lean();

    // Filter orders for this branch
    const branchOrders = allOrders.filter(order => {
      return order.Product && order.Product.some(product => {
        const itemId = product.Item_id;
        return itemToBranchMap[itemId] === branchId;
      });
    });

    // Calculate TotalOrders
    const TotalOrders = branchOrders.length;

    // Calculate TotalSales - sum of completed transactions for this branch
    const salesResult = await Transaction.aggregate([
      {
        $match: {
          business_Branch_id: branchId,
          Status: true,
          status: 'completed',
          transactionType: { $in: ['Order_Now_Payment', 'deposit', 'Recharge'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const TotalSales = salesResult[0]?.total || 0;

    // Calculate Average - average order value
    const Average = TotalOrders > 0 ? (TotalSales / TotalOrders).toFixed(2) : 0;

    // Calculate TotalTax - sum of GST from transactions
    const taxResult = await Transaction.aggregate([
      {
        $match: {
          business_Branch_id: branchId,
          Status: true,
          status: 'completed',
          transactionType: { $in: ['Order_Now_Payment', 'deposit', 'Recharge'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$TotalGST' }
        }
      }
    ]);
    const TotalTax = taxResult[0]?.total || 0;

    // Calculate TotalDelivery - count of deliveries for orders from this branch
    const branchOrderIds = branchOrders.map(order => order.Order_Now_id);
    const TotalDelivery = await Delivery.countDocuments({
      order_id: { $in: branchOrderIds },
      Status: true
    });

    // Calculate TotalDriver - count of distinct delivery persons
    const driverResult = await Delivery.aggregate([
      {
        $match: {
          order_id: { $in: branchOrderIds },
          Status: true,
          DliveryPersonName: { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$DliveryPersonName'
        }
      },
      {
        $count: 'count'
      }
    ]);
    const TotalDriver = driverResult[0]?.count || 0;

    const reportData = {
      TotalSales: parseFloat(TotalSales.toFixed(2)),
      TotalOrders,
      Average: parseFloat(Average),
      TotalTax: parseFloat(TotalTax.toFixed(2)),
      TotalDelivery,
      TotalDriver,
      BusinessStatus: branch.Status,
      Address: branch.Address || ''
    };

    console.info('Restaurant report list retrieved successfully', { business_Branch_id: branchId });
    sendSuccess(res, reportData, 'Restaurant report list retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant report list', { 
      error: error.message, 
      stack: error.stack,
      business_Branch_id: req.query.business_Branch_id 
    });
    throw error;
  }
});

module.exports = {
  getReportListRestaurant
};
