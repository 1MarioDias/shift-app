const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller'); // Renamed from authController for clarity
const { authenticate, isAdmin, requireAuth } = require('../middlewares/auth.middleware');

// Public routes
router.post('/', usersController.register); // Register
router.post('/login', usersController.login); // Login

// Protected routes (require valid token)
router.get('/me', authenticate, requireAuth, usersController.getUserProfile);

// Admin routes (require valid token + admin role)
router.get('/', authenticate, requireAuth, isAdmin, usersController.getAllUsers); // List all users
router.delete('/:userId', authenticate, requireAuth, isAdmin, usersController.deleteUser); // Delete a user

module.exports = router;