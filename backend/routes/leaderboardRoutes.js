const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');
const authenticate = require('../middleware/authenticate'); // Middleware for JWT verification

const router = express.Router();

// Leaderboard route (accessible only by authenticated users)
router.get('/', authenticate, getLeaderboard);


module.exports = router;
