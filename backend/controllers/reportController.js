const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// @desc    Get expense summary (Total Expenses, This Month, This Week, Today, Highest, Average)
// @route   GET /api/reports/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const firstDayOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    firstDayOfWeek.setDate(diff);
    firstDayOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(firstDayOfWeek);
    endOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Total expenses, highest, average
    const totalExpAgg = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          max: { $max: '$amount' },
          avg: { $avg: '$amount' },
        },
      },
    ]);

    const totalExpenses = totalExpAgg.length > 0 ? totalExpAgg[0].total : 0;
    const highestExpense = totalExpAgg.length > 0 ? totalExpAgg[0].max : 0;
    const averageExpense = totalExpAgg.length > 0 ? Math.round(totalExpAgg[0].avg) : 0;

    // 2. Today, This Week, This Month aggregations
    const [todayAgg, weekAgg, monthAgg] = await Promise.all([
      Expense.aggregate([
        { $match: { userId: userObjectId, date: { $gte: startOfToday, $lte: endOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { userId: userObjectId, date: { $gte: firstDayOfWeek, $lte: endOfWeek } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { userId: userObjectId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const todayExpenses = todayAgg.length > 0 ? todayAgg[0].total : 0;
    const thisWeekExpenses = weekAgg.length > 0 ? weekAgg[0].total : 0;
    const thisMonthExpenses = monthAgg.length > 0 ? monthAgg[0].total : 0;

    // 3. Recent 5 expenses
    const recentExpenses = await Expense.find({ userId: req.user.id })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalExpenses,
        thisMonthExpenses,
        thisWeekExpenses,
        todayExpenses,
        highestExpense,
        averageExpense,
        recentExpenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly expense breakdown (last 6-12 months)
// @route   GET /api/reports/monthly
// @access  Private
exports.getMonthlyExpenses = async (req, res, next) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const monthsBack = parseInt(req.query.months, 10) || 6;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (monthsBack - 1));
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const agg = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build complete list of labels for each month
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const labels = [];
    const values = [];

    const now = new Date();
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const label = `${monthNames[m - 1]} ${y}`;
      labels.push(label);

      const found = agg.find((item) => item._id.year === y && item._id.month === m);
      values.push(found ? found.total : 0);
    }

    res.json({
      success: true,
      data: { labels, values },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense breakdown by category
// @route   GET /api/reports/category
// @access  Private
exports.getCategoryExpenses = async (req, res, next) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const { month, year, dateRange, startDate, endDate } = req.query;

    let matchQuery = { userId: userObjectId };
    const now = new Date();

    if (dateRange && dateRange !== 'all') {
      if (dateRange === 'day' || dateRange === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        matchQuery.date = { $gte: start, $lte: end };
      } else if (dateRange === 'week' || dateRange === 'this_week') {
        const firstDayOfWeek = new Date(now);
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        firstDayOfWeek.setDate(diff);
        firstDayOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(firstDayOfWeek);
        endOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        matchQuery.date = { $gte: firstDayOfWeek, $lte: endOfWeek };
      } else if (dateRange === 'month' || dateRange === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        matchQuery.date = { $gte: startOfMonth, $lte: endOfMonth };
      } else if (dateRange === 'quarterly' || dateRange === 'quarter' || dateRange === 'this_quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
        const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
        matchQuery.date = { $gte: startOfQuarter, $lte: endOfQuarter };
      } else if (dateRange === 'year' || dateRange === 'this_year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        matchQuery.date = { $gte: startOfYear, $lte: endOfYear };
      }
    } else if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.date.$lte = end;
      }
    } else if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59, 999);
      matchQuery.date = { $gte: start, $lte: end };
    }

    const agg = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalAmount = agg.reduce((acc, curr) => acc + curr.total, 0);

    const data = agg.map((item) => ({
      category: item._id || 'Uncategorized',
      total: item.total,
      count: item.count,
      percentage: totalAmount > 0 ? Math.round((item.total / totalAmount) * 100) : 0,
    }));

    res.json({
      success: true,
      totalAmount,
      data,
    });
  } catch (error) {
    next(error);
  }
};
