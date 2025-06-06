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
};

exports.getEventById = async (req, res, next) => {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        if (isNaN(eventId)) {
            return next(new ErrorHandler(400, 'Invalid event ID.'));
        }

        const event = await Event.findByPk(eventId, {
            include: [{
                model: User,
                as: 'organizer',
                attributes: ['idUtilizador', 'nome'] // Fetch organizer details
            }]
            // Later, you might want to include counts for participants and waiting list
            // This would require joining with EventoParticipante and ListaEspera tables
            // and using Sequelize.fn('COUNT', ...)
        });

        if (!event) {
            return next(new ErrorHandler(404, `Event with ID ${eventId} not found.`));
        }

        // Authorization for private events
        if (!event.isPublic) {
            if (!req.user) { // No token provided
                return next(new ErrorHandler(401, 'Authentication required to view this private event.'));
            }
            // If private, user must be the organizer or an admin to view
            if (event.idAutor !== req.user.userId && req.user.role !== 'Administrador') {
                return next(new ErrorHandler(403, 'You do not have permission to view this private event.'));
            }
        }

        // Placeholder for participant counts - requires more complex queries
        const currentParticipants = 0; // TODO: Implement actual count
        const onWaitingList = 0;       // TODO: Implement actual count

        const responseLinks = [];
        // Add modify/delete links if user is organizer or admin
        if (req.user && (event.idAutor === req.user.userId || req.user.role === 'Administrador')) {
            responseLinks.push({ rel: "delete", href: `/events/${event.idEvento}`, method: "DELETE" });
            responseLinks.push({ rel: "modify", href: `/events/${event.idEvento}`, method: "PUT" }); // Or PATCH
        }

        res.status(200).json({
            eventId: event.idEvento,
            title: event.titulo,
            image: event.imagem,
            description: event.descricao,
            date: event.data, // YYYY-MM-DD
            time: event.hora, // HH:MM:SS
            datetime: `${event.data}T${event.hora}`, // Combined for convenience, adjust timezone as needed
            location: event.localizacao,
            eventType: event.tipoEvento,
            organizer: event.organizer ? {
                organizerId: event.organizer.idUtilizador,
                organizerName: event.organizer.nome
            } : null,
            isPublic: event.isPublic,
            maxParticipants: event.maxParticipantes,
            currentParticipants, // Placeholder
            onWaitingList,       // Placeholder
            linksRelevantes: event.linksRelevantes,
            createdAt: event.dataCriacao,
            links: responseLinks
        });

    } catch (error) {
        if (error instanceof ErrorHandler) return next(error);
        console.error('Error in getEventById:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// POST /events - Create a new event
exports.createEvent = async (req, res, next) => {
    try {
        const {
            title,
            image, // Assuming image is a filename or URL string
            description,
            eventType,
            eventDate, // Expecting YYYY-MM-DD
            eventTime, // Expecting HH:MM or HH:MM:SS
            location,
            maxParticipants,
            isPublic = true, // Default to true (1 in DB)
            linksRelevantes // Changed from 'links' to match model
        } = req.body;

        const idAutor = req.user.userId;

        // --- Validation ---
        if (!title) throw new ErrorHandler(400, 'The TITLE field cannot be empty.');
        if (title.length < 5 || title.length > 255) { // Adjusted max length to DB
            throw new ErrorHandler(400, 'The TITLE field must be between 5 to 255 characters.');
        }
        if (!image) throw new ErrorHandler(400, 'The IMAGE field is required.'); // As per plan
        if (!eventType) throw new ErrorHandler(400, 'The EVENT TYPE field is required.');
        if (!eventDate) throw new ErrorHandler(400, 'The DATE field is required.');
        if (!eventTime) throw new ErrorHandler(400, 'The TIME field is required.');
        if (!location) throw new ErrorHandler(400, 'The LOCATION field is required.');

        const mp = parseInt(maxParticipants, 10);
        if (isNaN(mp) || mp <= 1) {
            throw new ErrorHandler(400, 'The MAX PARTICIPANTS must be greater than 1.');
        }
        if (typeof isPublic !== 'boolean') {
             throw new ErrorHandler(400, 'The PRIVACY field (isPublic) is required and must be a boolean.');
        }

        // Validate date and time format and if it's in the future
        const combinedDateTime = `${eventDate}T${eventTime}`;
        const eventDateTime = new Date(combinedDateTime);
        if (isNaN(eventDateTime.getTime())) {
            throw new ErrorHandler(400, 'Invalid DATE or TIME format.');
        }
        if (eventDateTime <= new Date()) {
            throw new ErrorHandler(422, 'The DATE field must be in the future.');
        }
        // --- End Validation ---

        const newEvent = await Event.create({
            idAutor,
            titulo: title,
            imagem: image,
            descricao,
            tipoEvento: eventType,
            data: eventDate,
            hora: eventTime,
            localizacao: location,
            maxParticipantes: mp,
            isPublic,
            linksRelevantes,
            // dataCriacao is handled by defaultValue
            // estado is handled by defaultValue
            // visualizacoes is handled by defaultValue
        });

        res.status(201).json({
            eventId: newEvent.idEvento,
            message: "Event created successfully."
        });

    } catch (error) {
        if (error instanceof ErrorHandler) return next(error);
        if (error.name === 'SequelizeValidationError') {
            return next(new ErrorHandler(400, error.errors.map(e => e.message).join(', ')));
        }
        console.error('Error in createEvent:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// PUT /events/:eventId - Update all data of a specific event
exports.updateEvent = async (req, res, next) => {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        if (isNaN(eventId)) {
            return next(new ErrorHandler(400, 'Invalid event ID.'));
        }

        const {
            title,
            image,
            description,
            eventType,
            eventDate,
            eventTime,
            location,
            maxParticipants,
            isPublic,
            linksRelevantes
        } = req.body;

        const event = await Event.findByPk(eventId);
        if (!event) {
            return next(new ErrorHandler(404, `Event with ID ${eventId} not found.`));
        }

        // Authorization: Only event creator or admin can modify
        if (event.idAutor !== req.user.userId && req.user.role !== 'Administrador') {
            return next(new ErrorHandler(403, 'Only the event creator or an administrator can modify this event.'));
        }

        // Business Rule: Cannot modify less than 12 hours before start
        const eventStartDateTime = new Date(`${event.data}T${event.hora}`);
        const twelveHoursInMs = 12 * 60 * 60 * 1000;
        if (eventStartDateTime.getTime() - Date.now() < twelveHoursInMs && req.user.role !== 'Administrador') {
            return next(new ErrorHandler(403, 'Events cannot be modified less than 12 hours before start time by non-admins.'));
        }

        // --- Validation (similar to POST, all fields required for PUT) ---
        if (!title) throw new ErrorHandler(400, 'The TITLE field cannot be empty.');
        if (title.length < 5 || title.length > 255) {
             throw new ErrorHandler(400, 'The TITLE field must be between 5 to 255 characters.');
        }
        if (!image) throw new ErrorHandler(400, 'The IMAGE field is required.');
        if (!eventType) throw new ErrorHandler(400, 'The EVENT TYPE field is required.');
        if (!eventDate) throw new ErrorHandler(400, 'The DATE field is required.');
        if (!eventTime) throw new ErrorHandler(400, 'The TIME field is required.');
        if (!location) throw new ErrorHandler(400, 'The LOCATION field is required.');
        const mp = parseInt(maxParticipants, 10);
        if (isNaN(mp) || mp <= 1) {
            throw new ErrorHandler(400, 'The MAX PARTICIPANTS must be greater than 1.');
        }
        if (typeof isPublic !== 'boolean') {
            throw new ErrorHandler(400, 'The isPublic field is required and must be a boolean.');
        }
        const newEventDateTime = new Date(`${eventDate}T${eventTime}`);
        if (isNaN(newEventDateTime.getTime())) {
            throw new ErrorHandler(400, 'Invalid DATE or TIME format.');
        }
        // For PUT, if date is changed, it must be in the future. If not changed, this check might be skipped or adjusted.
        // For simplicity, if date/time is provided, it's validated.
        if ((event.data !== eventDate || event.hora !== eventTime) && newEventDateTime <= new Date()) {
            throw new ErrorHandler(422, 'The DATE field must be in the future if changed.');
        }
        // --- End Validation ---

        await event.update({
            titulo: title,
            imagem: image,
            descricao,
            tipoEvento: eventType,
            data: eventDate,
            hora: eventTime,
            localizacao: location,
            maxParticipantes: mp,
            isPublic,
            linksRelevantes
        });

        res.status(200).json({
            eventId: event.idEvento,
            message: "Event updated successfully."
        });

    } catch (error) {
        if (error instanceof ErrorHandler) return next(error);
        if (error.name === 'SequelizeValidationError') {
            return next(new ErrorHandler(400, error.errors.map(e => e.message).join(', ')));
        }
        console.error('Error in updateEvent:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// PATCH /events/:eventId - Update specific data of an event
exports.patchEvent = async (req, res, next) => {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        if (isNaN(eventId)) {
            return next(new ErrorHandler(400, 'Invalid event ID.'));
        }

        const event = await Event.findByPk(eventId);
        if (!event) {
            return next(new ErrorHandler(404, `Event with ID ${eventId} not found.`));
        }

        // Authorization
        if (event.idAutor !== req.user.userId && req.user.role !== 'Administrador') {
            return next(new ErrorHandler(403, 'Only the event creator or an administrator can modify this event.'));
        }

        // Business Rule: 12 hours
        const eventStartDateTime = new Date(`${event.data}T${event.hora}`);
        const twelveHoursInMs = 12 * 60 * 60 * 1000;
        if (eventStartDateTime.getTime() - Date.now() < twelveHoursInMs && req.user.role !== 'Administrador') {
             return next(new ErrorHandler(403, 'Events cannot be modified less than 12 hours before start time by non-admins.'));
        }

        const updateData = {};
        const allowedFields = ['title', 'image', 'description', 'eventType', 'eventDate', 'eventTime', 'location', 'maxParticipants', 'isPublic', 'linksRelevantes'];
        let changesMade = false;

        for (const key in req.body) {
            if (allowedFields.includes(key)) {
                updateData[key] = req.body[key];
                changesMade = true;
            }
        }

        if (!changesMade) {
            return next(new ErrorHandler(400, 'No valid fields provided for update.'));
        }

        // --- Validation for provided fields ---
        if (updateData.title !== undefined) {
            if (!updateData.title) throw new ErrorHandler(400, 'The TITLE field cannot be empty.');
            if (updateData.title.length < 5 || updateData.title.length > 255) {
                throw new ErrorHandler(400, 'The TITLE field must be between 5 to 255 characters.');
            }
        }
        if (updateData.maxParticipants !== undefined) {
            const mp = parseInt(updateData.maxParticipants, 10);
            if (isNaN(mp) || mp <= 1) {
                throw new ErrorHandler(400, 'The MAX PARTICIPANTS must be greater than 1.');
            }
            // Plan specific rule: new MAX PARTICIPANTS must be >= previous.
            // This rule might be too restrictive if an admin needs to lower it for some reason.
            // For now, implementing as per plan for non-admins.
            if (req.user.role !== 'Administrador' && mp < event.maxParticipantes) {
                 throw new ErrorHandler(400, 'The new MAX PARTICIPANTS value must be greater than or equal to the previous one.');
            }
            updateData.maxParticipants = mp;
        }
        if (updateData.isPublic !== undefined && typeof updateData.isPublic !== 'boolean') {
            throw new ErrorHandler(400, 'The isPublic field must be a boolean.');
        }

        const newEventDate = updateData.eventDate || event.data;
        const newEventTime = updateData.eventTime || event.hora;

        if (updateData.eventDate || updateData.eventTime) {
            const newEventDateTime = new Date(`${newEventDate}T${newEventTime}`);
            if (isNaN(newEventDateTime.getTime())) {
                throw new ErrorHandler(400, 'Invalid DATE or TIME format provided for update.');
            }
            if (newEventDateTime <= new Date()) {
                throw new ErrorHandler(422, 'The DATE field must be in the future if changed.');
            }
            updateData.data = newEventDate; // Map to DB field
            updateData.hora = newEventTime; // Map to DB field
            delete updateData.eventDate;
            delete updateData.eventTime;
        }
        // --- End Validation ---

        await event.update(updateData);
        const updatedEvent = await Event.findByPk(eventId); // Fetch again to get all fields

        res.status(200).json({
            eventId: updatedEvent.idEvento,
            // Return only the fields that were actually updated as per plan example
            // Or return the full updated event resource
            // For simplicity, returning a success message and ID.
            // To match plan:
            // ...Object.fromEntries(Object.entries(updateData).filter(([key]) => allowedFields.includes(key)))
            message: "Event partially updated successfully.",
            updatedFields: Object.keys(updateData) // Show what was attempted to update
        });

    } catch (error) {
        if (error instanceof ErrorHandler) return next(error);
        if (error.name === 'SequelizeValidationError') {
            return next(new ErrorHandler(400, error.errors.map(e => e.message).join(', ')));
        }
        console.error('Error in patchEvent:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// DELETE /events/:eventId - Delete an event
exports.deleteEvent = async (req, res, next) => {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        if (isNaN(eventId)) {
            return next(new ErrorHandler(400, 'Invalid event ID.'));
        }

        const event = await Event.findByPk(eventId);
        if (!event) {
            return next(new ErrorHandler(404, `Event with ID ${eventId} not found.`));
        }

        // Authorization
        const isCreator = event.idAutor === req.user.userId;
        const isAdmin = req.user.role === 'Administrador';

        if (!isCreator && !isAdmin) {
            return next(new ErrorHandler(403, 'You are not allowed to delete this event.'));
        }

        // Business Rule: 12 hours (only for non-admins)
        if (!isAdmin) {
            const eventStartDateTime = new Date(`${event.data}T${event.hora}`);
            const twelveHoursInMs = 12 * 60 * 60 * 1000;
            if (eventStartDateTime.getTime() - Date.now() < twelveHoursInMs) {
                return next(new ErrorHandler(403, 'Events cannot be deleted less than 12 hours before start time.'));
            }
        }

        await event.destroy();
        res.status(204).send(); // No content

    } catch (error) {
        if (error instanceof ErrorHandler) return next(error);
        console.error('Error in deleteEvent:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};