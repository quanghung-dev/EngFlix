const getAdminDashboardData = async () => {
    return {
        message: 'Chào mừng bạn đến với dashboard của admin!',
        stats: {
            totalUsers: 100, 
            activeNow: 5
        }
    };


};

module.exports = {
    getAdminDashboardData
};
