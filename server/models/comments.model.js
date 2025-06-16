const { DataTypes } = require('sequelize');
const db = require('./db');
const User = require('./users.model');
const Event = require('./events.model');

const Comment = db.sequelize.define('comentarios', {
    idComentario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    conteudo: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Comment text cannot be empty."
            },
            len: {
                args: [1, 1000],
                msg: "Comment text must be between 1 and 1000 characters."
            }
        }
    },
    dataComentario: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    idUtilizador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'idUtilizador'
        },
        onDelete: 'CASCADE'
    },
    idEvento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Event,
            key: 'idEvento'
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: false,
    tableName: 'comentarios'
});

// Associations
User.hasMany(Comment, { foreignKey: 'idUtilizador', as: 'commentsMade' });
Comment.belongsTo(User, { foreignKey: 'idUtilizador', as: 'commenter' });

Event.hasMany(Comment, { foreignKey: 'idEvento', as: 'eventComments' });
Comment.belongsTo(Event, { foreignKey: 'idEvento', as: 'commentedEvent' });

module.exports = Comment;