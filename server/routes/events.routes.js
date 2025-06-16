const express = require('express');
const router = express.Router();
const eventController = require('../controllers/events.controller');
const { authenticate, requireAuth, isAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { eventCommentsRouter } = require('../routes/comments.routes.js');
const participationRouter = require('./participation.routes.js');

// GET /events - Trata das visualizações públicas e de administrador com base na autenticação
router.get('/', authenticate, eventController.getEvents);

// GET /events/:eventId - Obtém um evento específico
router.get('/:eventId', authenticate, eventController.getEventById);

// POST /events - Cria um novo evento
router.post('/', authenticate, requireAuth, upload.single('eventImage'), eventController.createEvent);

router.use('/:eventId/comments', eventCommentsRouter);

router.use('/:eventId/participations', participationRouter);

// PUT /events/:eventId - Atualiza todos os dados de um evento específico
router.put('/:eventId', authenticate, requireAuth, eventController.updateEvent);

// PATCH /events/:eventId - Atualiza dados específicos de um evento
router.patch('/:eventId', authenticate, requireAuth, eventController.patchEvent);

// DELETE /events/:eventId - Elimina um evento
router.delete('/:eventId', authenticate, requireAuth, eventController.deleteEvent);

module.exports = router;