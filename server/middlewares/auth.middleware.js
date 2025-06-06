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
            // Allow unauthenticated access for some routes (e.g., public GET /events)
            // The controller will then decide what to do based on req.user's presence
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            // If token is provided but user not found, it's an issue.
            // For strictly protected routes, this would be an error.
            // For routes with optional auth, req.user will remain undefined.
            // However, if a token was provided, it implies an attempt to authenticate.
             return next(new ErrorHandler(401, 'User for token not found.'));
        }

        req.user = { // Attach user info to request object
            userId: user.idUtilizador,
            email: user.email,
            role: user.tipoUtilizador
        };
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            // If token is invalid or expired, treat as unauthenticated or error for protected routes.
            // For now, let's pass an error to indicate a bad token if one was provided.
            return next(new ErrorHandler(401, 'Invalid or expired token.'));
        }
        // For other errors during authentication, pass them along
        next(error);
    }
};

exports.isAdmin = (req, res, next) => {
    if (!req.user) { // Check if user is authenticated first
        return next(new ErrorHandler(401, 'Authentication required.'));
    }
    if (req.user.role !== 'Administrador') {
        return next(new ErrorHandler(403, 'Administrator privileges required.'));
    }
    next();
};

// Middleware to ensure user is authenticated (for routes that strictly require login)
exports.requireAuth = (req, res, next) => {
    if (!req.user) {
        return next(new ErrorHandler(401, 'Valid authentication token required.'));
    }
    next();
};