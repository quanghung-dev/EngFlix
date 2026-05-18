const authService = require('../services/authService.js');
const { errorResponse } = require('../utils/response.js');

const syncUser = async (req, res, next) => {
    try {
        const { uid, email, name, avatarUrl } = req.user;

        if (!uid || !email) {
            return errorResponse(res, 400, 'Authenticated Firebase user must have uid and email');
        }

        const result = await authService.syncUser({ uid, email, name, avatarUrl });
        const message = result.isNew
            ? 'New user created and synced to the database'
            : 'User already exists in the database';

        return res.status(result.isNew ? 201 : 200).json({
            message,
            user: result.user
        });
    } catch (error) {
        console.error('Error syncing user:', error);
        next(error);
    }
};

module.exports = {
    syncUser
};  
