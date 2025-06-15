const cloudinary = require('cloudinary').v2;
const path = require('path'); // For dotenv path resolution

// Ensure environment variables are loaded.
// If you load dotenv globally in your main app.js, this might not be strictly necessary here,
// but it's safe to include if this file might be required before global setup.
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("FATAL ERROR: Cloudinary environment variables are not set. Please check your .env file.");
    // process.exit(1); // Optionally exit if Cloudinary is critical
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Good practice to ensure HTTPS URLs
});

module.exports = cloudinary; // Export only the configured Cloudinary SDK instance