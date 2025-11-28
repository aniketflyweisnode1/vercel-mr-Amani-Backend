const RestaurantItems = require('../models/Restaurant_Items.model');
const BusinessBranch = require('../models/business_Branch.model');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const getStoreByItemId = asyncHandler(async (req, res) => {
  try {
    const { Item_id } = req.params;
    
    // Validate Item_id
    const itemId = parseInt(Item_id, 10);
    if (Number.isNaN(itemId) || itemId <= 0) {
      return sendError(res, 'Invalid Restaurant Item ID format', 400);
    }
    
    // Find the restaurant item
    const restaurantItem = await RestaurantItems.findOne({ 
      Restaurant_Items_id: itemId,
      Status: true 
    });
    
    if (!restaurantItem) {
      return sendNotFound(res, 'Restaurant item not found');
    }
    
    // Get the business branch (store) information
    if (!restaurantItem.business_Branch_id) {
      return sendError(res, 'Store information not available for this item', 404);
    }
    
    const store = await BusinessBranch.findOne({ 
      business_Branch_id: restaurantItem.business_Branch_id,
      Status: true 
    });
    
    if (!store) {
      return sendNotFound(res, 'Store not found');
    }
    
    // Convert to object and add item information
    const storeData = store.toObject ? store.toObject() : store;
    storeData.Item_id = restaurantItem.Restaurant_Items_id;
    storeData.ItemDetails = {
      Restaurant_Items_id: restaurantItem.Restaurant_Items_id,
      CurrentStock: restaurantItem.CurrentStock,
      unitPrice: restaurantItem.unitPrice,
      unit: restaurantItem.unit,
      SupplierName: restaurantItem.SupplierName
    };
    
    sendSuccess(res, storeData, 'Store retrieved successfully');
  } catch (error) {
    console.error('Error retrieving store by item ID', { error: error.message, Item_id: req.params.Item_id });
    throw error;
  }
});

module.exports = {
  getStoreByItemId
};

