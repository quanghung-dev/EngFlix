const chatService = require('../services/chatService.js');
const { dataResponse, errorResponse } = require('../utils/response.js');
const { getPagination, buildPaginationMeta } = require('../utils/pagination.js');

// Lấy danh sách tin nhắn chat phân trang
const getMessages = async (req, res, next) => {
    try {
        const { limit, offset, page } = getPagination(req.query, 50);
        const { messages, total } = await chatService.getChatMessages(limit, offset);
        return dataResponse(res, 200, messages, buildPaginationMeta(page, limit, total));
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        next(error);
    }
};

// Gửi tin nhắn mới vào chat cộng đồng
const sendMessage = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const { content } = req.body;

        if (!userId) {
            return errorResponse(res, 401, 'Unauthorized');
        }
        if (!content || !content.trim()) {
            return errorResponse(res, 400, 'Content is required');
        }

        const newMessage = await chatService.createChatMessage(userId, content.trim());
        return dataResponse(res, 201, newMessage);
    } catch (error) {
        console.error('Error sending chat message:', error);
        next(error);
    }
};

module.exports = {
    getMessages,
    sendMessage
};
