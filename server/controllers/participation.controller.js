const { Op, Transaction } = require('sequelize');
const db = require('../models/db'); // For transactions
const Event = require('../models/events.model');
const User = require('../models/users.model');
const EventParticipant = require('../models/eventParticipants.model');
const WaitingList = require('../models/waitingList.model');
const { ErrorHandler } = require('../utils/error');

// passar da waitilingList para a lista de participantes confirmados
async function promoteFromWaitingList(eventId, transaction) {
    const event = await Event.findByPk(eventId, { transaction });
    if (!event) {
        console.log(`Event ${eventId} not found, cannot promote.`);
        return null;
    }

    if (event.maxParticipantes === null) {
        const usersOnWaitingList = await WaitingList.findAll({
            where: { idEvento: eventId },
            order: [['dataInscricao', 'ASC']],
            transaction
        });

        let promotedCount = 0;
        for (const userToPromote of usersOnWaitingList) {
            // confirma se o utilizador já não é um participante confirmado
            const alreadyParticipant = await EventParticipant.findOne({
                where: { idEvento: eventId, idUtilizador: userToPromote.idUtilizador, status: 'confirmado' },
                transaction
            });
            if (!alreadyParticipant) {
                await EventParticipant.create({
                    idEvento: eventId,
                    idUtilizador: userToPromote.idUtilizador,
                    status: 'confirmado',
                }, { transaction });
                promotedCount++;
            }
            await WaitingList.destroy({
                where: {
                    idEvento: eventId,
                    idUtilizador: userToPromote.idUtilizador
                },
                transaction
            });
        }
        if (promotedCount > 0) {
            console.log(`${promotedCount} user(s) promoted from waiting list for event ${eventId} due to unlimited capacity.`);
        }
        return promotedCount > 0 ? usersOnWaitingList.map(u => u.idUtilizador) : null;

    } else if (typeof event.maxParticipantes === 'number') {
        const currentParticipantCount = await EventParticipant.count({
            where: { idEvento: eventId, status: 'confirmado' },
            transaction
        });

        if (currentParticipantCount < event.maxParticipantes) {
            const userToPromote = await WaitingList.findOne({
                where: { idEvento: eventId },
                order: [['dataInscricao', 'ASC']],
                transaction
            });

            if (userToPromote) {
                 // confirma se o utilizador já não é um participante confirmado
                const alreadyParticipant = await EventParticipant.findOne({
                    where: { idEvento: eventId, idUtilizador: userToPromote.idUtilizador, status: 'confirmado' },
                    transaction
                });
                if (alreadyParticipant) {
                    // se for: apaga da waiting list na mesma
                     await WaitingList.destroy({
                        where: { idEvento: eventId, idUtilizador: userToPromote.idUtilizador },
                        transaction
                    });
                    console.log(`User ${userToPromote.idUtilizador} was already a participant for event ${eventId}, removed from waiting list.`);
                    return null;
                }

                await EventParticipant.create({
                    idEvento: eventId,
                    idUtilizador: userToPromote.idUtilizador,
                    status: 'confirmado',
                }, { transaction });

                await WaitingList.destroy({
                    where: {
                        idEvento: eventId,
                        idUtilizador: userToPromote.idUtilizador
                    },
                    transaction
                });
                console.log(`User ${userToPromote.idUtilizador} promoted from waiting list for event ${eventId}.`);
                return [userToPromote.idUtilizador];
            }
        }
    } else {
        console.log(`Event ${eventId} maxParticipants is not set or invalid, cannot promote.`);
    }
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
            const newParticipant = await EventParticipant.create({
                idEvento: eventId,
                idUtilizador: userId,
                status: 'confirmado'
            }, { transaction });

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
                    status: 'confirmado'
                }, { transaction });

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
                    idUtilizador: userId
                }, { transaction });

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