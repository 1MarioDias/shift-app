const Event = require('../models/events.model');
const User = require('../models/users.model');
const { Op } = require('sequelize');
const { ErrorHandler } = require('../utils/error');
const cloudinary = require('../config/cloudinaryConfig');

// Helper da paginação e response links
const buildEventResponse = (req, pageNum, pageSizeNum, count, formattedEvents, queryParamsForLinks = {}) => {
    const totalPages = Math.ceil(count / pageSizeNum);
    const links = [];
    const basePath = req.baseUrl;

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


// Main GET /events rota
exports.getEvents = async (req, res, next) => {
    if (req.user && req.user.role === 'Administrador') {
        return _getAllEventsForAdmin(req, res, next);
    } else {
        return _getPublicEventsList(req, res, next);
    }
};

// Events para o Admin (TODOS os events, e mais filtração)
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
            attributes: ['idUtilizador', 'nome']
        }];
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
            const dateObj = new Date(datetime);
            if (!isNaN(dateObj.getTime()) && datetime.match(/^\d{4}-\d{2}-\d{2}$/)) {
                whereClause.data = datetime;
                queryParamsForLinks.datetime = datetime;
            } else {
                console.warn(`Invalid date format for datetime filter: ${datetime}. Expected YYYY-MM-DD.`);
            }
        }
        if (location) {
            whereClause.localizacao = { [Op.like]: `%${location}%` };
            queryParamsForLinks.location = location;
        }
        // Filtro isPublic
        if (isPublic !== undefined && (isPublic === 'true' || isPublic === 'false')) {
            whereClause.isPublic = (isPublic === 'true');
            queryParamsForLinks.isPublic = isPublic;
        }
        if (organizerId) {
            const orgIdNum = parseInt(organizerId, 10);
            if (!isNaN(orgIdNum)) {
                whereClause.idAutor = orgIdNum;
                queryParamsForLinks.organizerId = organizerId;
            } else {
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
            authorName: event.organizer ? event.organizer.nome : 'Unknown Author',
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
        next(new ErrorHandler(500, 'An unexpected error occurred while fetching events for admin. Please try again later.'));
    }
}

// Eventos Públicos
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
            include: [{
                model: User,
                as: 'organizer',
                attributes: ['nome'] // vai buscar o nome à tabela utilizadores
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
            authorName: event.organizer ? event.organizer.nome : 'Unknown Author'
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
                attributes: ['idUtilizador', 'nome']
            }]
            // Adicionar contadores para participantes e lista de espera
            // juntar com as tabelas EventoParticipante e ListaEspera
            // usar Sequelize.fn('COUNT', ...)
        });

        if (!event) {
            return next(new ErrorHandler(404, `Event with ID ${eventId} not found.`));
        }

        // AUTH para private events
        if (!event.isPublic) {
            if (!req.user) {
                return next(new ErrorHandler(401, 'Authentication required to view this private event.'));
            }
            if (event.idAutor !== req.user.userId && req.user.role !== 'Administrador') {
                return next(new ErrorHandler(403, 'You do not have permission to view this private event.'));
            }
        }

        // placeholders para os contadores
        const currentParticipants = 0; // TODO: Implementar
        const onWaitingList = 0;       // TODO: Implementar

        const responseLinks = [];
        if (req.user && (event.idAutor === req.user.userId || req.user.role === 'Administrador')) {
            responseLinks.push({ rel: "delete", href: `/events/${event.idEvento}`, method: "DELETE" });
            responseLinks.push({ rel: "modify", href: `/events/${event.idEvento}`, method: "PUT" }); // Or PATCH
        }

        res.status(200).json({
            eventId: event.idEvento,
            title: event.titulo,
            image: event.imagem,
            description: event.descricao,
            date: event.data,
            time: event.hora,
            datetime: `${event.data}T${event.hora}`,
            location: event.localizacao,
            eventType: event.tipoEvento,
            organizer: event.organizer ? {
                organizerId: event.organizer.idUtilizador,
                organizerName: event.organizer.nome
            } : null,
            isPublic: event.isPublic,
            maxParticipants: event.maxParticipantes,
            currentParticipants,
            onWaitingList,
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

// POST /events
exports.createEvent = async (req, res, next) => {
    let tempImagePublicId = null;

    console.log('--- Create Event ---');
    console.log('req.file:', req.file); // DEBUG
    console.log('req.body:', req.body); // DEBUG

    try {
        const {
            title, description, eventType, eventDate, eventTime,
            location, maxParticipants, isPublic, linksRelevantes
        } = req.body;

        const idAutor = req.user.userId;

        if (!title) throw new ErrorHandler(400, 'The TITLE field cannot be empty.');

        let mp = null;
        if (maxParticipants !== undefined && maxParticipants !== null && maxParticipants !== '') {
            mp = parseInt(maxParticipants, 10);
            if (isNaN(mp) || mp <= 1) {
                throw new ErrorHandler(400, 'If provided, MAX PARTICIPANTS must be a number greater than 1.');
            }
        }

        let finalIsPublic = true;
        if (req.body.isPublic !== undefined) {
            if (typeof req.body.isPublic === 'boolean') {
                finalIsPublic = req.body.isPublic;
            } else if (req.body.isPublic === 'true') {
                finalIsPublic = true;
            } else if (req.body.isPublic === 'false') {
                finalIsPublic = false;
            } else {
                throw new ErrorHandler(400, 'The PRIVACY (isPublic) field must be a boolean (true/false) or string "true"/"false".');
            }
        }
        
        const combinedDateTime = `${eventDate}T${eventTime}`;
        const eventDateTime = new Date(combinedDateTime);
        if (isNaN(eventDateTime.getTime())) {
            throw new ErrorHandler(400, 'Invalid DATE or TIME format. Please use YYYY-MM-DD and HH:MM.');
        }
        if (eventDateTime <= new Date()) {
            throw new ErrorHandler(422, 'The event DATE and TIME must be in the future.');
        }

        let imageUrl = null;

        if (req.file) {
            console.log('req.file is PRESENT. Attempting Cloudinary upload.'); // DEBUG
            if (!req.file.buffer) {
                console.error('Error: req.file exists but req.file.buffer is missing.');
                return next(new ErrorHandler(500, 'File buffer is missing after upload.'));
            }
            try {
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'image',
                            folder: 'shift-app/events',
                        },
                        (error, result) => {
                            if (error) {
                                console.error('Cloudinary upload stream error:', error);
                                return reject(new ErrorHandler(500, `Cloudinary image upload failed: ${error.message}`));
                            }
                            resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });

                if (!result || !result.secure_url) {
                    console.error('Cloudinary upload did not return a secure URL. Result:', result);
                    return next(new ErrorHandler(500, 'Cloudinary upload did not return a secure URL.'));
                }
                imageUrl = result.secure_url;
                tempImagePublicId = result.public_id;
                console.log('Cloudinary upload successful. Image URL:', imageUrl); // DEBUG
            } catch (uploadError) {
                console.error('Catch block for Cloudinary upload error:', uploadError); // DEBUG
                const errorToPass = uploadError instanceof ErrorHandler ? uploadError : new ErrorHandler(500, `Image upload processing error: ${uploadError.message}`);
                return next(errorToPass);
            }
        } else {
            console.log('req.file is ABSENT. Using default hardcoded image.'); // DEBUG
            imageUrl = 'https://res.cloudinary.com/dbbypewvv/image/upload/v1749942289/cardImage_joengm.png';
        }

        const newEvent = await Event.create({
            idAutor,
            titulo: title,
            imagem: imageUrl,
            descricao: description,
            tipoEvento: eventType,
            data: eventDate,
            hora: eventTime,
            localizacao: location,
            maxParticipantes: mp,
            isPublic: finalIsPublic,
            linksRelevantes,
            cloudinaryId: tempImagePublicId
        });

        res.status(201).json({
            eventId: newEvent.idEvento,
            message: "Event created successfully.",
            event: newEvent 
        });

    } catch (error) {
        console.error('Outer catch block in createEvent:', error);
        // Rollback Cloudinary upload if an image was uploaded and a subsequent error occurred
        if (tempImagePublicId) {
            try {
                console.log(`Attempting to delete image ${tempImagePublicId} from Cloudinary due to error.`);
                await cloudinary.uploader.destroy(tempImagePublicId);
                console.log(`Successfully deleted image ${tempImagePublicId} from Cloudinary.`);
            } catch (deleteError) {
                console.error(`Failed to delete image ${tempImagePublicId} from Cloudinary after error:`, deleteError);
            }
        }

        if (error instanceof ErrorHandler) return next(error);
        if (error.name === 'SequelizeValidationError') {
            return next(new ErrorHandler(400, error.errors.map(e => e.message).join(', ')));
        }
        console.error('Unhandled error in createEvent controller (final catch):', error.name, error.message, error.stack);
        next(new ErrorHandler(500, 'Internal Server Error, please try again!'));
    }
};

// PUT /events/:eventId
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

        // AUTH
        if (event.idAutor !== req.user.userId && req.user.role !== 'Administrador') {
            return next(new ErrorHandler(403, 'Only the event creator or an administrator can modify this event.'));
        }

        // Não deixa mudar 12 horas antes do evento
        const eventStartDateTime = new Date(`${event.data}T${event.hora}`);
        const twelveHoursInMs = 12 * 60 * 60 * 1000;
        if (eventStartDateTime.getTime() - Date.now() < twelveHoursInMs && req.user.role !== 'Administrador') {
            return next(new ErrorHandler(403, 'Events cannot be modified less than 12 hours before start time by non-admins.'));
        }

        // validação
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
        if ((event.data !== eventDate || event.hora !== eventTime) && newEventDateTime <= new Date()) {
            throw new ErrorHandler(422, 'The DATE field must be in the future if changed.');
        }

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

// PATCH /events/:eventId
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

        // AUTH
        if (event.idAutor !== req.user.userId && req.user.role !== 'Administrador') {
            return next(new ErrorHandler(403, 'Only the event creator or an administrator can modify this event.'));
        }

        // 12-hour rule check
        const eventStartDateTime = new Date(`${event.data}T${event.hora}`);
        const twelveHoursInMs = 12 * 60 * 60 * 1000;
        if (eventStartDateTime.getTime() - Date.now() < twelveHoursInMs && req.user.role !== 'Administrador') {
            return next(new ErrorHandler(403, 'Events cannot be modified less than 12 hours before start time by non-admins.'));
        }

        const updateData = {};
        let changesMade = false;

        const fieldMapping = {
            'title': 'titulo',
            'description': 'descricao',
            'eventType': 'tipoEvento',
            'location': 'localizacao',
            'maxParticipants': 'maxParticipantes',
            'isPublic': 'isPublic',
            'linksRelevantes': 'linksRelevantes'
        };

        for (const [frontendField, value] of Object.entries(req.body)) {
            // Skip eventDate e eventTime
            if (frontendField === 'eventDate' || frontendField === 'eventTime') {
                continue;
            }
            
            if (fieldMapping[frontendField]) {
                updateData[fieldMapping[frontendField]] = value;
                changesMade = true;
            }
        }

        // separa eventDate e eventTime
        const newEventDate = req.body.eventDate || event.data;
        const newEventTime = req.body.eventTime || event.hora;

        if (req.body.eventDate || req.body.eventTime) {
            const newEventDateTime = new Date(`${newEventDate}T${newEventTime}`);
            if (isNaN(newEventDateTime.getTime())) {
                throw new ErrorHandler(400, 'Invalid DATE or TIME format provided for update.');
            }
            if (newEventDateTime <= new Date()) {
                throw new ErrorHandler(422, 'The DATE field must be in the future if changed.');
            }
            updateData.data = newEventDate;
            updateData.hora = newEventTime;
            changesMade = true;
        }

        if (updateData.titulo !== undefined) {
            if (!updateData.titulo) throw new ErrorHandler(400, 'The TITLE field cannot be empty.');
            if (updateData.titulo.length < 5 || updateData.titulo.length > 255) {
                throw new ErrorHandler(400, 'The TITLE field must be between 5 to 255 characters.');
            }
        }

        if (updateData.maxParticipantes !== undefined) {
            const mp = parseInt(updateData.maxParticipantes, 10);
            if (isNaN(mp) || mp <= 1) {
                throw new ErrorHandler(400, 'The MAX PARTICIPANTS must be greater than 1.');
            }
            if (req.user.role !== 'Administrador' && mp < event.maxParticipantes) {
                throw new ErrorHandler(400, 'The new MAX PARTICIPANTS value must be greater than or equal to the previous one for non-admins.');
            }
            updateData.maxParticipantes = mp;
        }

        if (updateData.isPublic !== undefined && typeof updateData.isPublic !== 'boolean') {
            throw new ErrorHandler(400, 'The isPublic field must be a boolean.');
        }

        if (!changesMade) {
            return next(new ErrorHandler(400, 'No valid fields provided for update.'));
        }

        // update
        await event.update(updateData);
        const updatedEvent = await Event.findByPk(eventId);

        res.status(200).json({
            eventId: updatedEvent.idEvento,
            message: "Event partially updated successfully.",
            updatedFields: Object.keys(updateData)
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

// DELETE /events/:eventId
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

        // AUTH
        const isCreator = event.idAutor === req.user.userId;
        const isAdmin = req.user.role === 'Administrador';

        if (!isCreator && !isAdmin) {
            return next(new ErrorHandler(403, 'You are not allowed to delete this event.'));
        }

        // 12h
        if (!isAdmin) {
            const eventStartDateTime = new Date(`${event.data}T${event.hora}`);
            const twelveHoursInMs = 12 * 60 * 60 * 1000;
            if (eventStartDateTime.getTime() - Date.now() < twelveHoursInMs) {
                return next(new ErrorHandler(403, 'Events cannot be deleted less than 12 hours before start time.'));
            }
        }

        await event.destroy();
        res.status(204).send();

    } catch (error) {
        if (error instanceof ErrorHandler) return next(error);
        console.error('Error in deleteEvent:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};