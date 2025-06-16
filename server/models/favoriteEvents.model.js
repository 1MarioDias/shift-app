const { DataTypes } = require('sequelize');
const db = require('./db');
const User = require('./users.model');
const Event = require('./events.model');

const FavoriteEvent = db.sequelize.define('eventosfavoritos', {
    idUtilizador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: 'idUtilizador'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    idEvento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Event,
            key: 'idEvento'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    dataFavorito: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'eventosfavoritos',
    timestamps: false
});

// Define associations
User.belongsToMany(Event, {
    through: FavoriteEvent,
    foreignKey: 'idUtilizador',
    otherKey: 'idEvento',
    as: 'favoriteEvents'
});

Event.belongsToMany(User, {
    through: FavoriteEvent,
    foreignKey: 'idEvento',
    otherKey: 'idUtilizador',
    as: 'favoritedByUsers'
});

FavoriteEvent.belongsTo(User, { foreignKey: 'idUtilizador', as: 'user' });
FavoriteEvent.belongsTo(Event, { foreignKey: 'idEvento', as: 'event' });

module.exports = FavoriteEvent;