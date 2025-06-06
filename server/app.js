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

// Comment out this line:
// app.options('*', cors(corsOptions)); 

app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const diffSeconds = (Date.now() - start) / 1000;
        console.log(`Request: ${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
});

// Ensure these are still commented out:
app.use('/events', require('./routes/events.routes.js'));
app.use('/users', require('./routes/users.routes.js'));
app.use('/comments', require('./routes/comments.routes.js'));

app.use((req, res, next) => {
    res.status(404).json({ message: `The requested resource was not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
    console.error(err); // Make sure you're seeing the error here
    // ... rest of your error handler
    if (err.type === 'entity.parse.failed') // ...
    // ... (keep your existing error handler logic)
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, host, () => {
    console.log(`App listening at http://${host}:${port}/`);
});