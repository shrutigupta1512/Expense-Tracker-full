const db = require('../database');


// Controller to fetch leaderboard
const getLeaderboard = async (req, res) => {
    try {
        // Fetch all users and their total_expense in descending order
        const [users] = await db.execute(
            'SELECT id, name, total_expense FROM users ORDER BY total_expense DESC'
        );
        console.log("Users fetched:", users);  // Log to see if data is being fetched correctly

        // Map to add rank to each user
        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            id: user.id,
            name: user.name,
            total_expense: user.total_expense,
        }));

        res.status(200).json({ leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getLeaderboard };
