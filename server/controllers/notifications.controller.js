const Notification = require('../models/notifications.model');
const Event = require('../models/events.model');
const EventParticipant = require('../models/eventParticipants.model');
const WaitingList = require('../models/waitingList.model');
const { ErrorHandler } = require('../utils/error');
const { Op } = require('sequelize');

const NOTIFICATION_TYPES = {
    EVENT_UPDATED: 'EVENT_UPDATED',
    EVENT_REGISTRATION_CONFIRMED: 'EVENT_REGISTRATION_CONFIRMED',
    EVENT_WAITING_LIST_ADDED: 'EVENT_WAITING_LIST_ADDED',
    EVENT_PROMOTED_FROM_WAITING_LIST: 'EVENT_PROMOTED_FROM_WAITING_LIST',
};

const formatNotificationResponse = (notification) => {
    let link = null;
    if (notification.idEvento) {
        link = `/events/${notification.idEvento}`;
    }

    return {
        notificationId: notification.idNotificacao,
        message: notification.conteudo,
        isRead: notification.isRead,
        createdAt: notification.dataEnvio,
        type: notification.tipoNotificacao,
        link: link
    };
};

// criar notificação (interna)
async function createNotification(userId, type, message, eventId = null, transaction = null) {

    if (!userId || !type || !message) {
        // params em falta
        console.error('Erro ao criar notificação: Parâmetros em falta.', { userId, type, message });
        throw new Error('Missing required parameters for creating notification.');
    }

    if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
        console.warn(`Tentativa de criar notificação com tipo inválido: ${type}`);
        throw new Error(`Invalid notification type: ${type}`);
    }

    const notification = await Notification.create({
        idUtilizador: userId,
        idEvento: eventId,
        conteudo: message,
        tipoNotificacao: type,
        isRead: false
    }, { transaction });

    console.log(`Notificação criada (Transação: ${transaction ? 'SIM' : 'NÃO'}): User ${userId}, Type ${type}, Event ${eventId || 'N/A'}`);
    return notification;
}
module.exports.createNotification = createNotification;

// GET /notifications - Lista as Notificações do Utilizador Autenticado
exports.listUserNotifications = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        let { unreadOnly, page = 0, pageSize = 10 } = req.query;

        // unreadOnly: default para true.
        const filterUnread = (unreadOnly === undefined || unreadOnly === 'true');

        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (isNaN(pageNum) || pageNum < 0) {
            return next(new ErrorHandler(400, 'Invalid page number.'));
        }
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 50) {
            return next(new ErrorHandler(400, 'Page size must be between 1 and 50.'));
        }

        const whereClause = { idUtilizador: userId };
        if (filterUnread) {
            whereClause.isRead = false;
        }

        const { count, rows } = await Notification.findAndCountAll({
            where: whereClause,
            limit: pageSizeNum,
            offset: pageNum * pageSizeNum,
            order: [['dataEnvio', 'DESC']],
        });

        const formattedNotifications = rows.map(formatNotificationResponse);
        const totalPages = Math.ceil(count / pageSizeNum);

        const queryParamsForLinks = { pageSize: pageSizeNum };
        if (unreadOnly !== undefined) queryParamsForLinks.unreadOnly = unreadOnly;


        const responseLinks = [];
        const basePath = `/notifications`;
        if (pageNum < totalPages - 1) {
            responseLinks.push({ rel: "next-page", href: `${basePath}?page=${pageNum + 1}&${new URLSearchParams(queryParamsForLinks)}`, method: "GET" });
        }
        if (pageNum > 0) {
            responseLinks.push({ rel: "prev-page", href: `${basePath}?page=${pageNum - 1}&${new URLSearchParams(queryParamsForLinks)}`, method: "GET" });
        }


        res.json({
            data: formattedNotifications,
            pagination: {
                currentPage: pageNum,
                pageSize: pageSizeNum,
                totalItems: count,
                totalPages: totalPages
            },
            links: responseLinks
        });

    } catch (error) {
        console.error('Error in listUserNotifications:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// PATCH /notifications/:notificationId - Alterar o Estado de uma notificação Lida/Não Lida
exports.updateNotificationStatus = async (req, res, next) => {
    try {
        const notificationId = parseInt(req.params.notificationId, 10);
        const userId = req.user.userId;
        const { isRead } = req.body;

        if (isNaN(notificationId)) {
            return next(new ErrorHandler(400, 'Invalid notification ID.'));
        }
        if (typeof isRead !== 'boolean') {
            return next(new ErrorHandler(400, "'isRead' must be a boolean value."));
        }

        const notification = await Notification.findByPk(notificationId);

        if (!notification) {
            return next(new ErrorHandler(404, `Notification with ID ${notificationId} not found.`));
        }

        if (notification.idUtilizador !== userId) {
            return next(new ErrorHandler(403, 'Forbidden. You can only update your own notifications.'));
        }

        notification.isRead = isRead;
        await notification.save();

        res.json(formatNotificationResponse(notification));

    } catch (error) {
        console.error('Error in updateNotificationStatus:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// notificar utilizadores sobre atualização de um evento ao qual estão inscritos ou na lista de espera
module.exports.notifyEventUpdate = async (eventId, eventTitle) => {
    const message = `The event '${eventTitle}' (ID: ${eventId}) has been updated. Check the new details!`;
    // Notificar utilizadores inscritos no evento
    const participants = await EventParticipant.findAll({
        where: { idEvento: eventId, status: 'confirmado' },
        attributes: ['idUtilizador']
    });
    for (const p of participants) {
        await createNotification(p.idUtilizador, NOTIFICATION_TYPES.EVENT_UPDATED, message, eventId);
    }
    // Notificar utilizadores na lista de espera
    const waitingListUsers = await WaitingList.findAll({
        where: { idEvento: eventId },
        attributes: ['idUtilizador']
    });
    for (const w of waitingListUsers) {
        await createNotification(w.idUtilizador, NOTIFICATION_TYPES.EVENT_UPDATED, message, eventId);
    }
};