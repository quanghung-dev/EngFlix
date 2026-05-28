const { errorResponse, dataResponse } = require('../utils/response');
const transcriptBookmarksService = require('../services/transcriptBookmarksService');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const createTranscriptBookmark = async (req, res, next) => {
    try {
        const { transcript_id, note } = req.body;
        const user_id = req.user.uid;
        const bookmark = await transcriptBookmarksService.createTranscriptBookmark(user_id, transcript_id, note);
        if (!bookmark) {
            return errorResponse(res, 400, 'Failed to create transcript bookmark');
        }
        const statusCode = bookmark.already_exists ? 200 : 201;
        return dataResponse(res, statusCode, bookmark);
    } catch (error) {
        next(error);
    }
};

const getTranscriptBookmarksByUserId = async (req, res, next) => {
    try {
        const user_id = req.user.uid;
        const { page,limit, offset } = getPagination(req.query);
        const {bookmarks, totalCount} = await transcriptBookmarksService.getTranscriptBookmarksByUserId(user_id, parseInt(limit), parseInt(offset));
        if (!bookmarks) {
            return errorResponse(res, 404, 'Transcript bookmarks not found');
        }
        return dataResponse(res, 200, bookmarks, buildPaginationMeta(page,limit,totalCount ));
    } catch (error) {
        next(error);
    }
};

const updateTranscriptBookmark = async (req, res, next) => {
    try {        
        const user_id = req.user.uid;
        const { id } = req.params;
        const { note } = req.body;
        const updatedBookmark = await transcriptBookmarksService.updateTranscriptBookmark(user_id,id, note);
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
        const { id } = req.params;
        const deletedBookmark = await transcriptBookmarksService.deleteTranscriptBookmark(user_id,id); 
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
