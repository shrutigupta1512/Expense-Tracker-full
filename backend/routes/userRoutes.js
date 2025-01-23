const express = require('express');
const { registerUser, markUserAsPremium, getUserById } = require('../controllers/userController');

const router = express.Router();

// Signup route
router.post('/signup', registerUser);

// Mark a user as premium
router.put('/users/:id/premium', markUserAsPremium);

// Fetch user by ID
router.get('/:id', getUserById);

module.exports = router;
