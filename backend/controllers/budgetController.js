const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get budget for a specific month/year (defaults to current)
// @route   GET /api/budget
// @access  Private
exports.getBudget = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1; // 1-12
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const budget = await Budget.findOne({
      userId: req.user.id,
      month,
      year,
    });

    // Calculate total spent for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenseAgg = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spent = expenseAgg.length > 0 ? expenseAgg[0].totalSpent : 0;
    const budgetAmount = budget ? budget.amount : 0;
    const remaining = budgetAmount - spent;
    const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

    // Spending breakdown for Day, Week, Month, Quarter, Year
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const firstDayOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    firstDayOfWeek.setDate(diff);
    firstDayOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(firstDayOfWeek);
    endOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const quarter = Math.floor(now.getMonth() / 3);
    const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1, 0, 0, 0, 0);
    const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);

    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const [dayAgg, weekAgg, quarterAgg, yearAgg] = await Promise.all([
      Expense.aggregate([
        { $match: { userId: req.user._id, date: { $gte: startOfToday, $lte: endOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { userId: req.user._id, date: { $gte: firstDayOfWeek, $lte: endOfWeek } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { userId: req.user._id, date: { $gte: startOfQuarter, $lte: endOfQuarter } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { userId: req.user._id, date: { $gte: startOfYear, $lte: endOfYear } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const periods = {
      day: dayAgg.length > 0 ? dayAgg[0].total : 0,
      week: weekAgg.length > 0 ? weekAgg[0].total : 0,
      month: spent,
      quarterly: quarterAgg.length > 0 ? quarterAgg[0].total : 0,
      year: yearAgg.length > 0 ? yearAgg[0].total : 0,
    };

    res.json({
      success: true,
      data: {
        budget: budget || null,
        month,
        year,
        budgetAmount,
        spent,
        remaining,
        percentage,
        isWarning: percentage >= 80 && percentage <= 100,
        isExceeded: spent > budgetAmount && budgetAmount > 0,
        periods,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update budget
// @route   POST /api/budget
// @access  Private
exports.setBudget = async (req, res, next) => {
  try {
    const now = new Date();
    const amount = Number(req.body.amount);
    const month = parseInt(req.body.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.body.year, 10) || now.getFullYear();

    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid budget amount' });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.id, month, year },
      { amount },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budget saved successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget by ID
// @route   PUT /api/budget/:id
// @access  Private
exports.updateBudget = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (amount === undefined || Number(amount) < 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid budget amount' });
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { amount: Number(amount) },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget record not found' });
    }

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};
