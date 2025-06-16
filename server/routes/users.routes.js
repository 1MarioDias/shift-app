const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticate, isAdmin, requireAuth } = require('../middlewares/auth.middleware');

// Public routes
router.post('/', usersController.register); // Register
router.post('/login', usersController.login); // Login

// Protected routes (require valid token)
router.get('/me', authenticate, requireAuth, usersController.getUserProfile);

// Admin routes (require valid token + admin role)
router.get('/', authenticate, requireAuth, isAdmin, usersController.getAllUsers);
router.delete('/:userId', authenticate, requireAuth, isAdmin, usersController.deleteUser);

module.exports = router;