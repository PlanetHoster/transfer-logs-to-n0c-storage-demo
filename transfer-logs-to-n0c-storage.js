/**
 * Demonstrates how to transfer logs to N0C storage. This script is ran as a cron job.
 */

// load environment variables
require('dotenv').config(
    {
        path: __dirname + '/.env'
    }
);

const Minio = require('minio');
const fs = require('fs');

// Environment variables
const S3_BUCKET = process.env.S3_BUCKET;
const S3_HOST = process.env.S3_HOST;
const S3_PORT = parseInt(process.env.S3_PORT, 10);
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
const S3_SECRET_KEY = process.env.S3_SECRET_KEY;
const S3_SSL = process.env.S3_SSL === 'true';

const PATH_TO_LOGS = process.env.PATH_TO_LOGS;
const APPLICATION_LOG_FILENAME = process.env.APPLICATION_LOG_FILENAME;
const ERROR_LOG_FILENAME = process.env.ERROR_LOG_FILENAME;

const N0C_STORAGE_LOG_PATH = process.env.N0C_STORAGE_LOG_PATH;

// Dynamic variables
const APPLICATION_LOG_PATH = `${PATH_TO_LOGS}/${APPLICATION_LOG_FILENAME}`;
const ERROR_LOG_PATH = `${PATH_TO_LOGS}/${ERROR_LOG_FILENAME}`;

const TIMESTAMPED_FOLDER_NAME = new Date().toISOString().split('T').join('_');

const N0C_STORAGE_APPLICATION_LOG_PATH = `${N0C_STORAGE_LOG_PATH}${TIMESTAMPED_FOLDER_NAME}/${APPLICATION_LOG_FILENAME}`;
const N0C_STORAGE_ERROR_LOG_PATH = `${N0C_STORAGE_LOG_PATH}${TIMESTAMPED_FOLDER_NAME}/${ERROR_LOG_FILENAME}`;


// S3 client
const minioClient = new Minio.Client({
    endPoint: S3_HOST,
    port: S3_PORT,
    useSSL: S3_SSL,
    accessKey: S3_ACCESS_KEY,
    secretKey: S3_SECRET_KEY,
})

async function uploadToS3() {
    console.log('Starting file upload... 🚀');
    try {
        if (fs.existsSync(APPLICATION_LOG_PATH)) {
            console.log('Uploading application log... 📄');
            await minioClient.fPutObject(
                S3_BUCKET,
                N0C_STORAGE_APPLICATION_LOG_PATH,
                APPLICATION_LOG_PATH
            );
            console.log('Application log uploaded successfully! ✅');

            console.log('Removing application log... 🗑️');
            fs.unlinkSync(APPLICATION_LOG_PATH);
            console.log('Application log removed successfully! ✅');

            console.log('Recreating empty application log... 📝');
            fs.writeFileSync(APPLICATION_LOG_PATH, '');
            console.log('Application log recreated successfully! ✅');
        } else {
            console.log('Application log does not exist, skipping... ⚠️');
        }

        if (fs.existsSync(ERROR_LOG_PATH)) {
            console.log('Uploading error log... 📄');
            await minioClient.fPutObject(
                S3_BUCKET,
                N0C_STORAGE_ERROR_LOG_PATH,
                ERROR_LOG_PATH
            );
            console.log('Error log uploaded successfully! ✅');

            console.log('Removing error log... 🗑️');
            fs.unlinkSync(ERROR_LOG_PATH);
            console.log('Error log removed successfully! ✅');

            console.log('Recreating empty error log... 📝');
            fs.writeFileSync(ERROR_LOG_PATH, '');
            console.log('Error log recreated successfully! ✅');
        } else {
            console.log('Error log does not exist, skipping... ⚠️');
        }

        console.log('All files uploaded successfully! 🎉');
    } catch (error) {
        console.error('❌ Error uploading file:', error);
    }
}

// Run the upload function
(async () => {
    await uploadToS3();
})();
