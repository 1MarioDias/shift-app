const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticate, isAdmin, requireAuth } = require('../middlewares/auth.middleware');
const participationController = require('../controllers/participation.controller');

// Public routes
router.post('/', usersController.register); // Register
router.post('/login', usersController.login); // Login

// Protected routes (require valid token)
router.get('/me', authenticate, requireAuth, usersController.getUserProfile);

// rotas para participações e lista de espera
router.get('/me/participations', authenticate, requireAuth, participationController.listUserParticipations);
router.get('/me/waitlist', authenticate, requireAuth, participationController.listUserWaitingList);

// Admin routes (require valid token + admin role)
router.get('/', authenticate, requireAuth, isAdmin, usersController.getAllUsers);
router.delete('/:userId', authenticate, requireAuth, isAdmin, usersController.deleteUser);

module.exports = router;