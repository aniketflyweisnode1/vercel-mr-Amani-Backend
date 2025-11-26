const Transaction = require('../models/transaction.model');
const Restaurant_Items = require('../models/Restaurant_Items.model');
const Business_Branch = require('../models/business_Branch.model');
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

    const analyticsData = {
      salesCount,
      OrdersCount,
      EarningCount,
      Returns_Canceled,
      FulfillmentRate: parseFloat(FulfillmentRate),
      Items_Products
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

