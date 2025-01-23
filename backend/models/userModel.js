const db = require('../database');

class User {
    // Find a user by ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    // Find a user by email
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    // Create a new user
    static async create({ name, email, password }) {
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, is_premium) VALUES (?, ?, ?, ?)',
            [name, email, password, 0]
        );
        return { id: result.insertId, name, email, is_premium: 0 };
    }

    // Mark a user as premium
    static async markAsPremium(userId) {
        const [result] = await db.execute(
            'UPDATE users SET is_premium = 1 WHERE id = ?',
            [userId]
        );
        return result.affectedRows > 0; // Returns true if the update was successful
    }
    
    // Update a user's password
    static async updatePassword(userId, hashedPassword) {
        try {
            if (!userId || !hashedPassword) {
                console.error('Invalid parameters for updatePassword:', { userId, hashedPassword }); // Debug log
                throw new Error('Invalid parameters for updating password.');
            }
    
            await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
            console.log('Password updated in database for userId:', userId); // Debug log
        } catch (error) {
            console.error('Error in updatePassword:', error.message); // Debug log
            throw error;
        }
    }
    
    
    
}

module.exports = User;
