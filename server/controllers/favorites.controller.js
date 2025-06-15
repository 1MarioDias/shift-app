const { Op } = require('sequelize');
const { ErrorHandler } = require('../utils/error');
const Event = require('../models/events.model');
const User = require('../models/users.model');
const FavoriteEvent = require('../models/favoriteEvents.model');
const { buildEventResponse } = require('./events.controller'); // Re-use helper if suitable or adapt

// GET /favorites - Lista os Eventos Favoritos do Utilizador Autenticado
exports.listFavoriteEvents = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { page = 0, pageSize = 10 } = req.query;

        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (isNaN(pageNum) || pageNum < 0) throw new ErrorHandler(400, 'Invalid page number.');
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 50) throw new ErrorHandler(400, 'Page size must be between 1 and 50.');

        const userWithFavorites = await User.findByPk(userId, {
            include: [{
                model: Event,
                as: 'favoriteEvents',
                attributes: ['idEvento', 'titulo', 'descricao', 'data', 'hora', 'localizacao', 'tipoEvento', 'imagem'],
                through: {
                    attributes: ['dataFavorito'], // Include when it was favorited
                    as: 'favoritedDetails'
                },
                // Apply pagination to the included 'favoriteEvents'
                // This is a bit tricky with Sequelize's belongsToMany for direct pagination on the related model.
                // A more robust way for pagination is to query FavoriteEvent table directly.
            }],
        });

        if (!userWithFavorites) {
            // Should not happen if requireAuth is working
            return next(new ErrorHandler(404, 'User not found.'));
        }

        // Alternative and often better for pagination: Query FavoriteEvent directly
        const { count, rows } = await FavoriteEvent.findAndCountAll({
            where: { idUtilizador: userId },
            include: [{
                model: Event,
                as: 'event',
                attributes: ['idEvento', 'titulo', 'descricao', 'data', 'hora', 'localizacao', 'tipoEvento', 'imagem', 'isPublic'],
                include: [{ // Include organizer for authorName
                    model: User,
                    as: 'organizer',
                    attributes: ['nome']
                }]
            }],
            limit: pageSizeNum,
            offset: pageNum * pageSizeNum,
            order: [['dataFavorito', 'DESC']] // Order by when it was favorited
        });

        const formattedEvents = rows.map(fav => ({
            eventId: fav.event.idEvento,
            title: fav.event.titulo,
            image: fav.event.imagem, // Ensure this is the full Cloudinary URL
            description: fav.event.descricao,
            date: fav.event.data,
            time: fav.event.hora,
            datetime: `${fav.event.data}T${fav.event.hora}`,
            location: fav.event.localizacao,
            eventType: fav.event.tipoEvento,
            isPublic: fav.event.isPublic,
            authorName: fav.event.organizer ? fav.event.organizer.nome : 'Unknown Author',
            favoritedAt: fav.dataFavorito
        }));

        const totalPages = Math.ceil(count / pageSizeNum);
        const responseLinks = [];
        const basePath = `${req.baseUrl}`; // /favorites

        if (pageNum < totalPages - 1) {
            responseLinks.push({ rel: "next-page", href: `${basePath}?pageSize=${pageSizeNum}&page=${pageNum + 1}`, method: "GET" });
        }
        if (pageNum > 0) {
            responseLinks.push({ rel: "prev-page", href: `${basePath}?pageSize=${pageSizeNum}&page=${pageNum - 1}`, method: "GET" });
        }
        // Add a link to allow adding events (conceptually, points to general event creation)
        responseLinks.push({ rel: "add-event", href: "/events", method: "POST" });


        res.json({
            data: formattedEvents,
            pagination: {
                currentPage: pageNum,
                pageSize: pageSizeNum,
                totalItems: count,
                totalPages: totalPages
            },
            links: responseLinks
        });

    } catch (error) {
        console.error('Error in listFavoriteEvents:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// POST /favorites/:eventId - Marca um Evento como Favorito
exports.addEventToFavorites = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const eventId = parseInt(req.params.eventId, 10);

        if (isNaN(eventId)) {
            return next(new ErrorHandler(400, 'Invalid event ID.'));
        }

        const event = await Event.findByPk(eventId);
        if (!event) {
            return next(new ErrorHandler(404, `Event with ID ${eventId} not found.`));
        }

        const existingFavorite = await FavoriteEvent.findOne({
            where: { idUtilizador: userId, idEvento: eventId }
        });

        if (existingFavorite) {
            return next(new ErrorHandler(400, 'Event is already in favorites.'));
        }

        const newFavorite = await FavoriteEvent.create({
            idUtilizador: userId,
            idEvento: eventId
            // dataFavorito will use defaultValue
        });

        res.status(200).json({ // As per your spec, 200 OK for adding
            message: "Event added to favorites successfully.",
            favorite: {
                userId: newFavorite.idUtilizador,
                eventId: newFavorite.idEvento,
                favoritedAt: newFavorite.dataFavorito
            }
        });

    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             return next(new ErrorHandler(404, `Event with ID ${req.params.eventId} not found or user issue.`));
        }
        console.error('Error in addEventToFavorites:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// DELETE /favorites/:eventId - Remove um Evento dos Favoritos
exports.removeEventFromFavorites = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const eventId = parseInt(req.params.eventId, 10);

        if (isNaN(eventId)) {
            return next(new ErrorHandler(400, 'Invalid event ID.'));
        }

        const favorite = await FavoriteEvent.findOne({
            where: { idUtilizador: userId, idEvento: eventId }
        });

        if (!favorite) {
            return next(new ErrorHandler(404, `Event with ID ${eventId} not found in your favorites.`));
        }

        await favorite.destroy();
        res.status(204).send();

    } catch (error) {
        console.error('Error in removeEventFromFavorites:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};