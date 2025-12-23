const Transaction = require('../models/transaction.model');
const Expenses = require('../models/Expenses.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Helper function to ensure branch exists
const ensureBranchExists = async (branchId) => {
  if (!branchId) return false;
  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return !!branch;
};

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Helper function to get date ranges based on filter
const getDateRange = (filter) => {
  const now = new Date();
  let start, end;
  
  switch (filter) {
    case 'Today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      end.setDate(end.getDate() + 1);
      break;
    case 'ThisWeek':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      end = new Date(now);
      break;
    case 'Month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case 'all':
    default:
      start = null;
      end = null;
      break;
  }
  
  return { start, end };
};

// Helper function to get chart data by day
const getChartDataByDay = async (branchId, start, end) => {
  const matchQuery = {
    business_Branch_id: branchId,
    Status: true,
    status: 'completed',
    transactionType: { $in: ['Order_Now_Payment', 'deposit', 'Recharge'] }
  };
  
  if (start && end) {
    matchQuery.transaction_date = { $gte: start, $lt: end };
  }
  
  const chartData = await Transaction.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$transaction_date' }
        },
        RevenueCount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Format chart data with day names
  const formattedChart = chartData.map(item => {
    const date = new Date(item._id);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      RevenueCount: item.RevenueCount || 0,
      dayName: dayNames[date.getDay()],
      date: item._id
    };
  });
  
  return formattedChart;
};

// Helper function to categorize expenses
const categorizeExpenses = (expenseName) => {
  const name = expenseName.toLowerCase();
  if (name.includes('food') || name.includes('ingredient') || name.includes('grocery')) {
    return 'FoodPrice';
  } else if (name.includes('labor') || name.includes('salary') || name.includes('wage') || name.includes('employee')) {
    return 'LaborCosts';
  } else if (name.includes('rent') || name.includes('utility') || name.includes('electric') || name.includes('water') || name.includes('gas')) {
    return 'RentUtilities';
  } else if (name.includes('equipment') || name.includes('machine') || name.includes('tool')) {
    return 'Equipment';
  } else if (name.includes('marketing') || name.includes('advert') || name.includes('promo')) {
    return 'Marketing';
  }
  return 'Other';
};

/**
 * Get Accounting data by Branch ID
 * @route GET /api/v2/accounting/getByBranchId/:Branch_id
 */
const getAccountingByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.params;
    const { filter = 'Month' } = req.query;
    
    const branchId = parseInt(Branch_id, 10);
    if (isNaN(branchId)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }
    
    if (!(await ensureBranchExists(branchId))) {
      return sendNotFound(res, 'Business branch not found');
    }
    
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    
    // Get current month transactions (revenue)
    const currentMonthTransactions = await Transaction.find({
      business_Branch_id: branchId,
      Status: true,
      status: 'completed',
      transactionType: { $in: ['Order_Now_Payment', 'deposit', 'Recharge'] },
      transaction_date: { $gte: startOfCurrentMonth }
    }).lean();
    
    // Get last month transactions
    const lastMonthTransactions = await Transaction.find({
      business_Branch_id: branchId,
      Status: true,
      status: 'completed',
      transactionType: { $in: ['Order_Now_Payment', 'deposit', 'Recharge'] },
      transaction_date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    }).lean();
    
    // Calculate revenue
    const RevenueCount = currentMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const lastMonthRevenue = lastMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const Revenuelastmonth = calculatePercentageChange(RevenueCount, lastMonthRevenue);
    
    // Get current month expenses
    const currentMonthExpenses = await Expenses.find({
      Branch_id: branchId,
      Status: true,
      Date: { $gte: startOfCurrentMonth }
    }).lean();
    
    // Get last month expenses
    const lastMonthExpenses = await Expenses.find({
      Branch_id: branchId,
      Status: true,
      Date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    }).lean();
    
    const currentExpensesTotal = currentMonthExpenses.reduce((sum, e) => sum + (e.Amount || 0), 0);
    const lastExpensesTotal = lastMonthExpenses.reduce((sum, e) => sum + (e.Amount || 0), 0);
    
    // Calculate net profit (Revenue - Expenses)
    const notProfitCount = RevenueCount - currentExpensesTotal;
    const lastMonthProfit = lastMonthRevenue - lastExpensesTotal;
    const notProfitlastmonth = calculatePercentageChange(notProfitCount, lastMonthProfit);
    
    // Earnings (same as revenue for now, can be adjusted)
    const EarningCount = RevenueCount;
    const lastMonthEarnings = lastMonthRevenue;
    const Earninglastmonth = calculatePercentageChange(EarningCount, lastMonthEarnings);
    
    // Calculate profit margin
    const Profitmargin = RevenueCount > 0 ? ((notProfitCount / RevenueCount) * 100) : 0;
    
    // Industry average (placeholder - can be calculated from all branches or set as constant)
    const IndustryAvg = 15; // 15% as example
    
    // Get overview chart data
    const { start, end } = getDateRange(filter);
    const OverViewChart = {
      filter: filter,
      Chart: await getChartDataByDay(branchId, start, end)
    };
    
    // Categorize expenses
    const expenseCategories = {
      FoodPrice: { ExpenseCount: 0, lastMonth: 0 },
      LaborCosts: { ExpenseCount: 0, lastMonth: 0 },
      RentUtilities: { ExpenseCount: 0, lastMonth: 0 },
      Equipment: { ExpenseCount: 0, lastMonth: 0 },
      Marketing: { ExpenseCount: 0, lastMonth: 0 }
    };
    
    currentMonthExpenses.forEach(expense => {
      const category = categorizeExpenses(expense.Expense_Name || '');
      if (expenseCategories[category]) {
        expenseCategories[category].ExpenseCount += expense.Amount || 0;
      }
    });
    
    lastMonthExpenses.forEach(expense => {
      const category = categorizeExpenses(expense.Expense_Name || '');
      if (expenseCategories[category]) {
        expenseCategories[category].lastMonth += expense.Amount || 0;
      }
    });
    
    // Calculate percentage changes for expense categories
    const ExpensesChart = [
      {
        FoodPriceCount: expenseCategories.FoodPrice.ExpenseCount,
        lastMonth: parseFloat(calculatePercentageChange(expenseCategories.FoodPrice.ExpenseCount, expenseCategories.FoodPrice.lastMonth).toFixed(2))
      },
      {
        LaborCostsPriceCount: expenseCategories.LaborCosts.ExpenseCount,
        lastMonth: parseFloat(calculatePercentageChange(expenseCategories.LaborCosts.ExpenseCount, expenseCategories.LaborCosts.lastMonth).toFixed(2))
      },
      {
        RentUtilitiesPriceCount: expenseCategories.RentUtilities.ExpenseCount,
        lastMonth: parseFloat(calculatePercentageChange(expenseCategories.RentUtilities.ExpenseCount, expenseCategories.RentUtilities.lastMonth).toFixed(2))
      },
      {
        EquipmentPriceCount: expenseCategories.Equipment.ExpenseCount,
        lastMonth: parseFloat(calculatePercentageChange(expenseCategories.Equipment.ExpenseCount, expenseCategories.Equipment.lastMonth).toFixed(2))
      },
      {
        MarketingPriceCount: expenseCategories.Marketing.ExpenseCount,
        lastMonth: parseFloat(calculatePercentageChange(expenseCategories.Marketing.ExpenseCount, expenseCategories.Marketing.lastMonth).toFixed(2))
      }
    ];
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({
      business_Branch_id: branchId,
      Status: true
    })
      .sort({ transaction_date: -1 })
      .limit(10)
      .select('transaction_id amount status transactionType transaction_date reference_number')
      .lean();
    
    const TransactionsRecent = recentTransactions.map(t => ({
      Detials: {
        transaction_id: t.transaction_id,
        amount: t.amount,
        status: t.status,
        transactionType: t.transactionType,
        transaction_date: t.transaction_date,
        reference_number: t.reference_number
      }
    }));
    
    const accountingData = {
      RevenueCount,
      Revenuelastmonth: parseFloat(Revenuelastmonth.toFixed(2)),
      notProfitCount,
      notProfitlastmonth: parseFloat(notProfitlastmonth.toFixed(2)),
      EarningCount,
      Earninglastmonth: parseFloat(Earninglastmonth.toFixed(2)),
      Profitmargin: parseFloat(Profitmargin.toFixed(2)),
      IndustryAvg,
      OverViewChart,
      Expenses: ExpensesChart,
      TransactionsRecent
    };
    
    console.info('Accounting data retrieved successfully', { branchId, filter });
    sendSuccess(res, accountingData, 'Accounting data retrieved successfully');
  } catch (error) {
    console.error('Error retrieving accounting data', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get Accounting data by authenticated user
 * @route GET /api/v2/accounting/getByAuth
 */
const getAccountingByAuth = asyncHandler(async (req, res) => {
  try {
    const { filter = 'Month' } = req.query;
    
    if (!req.userIdNumber) {
      return sendError(res, 'Authentication required', 401);
    }
    
    // Get user's branches
    const branches = await Business_Branch.find({
      user_id: req.userIdNumber,
      Status: true
    }).select('business_Branch_id').lean();
    
    if (!branches || branches.length === 0) {
      return sendError(res, 'No branches found for this user', 404);
    }
    
    // Use first branch or aggregate all branches
    const branchIds = branches.map(b => b.business_Branch_id);
    
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    
    // Get transactions for all user's branches
    const currentMonthTransactions = await Transaction.find({
      business_Branch_id: { $in: branchIds },
      Status: true,
      status: 'completed',
      transactionType: { $in: ['Order_Now_Payment', 'deposit', 'Recharge'] },
      transaction_date: { $gte: startOfCurrentMonth }
    }).lean();
    
    const lastMonthTransactions = await Transaction.find({
      business_Branch_id: { $in: branchIds },
      Status: true,
      status: 'completed',
      transactionType: { $in: ['Order_Now_Payment', 'deposit', 'Recharge'] },
      transaction_date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    }).lean();
    
    const RevenueCount = currentMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const lastMonthRevenue = lastMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const Revenuelastmonth = calculatePercentageChange(RevenueCount, lastMonthRevenue);
    
    const currentMonthExpenses = await Expenses.find({
      Branch_id: { $in: branchIds },
      Status: true,
      Date: { $gte: startOfCurrentMonth }
    }).lean();
    
    const lastMonthExpenses = await Expenses.find({
      Branch_id: { $in: branchIds },
      Status: true,
      Date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    }).lean();
    
    const currentExpensesTotal = currentMonthExpenses.reduce((sum, e) => sum + (e.Amount || 0), 0);
    const lastExpensesTotal = lastMonthExpenses.reduce((sum, e) => sum + (e.Amount || 0), 0);
    
    const notProfitCount = RevenueCount - currentExpensesTotal;
    const lastMonthProfit = lastMonthRevenue - lastExpensesTotal;
    const notProfitlastmonth = calculatePercentageChange(notProfitCount, lastMonthProfit);
    
    const EarningCount = RevenueCount;
    const lastMonthEarnings = lastMonthRevenue;
    const Earninglastmonth = calculatePercentageChange(EarningCount, lastMonthEarnings);
    
    const Profitmargin = RevenueCount > 0 ? ((notProfitCount / RevenueCount) * 100) : 0;
    const IndustryAvg = 15;
    
    // Get chart data for first branch (or aggregate)
    const { start, end } = getDateRange(filter);
    const OverViewChart = {
      filter: filter,
      Chart: await getChartDataByDay(branchIds[0], start, end)
    };
    
    const expenseCategories = {
      FoodPrice: { ExpenseCount: 0, lastMonth: 0 },
      LaborCosts: { ExpenseCount: 0, lastMonth: 0 },
      RentUtilities: { ExpenseCount: 0, lastMonth: 0 },
      Equipment: { ExpenseCount: 0, lastMonth: 0 },
      Marketing: { ExpenseCount: 0, lastMonth: 0 }
    };
    
    currentMonthExpenses.forEach(expense => {
      const category = categorizeExpenses(expense.Expense_Name || '');
      if (expenseCategories[category]) {
        expenseCategories[category].ExpenseCount += expense.Amount || 0;
      }
    });
    
    lastMonthExpenses.forEach(expense => {
      const category = categorizeExpenses(expense.Expense_Name || '');
      if (expenseCategories[category]) {
        expenseCategories[category].lastMonth += expense.Amount || 0;
      }
    });
    
    const ExpensesChart = [
      {
        FoodPriceCount: expenseCategories.FoodPrice.ExpenseCount,
        lastMonth: parseFloat(calculatePercentageChange(expenseCategories.FoodPrice.ExpenseCount, expenseCategories.FoodPrice.lastMonth).toFixed(2))
      },
      {
        LaborCostsPriceCount: expenseCategories.LaborCosts.ExpenseCount,
        lastMonth: parseFloat(calculatePercentageChange(expenseCategories.LaborCosts.ExpenseCount, expenseCategories.LaborCosts.lastMonth).toFixed(2))
      },
      {
        RentUtilitiesPriceCount: expenseCategories.RentUtilities.ExpenseCount,
        lastMonth: parseFloat(calculatePercentageChange(expenseCategories.RentUtilities.ExpenseCount, expenseCategories.RentUtilities.lastMonth).toFixed(2))
      },
      {
        EquipmentPriceCount: expenseCategories.Equipment.ExpenseCount,
        lastMonth: parseFloat(calculatePercentageChange(expenseCategories.Equipment.ExpenseCount, expenseCategories.Equipment.lastMonth).toFixed(2))
      },
      {
        MarketingPriceCount: expenseCategories.Marketing.ExpenseCount,
        lastMonth: parseFloat(calculatePercentageChange(expenseCategories.Marketing.ExpenseCount, expenseCategories.Marketing.lastMonth).toFixed(2))
      }
    ];
    
    const recentTransactions = await Transaction.find({
      business_Branch_id: { $in: branchIds },
      Status: true
    })
      .sort({ transaction_date: -1 })
      .limit(10)
      .select('transaction_id amount status transactionType transaction_date reference_number')
      .lean();
    
    const TransactionsRecent = recentTransactions.map(t => ({
      Detials: {
        transaction_id: t.transaction_id,
        amount: t.amount,
        status: t.status,
        transactionType: t.transactionType,
        transaction_date: t.transaction_date,
        reference_number: t.reference_number
      }
    }));
    
    const accountingData = {
      RevenueCount,
      Revenuelastmonth: parseFloat(Revenuelastmonth.toFixed(2)),
      notProfitCount,
      notProfitlastmonth: parseFloat(notProfitlastmonth.toFixed(2)),
      EarningCount,
      Earninglastmonth: parseFloat(Earninglastmonth.toFixed(2)),
      Profitmargin: parseFloat(Profitmargin.toFixed(2)),
      IndustryAvg,
      OverViewChart,
      Expenses: ExpensesChart,
      TransactionsRecent
    };
    
    console.info('Accounting data retrieved for authenticated user', { userId: req.userIdNumber });
    sendSuccess(res, accountingData, 'Accounting data retrieved successfully');
  } catch (error) {
    console.error('Error retrieving accounting data for authenticated user', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all Accounting data (admin only - can be filtered)
 * @route GET /api/v2/accounting/getAll
 */
const getAllAccounting = asyncHandler(async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      Branch_id,
      filter = 'Month'
    } = req.query;
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    let branchIds = [];
    if (Branch_id) {
      const branchId = parseInt(Branch_id, 10);
      if (isNaN(branchId)) {
        return sendError(res, 'Invalid branch ID format', 400);
      }
      branchIds = [branchId];
    } else {
      // Get all active branches
      const branches = await Business_Branch.find({ Status: true })
        .select('business_Branch_id')
        .skip(skip)
        .limit(numericLimit)
        .lean();
      branchIds = branches.map(b => b.business_Branch_id);
    }
    
    if (branchIds.length === 0) {
      return sendPaginated(res, [], {
        currentPage: numericPage,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: numericLimit,
        hasNextPage: false,
        hasPrevPage: false
      }, 'No accounting data found');
    }
    
    // Get accounting data for each branch
    const accountingDataList = await Promise.all(
      branchIds.map(async (branchId) => {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        
        const [currentTransactions, lastTransactions, currentExpenses, lastExpenses] = await Promise.all([
          Transaction.find({
            business_Branch_id: branchId,
            Status: true,
            status: 'completed',
            transactionType: { $in: ['Order_Now_Payment', 'deposit', 'Recharge'] },
            transaction_date: { $gte: startOfCurrentMonth }
          }).lean(),
          Transaction.find({
            business_Branch_id: branchId,
            Status: true,
            status: 'completed',
            transactionType: { $in: ['Order_Now_Payment', 'deposit', 'Recharge'] },
            transaction_date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
          }).lean(),
          Expenses.find({
            Branch_id: branchId,
            Status: true,
            Date: { $gte: startOfCurrentMonth }
          }).lean(),
          Expenses.find({
            Branch_id: branchId,
            Status: true,
            Date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
          }).lean()
        ]);
        
        const RevenueCount = currentTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const lastMonthRevenue = lastTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const currentExpensesTotal = currentExpenses.reduce((sum, e) => sum + (e.Amount || 0), 0);
        const lastExpensesTotal = lastExpenses.reduce((sum, e) => sum + (e.Amount || 0), 0);
        
        return {
          Branch_id: branchId,
          RevenueCount,
          Revenuelastmonth: calculatePercentageChange(RevenueCount, lastMonthRevenue),
          notProfitCount: RevenueCount - currentExpensesTotal,
          notProfitlastmonth: calculatePercentageChange(RevenueCount - currentExpensesTotal, lastMonthRevenue - lastExpensesTotal),
          EarningCount: RevenueCount,
          Earninglastmonth: calculatePercentageChange(RevenueCount, lastMonthRevenue),
          Profitmargin: RevenueCount > 0 ? (((RevenueCount - currentExpensesTotal) / RevenueCount) * 100) : 0,
          IndustryAvg: 15
        };
      })
    );
    
    const totalBranches = Branch_id ? 1 : await Business_Branch.countDocuments({ Status: true });
    const totalPages = Math.ceil(totalBranches / numericLimit) || 1;
    
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: totalBranches,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };
    
    console.info('All accounting data retrieved', { total: totalBranches, page: numericPage });
    sendPaginated(res, accountingDataList, pagination, 'Accounting data retrieved successfully');
  } catch (error) {
    console.error('Error retrieving all accounting data', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get Accounting by ID (placeholder - can be used for saved reports)
 * @route GET /api/v2/accounting/getById/:id
 */
const getAccountingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // For now, treat ID as Branch_id
    const branchId = parseInt(id, 10);
    if (isNaN(branchId)) {
      return sendError(res, 'Invalid ID format', 400);
    }
    
    if (!(await ensureBranchExists(branchId))) {
      return sendNotFound(res, 'Business branch not found');
    }
    
    // Reuse getAccountingByBranchId logic
    req.params.Branch_id = branchId;
    req.query.filter = req.query.filter || 'Month';
    return await getAccountingByBranchId(req, res);
  } catch (error) {
    console.error('Error retrieving accounting by ID', { error: error.message, id: req.params.id });
    throw error;
  }
});

/**
 * Delete Accounting (placeholder - can be used for saved reports)
 * @route DELETE /api/v2/accounting/delete/:id
 */
const deleteAccounting = asyncHandler(async (req, res) => {
  try {
    // This endpoint can be used for deleting saved accounting reports if implemented
    // For now, return success as accounting data is calculated on-the-fly
    sendSuccess(res, { message: 'Accounting data is calculated dynamically and cannot be deleted' }, 'Operation completed');
  } catch (error) {
    console.error('Error in delete accounting', { error: error.message, id: req.params.id });
    throw error;
  }
});

module.exports = {
  getAccountingByBranchId,
  getAccountingByAuth,
  getAllAccounting,
  getAccountingById,
  deleteAccounting
};

