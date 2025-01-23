require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3, BUCKET_NAME } = require('../utils/awsConfig');
const Expense = require('../models/expenseModel');
const Report = require('../models/reportModel');
const { Upload } = require('@aws-sdk/lib-storage');

// Helper: Create PDF Report
const createPDF = (expenses, filter) => {
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
    }

    const doc = new PDFDocument({ margin: 50 });
    const pdfPath = path.join(reportsDir, `${filter}_report.pdf`);
    doc.pipe(fs.createWriteStream(pdfPath));

    // Add title and filter-specific header
    doc.fontSize(18).text(`Expense Report (${filter.toUpperCase()})`, { align: 'center' });
    if (filter === 'monthly') {
        const month = `Month: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        doc.fontSize(14).text(month, { align: 'center' });
    } else if (filter === 'yearly') {
        doc.fontSize(14).text('Yearly Summary', { align: 'center' });
    }
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    // Define table dimensions and headers
    const tableStartX = 50;
    const tableStartY = 150;
    const columnWidths = filter === 'yearly' ? [150, 100, 100, 100] : [100, 150, 100, 100, 100];
    const headers = filter === 'yearly'
        ? ['Month', 'Income', 'Expense', 'Savings']
        : ['Date', 'Description', 'Category', 'Income', 'Expense'];

    // Draw table headers with borders
    let y = tableStartY;
    doc.fontSize(10).font('Helvetica-Bold');
    headers.forEach((header, i) => {
        doc
            .rect(
                tableStartX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
                y,
                columnWidths[i],
                20
            )
            .stroke()
            .text(header, tableStartX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, y + 5, {
                width: columnWidths[i] - 10,
                align: 'center',
            });
    });
    y += 20;

    if (filter === 'yearly') {
        // Group expenses by month and calculate totals
        const monthlyData = {};
        expenses.forEach(exp => {
            const date = new Date(exp.created_at);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            const amount = parseFloat(exp.amount) || 0;
            const income = exp.category.toLowerCase() === 'salary' ? amount : 0;
            const expense = exp.category.toLowerCase() !== 'salary' ? amount : 0;
    
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = { income: 0, expense: 0 };
            }
    
            monthlyData[monthYear].income += income;
            monthlyData[monthYear].expense += expense;
        });
    
        // Initialize yearly totals
        let totalIncome = 0;
        let totalExpense = 0;
    
        // Draw table rows for each month
        doc.font('Helvetica');
        Object.entries(monthlyData).forEach(([monthYear, totals]) => {
            const income = totals.income.toFixed(2);
            const expense = totals.expense.toFixed(2);
            const savings = (totals.income - totals.expense).toFixed(2);
    
            // Accumulate totals for yearly summary
            totalIncome += parseFloat(income);
            totalExpense += parseFloat(expense);
    
            const row = [monthYear, income, expense, savings];
            row.forEach((cell, i) => {
                doc
                    .rect(
                        tableStartX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
                        y,
                        columnWidths[i],
                        20
                    )
                    .stroke()
                    .text(cell, tableStartX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, y + 5, {
                        width: columnWidths[i] - 10,
                        align: 'center',
                    });
            });
            y += 20;
        });
    
        // Add yearly summary row
        const totalSavings = (totalIncome - totalExpense).toFixed(2);
        const summaryRow = ['Yearly Totals', totalIncome.toFixed(2), totalExpense.toFixed(2), totalSavings];
    
        doc.font('Helvetica-Bold');
        summaryRow.forEach((cell, i) => {
            doc
                .rect(
                    tableStartX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
                    y,
                    columnWidths[i],
                    20
                )
                .stroke()
                .text(cell, tableStartX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, y + 5, {
                    width: columnWidths[i] - 10,
                    align: 'center',
                });
        });
    }
     else {
        // Monthly or daily report
        let totalIncome = 0;
        let totalExpense = 0;

        doc.font('Helvetica');
        expenses.forEach(exp => {
            const dateOnly = new Date(exp.created_at).toLocaleDateString();
            const amount = parseFloat(exp.amount) || 0;
            const income = exp.category.toLowerCase() === 'salary' ? amount : 0;
            const expense = exp.category.toLowerCase() !== 'salary' ? amount : 0;

            totalIncome += income;
            totalExpense += expense;

            const row = [dateOnly, exp.description, exp.category, income.toFixed(2), expense.toFixed(2)];
            row.forEach((cell, i) => {
                doc
                    .rect(
                        tableStartX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
                        y,
                        columnWidths[i],
                        20
                    )
                    .stroke()
                    .text(cell, tableStartX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, y + 5, {
                        width: columnWidths[i] - 10,
                        align: 'center',
                    });
            });
            y += 20;
        });

        const savings = totalIncome - totalExpense;
        const totalsRow = ['Totals', '', '', totalIncome.toFixed(2), totalExpense.toFixed(2)];
        const savingsRow = ['Savings', '', '', '', savings.toFixed(2)];

        [totalsRow, savingsRow].forEach(row => {
            row.forEach((cell, i) => {
                doc
                    .rect(
                        tableStartX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
                        y,
                        columnWidths[i],
                        20
                    )
                    .stroke()
                    .text(cell, tableStartX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, y + 5, {
                        width: columnWidths[i] - 10,
                        align: 'center',
                    });
            });
            y += 20;
        });
    }

    doc.end();
    return pdfPath;
};

// Controller: Generate Report
const generateReport = async (req, res) => {
    const userId = req.user.id;
    const filter = req.query.filter || 'all';

    try {
        if (!req.user.is_premium) {
            return res.status(401).json({ message: 'Unauthorized. Premium users only.' });
        }

        if (!['daily', 'monthly', 'yearly', 'all'].includes(filter)) {
            return res.status(400).json({ message: 'Invalid filter value' });
        }

        const expenses = await Expense.findAllByUser(userId, filter);
        const pdfPath = createPDF(expenses, filter);

        const pdfStream = fs.createReadStream(pdfPath);
        const upload = new Upload({
            client: s3,
            params: {
                Bucket: BUCKET_NAME,
                Key: `expense_reports/${userId}_${filter}_report.pdf`,
                Body: pdfStream,
                ContentType: 'application/pdf',
            },
        });

        await upload.done();

        const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/expense_reports/${userId}_${filter}_report.pdf`;

        await Report.create(userId, fileUrl);

        res.status(200).json({ fileUrl });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Failed to generate report' });
    }
};

// Controller: Download Report
const downloadReport = async (req, res) => {
    const fileUrl = req.query.fileUrl;
    const fileKey = fileUrl.split('/').pop();

    const params = {
        Bucket: BUCKET_NAME,
        Key: `expense_reports/${fileKey}`,
    };

    try {
        const downloadCommand = new GetObjectCommand(params);
        const fileData = await s3.send(downloadCommand);

        res.setHeader('Content-Disposition', `attachment; filename="${fileKey}"`);
        res.setHeader('Content-Type', 'application/pdf');
        fileData.Body.pipe(res);
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).json({ message: 'Failed to download report' });
    }
};

// Controller: Fetch Download History
// Controller: Fetch Download History
const getDownloadHistory = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is available via authentication middleware

    try {
        const history = await Report.findAllByUser(userId); // Fetch history from the database

        if (!history.length) {
            return res.status(404).json({ message: 'No download history found.' });
        }

        res.status(200).json({ history });
    } catch (error) {
        console.error('Error fetching download history:', error);
        res.status(500).json({ message: 'Failed to fetch download history.' });
    }
};


module.exports = {
    generateReport,
    downloadReport,
    getDownloadHistory,
};
