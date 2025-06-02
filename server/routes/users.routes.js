const express = require('express');
const router = express.Router();
const authController = require('../controllers/users.controller');

// Register
router.post('/', authController.register);

// Login
router.post('/login', authController.login);

module.exports = router;