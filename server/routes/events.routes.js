const express = require('express');
const router = express.Router();
const eventController = require('../controllers/events.controller');

// Public routes
router.get('/', eventController.getEvents);

// Admin route
router.get('/admin', eventController.getEvents);

module.exports = router;