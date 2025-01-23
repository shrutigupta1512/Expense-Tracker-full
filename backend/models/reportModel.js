const db = require('../database');

class Report {
    static async create(userId, fileUrl) {
        // Insert file URL into fileurls table
        const [result] = await db.execute(
            'INSERT INTO fileurls (url, userId, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())',
            [fileUrl, userId]
        );
        return result;
    }

    static async findAllByUser(userId) {
        // Retrieve all reports for a user from expensereportlinks table
        const [history] = await db.execute(
            'SELECT * FROM expensereportlinks WHERE userId = ? ORDER BY createdAt DESC',
            [userId]
        );
        return history;
    }
}

module.exports = Report;