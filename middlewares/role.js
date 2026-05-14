const pool = require('../db/index.js');
const { AppError } = require('../utils/AppError.js');

const requireRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.uid) {
                return next(new AppError('Unauthorized', 401));
            }

            const uid = req.user.uid;
            const query = 'SELECT user_role FROM users WHERE id = $1';
            const result = await pool.query(query, [uid]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy user trong database' });
            }

            const userRole = result.rows[0].user_role;
            if (userRole != requiredRole) {
                return res.status(403).json({ 
                    error: `Truy cập bị từ chối. API này chỉ dành cho ${requiredRole}. Bạn đang là ${userRole}.` 
                });
            }

            next();
        } catch (error) {
            console.error('Lỗi khi kiểm tra vai trò người dùng:', error);
            next(new AppError('Lỗi máy chủ khi kiểm tra vai trò người dùng', 500));
        }
    }
};

module.exports = requireRole;
