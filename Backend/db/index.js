const {Pool} = require('pg');
require('dotenv').config();

const poolConfig = {};

if (process.env.DATABASE_URL) {
    poolConfig.connectionString = process.env.DATABASE_URL;
} else {
    poolConfig.user = process.env.DB_USER;
    poolConfig.password = process.env.DB_PASSWORD;
    poolConfig.host = process.env.DB_HOST;
    poolConfig.port = process.env.DB_PORT;
    poolConfig.database = process.env.DB_DATABASE;
}

if (
    (poolConfig.connectionString && (poolConfig.connectionString.includes('sslmode=require') || poolConfig.connectionString.includes('neon.tech'))) ||
    (poolConfig.host && poolConfig.host.includes('neon.tech'))
) {
    poolConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = new Pool(poolConfig);

module.exports = pool;