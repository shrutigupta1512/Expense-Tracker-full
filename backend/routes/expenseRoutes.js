const express = require('express');
const router = express.Router();
const { createExpense, getExpensesByUser, deleteExpense } = require('../controllers/expenseController');
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate, createExpense);
router.get('/', authenticate, getExpensesByUser);
router.delete('/:expenseId', authenticate, deleteExpense);

module.exports = router;