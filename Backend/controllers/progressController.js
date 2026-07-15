const progressService = require('../services/progressService.js');
const { dataResponse, errorResponse } = require('../utils/response.js');
const { setPrivateNoStore } = require('../utils/cacheHeaders.js');

// Lấy thông tin báo cáo học tập tổng hợp của người dùng
const getStats = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        if (!userId) return errorResponse(res, 401, 'Unauthorized');

        const stats = await progressService.getProgressStats(userId);
        setPrivateNoStore(res);
        return dataResponse(res, 200, stats);
    } catch (error) {
        console.error('Error in getStats controller:', error);
        next(error);
    }
};

module.exports = {
    getStats
};
