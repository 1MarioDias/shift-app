const Comment = require('../models/comments.model');
const User = require('../models/users.model');
const Event = require('../models/events.model');
// const EventParticipant = require('../models/eventParticipants.model'); // Assuming you have this model
const { Op } = require('sequelize');
const { ErrorHandler } = require('../utils/error');

// Helper to format comment response
const formatCommentResponse = (comment) => {
    return {
        commentId: comment.idComentario,
        text: comment.conteudo,
        date: comment.dataComentario,
        user: comment.commenter ? {
            userId: comment.commenter.idUtilizador,
            userName: comment.commenter.nome
        } : null,
        eventId: comment.idEvento,
        eventTitle: comment.commentedEvent ? comment.commentedEvent.titulo : null // If event details are included
    };
};

// GET /events/:eventId/comments - Lista os Comentários de um Evento específico
exports.getCommentsForEvent = async (req, res, next) => {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        const { page = 0, pageSize = 10 } = req.query;

        if (isNaN(eventId)) {
            return next(new ErrorHandler(400, 'Invalid event ID.'));
        }

        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (isNaN(pageNum) || pageNum < 0) throw new ErrorHandler(400, 'Invalid page number.');
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 50) throw new ErrorHandler(400, 'Page size must be between 1 and 50.');

        const event = await Event.findByPk(eventId);
        if (!event) {
            return next(new ErrorHandler(404, `Event with ID ${eventId} not found.`));
        }

        // Authorization for private events
        if (!event.isPublic) {
            if (!req.user) { // authenticate middleware should run before this
                return next(new ErrorHandler(401, 'Authentication required to view comments for this private event.'));
            }
            // Allow if user is organizer or admin
            if (event.idAutor !== req.user.userId && req.user.role !== 'Administrador') {
                return next(new ErrorHandler(403, 'You do not have permission to view comments for this private event.'));
            }
        }

        const { count, rows } = await Comment.findAndCountAll({
            where: { idEvento: eventId },
            include: [{
                model: User,
                as: 'commenter',
                attributes: ['idUtilizador', 'nome']
            }],
            limit: pageSizeNum,
            offset: pageNum * pageSizeNum,
            order: [['dataComentario', 'DESC']]
        });

        const formattedComments = rows.map(formatCommentResponse);
        const totalPages = Math.ceil(count / pageSizeNum);
        const responseLinks = [];
        const basePath = `/events/${eventId}/comments`;

        if (pageNum < totalPages - 1) {
            responseLinks.push({ rel: "next-page", href: `${basePath}?pageSize=${pageSizeNum}&page=${pageNum + 1}`, method: "GET" });
        }
        if (pageNum > 0) {
            responseLinks.push({ rel: "prev-page", href: `${basePath}?pageSize=${pageSizeNum}&page=${pageNum - 1}`, method: "GET" });
        }
        if (req.user) { // Only show add-comment link if user is authenticated
             responseLinks.push({ rel: "add-comment", href: `/events/${eventId}/comments`, method: "POST" });
        }


        res.json({
            data: formattedComments,
            pagination: {
                currentPage: pageNum,
                pageSize: pageSizeNum,
                totalItems: count,
                totalPages: totalPages
            },
            links: responseLinks
        });

    } catch (error) {
        console.error('Error in getCommentsForEvent:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// POST /events/:eventId/comments - Adiciona um Comentário num Evento específico
exports.addCommentToEvent = async (req, res, next) => {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        const userId = req.user.userId; // From requireAuth middleware
        const { text } = req.body;

        if (isNaN(eventId)) {
            return next(new ErrorHandler(400, 'Invalid event ID.'));
        }
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return next(new ErrorHandler(400, "'text' field cannot be empty."));
        }

        const event = await Event.findByPk(eventId);
        if (!event) {
            return next(new ErrorHandler(404, `Event with ID ${eventId} not found.`));
        }

        // Optional: Check if user participated in the event to comment
        // This requires an EventParticipant model and table.
        // const participant = await EventParticipant.findOne({ where: { idEvento: eventId, idUtilizador: userId, status: 'confirmado' } });
        // if (!participant && event.idAutor !== userId && req.user.role !== 'Administrador') { // Allow organizer and admin to comment regardless
        //     return next(new ErrorHandler(403, 'You must participate in the event to comment.'));
        // }


        const newComment = await Comment.create({
            conteudo: text.trim(),
            idUtilizador: userId,
            idEvento: eventId
        });

        // Fetch the commenter details for the response
        const commenter = await User.findByPk(userId, { attributes: ['idUtilizador', 'nome'] });

        res.status(201).json({
            commentId: newComment.idComentario,
            text: newComment.conteudo,
            date: newComment.dataComentario,
            user: commenter ? { userId: commenter.idUtilizador, userName: commenter.nome } : null,
            eventId: newComment.idEvento
        });

    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return next(new ErrorHandler(400, error.errors.map(e => e.message).join(', ')));
        }
        console.error('Error in addCommentToEvent:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// GET /comments - Moderador - Lista TODOS os comentários
exports.getAllComments = async (req, res, next) => {
    try {
        const {
            query,
            page = 0,
            pageSize = 10,
            sortBy = 'dataComentario',
            order = 'desc',
            userId, // Filter by userId
            eventId // Filter by eventId
        } = req.query;

        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (isNaN(pageNum) || pageNum < 0) throw new ErrorHandler(400, 'Invalid page number.');
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) throw new ErrorHandler(400, 'Page size must be between 1 and 100 for admin view.');

        const whereClause = {};
        const queryParamsForLinks = { sortBy, order };

        if (query) {
            whereClause.conteudo = { [Op.like]: `%${query}%` };
            queryParamsForLinks.query = query;
        }
        if (userId) {
            const userIdNum = parseInt(userId, 10);
            if (!isNaN(userIdNum)) {
                whereClause.idUtilizador = userIdNum;
                queryParamsForLinks.userId = userId;
            } else {
                return next(new ErrorHandler(400, 'Invalid userId format for filter.'));
            }
        }
        if (eventId) {
            const eventIdNum = parseInt(eventId, 10);
            if (!isNaN(eventIdNum)) {
                whereClause.idEvento = eventIdNum;
                queryParamsForLinks.eventId = eventId;
            } else {
                return next(new ErrorHandler(400, 'Invalid eventId format for filter.'));
            }
        }

        const { count, rows } = await Comment.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'commenter', attributes: ['idUtilizador', 'nome'] },
                { model: Event, as: 'commentedEvent', attributes: ['idEvento', 'titulo'] }
            ],
            limit: pageSizeNum,
            offset: pageNum * pageSizeNum,
            order: [[sortBy, order.toUpperCase()]],
            distinct: true // Important for counts with includes
        });

        const formattedComments = rows.map(formatCommentResponse);
        const totalPages = Math.ceil(count / pageSizeNum);
        const responseLinks = [];
        const basePath = `/comments`;

        if (pageNum < totalPages - 1) {
            responseLinks.push({ rel: "next-page", href: `${basePath}?pageSize=${pageSizeNum}&page=${pageNum + 1}&${new URLSearchParams(queryParamsForLinks)}`, method: "GET" });
        }
        if (pageNum > 0) {
            responseLinks.push({ rel: "prev-page", href: `${basePath}?pageSize=${pageSizeNum}&page=${pageNum - 1}&${new URLSearchParams(queryParamsForLinks)}`, method: "GET" });
        }

        res.json({
            data: formattedComments,
            pagination: {
                currentPage: pageNum,
                pageSize: pageSizeNum,
                totalItems: count,
                totalPages: totalPages
            },
            links: responseLinks
        });

    } catch (error) {
        console.error('Error in getAllComments (admin):', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// DELETE /comments/:commentId - Moderador - Remove qualquer Comentário
exports.deleteCommentByAdmin = async (req, res, next) => {
    try {
        const commentId = parseInt(req.params.commentId, 10);
        if (isNaN(commentId)) {
            return next(new ErrorHandler(400, 'Invalid comment ID.'));
        }

        const comment = await Comment.findByPk(commentId);
        if (!comment) {
            return next(new ErrorHandler(404, `Comment with ID ${commentId} not found.`));
        }

        await comment.destroy();
        res.status(204).send();

    } catch (error) {
        console.error('Error in deleteCommentByAdmin:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// DELETE /comments/mine/:commentId - Utilizador apaga o SEU comentário
exports.deleteComment = async (req, res, next) => {
    try {
        const commentId = parseInt(req.params.commentId, 10);
        const userId = req.user.userId; // From requireAuth
        const userRole = req.user.role; // From authenticate middleware

        if (isNaN(commentId)) {
            return next(new ErrorHandler(400, 'Invalid comment ID.'));
        }

        const comment = await Comment.findByPk(commentId);
        if (!comment) {
            return next(new ErrorHandler(404, `Comment with ID ${commentId} not found.`));
        }

        const isOwner = comment.idUtilizador === userId;
        const isAdmin = userRole === 'Administrador';

        if (!isOwner && !isAdmin) {
            return next(new ErrorHandler(403, 'You are not authorized to delete this comment.'));
        }

        // Optional: Time limit for non-admins deleting their own comment
        // if (isOwner && !isAdmin) {
        //     const oneHourInMs = 60 * 60 * 1000;
        //     if (Date.now() - new Date(comment.dataComentario).getTime() > oneHourInMs) {
        //         return next(new ErrorHandler(403, 'You can only delete your own comment within one hour of posting. Admins can delete anytime.'));
        //     }
        // }

        await comment.destroy();
        res.status(204).send();

    } catch (error) {
        console.error('Error in deleteComment:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};