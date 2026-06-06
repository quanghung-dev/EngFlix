const fs = require("fs");
const { errorResponse, dataResponse } = require('../utils/response');
const pronunciationAttemptsService = require('../services/pronunciationAttemptsService');

const parsePositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const assessPronunciationAttempt = async (req, res, next) => {
    const file = req.file;
    try {
        const user_id = req.user.uid;
        const { referenceText } = req.body;
        const lessonId = parsePositiveInteger(req.body.lessonId);
        const transcriptId = parsePositiveInteger(req.body.transcriptId);

        if (!file) {
            return errorResponse(res, 400, 'No audio file uploaded');
        }
        if (!referenceText) {
            return errorResponse(res, 400, 'referenceText is required');
        }
        if (!user_id) {
            return errorResponse(res, 400, 'userId is required');
        }
        if (!lessonId) {
            return errorResponse(res, 400, 'lessonId must be a positive integer');
        }
        if (!transcriptId) {
            return errorResponse(res, 400, 'transcriptId must be a positive integer');
        }

        const result = await pronunciationAttemptsService.assessPronunciationAttempt({
            filePath: file.path,
            referenceText,
            user_id,
            lessonId,
            transcriptId
        });
        return dataResponse(res, 200, result);

    } catch (error) {
        if (error.code === '23503') {
            return errorResponse(res, 404, 'User, lesson, or transcript not found');
        }
        next(error);
    } finally {
        if (file?.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    }
};

const deletePronunciationAttempt = async (req, res, next) => {
    const user_id = req.user.uid;
    const attemptId = parsePositiveInteger(req.params.attemptId);

    if (!user_id) {
        return errorResponse(res, 400, 'User not found');
    }
    if (!attemptId) {
        return errorResponse(res, 400, 'attemptId must be a positive integer');
    }

    try {
        const result = await pronunciationAttemptsService.deletePronunciationAttempt({
            userId: user_id,
            attemptId
        });
        return dataResponse(res, 200, result);
    } catch (error) {
        if (error.statusCode) {
            return errorResponse(res, error.statusCode, error.message);
        }
        if (error.code === '23503') {
            return errorResponse(res, 404, 'User or attempt not found');
        }
        next(error);
    }
};

module.exports = {
    assessPronunciationAttempt,
    deletePronunciationAttempt
};
