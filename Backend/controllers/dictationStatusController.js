const { errorResponse, dataResponse } = require('../utils/response');
const dictationStatusServices = require('../services/dictationStatusServices');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const parsePositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const getOptionalLessonId = (req) => {
    const value = req.query.lesson_id || req.query.lessonId;
    if (value === undefined || value === null || value === '') {
        return { lessonId: undefined };
    }

    const lessonId = parsePositiveInteger(value);
    if (!lessonId) {
        return { error: 'lesson_id khong hop le' };
    }

    return { lessonId };
};

const getdictationStatus = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const { lessonId, error } = getOptionalLessonId(req);
        if (error) {
            return errorResponse(res, 400, error);
        }

        const { page, limit, offset } = getPagination(req.query);
        const { result, totalCount } = await dictationStatusServices.getdictationStatus(userId, lessonId, limit, offset);
        return dataResponse(res, 200, result, buildPaginationMeta(page, limit, totalCount));
    } catch (error) {
        next(error);
    }
};

const setdictationStatus = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const transcriptId = parsePositiveInteger(req.params.transcriptId);
        if (!transcriptId) {
            return errorResponse(res, 400, 'transcriptId khong hop le');
        }

        const result = await dictationStatusServices.setdictationStatus(userId, transcriptId);
        if (!result) {
            return errorResponse(res, 404, 'Transcript not found');
        }

        const statusCode = result.already_exists ? 200 : 201;
        return dataResponse(res, statusCode, result);
    } catch (error) {
        if (error.code === '23503') {
            return errorResponse(res, 404, 'User not found');
        }
        next(error);
    }
};

module.exports = {
    getdictationStatus,
    setdictationStatus
}
