const { successResponse } = require('../utils/response');
const lessonService = require('../services/lessonsServices.js');
const { AppError } = require('../utils/AppError');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');

const getLessons = async (req, res, next) => {
    try {
        const category_id = req.query.category_id;
        if (!category_id) {
            return next(new AppError('Vui lòng cung cấp category_id trên URL', 400));
        }
        const {limit , offset, page } = getPagination(req.query);
        const { lessons, totalCount } = await lessonService.getLessonsByCategory(category_id, limit, offset);
        const responseData = formatPaginatedResponse(lessons, totalCount, page, limit);
        return successResponse(res, 200, 'Lấy danh sách bài học thành công', responseData);

    } catch (error) {
        next(error);
    }
};

const getLessonById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const lesson = await lessonService.getLessonById(id);
        if (!lesson) {
            return next(new AppError('Không tìm thấy bài học', 404));
        }
        return successResponse(res, 200, 'Lấy thông tin bài học thành công', lesson);
    } catch (error) {
        next(error);
    }
};
const createLesson = async (req, res, next) => {
    try {
        const { category_id, title, video_url, description } = req.body;
        if (!category_id || !title || !video_url) {
            return next(new AppError('category_id, title và video_url là bắt buộc', 400));
        }
        const newLesson = await lessonService.createLesson({ category_id, title, video_url, description });
        return successResponse(res, 201, 'Tạo bài học thành công', newLesson);
    } catch (error) {
        next(error);
    }
};
const updateLesson = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { category_id, title, video_url, description } = req.body;
        if (!category_id || !title || !video_url) {
            return next(new AppError('category_id, title và video_url là bắt buộc', 400));
        }
        const updatedLesson = await lessonService.updateLesson(id, { category_id, title, video_url, description });
        return successResponse(res, 200, "Cập nhật bài học thành công", updatedLesson);
    } catch (error) {
        next(error);
    }
};  
const deleteLesson = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await lessonService.deleteLesson(id);
        if (!result) {       
            return next(new AppError('Không tìm thấy bài học để xóa', 404));
        }
        return successResponse(res,200,'Xóa bài học thành công'); 
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLessons,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson
};
