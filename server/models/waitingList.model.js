const { DataTypes } = require('sequelize');
const db = require('./db');
const User = require('./users.model');
const Event = require('./events.model');

const WaitingList = db.sequelize.define('listaespera', {
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
    dataInscricao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'listaespera',
    timestamps: false
});

// Associations
User.belongsToMany(Event, { through: WaitingList, foreignKey: 'idUtilizador', otherKey: 'idEvento', as: 'waitingListEvents' });
Event.belongsToMany(User, { through: WaitingList, foreignKey: 'idEvento', otherKey: 'idUtilizador', as: 'waitingListUsers' });

WaitingList.belongsTo(User, { foreignKey: 'idUtilizador', as: 'user' });
WaitingList.belongsTo(Event, { foreignKey: 'idEvento', as: 'event' });

module.exports = WaitingList;