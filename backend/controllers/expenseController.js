const Expense = require('../models/expenseModel');

exports.createExpense = async (req, res) => {
    const { amount, category, description } = req.body;
    const userId = req.user.userId; // From authentication middleware (ensure the userId is correctly set in authenticate middleware)

    try {
        const result = await Expense.create(userId, amount, category, description);
        res.status(201).json({ message: 'Expense added successfully', expenseId: result.insertId });
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'Database error' });
    }
};

exports.getExpensesByUser = async (req, res) => {
    const userId = req.user.userId; // From authentication middleware
    try {
        const expenses = await Expense.findAllByUser(userId);
        res.status(200).json({ expenses });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Database error' });
    }
};

exports.deleteExpense = async (req, res) => {
    const { expenseId } = req.params;
    try {
        await Expense.deleteById(expenseId);
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Database error' });
    }
};
