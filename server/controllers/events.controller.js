// ...existing code...
const Event = require('../models/events.model');
const User = require('../models/users.model');
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
            organizerId // This query param represents the author's ID
        } = req.query;

        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (isNaN(pageNum) || pageNum < 0) throw new ErrorHandler(400, 'Invalid page number.');
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) throw new ErrorHandler(400, 'Page size must be between 1 and 100.');

        const whereClause = {};
        const includeOptions = [];

        if (query) {
            whereClause[Op.or] = [
                { titulo: { [Op.like]: `%${query}%` } },
                { descricao: { [Op.like]: `%${query}%` } }
            ];
        }
        if (eventType) whereClause.tipoEvento = eventType;
        if (datetime) {
            // Assuming datetime is just a date for filtering. Adjust if it includes time.
            whereClause.data = { [Op.gte]: new Date(datetime).toISOString().split('T')[0] };
        }
        if (location) whereClause.localizacao = { [Op.like]: `%${location}%` };

        const isAdminAccess = req.user && req.user.role === 'Administrador';

        if (isAdminAccess) {
            if (isPublic !== undefined && (isPublic === 'true' || isPublic === 'false')) {
                whereClause.isPublic = isPublic === 'true';
            }
            // If admin filters by organizerId, it means they are filtering by the author of the event
            if (organizerId) {
                const orgIdNum = parseInt(organizerId, 10);
                if (!isNaN(orgIdNum)) {
                    whereClause.idAutor = orgIdNum; // Filter by idAutor
                } else {
                    throw new ErrorHandler(400, 'Invalid organizerId format.');
                }
            }
            includeOptions.push({
                model: User,
                as: 'organizer', // This alias must match the one in Event.belongsTo
                attributes: ['idUtilizador', 'nome'] // Select desired attributes from User
            });
        } else {
            whereClause.isPublic = true;
        }

        const { count, rows } = await Event.findAndCountAll({
            where: whereClause,
            include: includeOptions,
            limit: pageSizeNum,
            offset: pageNum * pageSizeNum,
            order: [[sortBy, order.toUpperCase()]],
            distinct: true
        });

        const formattedEvents = rows.map(event => {
            const baseEvent = {
                eventId: event.idEvento,
                title: event.titulo,
                image: event.imagem,
                description: event.descricao,
                date: event.data,
                hora: event.hora,
                location: event.localizacao,
                eventType: event.tipoEvento,
                // Add other fields from your model like dataCriacao, linksRelevantes if needed
                dataCriacao: event.dataCriacao,
                linksRelevantes: event.linksRelevantes
            };
            if (isAdminAccess && event.organizer) {
                return {
                    ...baseEvent,
                    isPublic: event.isPublic,
                    organizer: {
                        organizerId: event.organizer.idUtilizador, // This is the PK of the User table
                        organizerName: event.organizer.nome
                    }
                };
            }
            return baseEvent;
        });
        
        const totalPages = Math.ceil(count / pageSizeNum);
        const links = [];
        // ... (rest of your links and response logic) ...
        if (pageNum < totalPages - 1) {
            const nextPageParams = new URLSearchParams({
                pageSize: pageSizeNum,
                page: pageNum + 1,
                ...(query && { query }),
                ...(eventType && { eventType }),
                ...(datetime && { datetime }),
                ...(location && { location }),
                ...(sortBy && { sortBy }),
                ...(order && { order }),
                ...(isAdminAccess && isPublic !== undefined && { isPublic }),
                ...(isAdminAccess && organizerId && { organizerId }),
            });
            links.push({ rel: "next-page", href: `/events?${nextPageParams.toString()}`, method: "GET" });
        }
        if (!isAdminAccess) { 
             links.push({ rel: "add-event", href: "/events", method: "POST" });
        }

        res.json({
            data: formattedEvents,
            pagination: {
                currentPage: pageNum,
                pageSize: pageSizeNum,
                totalItems: count,
                totalPages: totalPages
            },
            links: links
        });

    } catch (error) {
        console.error('Error in getEvents controller:', error);
        if (error instanceof ErrorHandler && error.statusCode === 400) {
            return next(error);
        }
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};
// ...rest of the file if any