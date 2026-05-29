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
    signInWithFirebase,
    syncUser
};
