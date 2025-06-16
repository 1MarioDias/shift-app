const { DataTypes } = require('sequelize');
const db = require('./db');
const User = require('./users.model');
const Event = require('./events.model');

const EventParticipant = db.sequelize.define('eventoparticipantes', {
    idEvento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Event,
            key: 'idEvento'
        },
        onDelete: 'CASCADE'
    },
    idUtilizador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: 'idUtilizador'
        },
        onDelete: 'CASCADE'
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'confirmado' 
        // default quando o utilizador se inscreve e é logo adicionado como participante
    },
    dataInscricao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'eventoparticipantes',
    timestamps: false
});

User.belongsToMany(Event, { through: EventParticipant, foreignKey: 'idUtilizador', otherKey: 'idEvento', as: 'participatingEvents' });
Event.belongsToMany(User, { through: EventParticipant, foreignKey: 'idEvento', otherKey: 'idUtilizador', as: 'eventParticipants' });

EventParticipant.belongsTo(User, { foreignKey: 'idUtilizador', as: 'user' });
EventParticipant.belongsTo(Event, { foreignKey: 'idEvento', as: 'event' });


module.exports = EventParticipant;