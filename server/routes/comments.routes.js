const express = require('express');
const commentsController = require('../controllers/comments.controller');
const { authenticate, requireAuth, isAdmin } = require('../middlewares/auth.middleware');

// Router for event-specific comments (to be mounted under /events/:eventId/comments)
const eventCommentsRouter = express.Router({ mergeParams: true });

// GET /events/:eventId/comments - Lista os Comentários de um Evento específico
eventCommentsRouter.get('/', authenticate, commentsController.getCommentsForEvent);

// POST /events/:eventId/comments - Adiciona um Comentário num Evento específico
eventCommentsRouter.post('/', authenticate, requireAuth, commentsController.addCommentToEvent);


// Router for general/admin comments (to be mounted under /comments)
const generalCommentsRouter = express.Router();

// GET /comments - Moderador - Lista TODOS os comentários
generalCommentsRouter.get('/', authenticate, requireAuth, isAdmin, commentsController.getAllComments);

// DELETE /comments/:commentId - Deletes a comment (owner or admin)
// This route now requires authentication, and the controller handles authorization.
generalCommentsRouter.delete('/:commentId', authenticate, requireAuth, commentsController.deleteComment);

// Remove the old /mine route:
// generalCommentsRouter.delete('/mine/:commentId', authenticate, requireAuth, commentsController.deleteOwnComment);

module.exports = {
    eventCommentsRouter,
    generalCommentsRouter
};