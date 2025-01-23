const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
console.log('Imported User:', User);

const authenticate = async (req, res, next) => {
    try {
        // Debugging: Log the Authorization header
        console.log('Authorization Header:', req.header('Authorization'));
        let authHeader; // Use let because we'll assign the value conditionally

        // Check if req.query.token exists
        if (req.query.token) {
            authHeader = `Bearer ${req.query.token}`;
        } 
        // If not, check if req.header('Authorization') exists
        else if (req.header('Authorization')) {
            authHeader = req.header('Authorization');
        }

        console.log(authHeader);  // Log the final authHeader value
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error('No Authorization header or invalid format.');
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        // Debugging: Log the extracted token
        console.log('Extracted Token:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Debugging: Log the decoded token
        console.log('Decoded Token:', decoded);

        // Use findById instead of findByPk
        console.log('Decoded userId:', decoded.userId);

        const user = await User.findById(decoded.userId);

        if (!user) {
            console.error('User not found for decoded userId:', decoded.userId);
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Debugging: Log the user fetched from the database
        console.log('Authenticated User:', user);

        req.user = user;
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        // Debugging: Log the error details
        console.error('Authentication error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token has expired.' });
        }

        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

module.exports = authenticate;
