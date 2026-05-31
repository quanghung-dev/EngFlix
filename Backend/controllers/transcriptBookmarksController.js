const { errorResponse, dataResponse } = require('../utils/response');
const transcriptBookmarksService = require('../services/transcriptBookmarksService');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const parsePositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const createTranscriptBookmark = async (req, res, next) => {
    try {
        const { transcript_id, note } = req.body ?? {};
        const parsedTranscriptId = parsePositiveInteger(transcript_id);
        if (!parsedTranscriptId) {
            return errorResponse(res, 400, 'transcript_id must be a positive integer');
        }

        const user_id = req.user.uid;
        const bookmark = await transcriptBookmarksService.createTranscriptBookmark(user_id, parsedTranscriptId, note);
        if (!bookmark) {
            return errorResponse(res, 400, 'Failed to create transcript bookmark');
        }
        const statusCode = bookmark.already_exists ? 200 : 201;
        return dataResponse(res, statusCode, bookmark);
    } catch (error) {
        if (error.code === '23503') {
            return errorResponse(res, 404, 'Transcript or user not found');
        }
        next(error);
    }
};

const getTranscriptBookmarksByUserId = async (req, res, next) => {
    try {
        const user_id = req.user.uid;
        const lessonId = parsePositiveInteger(req.params.lessonId);
        if (!lessonId) {
            return errorResponse(res, 400, 'lessonId must be a positive integer');
        }

        const { page, limit, offset } = getPagination(req.query);
        const { bookmarks, totalCount } = await transcriptBookmarksService.getTranscriptBookmarksByUserId(user_id, lessonId, limit, offset);
        if (!bookmarks) {
            return errorResponse(res, 404, 'Transcript bookmarks not found');
        }
        return dataResponse(res, 200, bookmarks, buildPaginationMeta(page, limit, totalCount));
    } catch (error) {
        next(error);
    }
};

const updateTranscriptBookmark = async (req, res, next) => {
    try {        
        const user_id = req.user.uid;
        const id = parsePositiveInteger(req.params.id);
        if (!id) {
            return errorResponse(res, 400, 'id must be a positive integer');
        }

        if (!req.body || !Object.prototype.hasOwnProperty.call(req.body, 'note')) {
            return errorResponse(res, 400, 'note is required');
        }

        const updatedBookmark = await transcriptBookmarksService.updateTranscriptBookmark(user_id, id, req.body.note);
        if (!updatedBookmark) {
            return errorResponse(res, 404, 'Transcript bookmark not found');
        }
        return dataResponse(res, 200, updatedBookmark);
    } catch (error) {
        next(error);
    }   
};

const deleteTranscriptBookmark = async (req, res, next) => {
    try { 
        const user_id = req.user.uid;
        const id = parsePositiveInteger(req.params.id);
        if (!id) {
            return errorResponse(res, 400, 'id must be a positive integer');
        }

        const deletedBookmark = await transcriptBookmarksService.deleteTranscriptBookmark(user_id, id);
        if (!deletedBookmark) {
            return errorResponse(res, 404, 'Transcript bookmark not found');
        }
        return dataResponse(res, 200, deletedBookmark);
    } catch (error) {
        next(error);
    }
};
module.exports = {
    createTranscriptBookmark,
    getTranscriptBookmarksByUserId,
    updateTranscriptBookmark,
    deleteTranscriptBookmark
};
