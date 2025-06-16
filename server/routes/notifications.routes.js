const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { authenticate, requireAuth } = require('../middlewares/auth.middleware');

// GET /notifications - Lista as Notificações do Utilizador Autenticado
router.get('/', authenticate, requireAuth, notificationsController.listUserNotifications);

// PATCH /notifications/:notificationId - Alterar o Estado de uma notificação Lida/Não Lida
router.patch('/:notificationId', authenticate, requireAuth, notificationsController.updateNotificationStatus);

module.exports = router;