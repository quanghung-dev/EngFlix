const friendshipService = require('../services/friendshipService.js');
const { dataResponse, errorResponse } = require('../utils/response.js');

// Lấy danh sách bạn bè đã kết bạn
const getFriendsList = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        if (!userId) return errorResponse(res, 401, 'Unauthorized');

        const friends = await friendshipService.getFriends(userId);
        return dataResponse(res, 200, friends);
    } catch (error) {
        console.error('Error in getFriendsList:', error);
        next(error);
    }
};

// Lấy lời mời kết bạn nhận được đang chờ
const getIncomingRequests = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        if (!userId) return errorResponse(res, 401, 'Unauthorized');

        const requests = await friendshipService.getPendingRequests(userId);
        return dataResponse(res, 200, requests);
    } catch (error) {
        console.error('Error in getIncomingRequests:', error);
        next(error);
    }
};

// Gửi lời mời kết bạn mới
const sendRequest = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const { friend_id } = req.body;

        if (!userId) return errorResponse(res, 401, 'Unauthorized');
        if (!friend_id) return errorResponse(res, 400, 'friend_id is required');

        const request = await friendshipService.sendFriendRequest(userId, friend_id);
        return dataResponse(res, 201, request);
    } catch (error) {
        console.error('Error in sendRequest:', error);
        next(error);
    }
};

// Chấp nhận lời mời kết bạn
const acceptRequest = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const { id } = req.params;

        if (!userId) return errorResponse(res, 401, 'Unauthorized');
        if (!id) return errorResponse(res, 400, 'id is required');

        const updated = await friendshipService.acceptFriendRequest(userId, id);
        return dataResponse(res, 200, updated);
    } catch (error) {
        console.error('Error in acceptRequest:', error);
        next(error);
    }
};

// Từ chối lời mời hoặc xoá kết bạn (Huỷ bạn bè)
const declineOrRemove = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const { id } = req.params;

        if (!userId) return errorResponse(res, 401, 'Unauthorized');
        if (!id) return errorResponse(res, 400, 'id is required');

        const deleted = await friendshipService.declineOrRemoveFriend(userId, id);
        return dataResponse(res, 200, deleted);
    } catch (error) {
        console.error('Error in declineOrRemove:', error);
        next(error);
    }
};

// Tìm kiếm người dùng khác trong hệ thống để kết bạn
const searchNewFriends = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const { query } = req.query;

        if (!userId) return errorResponse(res, 401, 'Unauthorized');
        if (!query) return errorResponse(res, 400, 'query is required');

        const users = await friendshipService.searchUsersToAdd(userId, query);
        return dataResponse(res, 200, users);
    } catch (error) {
        console.error('Error in searchNewFriends:', error);
        next(error);
    }
};

module.exports = {
    getFriendsList,
    getIncomingRequests,
    sendRequest,
    acceptRequest,
    declineOrRemove,
    searchNewFriends
};
