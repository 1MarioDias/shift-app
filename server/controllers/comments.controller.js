const Comment = require('../models/comments.model');
const User = require('../models/users.model');
const Event = require('../models/events.model');
const { Op } = require('sequelize');
const { ErrorHandler } = require('../utils/error');

// GET /comments
exports.getAllComments = async (req, res, next) => {
    try {
        const {
            query,
            page = 0,
            pageSize = 10,
            sortBy = 'dataComentario',
            order = 'desc',
            userId,
            eventId
        } = req.query;

        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (isNaN(pageNum) || pageNum < 0) throw new ErrorHandler(400, 'Invalid page number.');
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) throw new ErrorHandler(400, 'Page size must be between 1 and 100.');

        const whereClause = {};
        if (query) whereClause.conteudo = { [Op.like]: `%${query}%` };
        if (userId) {
            const userIdNum = parseInt(userId, 10);
            if (!isNaN(userIdNum)) whereClause.idUtilizador = userIdNum;
            else throw new ErrorHandler(400, 'Invalid userId format.');
        }
        if (eventId) {
            const eventIdNum = parseInt(eventId, 10);
            if (!isNaN(eventIdNum)) whereClause.idEvento = eventIdNum;
            else throw new ErrorHandler(400, 'Invalid eventId format.');
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
            distinct: true
        });

        const formattedComments = rows.map(comment => ({
            commentId: comment.idComentario,
            text: comment.conteudo,
            date: comment.dataComentario,
            userId: comment.commenter ? comment.commenter.idUtilizador : null,
            userName: comment.commenter ? comment.commenter.nome : 'Unknown',
            eventId: comment.commentedEvent ? comment.commentedEvent.idEvento : null,
            eventTitle: comment.commentedEvent ? comment.commentedEvent.titulo : 'Unknown'
        }));
        
        const totalPages = Math.ceil(count / pageSizeNum);

        res.json({
            data: formattedComments,
            pagination: {
                currentPage: pageNum,
                pageSize: pageSizeNum,
                totalItems: count,
                totalPages: totalPages
            },
            links: [
                 ...(pageNum < totalPages - 1 ? [{ rel: "next-page", href: `/comments?pageSize=${pageSizeNum}&page=${pageNum + 1}${query ? `&query=${query}` : ''}`, method: "GET" }] : [])
            ]
        });
    } catch (error) {
        if (error.statusCode === 400) return next(error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// DELETE /comments/:commentId - Moderador - Remove qualquer Comentário
exports.deleteComment = async (req, res, next) => {
    try {
        const commentIdToDelete = parseInt(req.params.commentId, 10);
        if (isNaN(commentIdToDelete)) {
            return next(new ErrorHandler(400, 'Invalid comment ID.'));
        }

        const comment = await Comment.findByPk(commentIdToDelete);
        if (!comment) {
            return next(new ErrorHandler(404, `Comment with ID ${commentIdToDelete} not found.`));
        }

        await comment.destroy();
        res.status(204).send();
    } catch (error) {
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};