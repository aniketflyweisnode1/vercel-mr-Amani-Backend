const BranchMapBank = require('../models/Branch_map_Bank.model');
const Transaction = require('../models/transaction.model');
const Expenses = require('../models/Expenses.model');
const Business_Branch = require('../models/business_Branch.model');
const { asyncHandler } = require('../../middleware/errorHandler');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');

const ensureBusinessBranchExists = async (Branch_id) => {
  if (Branch_id === undefined || Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: Branch_id, Status: true });
  return !!branch;
};

const incomeTypes = ['Registration_fee', 'deposit', 'Plan_Buy', 'Recharge'];
const withdrawalTypes = ['withdraw', 'refund'];

const getFinanceByBranchId = asyncHandler(async (req, res) => {
  try {
    const { Branch_id } = req.params;
    const {
      transactionSortBy = 'transaction_date',
      transactionSortOrder = 'desc',
      expenseSortBy = 'Date',
      expenseSortOrder = 'desc'
    } = req.query;

    const branchIdNum = parseInt(Branch_id, 10);
    if (isNaN(branchIdNum)) {
      return sendError(res, 'Invalid branch ID format', 400);
    }

    const branchExists = await ensureBusinessBranchExists(branchIdNum);
    if (!branchExists) {
      return sendNotFound(res, 'Business branch not found');
    }

    const [bankMappings, transactionTotals, expenseTotals] = await Promise.all([
      BranchMapBank.find({ Branch_id: branchIdNum, Status: true })
        .populate('Bank_id', 'Bank_id Bank_name AccountNo AccountType AccountHoladerName RoutingNo Branch')
        .lean(),
      Transaction.aggregate([
        { $match: { business_Branch_id: branchIdNum } },
        {
          $group: {
            _id: null,
            income: {
              $sum: {
                $cond: [{ $in: ['$transactionType', incomeTypes] }, '$amount', 0]
              }
            },
            withdrawals: {
              $sum: {
                $cond: [{ $in: ['$transactionType', withdrawalTypes] }, '$amount', 0]
              }
            }
          }
        }
      ]),
      Expenses.aggregate([
        { $match: { Branch_id: branchIdNum, Status: true } },
        {
          $group: {
            _id: null,
            total: { $sum: '$Amount' }
          }
        }
      ])
    ]);

    const bankList = bankMappings
      .map((mapping) => mapping.Bank_id)
      .filter(Boolean);

    const transactionSort = {};
    transactionSort[transactionSortBy] = transactionSortOrder === 'asc' ? 1 : -1;

    const transactions = await Transaction.find({ business_Branch_id: branchIdNum })
      .populate('Plan_id', 'name Price')
      .populate('payment_method_id', 'payment_method emoji')
      .populate('user_id', 'firstName lastName phoneNo')
      .sort(transactionSort)
      .lean();
    const expenseSortObj = {};
    expenseSortObj[expenseSortBy] = expenseSortOrder === 'asc' ? 1 : -1;

    const expenseList = await Expenses.find({ Branch_id: branchIdNum, Status: true })
      .sort(expenseSortObj)
      .lean();

    const financePayload = {
      Bank: bankList,
      Transactions: {
        TotalIncomeCount: transactionTotals[0]?.income || 0,
        withdrawals: transactionTotals[0]?.withdrawals || 0,
        TransactionList: transactions
      },
      Expenses: {
        totalExpenses: expenseTotals[0]?.total || 0,
        ExpenseList: expenseList
      }
    };

    sendSuccess(res, financePayload, 'Finance data retrieved successfully');
  } catch (error) {
    console.error('Error retrieving finance data', { error: error.message, branchId: req.params.Branch_id });
    throw error;
  }
});

module.exports = {
  getFinanceByBranchId
};


