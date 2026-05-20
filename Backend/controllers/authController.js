const authService = require('../services/authService.js');
const { dataResponse, errorResponse } = require('../utils/response.js');

const syncUser = async (req, res, next) => {
    try {
        const { uid, email, name, avatarUrl } = req.user;

        if (!uid || !email) {
            return errorResponse(res, 400, 'Authenticated Firebase user must have uid and email');
        }

        const user = await authService.syncUser({ uid, email, name, avatarUrl });
        return dataResponse(res, 200, user);
    } catch (error) {
        console.error('Error syncing user:', error);
        next(error);
    }
};

module.exports = {
    syncUser
};  
