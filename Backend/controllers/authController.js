const authService = require('../services/authService.js');
const { dataResponse, errorResponse } = require('../utils/response.js');

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorResponse(res, 400, 'Email and password are required');
        }

        const token = await authService.signInWithFirebase({ email, password });
        return dataResponse(res, 200, token);
    } catch (error) {
        console.error('Error logging in with Firebase:', error);
        next(error);
    }
};

const syncUser = async (req, res, next) => {
    try {
        const { uid, email, name, avatarUrl, phone } = req.user;

        if (!uid || !email) {
            return errorResponse(res, 400, 'Authenticated Firebase user must have uid and email');
        }

        const user = await authService.syncUser({ uid, email, name, avatarUrl, phone });
        return dataResponse(res, 200, user);
    } catch (error) {
        console.error('Error syncing user:', error);
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { name, phone } = req.body;

        if (!uid) {
            return errorResponse(res, 401, 'Unauthorized');
        }

        const user = await authService.updateUser(uid, { name, phone });
        return dataResponse(res, 200, user);
    } catch (error) {
        console.error('Error updating user profile:', error);
        next(error);
    }
};

module.exports = {
    login,
    syncUser,
    updateProfile
};  
