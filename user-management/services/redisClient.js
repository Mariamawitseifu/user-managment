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

// Utility function to set cache with expiration
const setCache = async (key, value) => {
    const expirationInSeconds = process.env.REDIS_CACHE_EXPIRATION || 3600; // Default to 1 hour if not set
    try {
        await redisClient.set(key, value, {
            EX: expirationInSeconds // Use the expiration time from env
        });
    } catch (err) {
        logger.error('Error setting cache:', err);
    }
};

// Utility function to get cache
const getCache = async (key) => {
    try {
        return await redisClient.get(key);
    } catch (err) {
        logger.error('Error getting cache:', err);
        return null; // Return null if there's an error
    }
};

module.exports = { redisClient, connectRedis, setCache, getCache };
