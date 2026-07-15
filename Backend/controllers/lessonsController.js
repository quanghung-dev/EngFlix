const { dataResponse, errorResponse } = require('../utils/response');
const lessonService = require('../services/lessonsService.js');
const categoryService = require('../services/categoryService.js');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { redisClient, getIsRedisConnected } = require('../db/redis');
const studyService = require('../services/studyService.js');
const { setPublicCache, setPrivateNoStore } = require('../utils/cacheHeaders.js');
const { revalidateFrontend } = require('../utils/revalidateFrontend.js');

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
        const cacheKey = `lessons:category_id:${category_id || 'all'}:level:${level || 'all'}:search:${search || 'all'}:limit:${limit}:offset:${offset}`;

        const isBypass = req.headers['cache-control'] === 'no-cache' || 
                         req.headers['pragma'] === 'no-cache' || 
                         req.query.refresh === 'true';

        if (getIsRedisConnected() && !isBypass) {
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    const { lessons, totalCount } = JSON.parse(cachedData);
                    setPublicCache(res);
                    return dataResponse(res, 200, lessons, buildPaginationMeta(page, limit, totalCount));
                }
            } catch (err) {
                console.error('Redis get error for lessons:', err.message);
            }
        }

        const { lessons, totalCount } = await lessonService.getLessons(categoryIdResult.value, level, search, limit, offset);

        if (getIsRedisConnected()) {
            try {
                await redisClient.set(cacheKey, JSON.stringify({ lessons, totalCount }), {
                    EX: 3600
                });
            } catch (err) {
                console.error('Redis set error for lessons:', err.message);
            }
        }

        setPublicCache(res);
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
        setPublicCache(res);
        return dataResponse(res, 200, lesson);
    } catch (error) {
        if (error.statusCode === 404) {
            return errorResponse(res, 404, 'lesson not found');
        }
        next(error);
    }
};

const getStudyContent = async (req, res, next) => {
    try {
        const lessonIdResult = parseOptionalPositiveInteger(req.params.lessonId, 'lessonId');
        if (lessonIdResult.error || !lessonIdResult.value) {
            return errorResponse(res, 400, lessonIdResult.error || 'lessonId must be a positive integer');
        }

        const content = await studyService.getContent(lessonIdResult.value);
        if (!content) return errorResponse(res, 404, 'lesson not found');

        setPublicCache(res);
        return dataResponse(res, 200, content);
    } catch (error) {
        next(error);
    }
};

const getStudyState = async (req, res, next) => {
    try {
        const lessonIdResult = parseOptionalPositiveInteger(req.params.lessonId, 'lessonId');
        const mode = req.query.mode;
        if (lessonIdResult.error || !lessonIdResult.value) {
            return errorResponse(res, 400, lessonIdResult.error || 'lessonId must be a positive integer');
        }
        if (mode !== 'dictation' && mode !== 'shadowing') {
            return errorResponse(res, 400, 'mode must be dictation or shadowing');
        }

        const state = await studyService.getState(req.user.uid, lessonIdResult.value, mode);
        if (!state) return errorResponse(res, 404, 'lesson not found');

        setPrivateNoStore(res);
        return dataResponse(res, 200, state);
    } catch (error) {
        next(error);
    }
};

const clearLessonsCache = async () => {
    if (getIsRedisConnected()) {
        try {
            const keys = await redisClient.keys('lessons:*');
            if (keys && keys.length > 0) {
                await redisClient.del(keys);
            }
        } catch (err) {
            console.error('Lỗi xoá cache lessons:', err.message);
        }
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
        await clearLessonsCache();
        await revalidateFrontend([
            'topics',
            'lessons',
            `lesson:${newLesson.id}`,
            `category:${newLesson.category_id}`
        ]);
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
        await clearLessonsCache();
        await revalidateFrontend([
            'topics',
            'lessons',
            `lesson:${updatedLesson.id}`,
            `category:${updatedLesson.category_id}`
        ]);
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
        await clearLessonsCache();
        await revalidateFrontend(['topics', 'lessons', `lesson:${id}`]);
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
        await clearLessonsCache();
        await revalidateFrontend([
            'topics',
            'lessons',
            `lesson:${newLesson.id}`,
            `category:${newLesson.category_id}`
        ]);
        return dataResponse(res, 201, newLesson);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLessons,
    getLessonById,
    getStudyContent,
    getStudyState,
    createLesson,
    updateLesson,
    deleteLesson,
    createLessonFromYoutube
};
