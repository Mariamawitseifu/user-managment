// redis.js
const { createClient } = require('redis');
const logger = require('../logger');

const redisClient = createClient({ url: process.env.REDIS_URL });

const connectRedis = async () => {
    try {
        await redisClient.connect();
        logger.info('Connected to Redis');
    } catch (err) {
        logger.error('Redis connection error:', err);
    }

    redisClient.on('error', (err) => {
        logger.error('Redis Client Error:', err);
    });
};

module.exports = { redisClient, connectRedis };
