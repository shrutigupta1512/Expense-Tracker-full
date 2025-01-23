const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const { getUserById } = require('../controllers/userController');

// Route to create an order for premium membership
router.post('/create-order', premiumController.createOrder);

// Route to verify payment after the user completes the transaction
router.post('/verify-payment', premiumController.verifyPayment);

// Middleware to fetch and attach user data for premium actions
router.use(async (req, res, next) => {
    const userId = req.body.userId || req.query.userId;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const user = await getUserById(req, res);
        req.user = user; // Attach user data to the request object
        next();
    } catch (error) {
        console.error('Error in premium middleware:', error);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

module.exports = router;
