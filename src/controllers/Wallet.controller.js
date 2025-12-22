const Wallet = require('../models/Wallet.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to populate wallet data with user information
const populateWalletData = async (wallet) => {
  if (!wallet) return null;
  
  const walletObj = wallet.toObject ? wallet.toObject() : wallet;
  
  // Populate user_id (wallet owner)
  if (walletObj.user_id) {
    const userId = typeof walletObj.user_id === 'object' ? walletObj.user_id : walletObj.user_id;
    const user = await User.findOne({ user_id: userId })
      .select('user_id firstName lastName phoneNo BusinessName Email user_image');
    if (user) {
      walletObj.user_id = user.toObject ? user.toObject() : user;
    }
  }
  
  // Populate created_by
  if (walletObj.created_by) {
    const createdById = typeof walletObj.created_by === 'object' ? walletObj.created_by : walletObj.created_by;
    const createdBy = await User.findOne({ user_id: createdById })
      .select('user_id firstName lastName phoneNo BusinessName Email');
    if (createdBy) {
      walletObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
    }
  }
  
  // Populate updated_by
  if (walletObj.updated_by) {
    const updatedById = typeof walletObj.updated_by === 'object' ? walletObj.updated_by : walletObj.updated_by;
    const updatedBy = await User.findOne({ user_id: updatedById })
      .select('user_id firstName lastName phoneNo BusinessName Email');
    if (updatedBy) {
      walletObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
    }
  }
  
  return walletObj;
};


const createWallet = asyncHandler(async (req, res) => {
  try {
    const walletData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };
    
    // Check if wallet already exists for this user
    const existingWallet = await Wallet.findOne({ user_id: walletData.user_id });
    if (existingWallet) {
      return sendError(res, 'Wallet already exists for this user', 400);
    }
    
    const wallet = await Wallet.create(walletData);
    console.info('Wallet created successfully', { walletId: wallet._id, wallet_id: wallet.wallet_id });
    sendSuccess(res, wallet, 'Wallet created successfully', 201);
  } catch (error) {
    console.error('Error creating wallet', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllWallets = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, user_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { user_id: isNaN(search) ? null : parseInt(search, 10) }
      ].filter(item => item !== null);
    }
    if (status !== undefined) filter.Status = status === 'true';
    if (user_id) filter.user_id = parseInt(user_id, 10);
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const [wallets, total] = await Promise.all([
      Wallet.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Wallet.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: parseInt(page), totalPages, totalItems: total,
      itemsPerPage: parseInt(limit), hasNextPage: page < totalPages, hasPrevPage: page > 1
    };
    console.info('Wallets retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });
    sendPaginated(res, wallets, pagination, 'Wallets retrieved successfully');
  } catch (error) {
    console.error('Error retrieving wallets', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getWalletById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let wallet;
    
    // First, try to find wallet by wallet_id or MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      wallet = await Wallet.findById(id);
    } else {
      const walletId = parseInt(id, 10);
      if (isNaN(walletId)) return sendNotFound(res, 'Invalid wallet ID format');
      wallet = await Wallet.findOne({ wallet_id: walletId });
    }
    
    // If wallet not found, try to treat ID as user_id and auto-create wallet
    if (!wallet) {
      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        return sendNotFound(res, 'Wallet not found');
      }
      
      // Check if user exists
      const user = await User.findOne({ user_id: userId, status: true });
      if (!user) {
        return sendNotFound(res, 'User not found. Cannot create wallet for non-existent user.');
      }
      
      // Check if wallet already exists for this user (in case of race condition)
      wallet = await Wallet.findOne({ user_id: userId });
      
      // If still no wallet, create one with 0 balance
      if (!wallet) {
        wallet = await Wallet.create({
          user_id: userId,
          Amount: 0,
          HoldAmount: 0,
          Status: true,
          created_by: req.userIdNumber || userId
        });
        console.info('Wallet auto-created successfully', { 
          walletId: wallet._id, 
          wallet_id: wallet.wallet_id, 
          user_id: userId 
        });
      }
    }
    
    // Populate wallet data with user information
    const populatedWallet = await populateWalletData(wallet);
    
    console.info('Wallet retrieved successfully', { 
      walletId: wallet._id, 
      wallet_id: wallet.wallet_id,
      user_id: wallet.user_id 
    });
    sendSuccess(res, populatedWallet, 'Wallet retrieved successfully');
  } catch (error) {
    console.error('Error retrieving wallet', { error: error.message, walletId: req.params.id });
    throw error;
  }
});

const updateWallet = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.userIdNumber || null, updated_at: new Date() };
    let wallet;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      wallet = await Wallet.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const walletId = parseInt(id, 10);
      if (isNaN(walletId)) return sendNotFound(res, 'Invalid wallet ID format');
      wallet = await Wallet.findOneAndUpdate({ wallet_id: walletId }, updateData, { new: true, runValidators: true });
    }
    if (!wallet) return sendNotFound(res, 'Wallet not found');
    console.info('Wallet updated successfully', { walletId: wallet._id });
    sendSuccess(res, wallet, 'Wallet updated successfully');
  } catch (error) {
    console.error('Error updating wallet', { error: error.message, walletId: req.params.id });
    throw error;
  }
});

const deleteWallet = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let wallet;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      wallet = await Wallet.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const walletId = parseInt(id, 10);
      if (isNaN(walletId)) return sendNotFound(res, 'Invalid wallet ID format');
      wallet = await Wallet.findOneAndUpdate({ wallet_id: walletId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!wallet) return sendNotFound(res, 'Wallet not found');
    console.info('Wallet deleted successfully', { walletId: wallet._id });
    sendSuccess(res, wallet, 'Wallet deleted successfully');
  } catch (error) {
    console.error('Error deleting wallet', { error: error.message, walletId: req.params.id });
    throw error;
  }
});

module.exports = {
  createWallet, getAllWallets, getWalletById, updateWallet, deleteWallet
};

