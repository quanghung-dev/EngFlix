const authService = require('../services/authService.js');

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
    syncUser
};  
