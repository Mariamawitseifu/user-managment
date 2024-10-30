const mongoose = require("mongoose");
const logger = require('../logger');

const mongoUrl = process.env.MONGO_URL;

exports.mongoConnect = () => {
    return mongoose.connect(mongoUrl || "mongodb://mongo:27017/users-role-perm", {
    })
    .then(() => {
        logger.info('Database connected successfully');
    })
    .catch(err => {
        logger.error(`Database connection failed: ${err.message}`);
        process.exit(1);
    });
};

