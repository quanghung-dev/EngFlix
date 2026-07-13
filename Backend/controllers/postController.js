const postService = require('../services/postService.js');
const { dataResponse, errorResponse } = require('../utils/response.js');
const { getPagination, buildPaginationMeta } = require('../utils/pagination.js');

// Lấy danh sách bảng tin cộng đồng
const getFeed = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        if (!userId) return errorResponse(res, 401, 'Unauthorized');

        const { limit, offset, page } = getPagination(req.query);
        const { posts, total } = await postService.getPostsFeed(userId, limit, offset);
        return dataResponse(res, 200, posts, buildPaginationMeta(page, limit, total));
    } catch (error) {
        console.error('Error in getFeed controller:', error);
        next(error);
    }
};

// Lấy tường nhà (danh sách bài viết) của 1 học viên cụ thể
const getUserWall = async (req, res, next) => {
    try {
        const currentUserId = req.user?.uid;
        const { userId } = req.params;

        if (!currentUserId) return errorResponse(res, 401, 'Unauthorized');
        if (!userId) return errorResponse(res, 400, 'userId is required');

        const { limit, offset, page } = getPagination(req.query);
        const { posts, total } = await postService.getUserPosts(currentUserId, userId, limit, offset);
        return dataResponse(res, 200, posts, buildPaginationMeta(page, limit, total));
    } catch (error) {
        console.error('Error in getUserWall controller:', error);
        next(error);
    }
};

// Đăng bài viết mới
const createNewPost = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const { content, imageUrl } = req.body;

        if (!userId) return errorResponse(res, 401, 'Unauthorized');
        if (!content || !content.trim()) return errorResponse(res, 400, 'Content is required');

        const post = await postService.createPost(userId, content.trim(), imageUrl || null);
        return dataResponse(res, 201, post);
    } catch (error) {
        console.error('Error in createNewPost controller:', error);
        next(error);
    }
};

const parsePositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

// Xoá bài viết của mình
const deleteUserPost = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const id = parsePositiveInteger(req.params.id);

        if (!userId) return errorResponse(res, 401, 'Unauthorized');
        if (!id) return errorResponse(res, 400, 'id must be a positive integer');

        const deleted = await postService.deletePost(userId, id);
        if (!deleted) return errorResponse(res, 403, 'Not authorized or post not found');
        return dataResponse(res, 200, deleted);
    } catch (error) {
        console.error('Error in deleteUserPost controller:', error);
        next(error);
    }
};

// Thích/Huỷ thích bài viết
const likePost = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const id = parsePositiveInteger(req.params.id);

        if (!userId) return errorResponse(res, 401, 'Unauthorized');
        if (!id) return errorResponse(res, 400, 'id must be a positive integer');

        const result = await postService.toggleLike(userId, id);
        return dataResponse(res, 200, result);
    } catch (error) {
        console.error('Error in likePost controller:', error);
        next(error);
    }
};

// Lấy danh sách bình luận của bài viết
const getComments = async (req, res, next) => {
    try {
        const id = parsePositiveInteger(req.params.id);
        if (!id) return errorResponse(res, 400, 'id must be a positive integer');

        const comments = await postService.getPostComments(id);
        return dataResponse(res, 200, comments);
    } catch (error) {
        console.error('Error in getComments controller:', error);
        next(error);
    }
};

// Viết bình luận vào bài viết
const postComment = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const id = parsePositiveInteger(req.params.id);
        const { content } = req.body;

        if (!userId) return errorResponse(res, 401, 'Unauthorized');
        if (!id) return errorResponse(res, 400, 'id must be a positive integer');
        if (!content || !content.trim()) return errorResponse(res, 400, 'Content is required');

        const comment = await postService.createComment(userId, id, content.trim());
        return dataResponse(res, 201, comment);
    } catch (error) {
        console.error('Error in postComment controller:', error);
        next(error);
    }
};

module.exports = {
    getFeed,
    getUserWall,
    createNewPost,
    deleteUserPost,
    likePost,
    getComments,
    postComment
};
