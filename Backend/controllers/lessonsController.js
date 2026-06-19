const { dataResponse, errorResponse } = require('../utils/response');
const lessonService = require('../services/lessonsService.js');
const categoryService = require('../services/categoryService.js');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const parseOptionalPositiveInteger = (value, fieldName) => {
    if (value === undefined || value === null || value === '') {
        return { value: undefined };
    }

    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
        return { error: `${fieldName} must be a positive integer` };
    }

    return { value: number };
};

const getLessons = async (req, res, next) => {
    try {
        const { category_id, level, search } = req.query;
        const categoryIdResult = parseOptionalPositiveInteger(category_id, 'category_id');
        if (categoryIdResult.error) {
            return errorResponse(res, 400, categoryIdResult.error);
        }

        const { limit, offset, page } = getPagination(req.query);
        const { lessons, totalCount } = await lessonService.getLessons(categoryIdResult.value, level, search, limit, offset);
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
        if (!newLesson) {
            return errorResponse(res, 500, 'Tao bai hoc that bai');
        }
        return dataResponse(res, 201, newLesson);
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
        if (!updatedLesson) {
            return errorResponse(res, 404, 'Khong tim thay bai hoc de cap nhat');
        }
        return dataResponse(res, 200, updatedLesson);
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
        return dataResponse(res, 200, { message: 'Xoa bai hoc thanh cong' });
    } catch (error) {
        next(error);
    }
};

const createLessonFromYoutube = async (req, res, next) => {
    try {
        const { category_id, youtube_url } = req.body;
        if (!category_id || !youtube_url) {
            return errorResponse(res, 400, 'category_id va youtube_url la bat buoc');
        }

        const category = await categoryService.getCategoryById(category_id);
        if (!category) {
            return errorResponse(res, 404, 'Category khong ton tai');
        }

        const newLesson = await lessonService.createLessonFromYoutube(category_id, youtube_url);
        if (!newLesson) {
            return errorResponse(res, 500, 'Tao bai hoc tu youtube that bai');
        }
        return dataResponse(res, 201, newLesson);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLessons,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
    createLessonFromYoutube
};
