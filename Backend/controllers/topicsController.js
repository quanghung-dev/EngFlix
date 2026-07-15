const topicsService = require('../services/topicsService.js');
const { dataResponse, errorResponse } = require('../utils/response.js');
const { setPublicCache } = require('../utils/cacheHeaders.js');

const parseBoundedInteger = (value, fallback, max) => {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > max) return null;
    return parsed;
};

const getOverview = async (req, res, next) => {
    try {
        const previewLimit = parseBoundedInteger(req.query.preview_limit, 4, 12);
        const lessonLimit = parseBoundedInteger(req.query.lesson_limit, 100, 200);

        if (!previewLimit || !lessonLimit) {
            return errorResponse(
                res,
                400,
                'preview_limit must be between 1 and 12 and lesson_limit must be between 1 and 200'
            );
        }

        const overview = await topicsService.getOverview(previewLimit, lessonLimit);
        setPublicCache(res);
        return dataResponse(res, 200, overview);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOverview
};
