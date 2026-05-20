const adminService = require('../services/adminServices.js');

const getDashboardData = async (req, res) => {
    try {
        const data = await adminService.getAdminDashboardData();
        res.json(data);
    } catch (error) {
        console.error('Lỗi tại Admin Controller:', error);
        res.status(500).json({ error: 'Lỗi máy chủ khi lấy dữ liệu dashboard' });
    }

};

module.exports = {
    getDashboardData
};