const pool = require('../db/index.js');

const requireRole = (requiredRole) => {
    return async (req, res, next) => {
        const uid = req.user.uid;
        const query = 'SELECT role FROM users WHERE firebase_uid = $1';
        try {
            const result = await pool.query(query, [uid]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy user trong database' });
            }

            const userRole = result.rows[0].role;
            if (userRole != requiredRole) {
                return res.status(403).json({ 
                    error: `Truy cập bị từ chối. API này chỉ dành cho ${requiredRole}. Bạn đang là ${userRole}.` 
                });
            }

            next();
        } catch (error) {
            console.error('Lỗi khi kiểm tra vai trò người dùng:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = requireRole;