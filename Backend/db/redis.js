const { createClient } = require('redis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({
    url: redisUrl
});

redisClient.on('error', (err) => {
    // Graceful error logging - do not crash the app
    console.error('Redis Client Error:', err.message);
});

let isRedisConnected = false;

(async () => {
    try {
        await redisClient.connect();
        isRedisConnected = true;
        console.log(`Connected to Redis successfully at ${redisUrl}`);
    } catch (err) {
        console.error(`Could not connect to Redis at ${redisUrl}. Caching will be disabled:`, err.message);
    }
})();

module.exports = {
    redisClient,
    getIsRedisConnected: () => isRedisConnected
};
