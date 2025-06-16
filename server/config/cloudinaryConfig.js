const cloudinary = require('cloudinary').v2;
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("FATAL ERROR: Cloudinary environment variables are not set. Please check your .env file.");
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

module.exports = cloudinary;