const express = require('express');
const commentsController = require('../controllers/comments.controller');
const { authenticate, requireAuth, isAdmin } = require('../middlewares/auth.middleware');

const eventCommentsRouter = express.Router({ mergeParams: true });

// GET /events/:eventId/comments - Lista os Comentários de um Evento específico
eventCommentsRouter.get('/', authenticate, commentsController.getCommentsForEvent);

// POST /events/:eventId/comments - Adiciona um Comentário num Evento específico
eventCommentsRouter.post('/', authenticate, requireAuth, commentsController.addCommentToEvent);

const generalCommentsRouter = express.Router();
// dá handle às rotas de comentários gerais

// GET /comments - Moderador - Lista TODOS os comentários
generalCommentsRouter.get('/', authenticate, requireAuth, isAdmin, commentsController.getAllComments);

// DELETE /comments/:commentId - apaga o comentário - admin ou autor do comentário
generalCommentsRouter.delete('/:commentId', authenticate, requireAuth, commentsController.deleteComment);

module.exports = {
    eventCommentsRouter,
    generalCommentsRouter
};