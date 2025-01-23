const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Generate report route
router.get('/generate', reportController.generateReport);

// Download report route
router.get('/download', reportController.downloadReport);

// Fetch download history route
router.get('/history', reportController.getDownloadHistory);

module.exports = router;
