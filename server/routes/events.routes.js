const express = require('express');
const router = express.Router();
const eventController = require('../controllers/events.controller');
const { authenticate } = require('../middlewares/auth.middleware'); // isAdmin not directly needed here, controller checks role

// GET /events - Handles both public and admin views based on authentication
// The `authenticate` middleware will try to populate req.user if token is present.
// The `eventController.getEvents` will check req.user.role for admin access.
router.get('/', authenticate, eventController.getEvents);

// Potentially other event routes like POST, PUT, DELETE would need authenticate, requireAuth, and possibly isAdmin
// Example: router.post('/', authenticate, requireAuth, eventController.createEvent);
// Example: router.put('/:eventId', authenticate, requireAuth, eventController.updateEvent); // Could also check if user is organizer or admin

module.exports = router;