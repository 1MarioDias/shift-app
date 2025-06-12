// filepath: c:\Users\shouk\Documents\LTSIW\2ºAno\ProjetoII\shift-app\server\app.js
const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.PORT;
const host = process.env.HOST;

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const diffSeconds = (Date.now() - start) / 1000;
        console.log(`Request: ${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
});

app.use('/events', require('./routes/events.routes.js'));
app.use('/users', require('./routes/users.routes.js'));
app.use('/comments', require('./routes/comments.routes.js'));

app.use((req, res, next) => {
    res.status(404).json({ message: `The requested resource was not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
    console.error(err); 
    if (err.type === 'entity.parse.failed')
        return res.status(400).json({ error: 'Invalid JSON payload! Check if your body data is a valid JSON.' });

    // Sequelize validation errors (ALL models)
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            error: 'Validation error',
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // SequelizeDatabaseError related to an invalid ENUM value (USERS table -> role field)
    if (err.name === 'SequelizeDatabaseError') {
        if (err.original.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
            return res.status(400).json({
                error: 'Invalid value for enumerated field',
                message: err.message
            });
        }
        if (err.original.code === 'ER_BAD_NULL_ERROR') {
            return res.status(400).json({
                error: 'Missing mandatory field',
                message: err.message
            });
        }
        if (err.original.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                error: 'Duplicate entry',
                message: err.message
            });
        }
    }
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, host, () => {
    console.log(`App listening at http://${host}:${port}/`);
});