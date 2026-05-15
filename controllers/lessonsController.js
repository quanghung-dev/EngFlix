const { successResponse, dataResponse, errorResponse } = require('../utils/response');
const lessonService = require('../services/lessonsServices.js');
const { AppError } = require('../utils/AppError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const getLessons = async (req, res, next) => {
    try {
        const category_id = req.query.category_id;
        const level = req.query.level;
        const { limit, offset, page } = getPagination(req.query);
        const { lessons, totalCount } = await lessonService.getLessons(category_id, level, limit, offset);
        if (lessons.length === 0) {
            return errorResponse(res, 404, 'No lessons found');
        };
        return dataResponse(res, 200, lessons, buildPaginationMeta(page, limit, totalCount));
    } catch (error) {
        next(error);
    }
};

const getAllLessons = async (req, res, next) => {
    try {
        const { limit, offset, page } = getPagination(req.query);
        const { lessons, totalCount } = await lessonService.getLessons(null, null, limit, offset);
        return dataResponse(res, 200, lessons, buildPaginationMeta(page, limit, totalCount));
    } catch (error) {
        next(error);
    }
};

const getLessonsByCategory = async (req, res, next) => {
    try {
        const category_id = req.query.category_id;
        if (!category_id) {
            return errorResponse(res, 400, 'category_id la bat buoc');
        }

        const { limit, offset, page } = getPagination(req.query);
        const { lessons, totalCount } = await lessonService.getLessonsByCategory(category_id, limit, offset);

        return dataResponse(res, 200, lessons, buildPaginationMeta(page, limit, totalCount));
    } catch (error) {
        next(error);
    }
};

const getLessonById = async (req, res, next) => {
    try {
        const id = req.params.lessonId || req.params.id;
        const lesson = await lessonService.getLessonById(id);
        if (!lesson) {
            return errorResponse(res, 404, 'lesson not found');
        }

        return dataResponse(res, 200, lesson);
    } catch (error) {
        if (error.statusCode === 404) {
            return errorResponse(res, 404, 'lesson not found');
        }
        next(error);
    }
};

const createLesson = async (req, res, next) => {
    try {
        const { category_id, title, video_url, description } = req.body;
        if (!category_id || !title || !video_url) {
            return errorResponse(res, 400, 'category_id, title va video_url la bat buoc');
        }
        const newLesson = await lessonService.createLesson({ category_id, title, video_url, description });
        return successResponse(res, 201, 'Tao bai hoc thanh cong', newLesson);
    } catch (error) {
        next(error);
    }
};

const updateLesson = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { category_id, title, video_url, description } = req.body;
        if (!category_id || !title || !video_url) {
            return errorResponse(res, 400, 'category_id, title va video_url la bat buoc');
        }
        const updatedLesson = await lessonService.updateLesson(id, { category_id, title, video_url, description });
        return successResponse(res, 200, 'Cap nhat bai hoc thanh cong', updatedLesson);
    } catch (error) {
        next(error);
    }
};

const deleteLesson = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await lessonService.deleteLesson(id);
        if (!result) {
            return errorResponse(res, 404, 'Khong tim thay bai hoc de xoa');
        }
        return successResponse(res, 200, 'Xoa bai hoc thanh cong');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLessons,
    getAllLessons,
    getLessonsByCategory,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson
};
