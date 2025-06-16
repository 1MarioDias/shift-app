const { Op, Transaction } = require('sequelize');
const db = require('../models/db');
const Event = require('../models/events.model');
const User = require('../models/users.model');
const EventParticipant = require('../models/eventParticipants.model');
const WaitingList = require('../models/waitingList.model');
const { ErrorHandler } = require('../utils/error');
const { createNotification } = require('./notifications.controller');
const NOTIFICATION_TYPES = {
    EVENT_REGISTRATION_CONFIRMED: 'EVENT_REGISTRATION_CONFIRMED',
    EVENT_WAITING_LIST_ADDED: 'EVENT_WAITING_LIST_ADDED',
    EVENT_PROMOTED_FROM_WAITING_LIST: 'EVENT_PROMOTED_FROM_WAITING_LIST'
};

// passar da waitilingList para a lista de participantes confirmados
async function promoteFromWaitingList(eventId, transaction) {
    const event = await Event.findByPk(eventId, { transaction });
    if (!event) {
        console.log(`Event ${eventId} not found, cannot promote from waiting list.`);
        return null;
    }

    // evento c capacidade ilimitada
    if (event.maxParticipantes === null) {
        const usersOnWaitingList = await WaitingList.findAll({
            where: { idEvento: eventId },
            order: [['dataInscricao', 'ASC']],
            include: [{ model: User, as: 'user', attributes: ['idUtilizador'] }],
            transaction
        });

        let promotedUserIds = [];
        for (const waitingUser of usersOnWaitingList) {
            const userToPromoteId = waitingUser.idUtilizador;

            const alreadyParticipant = await EventParticipant.findOne({
                where: { idEvento: eventId, idUtilizador: userToPromoteId, status: 'confirmado' },
                transaction
            });

            if (!alreadyParticipant) {
                await EventParticipant.create({
                    idEvento: eventId,
                    idUtilizador: userToPromoteId,
                    status: 'confirmado',
                    dataInscricao: new Date()
                }, { transaction });

                // criar notificação
                const eventForNotification = await Event.findByPk(eventId, { attributes: ['titulo'], transaction });
                if (eventForNotification) {
                    await createNotification(
                        userToPromoteId,
                        NOTIFICATION_TYPES.EVENT_PROMOTED_FROM_WAITING_LIST,
                        `Good news! You've been promoted from the waiting list and are now registered for the event: '${eventForNotification.titulo}'.`,
                        eventId,
                        transaction
                    );
                }
                promotedUserIds.push(userToPromoteId);
                console.log(`User ${userToPromoteId} promoted from waiting list for event ${eventId} (unlimited capacity).`);
            }
            // remove da lista de espera
            await WaitingList.destroy({
                where: { idEvento: eventId, idUtilizador: userToPromoteId },
                transaction
            });
        }
        return promotedUserIds.length > 0 ? promotedUserIds : null;

    // evento com capacidade limitada
    } else if (typeof event.maxParticipantes === 'number') {
        const currentParticipantCount = await EventParticipant.count({
            where: { idEvento: eventId, status: 'confirmado' },
            transaction
        });

        if (currentParticipantCount < event.maxParticipantes) {
            const userToPromoteFromWaitingList = await WaitingList.findOne({
                where: { idEvento: eventId },
                order: [['dataInscricao', 'ASC']],
                include: [{ model: User, as: 'user', attributes: ['idUtilizador'] }],
                transaction
            });

            if (userToPromoteFromWaitingList) {
                const userToPromoteId = userToPromoteFromWaitingList.idUtilizador;

                const alreadyParticipant = await EventParticipant.findOne({
                    where: { idEvento: eventId, idUtilizador: userToPromoteId, status: 'confirmado' },
                    transaction
                });

                if (alreadyParticipant) {
                    // limpa da lista de espera
                    await WaitingList.destroy({
                        where: { idEvento: eventId, idUtilizador: userToPromoteId },
                        transaction
                    });
                    console.log(`User ${userToPromoteId} was already a confirmed participant for event ${eventId}. Removed from waiting list only.`);
                    return null;
                }

                // promove o utilizador da lista de espera para a tabela de participantes confirmados
                await EventParticipant.create({
                    idEvento: eventId,
                    idUtilizador: userToPromoteId,
                    status: 'confirmado',
                    dataInscricao: new Date()
                }, { transaction });

                // remove da lista de espera
                await WaitingList.destroy({
                    where: { idEvento: eventId, idUtilizador: userToPromoteId },
                    transaction
                });

                // cria a notificação
                const eventForNotification = await Event.findByPk(eventId, { attributes: ['titulo'], transaction });
                if (eventForNotification) {
                    await createNotification(
                        userToPromoteId,
                        NOTIFICATION_TYPES.EVENT_PROMOTED_FROM_WAITING_LIST,
                        `Good news! You've been promoted from the waiting list and are now registered for the event: '${eventForNotification.titulo}'.`,
                        eventId,
                        transaction
                    );
                }
                console.log(`User ${userToPromoteId} promoted from waiting list for event ${eventId}. Notification should have been created.`);
                return [userToPromoteId];
            } else {
                console.log(`No users on waiting list to promote for event ${eventId}.`);
                return null;
            }
        } else {
            console.log(`Event ${eventId} is still full or no capacity to promote (Current: ${currentParticipantCount}, Max: ${event.maxParticipantes}).`);
            return null;
        }
    }
    console.log(`Event ${eventId} maxParticipants is not set to null or a number, cannot promote.`);
    return null;
}


// POST /events/:eventId/participations - Participar num evento
exports.registerForEvent = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const eventId = parseInt(req.params.eventId, 10);
        const userId = req.user.userId;

        if (isNaN(eventId)) {
            await transaction.rollback();
            return next(new ErrorHandler(400, 'Invalid event ID.'));
        }

        const event = await Event.findByPk(eventId, { transaction });
        if (!event) {
            await transaction.rollback();
            return next(new ErrorHandler(404, `Event with ID ${eventId} not found.`));
        }

        const eventDateTime = new Date(`${event.data}T${event.hora}`);
        if (eventDateTime <= new Date()) {
            await transaction.rollback();
            return next(new ErrorHandler(400, 'Cannot register for an event that has already occurred.'));
        }

        const existingParticipant = await EventParticipant.findOne({
            where: { idEvento: eventId, idUtilizador: userId, status: 'confirmado' },
            transaction
        });
        const onWaitingList = await WaitingList.findOne({
            where: { idEvento: eventId, idUtilizador: userId },
            transaction
        });

        if (existingParticipant) {
            await transaction.rollback();
            return next(new ErrorHandler(400, 'User is already registered for this event.'));
        }
        if (onWaitingList) {
            await transaction.rollback();
            return next(new ErrorHandler(400, 'User is already on the waiting list for this event.'));
        }

        // evento ilimitado
        if (event.maxParticipantes === null) {
            await EventParticipant.create({
                idEvento: eventId,
                idUtilizador: userId,
                status: 'confirmado',
                dataInscricao: new Date()
            }, { transaction });

            // Cria notificação DENTRO da transação
            await createNotification(
                userId,
                NOTIFICATION_TYPES.EVENT_REGISTRATION_CONFIRMED,
                `You have successfully registered for the event: '${event.titulo}'.`,
                eventId,
                transaction
            );

            await transaction.commit();
            return res.status(201).json({
                message: "Successfully registered for the event (unlimited capacity).",
                participation: {
                    userId: newParticipant.idUtilizador,
                    eventId: newParticipant.idEvento,
                    status: newParticipant.status,
                    registeredAt: newParticipant.dataInscricao
                }
            });
        }

        // evento limitado
        if (typeof event.maxParticipantes === 'number') {
            const currentParticipantCount = await EventParticipant.count({
                where: { idEvento: eventId, status: 'confirmado' },
                transaction
            });

            if (currentParticipantCount < event.maxParticipantes) {
                const newParticipant = await EventParticipant.create({
                    idEvento: eventId,
                    idUtilizador: userId,
                    status: 'confirmado',
                    dataInscricao: new Date()
                }, { transaction });

                await createNotification(
                    userId,
                    NOTIFICATION_TYPES.EVENT_REGISTRATION_CONFIRMED,
                    `You have successfully registered for the event: '${event.titulo}'.`,
                    eventId,
                    transaction
                );

                await transaction.commit();
                return res.status(201).json({
                    message: "Successfully registered for the event.",
                    participation: {
                        userId: newParticipant.idUtilizador,
                        eventId: newParticipant.idEvento,
                        status: newParticipant.status,
                        registeredAt: newParticipant.dataInscricao
                    }
                });
            } else {
                // cheio: add na waiting list
                const newWaitingListEntry = await WaitingList.create({
                    idEvento: eventId,
                    idUtilizador: userId,
                    dataInscricao: new Date()
                }, { transaction });

                await createNotification(
                    userId,
                    NOTIFICATION_TYPES.EVENT_WAITING_LIST_ADDED,
                    `The event '${event.titulo}' is full. You've been added to the waiting list.`,
                    eventId,
                    transaction
                );

                await transaction.commit();
                return res.status(200).json({ // 200 na waiting list
                    message: "Event is full. You have been added to the waiting list.",
                    participation: {
                        userId: newWaitingListEntry.idUtilizador,
                        eventId: newWaitingListEntry.idEvento,
                        status: "waiting_list",
                        registeredAt: newWaitingListEntry.dataInscricao
                    }
                });
            }
        } else {
            await transaction.rollback();
            return next(new ErrorHandler(500, 'Event capacity (maxParticipants) has an invalid configuration. Cannot register.'));
        }

    } catch (error) {
        await transaction.rollback();
        if (error instanceof ErrorHandler) return next(error);
        console.error('Error in registerForEvent:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

// DELETE /events/:eventId/participations - Eliminar participação num evento
exports.cancelParticipation = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const eventId = parseInt(req.params.eventId, 10);
        const userId = req.user.userId;

        if (isNaN(eventId)) {
            await transaction.rollback();
            return next(new ErrorHandler(400, 'Invalid event ID.'));
        }

        const event = await Event.findByPk(eventId, { transaction });
        if (!event) {
            await transaction.rollback();
            return next(new ErrorHandler(404, `Event with ID ${eventId} not found.`));
        }

        const eventDateTime = new Date(`${event.data}T${event.hora}`);
        if (eventDateTime <= new Date()) {
            await transaction.rollback();
            return next(new ErrorHandler(400, 'Cannot cancel participation for an event that has already occurred.'));
        }

        const participant = await EventParticipant.findOne({
            where: { idEvento: eventId, idUtilizador: userId, status: 'confirmado' },
            transaction
        });

        if (participant) {
            await EventParticipant.destroy({
                where: { idEvento: eventId, idUtilizador: userId, status: 'confirmado' },
                transaction
            });
            // envia já um utilizador que estava na waiting list para a lista de participantes confirmados
            await promoteFromWaitingList(eventId, transaction);
            await transaction.commit();
            return res.status(204).send();
        }

        const onWaitingList = await WaitingList.findOne({
            where: { idEvento: eventId, idUtilizador: userId },
            transaction
        });

        if (onWaitingList) {
            await WaitingList.destroy({
                where: { idEvento: eventId, idUtilizador: userId },
                transaction
            });
            await transaction.commit();
            return res.status(204).send();
        }

        await transaction.rollback();
        return next(new ErrorHandler(400, 'User was not registered for this event or on its waiting list.'));

    } catch (error) {
        await transaction.rollback();
        if (error instanceof ErrorHandler) return next(error);
        console.error('Error in cancelParticipation:', error);
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};

exports.promoteFromWaitingList = promoteFromWaitingList;