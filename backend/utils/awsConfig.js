require('dotenv').config();
// Import the S3 client from AWS SDK v3
const { S3 } = require('@aws-sdk/client-s3');

// Create an S3 client instance

const s3 = new S3({
    region: 'eu-north-1', 
    requestTimeout: 60000,  // Timeout set to 60 seconds
    maxAttempts: 3,         // Retry failed requests up to 3 times // Your S3 region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Your S3 Bucket Name
const BUCKET_NAME = 'myawsfilebucket1';


module.exports = { s3, BUCKET_NAME };
