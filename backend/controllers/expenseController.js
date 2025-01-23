const db = require('../database');  // Make sure this is the correct path to your db connection file

const Expense = require('../models/expenseModel');


// Function to update total_expense in the users table
const updateTotalExpense = async (userId) => {
    await db.execute(
        'UPDATE users SET total_expense = (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = ?) WHERE id = ?',
        [userId, userId]
    );
};

// Controller to create a new expense
const createExpense = async (req, res) => {
    const { amount, category, description } = req.body;
    const userId = req.user.id;

    try {
        await Expense.create(userId, amount, category, description);
        await updateTotalExpense(userId); // Update total_expense after adding expense
        res.status(201).json({ message: 'Expense added successfully' });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller to fetch expenses by user
const getExpensesByUser = async (req, res) => {
    const userId = req.user.id;

    try {
        const expenses = await Expense.findAllByUser(userId);
        res.status(200).json({ expenses });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller to delete an expense
const deleteExpense = async (req, res) => {
    const { expenseId } = req.params;
    const userId = req.user.id;

    try {
        await Expense.deleteById(expenseId);
        await updateTotalExpense(userId); // Update total_expense after deleting expense
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createExpense,
    getExpensesByUser,
    deleteExpense,
};