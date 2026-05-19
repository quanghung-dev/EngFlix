const pool = require('../db/index.js');
const ROLES = require('../constants/roles.js');

const syncUser = async ({ uid, email, name, avatarUrl = null }) => {
    const query = `
        INSERT INTO users (uid, email, name, user_role, avatar_url)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (uid) DO UPDATE
        SET
            email = EXCLUDED.email,
            name = COALESCE(EXCLUDED.name, users.name),
            avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url)
        RETURNING
            uid,
            email,
            name,
            user_role,
            avatar_url,
            created_at
    `;
    const result = await pool.query(query, [
        uid,
        email,
        name,
        ROLES.User,
        avatarUrl
    ]);
    return result.rows[0];
};

module.exports = {
    syncUser
};
