const OrderNow = require('../models/Order_Now.model');
const RestaurantItems = require('../models/Restaurant_Items.model');
const Discounts = require('../models/Discounts.model');
const PaymentMethods = require('../models/payment_method.model');
const UserAddress = require('../models/User_Address.model');
const Transaction = require('../models/transaction.model');
const User = require('../models/User.model');
const BusinessBranch = require('../models/business_Branch.model');
const RestaurantItemCategory = require('../models/Restaurant_item_Category.model');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs (same as Order_Now controller)
const populateOrderNowData = async (orders) => {
  const ordersArray = Array.isArray(orders) ? orders : [orders];
  const populatedOrders = await Promise.all(
    ordersArray.map(async (order) => {
      const orderObj = order.toObject ? order.toObject() : order;
      
      // Populate Product array items
      if (orderObj.Product && orderObj.Product.length > 0) {
        orderObj.Product = await Promise.all(
          orderObj.Product.map(async (product) => {
            if (product.Item_id) {
              const item = await RestaurantItems.findOne({ Restaurant_Items_id: product.Item_id });
              if (item) {
                const itemObj = item.toObject ? item.toObject() : item;
                
                // Populate business_Branch_id
                if (item.business_Branch_id) {
                  const branch = await BusinessBranch.findOne({ business_Branch_id: item.business_Branch_id });
                  if (branch) {
                    itemObj.business_Branch_id = branch.toObject ? branch.toObject() : branch;
                  }
                }
                
                // Populate Restaurant_item_Category_id
                if (item.Restaurant_item_Category_id) {
                  const category = await RestaurantItemCategory.findOne({ Restaurant_item_Category_id: item.Restaurant_item_Category_id });
                  if (category) {
                    itemObj.Restaurant_item_Category_id = category.toObject ? category.toObject() : category;
                  }
                }
                
                return {
                  ...product,
                  ItemDetails: itemObj
                };
              }
            }
            return product;
          })
        );
      }
      
      // Populate applyDiscount_id
      if (orderObj.applyDiscount_id) {
        const discount = await Discounts.findOne({ Discounts_id: orderObj.applyDiscount_id });
        if (discount) {
          orderObj.applyDiscount_id = discount.toObject ? discount.toObject() : discount;
        }
      }
      
      // Populate payment_method_id
      if (orderObj.payment_method_id) {
        const paymentMethod = await PaymentMethods.findOne({ payment_method_id: orderObj.payment_method_id });
        if (paymentMethod) {
          orderObj.payment_method_id = paymentMethod.toObject ? paymentMethod.toObject() : paymentMethod;
        }
      }
      
      // Populate Delivery_address_id
      if (orderObj.Delivery_address_id) {
        const address = await UserAddress.findOne({ User_Address_id: orderObj.Delivery_address_id });
        if (address) {
          orderObj.Delivery_address_id = address.toObject ? address.toObject() : address;
        }
      }
      
      // Populate Trangection_Id
      if (orderObj.Trangection_Id) {
        const transaction = await Transaction.findOne({ transaction_id: orderObj.Trangection_Id });
        if (transaction) {
          orderObj.Trangection_Id = transaction.toObject ? transaction.toObject() : transaction;
        }
      }
      
      // Populate User_Id
      if (orderObj.User_Id) {
        const userId = typeof orderObj.User_Id === 'object' ? orderObj.User_Id : orderObj.User_Id;
        const user = await User.findOne({ user_id: userId });
        if (user) {
          orderObj.User_Id = user.toObject ? user.toObject() : user;
        }
      }
      
      // Populate created_by
      if (orderObj.created_by) {
        const createdById = typeof orderObj.created_by === 'object' ? orderObj.created_by : orderObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById });
        if (createdBy) {
          orderObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (orderObj.updated_by) {
        const updatedById = typeof orderObj.updated_by === 'object' ? orderObj.updated_by : orderObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById });
        if (updatedBy) {
          orderObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return orderObj;
    })
  );
  
  return Array.isArray(orders) ? populatedOrders : populatedOrders[0];
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

const getOngoingOrders = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    // Ongoing orders: Pending, Preparing, Confirmed, Out for Delivery, Placed
    const ongoingStatuses = ['Pending', 'Preparing', 'Confirmed', 'Out for Delivery', 'Placed'];
    
    const filter = {
      Status: true,
      OrderStatus: { $in: ongoingStatuses },
      User_Id: req.userIdNumber || null
    };
    
    // If no userIdNumber, remove User_Id filter (for admin access)
    if (!req.userIdNumber) {
      delete filter.User_Id;
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [orders, total] = await Promise.all([
      OrderNow.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OrderNow.countDocuments(filter)
    ]);
    
    const populatedOrders = await populateOrderNowData(orders);
    sendPaginated(res, populatedOrders, paginateMeta(numericPage, numericLimit, total), 'Ongoing orders retrieved successfully');
  } catch (error) {
    console.error('Error retrieving ongoing orders', { error: error.message });
    throw error;
  }
});

const getCompletedOrders = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    // Completed orders: Orders with Trangection_Id (payment completed) or specific completed status
    // You can adjust this logic based on your business requirements
    const filter = {
      Status: true,
      $or: [
        { Trangection_Id: { $exists: true, $ne: null } }, // Has transaction (payment completed)
        { OrderStatus: { $in: ['Completed', 'Delivered'] } } // Or has completed status
      ],
      User_Id: req.userIdNumber || null
    };
    
    // If no userIdNumber, remove User_Id filter (for admin access)
    if (!req.userIdNumber) {
      delete filter.User_Id;
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [orders, total] = await Promise.all([
      OrderNow.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      OrderNow.countDocuments(filter)
    ]);
    
    const populatedOrders = await populateOrderNowData(orders);
    sendPaginated(res, populatedOrders, paginateMeta(numericPage, numericLimit, total), 'Completed orders retrieved successfully');
  } catch (error) {
    console.error('Error retrieving completed orders', { error: error.message });
    throw error;
  }
});

module.exports = {
  getOngoingOrders,
  getCompletedOrders
};

