const e = require('express');
const pool = require('../db/index.js');

const syncUser = async (uid, email) => {
    const checkUserQuery = 'SELECT * FROM users WHERE firebase_uid = $1';
    const checkUserResult = await pool.query(checkUserQuery, [uid]);
    const insertUserQuery = 'INSERT INTO users (firebase_uid, email) VALUES ($1, $2) RETURNING *';

    if (checkUserResult.rows.length > 0) {
        return { isNew: false, user: checkUserResult.rows[0] };
    }
    else {
        const insertUserResult = await pool.query(insertUserQuery, [uid, email]);
        return { isNew: true, user: insertUserResult.rows[0] };

    }
};

module.exports = {
    syncUser
};