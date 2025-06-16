const { DataTypes } = require('sequelize');
const db = require('./db');
const User = require('./users.model');
const Event = require('./events.model');

const Notification = db.sequelize.define('notificacoes', {
    idNotificacao: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idNotificacao'
    },
    idUtilizador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'idUtilizador'
        },
        field: 'idUtilizador'
    },
    idEvento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Event,
            key: 'idEvento'
        },
        field: 'idEvento'
    },
    conteudo: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'conteudo'
    },
    dataEnvio: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'dataEnvio'
    },
    tipoNotificacao: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'tipoNotificacao'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'isRead'
    }
}, {
    timestamps: false,
    tableName: 'notificacoes'
});

Notification.belongsTo(User, { foreignKey: 'idUtilizador', as: 'user' });
Notification.belongsTo(Event, { foreignKey: 'idEvento', as: 'event' });

module.exports = Notification;