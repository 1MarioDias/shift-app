const { DataTypes } = require('sequelize');
const db = require('./db');
const bcrypt = require('bcryptjs');

const User = db.sequelize.define('utilizadores', {
    idUtilizador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'The USERNAME field cannot be empty.'
            }
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
            msg: 'The provided EMAIL is already in use.'
        },
        validate: {
            isEmail: {
                msg: 'Invalid email format.'
            }
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'The PASSWORD field cannot be empty.'
            }
        }
    },
    dataRegisto: {
        type: DataTypes.DATE,
        allowNull: false
    },
    tipoUtilizador: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Utilizador'
    },
    preferenciasNotificacoes: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'push'
    }
}, {
    timestamps: false,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

module.exports = User;