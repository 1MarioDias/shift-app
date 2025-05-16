const express = require('express');
const router = express.Router();
const eventController = require('../controllers/events.controller');

// Public routes
router.get('/', eventController.getEvents);

// Admin routes - make sure this comes after the public route
router.get('/admin', eventController.getEvents);

module.exports = router;