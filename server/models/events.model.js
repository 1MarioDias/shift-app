const { DataTypes } = require('sequelize');
const db = require('./db');

const Event = db.sequelize.define('eventos', {
    idEvento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
        type: DataTypes.DATE,
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
    isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: false
});

module.exports = Event;