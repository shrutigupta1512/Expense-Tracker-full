const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
require('dotenv').config();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
    try {
        const { amount, userId } = req.body;

        // Check if the user is already a premium user
        const user = await User.findById(userId);
        if (user.is_premium) {
            return res.status(400).json({ success: false, message: 'User is already a premium member' });
        }

        // Create order with Razorpay
        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `order_rcptid_${userId}`,
        };
        const order = await razorpay.orders.create(options);

        // Save order details in the database
        await Order.create(userId, order.id, 'PENDING');

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Error in createOrder:', error);
        res.status(500).json({ success: false, message: 'Failed to create order', error });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId } = req.body;

        // Verify payment signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature === razorpay_signature) {
            // Update the order status to SUCCESS
            await Order.updateStatus(razorpay_order_id, 'SUCCESS');

            // Update user as premium
            const isPremiumUpdated = await User.markAsPremium(userId);
            if (!isPremiumUpdated) {
                throw new Error('Failed to update user premium status');
            }

            res.status(200).json({ success: true, message: 'Transaction successful' });
        } else {
            // Update the order status to FAILED
            await Order.updateStatus(razorpay_order_id, 'FAILED');
            res.status(400).json({ success: false, message: 'Transaction verification failed' });
        }
    } catch (error) {
        console.error('Error in verifyPayment:', error);
        res.status(500).json({ success: false, message: 'Failed to verify payment', error });
    }
};
