require('dotenv').config(); // Load environment variables from .env file
const sendgrid = require('@sendgrid/mail');
const User = require('../models/usermodel');
const ForgotPassword = require('../models/forgotPasswordModel');
const bcrypt = require('bcrypt');

// Set the SendGrid API key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// Controller for handling forgot password requests
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a reset token and store it in the database
        const token = await ForgotPassword.createResetToken(user.id);

        // Create the password reset link
        const resetLink = `http://localhost:4000/password/reset?token=${token}`;

        // Email message configuration
        const message = {
            to: email, // Recipient email address
            from: 'shruti122456@gmail.com', // Verified sender email
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
            html: `
                <p>You requested a password reset.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>If you didn't request this, you can safely ignore this email.</p>
            `,
        };

        // Send the email
        await sendgrid.send(message);

        res.json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
        console.error('Error in forgotPassword:', error.message);
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
};

// Controller for handling password reset
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        console.log('Reset password request:', { token, newPassword }); // Debug log

        // Verify if the token exists and is valid
        const resetRequest = await ForgotPassword.findByToken(token);
        if (!resetRequest) {
            console.error('Invalid or expired token:', token); // Debug log
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        console.log('Reset request data:', resetRequest); // Debug log
        const { userId } = resetRequest;

        if (!userId) {
            console.error('Missing userId in reset request:', resetRequest); // Debug log
            return res.status(400).json({ message: 'User not found for this token.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('Hashed password:', hashedPassword); // Debug log

        // Update the user's password in the database
        await User.updatePassword(userId, hashedPassword);
        console.log('Password updated for userId:', userId); // Debug log

        // Invalidate the token after use
        await ForgotPassword.invalidateToken(token);
        console.log('Token invalidated:', token); // Debug log

        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error in resetPassword:', error.message, error); // Debug log
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
};

