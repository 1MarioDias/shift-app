const { DataTypes } = require('sequelize');
const db = require('./db');
const User = require('./users.model');

const Event = db.sequelize.define('eventos', {
    idEvento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idAutor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'idUtilizador'
        },
        field: 'idAutor'
    },
    dataCriacao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    imagem: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    data: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hora: {
        type: DataTypes.TIME,
        allowNull: false
    },
    localizacao: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    tipoEvento: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    maxParticipantes: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    estado: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'ativo'
    },
    visualizacoes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    linksRelevantes: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }

}, {
    timestamps: false,
    tableName: 'eventos'
});

// associações a outras tabelas
Event.belongsTo(User, { foreignKey: 'idAutor', as: 'organizer' });
User.hasMany(Event, { foreignKey: 'idAutor', as: 'organizedEvents' });


module.exports = Event;