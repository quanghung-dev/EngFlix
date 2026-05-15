const authService = require('../services/authService.js');
const { errorResponse } = require('../utils/response.js');

const loginWithClerk = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return errorResponse(res, 400, 'identifier and password are required');
        }

        const clerkResponse = await authService.loginWithClerk({ identifier, password });

        if (clerkResponse.setCookie) {
            res.setHeader('set-cookie', clerkResponse.setCookie);
        }

        return res.status(clerkResponse.statusCode).json(clerkResponse.data);
    } catch (error) {
        next(error);
    }
};

const registerWithClerk = async (req, res, next) => {
    try {
        const { email_address, password, first_name, last_name, username } = req.body;

        if (!email_address || !password) {
            return errorResponse(res, 400, 'email_address and password are required');
        }

        const clerkResponse = await authService.registerWithClerk({
            email_address,
            password,
            first_name,
            last_name,
            username
        });

        if (clerkResponse.setCookie) {
            res.setHeader('set-cookie', clerkResponse.setCookie);
        }

        return res.status(clerkResponse.statusCode).json(clerkResponse.data);
    } catch (error) {
        next(error);
    }
};

const syncUser = async (req, res) => {
    const {uid, email} = req.user;
    try {
        const result = await authService.syncUser(uid, email);
        if (!result.isNew) {
            res.json({
                message: 'User đã tồn tại trong cơ sở dữ liệu',
                user: { uid: result.user.id, email: result.user.email }
            });
        } else {
            res.json({
                message: 'User mới đã được tạo và đồng bộ vào cơ sở dữ liệu',
                user: { uid: result.user.id, email: result.user.email }
            });
        }

    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    loginWithClerk,
    registerWithClerk,
    syncUser
};  
