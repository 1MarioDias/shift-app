// connect to a MySQL database using Sequelize
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        // connection pool settings
        pool: {
            max: 5, // maximum number of connections in pool
            min: 0, // minimum number of connections in pool
            acquire: 30000, // maximum time (in ms) that a connection can be idle before being released
            idle: 10000 // maximum time (in ms) that a connection can be idle before being released
        }
    }
);

// test the connection to the database
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1); // exit the process with a failure code
    }
}
)();

const db = {}; //object to be exported
db.sequelize = sequelize; //save the Sequelize instance (actual connection pool)


// // OPTIONAL: synchronize the DB with the sequelize model
// (async () => {
    // try {
        // await db.sequelize.sync({ alter: true });
        // console.log('DB is successfully synchronized')
    // } catch (error) {
        // console.log(error)
    // }
// })();


module.exports = db; //export the db object with the sequelize instance and models