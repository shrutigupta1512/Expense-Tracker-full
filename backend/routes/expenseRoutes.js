const express = require('express');
const router = express.Router();
const { createExpense, getExpensesByUser, deleteExpense } = require('../controllers/expenseController');
const authenticate = require('../middleware/authenticate');

router.post('/expenses', authenticate, createExpense);
router.get('/expenses', authenticate, getExpensesByUser);
router.delete('/expenses/:expenseId', authenticate, deleteExpense);

module.exports = router;
