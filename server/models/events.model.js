const { DataTypes } = require('sequelize');
const db = require('./db'); // Assuming db.js exports the sequelize instance
const User = require('./users.model');

const Event = db.sequelize.define('eventos', {
    idEvento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idAutor: { // Changed from idUtilizador to idAutor
        type: DataTypes.INTEGER,
        allowNull: false, // As per your diagram, an event is created by a user
        references: {
            model: User,
            key: 'idUtilizador' // This still refers to the PK in the User table
        },
        field: 'idAutor' // Explicitly map to the 'idAutor' column in the DB
    },
    dataCriacao: { // Added based on diagram
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
    data: { // This is the event date
        type: DataTypes.DATEONLY, // Using DATEONLY if time is separate
        allowNull: false
    },
    hora: { // This is the event time
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
        allowNull: true // Diagram doesn't specify, assuming optional
    },
    estado: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'ativo' // Or as per your logic
    },
    visualizacoes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    linksRelevantes: { // Added based on diagram
        type: DataTypes.STRING, // Or TEXT if it can be long
        allowNull: true
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
    // idUtilizador field is removed
}, {
    timestamps: false, // No createdAt/updatedAt columns if dataCriacao serves this
    tableName: 'eventos'
});

// Association: An Event belongs to a User (as Organizer/Author)
// The foreign key in the Event model is 'idAutor'
Event.belongsTo(User, { foreignKey: 'idAutor', as: 'organizer' }); // or 'author'
User.hasMany(Event, { foreignKey: 'idAutor', as: 'organizedEvents' }); // or 'authoredEvents'


module.exports = Event;