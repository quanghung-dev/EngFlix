const bookmarkService = require('../services/bookmarkService.js');
const { dataResponse, errorResponse } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const parsePositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const createBookmark = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const lessonId = parsePositiveInteger(req.params.lessonId);
        if (!lessonId) {
            return errorResponse(res, 400, 'lessonId must be a positive integer');
        }

        const { bookmark, created } = await bookmarkService.createBookmark(userId, lessonId);
        return dataResponse(res, created ? 201 : 200, bookmark);
    } catch (error) {
        if (error.code === '23503') {
            return errorResponse(res, 404, 'Lesson or user not found');
        }
        next(error);
    }
};

const removeBookmark = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const lessonId = parsePositiveInteger(req.params.lessonId);
        if (!lessonId) {
            return errorResponse(res, 400, 'lessonId must be a positive integer');
        }

        const removed = await bookmarkService.removeBookmark(userId, lessonId);
        if (!removed) {
            return errorResponse(res, 404, 'Bookmark not found');
        }

        return dataResponse(res, 200, removed);
    } catch (error) {
        next(error);
    }
};

const getBookmarks = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const lessonIdValue = req.params.lessonId || req.query.lessonId;
        let lessonId;

        if (lessonIdValue !== undefined && lessonIdValue !== null && lessonIdValue !== '') {
            lessonId = parsePositiveInteger(lessonIdValue);
            if (!lessonId) {
                return errorResponse(res, 400, 'lessonId must be a positive integer');
            }
        }

        const { limit, offset, page } = getPagination(req.query);
        const { bookmarks, totalCount } = await bookmarkService.getBookmarks(userId, lessonId, limit, offset);
        return dataResponse(res, 200, bookmarks, buildPaginationMeta(page, limit, totalCount));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBookmark,
    removeBookmark,
    getBookmarks
};
