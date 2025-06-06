const { DataTypes } = require('sequelize');
const db = require('./db');
const User = require('./users.model');
const Event = require('./events.model');

const Comment = db.sequelize.define('comentarios', { // Table name 'comentarios'
    idComentario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    conteudo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    dataComentario: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    idUtilizador: { // Foreign Key for User
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'idUtilizador'
        }
    },
    idEvento: { // Foreign Key for Event
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Event,
            key: 'idEvento'
        }
    }
}, {
    timestamps: false, // No createdAt/updatedAt columns
    tableName: 'comentarios' // Explicitly set table name
});

// Associations
User.hasMany(Comment, { foreignKey: 'idUtilizador', as: 'commentsMade' });
Comment.belongsTo(User, { foreignKey: 'idUtilizador', as: 'commenter' });

Event.hasMany(Comment, { foreignKey: 'idEvento', as: 'eventComments' });
Comment.belongsTo(Event, { foreignKey: 'idEvento', as: 'commentedEvent' });

module.exports = Comment;