const express = require('express');
const router = express.Router();
const eventController = require('../controllers/events.controller');

// Rota pública
router.get('/', eventController.getEvents);

// Rota de admin para obter TODOS os eventos, até os privados
router.get('/admin', 
    // Adicionar Auth middleware aqui
    (req, res, next) => {
        req.isAdmin = true;
        next();
    },
    eventController.getEvents
);

module.exports = router;