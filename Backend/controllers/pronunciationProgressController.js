const { dataResponse, errorResponse } = require('../utils/response');
const pronunciationProgressService = require('../services/pronunciationProgressService');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const parsePositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const getPronunciationProgress = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const lessonId = parseInt(req.params.lessonId);
        const { limit, offset, page } = getPagination(req.query);
        if (!userId) {
            return errorResponse(res, 400, 'userId is required');
        }
        if (!lessonId) {
            return errorResponse(res, 400, 'not a valid lessonId');
        }
        const { progress, total } = await pronunciationProgressService.getPronunciationProgress(userId, lessonId, limit, offset);
        return dataResponse(res, 200, progress, buildPaginationMeta(page, limit, total));
    } catch (error) {
        next(error);
    }
};

const updatePronunciationProgress = async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const transcriptId = parsePositiveInteger(req.params.transcriptId);
        if (!userId) {
            return errorResponse(res, 400, 'userId is required');
        }
        if (!transcriptId) {
            return errorResponse(res, 400, 'not a valid transcriptId');
        }

        const result = await pronunciationProgressService.updatePronunciationProgress(userId, transcriptId);
        if (!result) {
            return errorResponse(res, 404, 'Pronunciation attempts not found');
        }

        return dataResponse(res, 200, result);
    } catch (error) {
        if (error.code === '23503') {
            return errorResponse(res, 404, 'User, lesson, transcript, or attempt not found');
        }
        next(error);
    }
};


module.exports = {
    getPronunciationProgress,
    updatePronunciationProgress
};
