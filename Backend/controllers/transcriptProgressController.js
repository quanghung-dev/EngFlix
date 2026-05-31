const { errorResponse, dataResponse } = require('../utils/response');
const transcriptProgressService = require('../services/transcriptProgressService');

const parsePositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const getTranscriptProgressById = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const lessonId = parsePositiveInteger(req.params.lessonId);
        if (!lessonId) {
            return errorResponse(res, 400, 'lessonId khong hop le');
        }

        const result = await transcriptProgressService.getTranscriptProgressById(userId, lessonId);
        return dataResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};

const createTranscriptProgress = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const lessonId = parsePositiveInteger(req.params.lessonId);
        if (!lessonId) {
            return errorResponse(res, 400, 'lessonId khong hop le');
        }

        const transcriptId = parsePositiveInteger(req.body?.transcript_id);
        if (!transcriptId) {
            return errorResponse(res, 400, 'transcript_id khong hop le');
        }

        const result = await transcriptProgressService.createTranscriptProgress(userId, lessonId, transcriptId);
        if (!result) {
            return errorResponse(res, 404, 'Transcript not found in lesson');
        }

        return dataResponse(res, 200, result);
    } catch (error) {
        if (error.code === '23503') {
            return errorResponse(res, 404, 'User not found');
        }
        next(error);
    }
};

module.exports = {
    getTranscriptProgressById,
    createTranscriptProgress
};
