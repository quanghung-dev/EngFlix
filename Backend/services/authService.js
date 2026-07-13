const pool = require('../db/index.js');
const ROLES = require('../constants/roles.js');

const FIREBASE_AUTH_ERROR_MESSAGES = {
    EMAIL_NOT_FOUND: 'Invalid email or password',
    INVALID_PASSWORD: 'Invalid email or password',
    INVALID_LOGIN_CREDENTIALS: 'Invalid email or password',
    USER_DISABLED: 'Firebase user account is disabled',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many failed login attempts. Try again later',
};

const signInWithFirebase = async ({ email, password }) => {
    const apiKey = process.env.FIREBASE_WEB_API_KEY || process.env.FIREBASE_API_KEY;

    if (!apiKey) {
        const error = new Error('Firebase Web API key is not configured');
        error.statusCode = 500;
        throw error;
    }

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        const firebaseCode = result?.error?.message;
        const error = new Error(FIREBASE_AUTH_ERROR_MESSAGES[firebaseCode] || 'Firebase login failed');
        error.statusCode = firebaseCode === 'USER_DISABLED' ? 403 : 401;
        throw error;
    }

    return {
        idToken: result.idToken,
        refreshToken: result.refreshToken,
        expiresIn: Number(result.expiresIn),
        uid: result.localId,
        email: result.email,
    };
};

const syncUser = async ({ uid, email, name, avatarUrl = null, phone = null }) => {
    const query = `
        INSERT INTO users (uid, email, name, user_role, avatar_url, phone)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (uid) DO UPDATE
        SET
            email = EXCLUDED.email,
            name = COALESCE(EXCLUDED.name, users.name),
            avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
            phone = COALESCE(EXCLUDED.phone, users.phone)
        RETURNING
            uid,
            email,
            name,
            user_role,
            avatar_url,
            phone,
            created_at
    `;
    const result = await pool.query(query, [
        uid,
        email,
        name,
        ROLES.User,
        avatarUrl,
        phone
    ]);
    return result.rows[0];
};

const getUserByUid = async (uid) => {
    const result = await pool.query(
        'SELECT uid, email, name, user_role, avatar_url, phone, created_at FROM users WHERE uid = $1',
        [uid]
    );
    return result.rows[0] || null;
};

const getUserProfileCounts = async (uid) => {
    const result = await pool.query(
        `
            SELECT
                (SELECT COUNT(*)::int FROM posts WHERE user_id = $1) AS post_count,
                (
                    SELECT COUNT(DISTINCT CASE
                        WHEN user_id = $1 THEN friend_id
                        ELSE user_id
                    END)::int
                    FROM friendships
                    WHERE status = 'accepted'
                      AND (user_id = $1 OR friend_id = $1)
                ) AS friend_count
        `,
        [uid]
    );
    return result.rows[0] || { post_count: 0, friend_count: 0 };
};

const updateUser = async (uid, { name, phone, avatarUrl }) => {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
        updates.push(`name = $${paramIndex}`);
        values.push(name);
        paramIndex++;
    }

    if (phone !== undefined) {
        updates.push(`phone = $${paramIndex}`);
        values.push(phone);
        paramIndex++;
    }

    if (avatarUrl !== undefined) {
        updates.push(`avatar_url = $${paramIndex}`);
        values.push(avatarUrl);
        paramIndex++;
    }

    if (updates.length === 0) {
        const result = await pool.query('SELECT uid, email, name, user_role, avatar_url, phone, created_at FROM users WHERE uid = $1', [uid]);
        if (result.rows.length === 0) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        return result.rows[0];
    }

    values.push(uid);
    const query = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE uid = $${paramIndex}
        RETURNING uid, email, name, user_role, avatar_url, phone, created_at
    `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    return result.rows[0];
};

module.exports = {
    signInWithFirebase,
    syncUser,
    getUserByUid,
    getUserProfileCounts,
    updateUser
};
