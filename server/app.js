const express = require('express');

// read environment variables from .env file
require('dotenv').config();

const app = express();
const port = process.env.PORT;
const host = process.env.HOST;

// CORS middleware - Move this BEFORE routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// middleware for ALL routes
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const diffSeconds = (Date.now() - start) / 1000;
        console.log(`Request: ${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
});

// use route middleware for /events requests
app.use('/events', require('./routes/events.routes.js'));

app.use('/users', require('./routes/users.routes.js'));

//handle invalid routes (404)    
app.use((req, res, next) => {
    res.status(404).json({ message: `The requested resource was not found: ${req.method} ${req.originalUrl}` });
});

// error middleware (always at the end of the file)
app.use((err, req, res, next) => {
    // !Uncomment this line to log the error details to the server console!
    console.error(err);

    // error thrown by express.json() middleware when the request body is not valid JSON
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
    // other errors
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, host, () => {
    console.log(`App listening at http://${host}:${port}/`);
});