const { dataResponse, errorResponse } = require('../utils/response');
const learningHistoryService = require('../services/learningHistoryService');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const parsePositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const parseOptionalBoolean = (value) => {
    if (value === undefined || value === null || value === '') {
        return false;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return null;
};

const getLearningHistory = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const { page, limit, offset } = getPagination(req.query);
        const { histories, totalCount } = await learningHistoryService.getHistories(userId, limit, offset);
        return dataResponse(res, 200, histories, buildPaginationMeta(page, limit, totalCount));
    } catch (error) {
        next(error);
    }
};

const recordLearningHistory = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const { completed, duration_watched, lesson_id } = req.body;

        if (!lesson_id || duration_watched === undefined || duration_watched === null) {
            return errorResponse(res, 400, 'lesson_id and duration_watched are required');
        }

        const lessonId = parsePositiveInteger(lesson_id);
        if (!lessonId) {
            return errorResponse(res, 400, 'lesson_id must be a positive integer');
        }

        const durationWatchedNum = Number(duration_watched);
        if (!Number.isFinite(durationWatchedNum) || durationWatchedNum < 0) {
            return errorResponse(res, 400, 'duration_watched must be a non-negative number');
        }

        const completedValue = parseOptionalBoolean(completed);
        if (completedValue === null) {
            return errorResponse(res, 400, 'completed must be a boolean');
        }

        const history = await learningHistoryService.recordHistory(
            userId,
            lessonId,
            durationWatchedNum,
            completedValue
        );
        return dataResponse(res, 200, history);
    } catch (error) {
        if (error.code === '23503') {
            return errorResponse(res, 404, 'Lesson or user not found');
        }
        next(error);
    }
};

const getLearningHistoryByLesson = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const lessonId = parsePositiveInteger(req.params.lessonId);
        if (!lessonId) {
            return errorResponse(res, 400, 'lessonId must be a positive integer');
        }

        const history = await learningHistoryService.getHistoryByLesson(userId, lessonId);
        if (!history) {
            return errorResponse(res, 404, 'history not found');
        }

        return dataResponse(res, 200, history);
    } catch (error) {
        next(error);
    }
};

const getLearningHistoryFinished = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const result = await learningHistoryService.getLearningHistoryFinished(userId);
        return dataResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};
const getLearningHistoryUnfinished = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const result = await learningHistoryService.getLearningHistoryUnfinished(userId);
        return dataResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};

const testGetgetLearningHistory = async (req, res, next) => {
    try {
        const result = await learningHistoryService.testGetgetLearningHistory();
        return dataResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLearningHistory,
    recordLearningHistory,
    getLearningHistoryByLesson,
    getLearningHistoryFinished,
    getLearningHistoryUnfinished,
    testGetgetLearningHistory
};
