const pool = require('../db/index.js');
const ROLES = require('../constants/roles.js');

const syncUser = async (uid, email) => {
    const checkUserQuery = 'SELECT * FROM users WHERE id = $1';
    const checkUserResult = await pool.query(checkUserQuery, [uid]);
    const insertUserQuery = 'INSERT INTO users (id, email, user_role, password) VALUES ($1, $2, $3, $4) RETURNING *';

    if (checkUserResult.rows.length > 0) {
        return { isNew: false, user: checkUserResult.rows[0] };
    }
    else {
        const insertUserResult = await pool.query(insertUserQuery, [uid, email, ROLES.User, '']);
        return { isNew: true, user: insertUserResult.rows[0] };

    }
};

module.exports = {
    syncUser
};
