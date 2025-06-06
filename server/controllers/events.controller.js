const Event = require('../models/events.model');
const User = require('../models/users.model');
const { Op } = require('sequelize');
const { ErrorHandler } = require('../utils/error');

// Helper to build pagination and response links
const buildEventResponse = (req, pageNum, pageSizeNum, count, formattedEvents, queryParamsForLinks = {}) => {
    const totalPages = Math.ceil(count / pageSizeNum);
    const links = [];
    const basePath = req.baseUrl; // Should be /events

    if (pageNum < totalPages - 1) {
        const nextPageParams = new URLSearchParams({
            pageSize: pageSizeNum,
            page: pageNum + 1,
            ...queryParamsForLinks
        });
        links.push({ rel: "next-page", href: `${basePath}?${nextPageParams.toString()}`, method: "GET" });
    }
    if (pageNum > 0) {
        const prevPageParams = new URLSearchParams({
            pageSize: pageSizeNum,
            page: pageNum - 1,
            ...queryParamsForLinks
        });
        links.push({ rel: "prev-page", href: `${basePath}?${prevPageParams.toString()}`, method: "GET" });
    }
    // Add other relevant links if necessary, e.g., for creating an event
    // if (req.user) links.push({ rel: "add-event", href: "/events", method: "POST" });


    return {
        data: formattedEvents,
        pagination: {
            currentPage: pageNum,
            pageSize: pageSizeNum,
            totalItems: count,
            totalPages: totalPages
        },
        links: links
    };
};


// Main exported function for the GET /events route
exports.getEvents = async (req, res, next) => {
    // The 'authenticate' middleware populates req.user if a valid token is provided
    if (req.user && req.user.role === 'Administrador') {
        return _getAllEventsForAdmin(req, res, next);
    } else {
        return _getPublicEventsList(req, res, next);
    }
};

// Internal function to get events for Admin (all events, more filters)
async function _getAllEventsForAdmin(req, res, next) {
    try {
        const {
            query, eventType, datetime, location, page = 0, pageSize = 10,
            sortBy = 'data', order = 'asc', isPublic, organizerId
        } = req.query;

        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (isNaN(pageNum) || pageNum < 0) throw new ErrorHandler(400, 'Invalid page number.');
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) throw new ErrorHandler(400, 'Page size must be between 1 and 100.');

        const whereClause = {};
        const includeOptions = [{
            model: User,
            as: 'organizer',
            attributes: ['idUtilizador', 'nome'] // Ensure 'nome' is fetched
        }];
        const queryParamsForLinks = { sortBy, order }; // Base params for pagination links

        if (query) {
            whereClause[Op.or] = [
                { titulo: { [Op.like]: `%${query}%` } },
                { descricao: { [Op.like]: `%${query}%` } }
            ];
            queryParamsForLinks.query = query;
        }
        if (eventType) {
            whereClause.tipoEvento = eventType;
            queryParamsForLinks.eventType = eventType;
        }
        if (datetime) { // datetime is expected to be 'YYYY-MM-DD'
            const dateObj = new Date(datetime);
            if (!isNaN(dateObj.getTime()) && datetime.match(/^\d{4}-\d{2}-\d{2}$/)) {
                whereClause.data = datetime; // Exact match for DATEONLY field
                queryParamsForLinks.datetime = datetime;
            } else {
                console.warn(`Invalid date format for datetime filter: ${datetime}. Expected YYYY-MM-DD.`);
            }
        }
        if (location) {
            whereClause.localizacao = { [Op.like]: `%${location}%` };
            queryParamsForLinks.location = location;
        }
        // Admin can filter by isPublic status
        if (isPublic !== undefined && (isPublic === 'true' || isPublic === 'false')) {
            whereClause.isPublic = (isPublic === 'true');
            queryParamsForLinks.isPublic = isPublic;
        }
        if (organizerId) {
            const orgIdNum = parseInt(organizerId, 10);
            if (!isNaN(orgIdNum)) {
                whereClause.idAutor = orgIdNum; // This filters by idAutor
                queryParamsForLinks.organizerId = organizerId;
            } else {
                // It's good practice to throw an error for invalid input
                return next(new ErrorHandler(400, 'Invalid organizerId format. Must be an integer.'));
            }
        }

        const { count, rows } = await Event.findAndCountAll({
            where: whereClause,
            include: includeOptions,
            limit: pageSizeNum,
            offset: pageNum * pageSizeNum,
            order: [[sortBy, order.toUpperCase()]],
            distinct: true
        });

        const formattedEvents = rows.map(event => ({
            eventId: event.idEvento,
            title: event.titulo,
            image: event.imagem,
            description: event.descricao,
            date: event.data,
            hora: event.hora,
            location: event.localizacao,
            eventType: event.tipoEvento,
            dataCriacao: event.dataCriacao,
            linksRelevantes: event.linksRelevantes,
            isPublic: event.isPublic,
            authorName: event.organizer ? event.organizer.nome : 'Unknown Author', // Add authorName
            organizer: event.organizer ? { 
                organizerId: event.organizer.idUtilizador,
                organizerName: event.organizer.nome
            } : null
        }));
        
        const responsePayload = buildEventResponse(req, pageNum, pageSizeNum, count, formattedEvents, queryParamsForLinks);
        res.json(responsePayload);

    } catch (error) {
        console.error('Error in _getAllEventsForAdmin:', error);
        if (error instanceof ErrorHandler) return next(error);
        // Provide a generic error message for unexpected issues
        next(new ErrorHandler(500, 'An unexpected error occurred while fetching events for admin. Please try again later.'));
    }
}

// Internal function to get public events list (only public, limited filters)
async function _getPublicEventsList(req, res, next) {
    try {
        const {
            query, eventType, datetime, location, page = 0, pageSize = 8, 
            sortBy = 'data', order = 'desc' 
        } = req.query;

        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (isNaN(pageNum) || pageNum < 0) throw new ErrorHandler(400, 'Invalid page number.');
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 50) throw new ErrorHandler(400, 'Page size must be between 1 and 50 for public view.');

        const whereClause = { isPublic: true }; 
        const queryParamsForLinks = { sortBy, order }; 

        if (query) {
            whereClause[Op.or] = [
                { titulo: { [Op.like]: `%${query}%` } },
                { descricao: { [Op.like]: `%${query}%` } }
            ];
            queryParamsForLinks.query = query;
        }
        if (eventType) {
            whereClause.tipoEvento = eventType;
            queryParamsForLinks.eventType = eventType;
        }
        if (datetime) {
            whereClause.data = { [Op.gte]: new Date(datetime).toISOString().split('T')[0] };
            queryParamsForLinks.datetime = datetime;
        }
        if (location) {
            whereClause.localizacao = { [Op.like]: `%${location}%` };
            queryParamsForLinks.location = location;
        }
        
        const { count, rows } = await Event.findAndCountAll({
            where: whereClause,
            include: [{ // Include organizer to get author's name
                model: User,
                as: 'organizer',
                attributes: ['nome'] // Only fetch the name
            }],
            limit: pageSizeNum,
            offset: pageNum * pageSizeNum,
            order: [[sortBy, order.toUpperCase()]],
            distinct: true
        });

        const formattedEvents = rows.map(event => ({
            eventId: event.idEvento,
            title: event.titulo,
            image: event.imagem,
            description: event.descricao, 
            date: event.data,
            hora: event.hora,
            location: event.localizacao,
            eventType: event.tipoEvento,
            authorName: event.organizer ? event.organizer.nome : 'Unknown Author' // Add authorName
        }));

        const responsePayload = buildEventResponse(req, pageNum, pageSizeNum, count, formattedEvents, queryParamsForLinks);
        res.json(responsePayload);
    } catch (error) {
        console.error('Error in _getPublicEventsList:', error);
        if (error instanceof ErrorHandler) return next(error);
        next(new ErrorHandler(500, 'An unexpected error occurred while fetching public events. Please try again later.'));
    }
}