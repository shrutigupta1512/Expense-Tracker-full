const db = require('../database');

class Order {
    // Create a new order
    static async create(userId, orderId, status) {
        const [result] = await db.execute(
            'INSERT INTO orders (userId, orderId, status, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
            [userId, orderId, status]
        );
        return result.insertId; // Returns the ID of the newly inserted order
    }

    // Update order status
    static async updateStatus(orderId, status) {
        const [result] = await db.execute(
            'UPDATE orders SET status = ?, updatedAt = NOW() WHERE orderId = ?',
            [status, orderId]
        );
        return result.affectedRows > 0; // Returns true if the update was successful
    }
}

module.exports = Order;
