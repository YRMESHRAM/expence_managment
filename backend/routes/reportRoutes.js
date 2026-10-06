const express = require('express');
const router = express.Router();
const {
  getSummary,
  getMonthlyExpenses,
  getCategoryExpenses,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getSummary);
router.get('/monthly', getMonthlyExpenses);
router.get('/monthly-trend', getMonthlyExpenses);
router.get('/category', getCategoryExpenses);
router.get('/category-breakdown', getCategoryExpenses);

module.exports = router;
