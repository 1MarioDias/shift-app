const express = require('express');
const router = express.Router();
const eventController = require('../controllers/events.controller');
const { authenticate, requireAuth, isAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { eventCommentsRouter } = require('../routes/comments.routes.js');

// GET /events - Trata das visualizações públicas e de administrador com base na autenticação
// O middleware `authenticate` tentará preencher req.user se o token estiver presente.
// O `eventController.getEvents` verificará req.user.role para acesso de administrador.
router.get('/', authenticate, eventController.getEvents);

// GET /events/:eventId - Obtém um evento específico
// `authenticate` torna req.user disponível se o token for enviado. O Controller trata da autenticação para eventos privados.
router.get('/:eventId', authenticate, eventController.getEventById);

// POST /events - Cria um novo evento
// Requer que o utilizador esteja autenticado
router.post('/', authenticate, requireAuth, upload.single('eventImage'), eventController.createEvent);

router.use('/:eventId/comments', eventCommentsRouter);

// PUT /events/:eventId - Atualiza todos os dados de um evento específico
// Requer que o utilizador esteja autenticado. O Controller verifica se o utilizador é o criador ou administrador.
router.put('/:eventId', authenticate, requireAuth, eventController.updateEvent);

// PATCH /events/:eventId - Atualiza dados específicos de um evento
// Requer que o utilizador esteja autenticado. O Controller verifica se o utilizador é o criador ou administrador.
router.patch('/:eventId', authenticate, requireAuth, eventController.patchEvent);

// DELETE /events/:eventId - Elimina um evento
// Requer que o utilizador esteja autenticado. O Controller verifica se o utilizador é o criador ou administrador.
router.delete('/:eventId', authenticate, requireAuth, eventController.deleteEvent);

module.exports = router;