const Expense = require('../models/Expense');

// @desc    Get all expenses for logged in user with filters, search, and sort
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      paymentMethod,
      dateRange,
      startDate,
      endDate,
      sort,
      limit,
    } = req.query;

    const query = { userId: req.user.id };

    // Search by title, description, or category
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    // Filter by Category
    if (category && category !== 'All' && category.trim() !== '') {
      query.category = category;
    }

    // Filter by Payment Method
    if (paymentMethod && paymentMethod !== 'All' && paymentMethod.trim() !== '') {
      query.paymentMethod = paymentMethod;
    }

    // Filter by Date (day, week, month, quarterly, year, custom)
    const now = new Date();
    if (dateRange && dateRange !== 'all') {
      if (dateRange === 'day' || dateRange === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
      } else if (dateRange === 'week' || dateRange === 'this_week') {
        const firstDayOfWeek = new Date(now);
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
        firstDayOfWeek.setDate(diff);
        firstDayOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(firstDayOfWeek);
        endOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        query.date = { $gte: firstDayOfWeek, $lte: endOfWeek };
      } else if (dateRange === 'month' || dateRange === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        query.date = { $gte: startOfMonth, $lte: endOfMonth };
      } else if (dateRange === 'quarterly' || dateRange === 'quarter' || dateRange === 'this_quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
        const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
        query.date = { $gte: startOfQuarter, $lte: endOfQuarter };
      } else if (dateRange === 'year' || dateRange === 'this_year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        query.date = { $gte: startOfYear, $lte: endOfYear };
      }
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting
    let sortOption = { date: -1, createdAt: -1 }; // default: Newest First
    if (sort === 'oldest') {
      sortOption = { date: 1, createdAt: 1 };
    } else if (sort === 'highest') {
      sortOption = { amount: -1 };
    } else if (sort === 'lowest') {
      sortOption = { amount: 1 };
    }

    let expenseQuery = Expense.find(query).sort(sortOption);

    if (limit) {
      expenseQuery = expenseQuery.limit(parseInt(limit, 10));
    }

    const expenses = await expenseQuery;
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, paymentMethod, description, receipt } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Please provide expense title and amount' });
    }

    const expense = await Expense.create({
      userId: req.user.id,
      title: title.trim(),
      amount: Number(amount),
      category: category || 'Other',
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'UPI',
      description: description ? description.trim() : '',
      receipt: receipt || '',
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const { title, amount, category, date, paymentMethod, description, receipt } = req.body;

    if (title !== undefined) expense.title = title.trim();
    if (amount !== undefined) expense.amount = Number(amount);
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = new Date(date);
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (description !== undefined) expense.description = description.trim();
    if (receipt !== undefined) expense.receipt = receipt;

    const updatedExpense = await expense.save();

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
