const pool = require('../db/index.js');
const ROLES = require('../constants/roles.js');

const getClerkFrontendApiUrl = () => {
    if (process.env.CLERK_FRONTEND_API_URL) {
        return process.env.CLERK_FRONTEND_API_URL.replace(/\/$/, '');
    }

    const publishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!publishableKey) {
        throw new Error('Missing CLERK_FRONTEND_API_URL, CLERK_PUBLISHABLE_KEY, or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
    }

    const encodedUrl = publishableKey.replace(/^pk_(test|live)_/, '');
    const decodedUrl = Buffer.from(encodedUrl, 'base64').toString('utf8').replace(/\$$/, '');
    return `https://${decodedUrl}`;
};

const clerkPost = async (path, body) => {
    const response = await fetch(`${getClerkFrontendApiUrl()}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    return {
        statusCode: response.status,
        data,
        setCookie: response.headers.get('set-cookie')
    };
};

const loginWithClerk = async ({ identifier, password }) => {
    const createSignIn = await clerkPost('/v1/client/sign_ins', { identifier });

    if (createSignIn.statusCode >= 400 || !createSignIn.data?.id) {
        return createSignIn;
    }

    const attemptSignIn = await clerkPost(
        `/v1/client/sign_ins/${createSignIn.data.id}/attempt_first_factor`,
        {
            strategy: 'password',
            identifier,
            password
        }
    );

    return attemptSignIn;
};

const registerWithClerk = async ({ email_address, password, first_name, last_name, username }) => {
    const signUpBody = {
        email_address,
        password
    };

    if (first_name) signUpBody.first_name = first_name;
    if (last_name) signUpBody.last_name = last_name;
    if (username) signUpBody.username = username;

    const createSignUp = await clerkPost('/v1/client/sign_ups', signUpBody);

    if (createSignUp.statusCode >= 400 || !createSignUp.data?.id) {
        return createSignUp;
    }

    const prepareVerification = await clerkPost(
        `/v1/client/sign_ups/${createSignUp.data.id}/prepare_verification`,
        {
            strategy: 'email_code'
        }
    );

    return prepareVerification;
};

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
    loginWithClerk,
    registerWithClerk,
    syncUser
};
