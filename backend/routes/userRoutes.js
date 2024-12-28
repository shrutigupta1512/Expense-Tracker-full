const express = require('express');
const { registerUser } = require('../controllers/userController');

const router = express.Router();

// Signup route
router.post('/signup', registerUser);

module.exports = router;
