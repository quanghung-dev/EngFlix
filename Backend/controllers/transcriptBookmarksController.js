const { errorResponse, dataResponse } = require('../utils/response');
const transcriptBookmarksSerrice = require('../services/transcriptBookmarksSerrice');

const createTranscriptBookmark = async (req, res, next) => {
    try {
        const { transcript_id, note } = req.body;
        const user_id = req.user.id;
        const bookmark = await transcriptBookmarksSerrice.createTranscriptBookmark(user_id, transcript_id, note);
        if (!bookmark) {
            return errorResponse(res, 400, 'Failed to create transcript bookmark');
        }
        return dataResponse(res, 201, bookmark);
    } catch (error) {
        next(error);
    }
};

const getTranscriptBookmarksByUserId = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const { limit, offset } = getPaginationParams(req.query);
        const {bookmarks, totalCount} = await transcriptBookmarksSerrice.getTranscriptBookmarksByUserId(user_id, parseInt(limit), parseInt(offset));
        if (!bookmarks) {
            return errorResponse(res, 404, 'Transcript bookmarks not found');
        }
        return dataResponse(res, 200, bookmarks, buildPaginationMeta(totalCount, parseInt(limit), parseInt(offset)));
    } catch (error) {
        next(error);
    }
};

const updateTranscriptBookmark = async (req, res, next) => {
    try {        
        const { id } = req.params;
        const { note } = req.body;
        const updatedBookmark = await transcriptBookmarksSerrice.updateTranscriptBookmark(id, note);
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
        const { id } = req.params;
        const deletedBookmark = await transcriptBookmarksSerrice.deleteTranscriptBookmark(id); 
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