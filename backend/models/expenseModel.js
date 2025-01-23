const db = require('../database');

class Expense {
    static async create(userId, amount, category, description) {
        const [result] = await db.execute(
            'INSERT INTO expenses (user_id, amount, category, description, created_at) VALUES (?, ?, ?, ?, NOW())',
            [userId, amount, category, description]
        );
        return result;
    }

    static async findAllByUser(userId) {
        const [expenses] = await db.execute('SELECT * FROM expenses WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return expenses;
    }

    static async findById(expenseId) {
        const [expense] = await db.execute('SELECT * FROM expenses WHERE id = ?', [expenseId]);
        return expense[0];
    }

    static async deleteById(expenseId) {
        const [result] = await db.execute('DELETE FROM expenses WHERE id = ?', [expenseId]);
        return result;
    }
}

module.exports = Expense;