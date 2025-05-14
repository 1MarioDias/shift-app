const Event = require('../models/events.model');
const { Op } = require('sequelize');
const { ErrorHandler } = require('../utils/error');

// Filtros e paginação
exports.getEvents = async (req, res, next) => {
    try {
        const {
            query,
            eventType,
            datetime,
            location,
            page = 0,
            pageSize = 10,
            sortBy = 'data',
            order = 'asc',
            isPublic,
            organizerId
        } = req.query;

        // Validar pageSize
        if (pageSize < 1 || pageSize > 100) {
            throw new ErrorHandler(400, 'pageSize must be between 1 and 100');
        }

        const whereClause = {
            isPublic: true // Default listar eventos públicos
        };

        // Rota de Admmin, permitir ver eventos privados
        if (req.isAdmin && typeof isPublic !== 'undefined') {
            whereClause.isPublic = isPublic === 'true';
        }

        if (query) {
            whereClause[Op.or] = [
                { titulo: { [Op.like]: `%${query}%` } },
                { descricao: { [Op.like]: `%${query}%` } }
            ];
        }

        if (eventType) {
            whereClause.tipoEvento = eventType;
        }

        if (datetime) {
            whereClause.data = datetime;
        }

        if (location) {
            whereClause.localizacao = { [Op.like]: `%${location}%` };
        }

        if (organizerId && req.isAdmin) {
            whereClause.idUtilizador = organizerId;
        }

        // Query com paginação
        const { count, rows } = await Event.findAndCountAll({
            where: whereClause,
            limit: parseInt(pageSize),
            offset: parseInt(page) * parseInt(pageSize),
            order: [[sortBy, order.toUpperCase()]],
        });

        // resposta:
        const response = {
            data: rows.map(event => ({
                eventId: event.idEvento,
                title: event.titulo,
                image: event.imagem,
                description: event.descricao,
                date: event.data,
                location: event.localizacao,
                eventType: event.tipoEvento,
                ...(req.isAdmin && {
                    isPublic: event.isPublic,
                    organizerId: event.idUtilizador
                })
            })),
            pagination: {
                currentPage: parseInt(page),
                pageSize: parseInt(pageSize),
                totalItems: count,
                totalPages: Math.ceil(count / pageSize)
            },
            links: []
        };

        // links
        if (parseInt(page) < Math.ceil(count / pageSize) - 1) {
            response.links.push({
                rel: "next-page",
                href: `/events?pageSize=${pageSize}&page=${parseInt(page) + 1}`,
                method: "GET"
            });
        }

        if (!req.isAdmin) {
            response.links.push({
                rel: "add-event",
                href: "/events",
                method: "POST"
            });
        }

        res.status(200).json(response);

    } catch (error) {
        next(error);
    }
};