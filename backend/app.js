// Import dotenv to load environment variables
require('dotenv').config();

console.log('__dirname:', __dirname); // Should print the full path to the backend folder
console.log(process.env.JWT_SECRET); // Should output the secret key
console.log('Environment Variables:', process.env);

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Import Routes
const expenseRoutes = require('./routes/expenseRoutes');
const authenticate = require('./middleware/authenticate');
const premiumRoute = require('./routes/premium');
const userRoutes = require('./routes/userRoutes'); // Import userRoutes
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Import db from database.js
const db = require('./database');

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allows all origins
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve static pages (Ensure you have correct paths for static files)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/signup.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/signup.html'));
});

app.get('/login', (req, res) => {
    console.log('Login route hit');
    res.sendFile(path.join(__dirname, '../frontend/views/login.html'));
});

app.get('/expense', authenticate, (req, res) => {
    const token = req.query.token || req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    // Proceed to serve the expense page
    res.sendFile(path.join(__dirname, '../frontend/views/expense.html'));
});

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already registered!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

        // Generate JWT token
        const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Respond with token and user info
        res.status(200).json({
            message: 'User registered successfully',
            user: { id: result.insertId, name, email },
            token: token  // Include the token in the response
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Database error' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password!' });
        }

        // Check if JWT_SECRET is available in environment variables
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT secret is missing from environment variables' });
        }
        
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'User logged in successfully', token, userid: user.id });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Database error' });
    }
});

// Routes for other parts of your application
app.use('/expenses', expenseRoutes);
app.use('/premium', premiumRoute);
app.use('/users', userRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/password', forgotPasswordRoutes);
app.use('/report', authenticate, reportRoutes);

// Fallback route to serve signup.html for unknown paths
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/signup.html'));
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
