const { v4: uuidv4 } = require('uuid');
const db = require('../database');

class ForgotPassword {
    // Create reset token for the user
    static async createResetToken(userId) {
        const token = uuidv4(); // Generating a unique token
        const createdAt = new Date();
        const updatedAt = createdAt;

        // Save the reset token in the database
        await db.execute(
            'INSERT INTO forgotpasswords (id, userId, token, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
            [token, userId, token, createdAt, updatedAt]
        );

        return token; // Return token for email
    }

    // Find the token from the database
    static async findByToken(token) {
        try {
            console.log('Finding token:', token); // Debug log
            const [rows] = await db.execute('SELECT * FROM forgotpasswords WHERE token = ? AND isActive = 1', [token]);
            if (rows.length === 0) {
                console.error('No matching token found:', token); // Debug log
                return null;
            }
            console.log('Token found:', rows[0]); // Debug log
            return rows[0];
        } catch (error) {
            console.error('Error in findByToken:', error.message); // Debug log
            throw error;
        }
    }
    
    

    // Invalidate the token after use (mark as inactive)
    static async invalidateToken(token) {
        await db.execute('UPDATE forgotpasswords SET isActive = 0 WHERE token = ?', [token]);
    }
}

module.exports = ForgotPassword;
