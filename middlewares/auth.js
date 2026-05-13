const admin = require('../firebase/index.js');


const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    };
    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
        
    } catch (error) {
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ 
                error: 'Token_Expired', 
                message: 'Thẻ VIP đã hết hạn, yêu cầu cấp thẻ mới.' 
            });
        }
        return res.status(403).json({ 
            error: 'Invalid_Token',
            message: 'Thẻ VIP giả mạo hoặc không hợp lệ.' 
        });
    }

}

module.exports = verifyToken;