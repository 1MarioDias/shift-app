const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../utils/error');
const User = require('../models/users.model');

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            // permite rotas sem auth
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user) {
             return next(new ErrorHandler(401, 'User for token not found.'));
        }

        req.user = {
            userId: user.idUtilizador,
            email: user.email,
            role: user.tipoUtilizador
        };
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return next(new ErrorHandler(401, 'Invalid or expired token.'));
        }
        next(error);
    }
};

exports.isAdmin = (req, res, next) => {
    if (!req.user) { // Confirma se foi autenticado
        return next(new ErrorHandler(401, 'Authentication required.'));
    }
    if (req.user.role !== 'Administrador') {
        return next(new ErrorHandler(403, 'Administrator privileges required.'));
    }
    next();
};

// Middleware para rotas que requerem autenticação
exports.requireAuth = (req, res, next) => {
    if (!req.user) {
        return next(new ErrorHandler(401, 'Valid authentication token required.'));
    }
    next();
};