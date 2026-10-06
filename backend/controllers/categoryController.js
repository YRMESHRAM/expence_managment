const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Education',
  'Entertainment',
  'Healthcare',
  'Rent',
  'Groceries',
  'Other',
];

// @desc    Get user categories (initialize defaults if empty)
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ userId: req.user.id }).sort({ name: 1 });

    if (categories.length === 0) {
      const defaultDocs = DEFAULT_CATEGORIES.map((name) => ({
        userId: req.user.id,
        name,
      }));
      await Category.insertMany(defaultDocs);
      categories = await Category.find({ userId: req.user.id }).sort({ name: 1 });
    }

    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    const existing = await Category.findOne({
      userId: req.user.id,
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({
      userId: req.user.id,
      name: trimmedName,
      icon: icon || 'Tag',
      color: color || '#6366f1',
    });

    res.status(201).json({
      success: true,
      message: 'Category added successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check duplicate
    const existing = await Category.findOne({
      userId: req.user.id,
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Another category with this name already exists' });
    }

    const updateData = { name: trimmedName };
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
