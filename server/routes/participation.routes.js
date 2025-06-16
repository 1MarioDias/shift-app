const express = require('express');
const router = express.Router({ mergeParams: true });
const participationController = require('../controllers/participation.controller');
const { authenticate, requireAuth } = require('../middlewares/auth.middleware');

// POST /events/:eventId/participations
router.post('/', authenticate, requireAuth, participationController.registerForEvent);

// DELETE /events/:eventId/participations
router.delete('/', authenticate, requireAuth, participationController.cancelParticipation);

module.exports = router;