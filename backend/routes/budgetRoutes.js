const express = require('express');
const router = express.Router();
const {
  getBudget,
  setBudget,
  updateBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getBudget)
  .post(setBudget);

router.route('/:id')
  .put(updateBudget);

module.exports = router;
