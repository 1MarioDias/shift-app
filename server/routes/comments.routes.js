const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments.controller');
const { authenticate, isAdmin, requireAuth } = require('../middlewares/auth.middleware');

// rotas de admin para comentários
router.get('/', authenticate, requireAuth, isAdmin, commentsController.getAllComments);
router.delete('/:commentId', authenticate, requireAuth, isAdmin, commentsController.deleteComment);

module.exports = router;