const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites.controller');
const { authenticate, requireAuth } = require('../middlewares/auth.middleware');

// GET /favorites - Lista os Eventos Favoritos do Utilizador Autenticado
router.get('/', authenticate, requireAuth, favoritesController.listFavoriteEvents);

// POST /favorites/:eventId - Marca um Evento como Favorito
router.post('/:eventId', authenticate, requireAuth, favoritesController.addEventToFavorites);

// DELETE /favorites/:eventId - Remove um Evento dos Favoritos
router.delete('/:eventId', authenticate, requireAuth, favoritesController.removeEventFromFavorites);

module.exports = router;