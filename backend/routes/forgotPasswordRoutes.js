const express = require('express');
const forgotPasswordController = require('../controllers/forgotPasswordController');
const router = express.Router();

// Forgot password route
router.post('/forgotpassword', forgotPasswordController.forgotPassword);

// Reset password route
router.post('/resetpassword', forgotPasswordController.resetPassword);
// Serve the reset password page
router.get('/reset', (req, res) => {
    const { token } = req.query;

    // Serve a simple form with the token included in a hidden input
    res.send(`
        <html>
            <head>
                <title>Reset Password</title>
            </head>
            <body>
                <form id="reset-password-form">
                    <input type="hidden" name="token" value="${token}" />
                    <label for="newPassword">New Password:</label>
                    <input type="password" id="newPassword" name="newPassword" required />
                    <button type="submit">Reset Password</button>
                </form>

                <script>
                    // JavaScript to handle form submission
                    document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
                        e.preventDefault(); // Prevent the default form submission

                        const token = document.querySelector('input[name="token"]').value; // Get token
                        const newPassword = document.getElementById('newPassword').value; // Get new password

                        if (!token || !newPassword) {
                            alert('Token or password missing!');
                            return;
                        }

                        try {
                            const response = await fetch('http://localhost:4000/password/resetpassword', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ token, newPassword }), // Send token and new password
                            });

                            const data = await response.json();
                            alert(data.message); // Show the response message from the server
                        } catch (error) {
                            console.error('Error resetting password:', error);
                            alert('Something went wrong. Please try again.');
                        }
                    });
                </script>
            </body>
        </html>
    `);
});


module.exports = router;
