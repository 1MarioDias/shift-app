const User = require('../models/users.model');
const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../utils/error');

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
        });

        // resposta
        res.status(201).json({
            userId: user.idUtilizador,
            name: user.nome,
            email: user.email,
            dataRegisto: user.dataRegisto
        });

    } catch (error) {
        console.error('Registration error:', error);
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

        // Validação dos campos obrigatórios
        if (!email) throw new ErrorHandler(400, 'The EMAIL field is required.');
        if (!password) throw new ErrorHandler(400, 'The PASSWORD field is required.');

        // Verifica se existe
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new ErrorHandler(404, 'The user with the provided credentials was not found.');
        }

        // Confirma a Password
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            throw new ErrorHandler(401, 'Invalid credentials.');
        }

        // Cria o token
        const token = jwt.sign(
            { 
                userId: user.idUtilizador,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ accessToken: token });

    } catch (error) {
        if ([400, 401, 404].includes(error.statusCode)) {
            return next(error);
        }
        next(new ErrorHandler(500, 'An unexpected error occurred during login.'));
    }
};