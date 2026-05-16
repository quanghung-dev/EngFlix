const { AppError } = require('../utils/AppError');
const bookmarkService = require('../services/bookmarkService.js');
const { successResponse, dataResponse, errorResponse } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const e = require('cors');
const { Ruleset } = require('firebase-admin/security-rules');

const parsePositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const createBookmark = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const lessonId = parsePositiveInteger(req.params.LessonId);
        if (!lessonId) {
            return errorResponse(res, 400, 'lessonId không hợp lệ');
        }
        const result = await bookmarkService.createBookmark(userId, lessonId);
        if (!result){
            return errorResponse(res, 500, 'Thêm bookmark thất bại');
        }
        return dataResponse(res,200,result)
    } catch (error) {
        if (error.code === '23503')
            return errorResponse(res, 404, 'Bài học không tồn tại');
            next(error);
        }
};

const removeBookmark = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const lessonId = parsePositiveInteger(req.params.LessonId);
        if (!lessonId){
            return errorResponse(res,404,'Không tìm thấy bookmark để xóa' )
        }
        const result = await bookmarkService.removeBookmark(userId,lessonId);
        return dataResponse(res,200,{ message: 'Xóa danh mục thành công' });
    } catch (error) {
        next(error);
    }
}

const getBookmark = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const lessonId = parsePositiveInteger(req.params.LessonId);
        const {limit , offset , page} = getPagination(req.query);
        const {bookmarks, totalCount} = await bookmarkService.getBookmarks(userId,lessonId);
        return dataResponse(res,200,bookmarks,buildPaginationMeta(page,limit,totalCount));
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createBookmark,
    removeBookmark,
    getBookmark
}