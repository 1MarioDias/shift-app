const Event = require('../models/events.model');
const { Op } = require('sequelize');
const { ErrorHandler } = require('../utils/error');

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

        // Valida pageSize
        if (pageSize < 1 || pageSize > 100) {
            throw new ErrorHandler(400, 'pageSize must be between 1 and 100');
        }

        const whereClause = {};

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

        // isto está mal mas por agora funciona...
        if (isPublic) {
            whereClause.isPublic = isPublic === 'true';
        }

        if (organizerId) {
            whereClause.idUtilizador = organizerId;
        }

        // Execute query
        const { count, rows } = await Event.findAndCountAll({
            where: whereClause,
            limit: parseInt(pageSize),
            offset: parseInt(page) * parseInt(pageSize),
            order: [[sortBy, order.toUpperCase()]]
        });

        // response
        const events = rows.map(event => ({
            eventId: event.idEvento,
            title: event.titulo,
            image: event.imagem,
            description: event.descricao,
            date: event.data,
            location: event.localizacao,
            eventType: event.tipoEvento,
            isPublic: event.isPublic
        }));

        // envia response
        res.json({
            data: events,
            pagination: {
                currentPage: parseInt(page),
                pageSize: parseInt(pageSize),
                totalItems: count,
                totalPages: Math.ceil(count / parseInt(pageSize))
            },
            links: [{
                rel: 'next-page',
                href: `/events${req.path}?pageSize=${pageSize}&page=${parseInt(page) + 1}`,
                method: 'GET'
            }]
        });

    } catch (error) {
        next(error);
    }
};