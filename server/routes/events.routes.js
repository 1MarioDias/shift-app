const express = require('express');
const router = express.Router();
const eventController = require('../controllers/events.controller');
const { authenticate, requireAuth, isAdmin } = require('../middlewares/auth.middleware');

// GET /events - Handles both public and admin views based on authentication
// The `authenticate` middleware will try to populate req.user if token is present.
// The `eventController.getEvents` will check req.user.role for admin access.
router.get('/', authenticate, eventController.getEvents);

// GET /events/:eventId - Get a specific event
// `authenticate` makes req.user available if token is sent. Controller handles auth for private events.
router.get('/:eventId', authenticate, eventController.getEventById);

// POST /events - Create a new event
// Requires user to be authenticated
router.post('/', authenticate, requireAuth, eventController.createEvent);

// PUT /events/:eventId - Update all data of a specific event
// Requires user to be authenticated. Controller handles if user is creator or admin.
router.put('/:eventId', authenticate, requireAuth, eventController.updateEvent);

// PATCH /events/:eventId - Update specific data of an event
// Requires user to be authenticated. Controller handles if user is creator or admin.
router.patch('/:eventId', authenticate, requireAuth, eventController.patchEvent);

// DELETE /events/:eventId - Delete an event
// Requires user to be authenticated. Controller handles if user is creator or admin.
router.delete('/:eventId', authenticate, requireAuth, eventController.deleteEvent);

module.exports = router;