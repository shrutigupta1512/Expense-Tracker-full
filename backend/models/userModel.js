const db = require('../database');
 class User {
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0]; // Ensure this returns a single user object or undefined
    }





    // Find a user by email
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0]; // returns the first user or undefined if not found
    }

    // Create a new user
    static async create({ name, email, password }) {
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password]
        );
        return { id: result.insertId, name, email };
    }
}

module.exports = User;
