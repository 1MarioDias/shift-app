// ...existing code...
const User = require('../models/users.model');
const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../utils/error');
const { Op } = require('sequelize');

exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Validação dos campos obrigatórios
        if (!username) throw new ErrorHandler(400, 'The USERNAME field is required.');
        if (!email) throw new ErrorHandler(400, 'The EMAIL field is required.');
        if (!password) throw new ErrorHandler(400, 'The PASSWORD field is required.');

        // cria o user
        const user = await User.create({
            nome: username,
            email,
            password,
            dataRegisto: new Date(),
            // tipoUtilizador will use defaultValue 'Utilizador' from model
        });

        // resposta
        res.status(201).json({
            userId: user.idUtilizador,
            name: user.nome,
            email: user.email
        });

    } catch (error) {
        // ... existing error handling ...
        if (error.name === 'SequelizeUniqueConstraintError') {
            return next(new ErrorHandler(400, 'The provided EMAIL is already in use.'));
        }
        if (error.name === 'SequelizeValidationError') {
            return next(new ErrorHandler(400, error.errors[0].message));
        }
        if (error.statusCode === 400) {
            return next(error);
        }
        next(new ErrorHandler(500, `Could not create user due to a database issue: ${error.message}`));
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email) throw new ErrorHandler(400, 'The EMAIL field is required.');
        if (!password) throw new ErrorHandler(400, 'The PASSWORD field is required.');

        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new ErrorHandler(401, 'Invalid credentials.');
        }

        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            throw new ErrorHandler(401, 'Invalid credentials.');
        }

        const token = jwt.sign(
            {
                userId: user.idUtilizador,
                email: user.email,
                role: user.tipoUtilizador // Include role in JWT payload
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            accessToken: token,
            user: { // Send user details, including role, in the response
                userId: user.idUtilizador,
                name: user.nome,
                email: user.email,
                role: user.tipoUtilizador
            }
        });

    } catch (error) {
        if ([400, 401].includes(error.statusCode)) {
            return next(error);
        }
        next(new ErrorHandler(500, 'An unexpected error occurred during login.'));
    }
};

// GET /users/me - Visualização do Perfil do Utilizador Autenticado
exports.getUserProfile = async (req, res, next) => {
    // req.user is populated by `requireAuth` and `authenticate` middleware
    try {
        // The user's own data is already in req.user from the authenticate middleware
        // If you need to fetch fresh data or more fields:
        const user = await User.findByPk(req.user.userId, {
            attributes: ['idUtilizador', 'nome', 'email', 'tipoUtilizador', 'dataRegisto']
        });
        if (!user) {
            return next(new ErrorHandler(404, "User not found"));
        }
        res.json({
            userId: user.idUtilizador,
            name: user.nome,
            email: user.email,
            role: user.tipoUtilizador,
            createdAt: user.dataRegisto
        });
    } catch (error) {
        next(new ErrorHandler(500, 'Internal Server Error.'));
    }
};

// GET /users - Moderador - Lista todos os Utilizadores
exports.getAllUsers = async (req, res, next) => {
    try {
        const {
            query,
            page = 0,
            pageSize = 10,
            sortBy = 'dataRegisto', // Matches DB column name
            order = 'desc'
        } = req.query;

        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (isNaN(pageNum) || pageNum < 0) throw new ErrorHandler(400, 'Invalid page number.');
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) throw new ErrorHandler(400, 'Page size must be between 1 and 100.');


        const whereClause = {};
        if (query) {
            whereClause[Op.or] = [
                { nome: { [Op.like]: `%${query}%` } },
                { email: { [Op.like]: `%${query}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: ['idUtilizador', 'nome', 'email', 'dataRegisto', 'tipoUtilizador'],
            limit: pageSizeNum,
            offset: pageNum * pageSizeNum,
            order: [[sortBy, order.toUpperCase()]]
        });

        const formattedUsers = rows.map(user => ({
            userId: user.idUtilizador,
            name: user.nome,
            email: user.email,
            createdAt: user.dataRegisto,
            role: user.tipoUtilizador
        }));
        
        const totalPages = Math.ceil(count / pageSizeNum);

        res.json({
            data: formattedUsers,
            pagination: {
                currentPage: pageNum,
                pageSize: pageSizeNum,
                totalItems: count,
                totalPages: totalPages
            },
            links: [
                ...(pageNum < totalPages - 1 ? [{ rel: "next-page", href: `/users?pageSize=${pageSizeNum}&page=${pageNum + 1}${query ? `&query=${query}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}${order ? `&order=${order}` : ''}`, method: "GET" }] : [])
            ]
        });
    } catch (error) {
        if (error.statusCode === 400) return next(error);
        next(new ErrorHandler(500, 'Internal Server Error.'));
    }
};

// DELETE /users/:userId - Moderador - Remove um Utilizador
exports.deleteUser = async (req, res, next) => {
    try {
        const userIdToDelete = parseInt(req.params.userId, 10);
        if (isNaN(userIdToDelete)) {
            return next(new ErrorHandler(400, 'Invalid user ID.'));
        }

        // Prevent admin from deleting themselves (optional, but good practice)
        if (req.user && req.user.userId === userIdToDelete) {
            return next(new ErrorHandler(403, 'Administrators cannot delete their own account.'));
        }

        const user = await User.findByPk(userIdToDelete);
        if (!user) {
            return next(new ErrorHandler(404, `User with ID ${userIdToDelete} not found.`));
        }

        await user.destroy();
        res.status(204).send();
    } catch (error) {
        next(new ErrorHandler(500, 'Internal Server Error, try again!'));
    }
};