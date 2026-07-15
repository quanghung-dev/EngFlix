const categoryService = require('../services/categoryService.js');
const { successResponse, dataResponse, errorResponse } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { redisClient, getIsRedisConnected } = require('../db/redis');
const e = require('cors');
const { setPublicCache } = require('../utils/cacheHeaders.js');
const { revalidateFrontend } = require('../utils/revalidateFrontend.js');

const getAllCategories = async (req, res, next) => {
    try {
        const { limit, offset, page } = getPagination(req.query);
        const cacheKey = `categories:limit:${limit}:offset:${offset}`;

        const isBypass = req.headers['cache-control'] === 'no-cache' || 
                         req.headers['pragma'] === 'no-cache' || 
                         req.query.refresh === 'true';

        if (getIsRedisConnected() && !isBypass) {
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    const { categories, totalCount } = JSON.parse(cachedData);
                    setPublicCache(res);
                    return dataResponse(res, 200, categories, buildPaginationMeta(page, limit, totalCount));
                }
            } catch (err) {
                console.error('Redis get error for categories:', err.message);
            }
        }

        const { categories, totalCount } = await categoryService.getAllCategories(limit, offset);
        if (categories.length === 0) {
            return errorResponse(res, 404, 'No categories found');
        }

        if (getIsRedisConnected()) {
            try {
                await redisClient.set(cacheKey, JSON.stringify({ categories, totalCount }), {
                    EX: 3600
                });
            } catch (err) {
                console.error('Redis set error for categories:', err.message);
            }
        }

        setPublicCache(res);
        return dataResponse(res, 200, categories, buildPaginationMeta(page, limit, totalCount));
    } catch (error) {
        next(error);
    }
};

const clearCategoriesCache = async () => {
    if (getIsRedisConnected()) {
        try {
            const keys = await redisClient.keys('categories:*');
            if (keys && keys.length > 0) {
                await redisClient.del(keys);
            }
        } catch (err) {
            console.error('Lỗi xoá cache categories:', err.message);
        }
    }
};

const createCategory = async (req, res, next) => {
    try {
        const {name} = req.body;
        if (!name) {
            return errorResponse(res, 400, 'Tên danh mục là bắt buộc');
        }
        const result = await categoryService.createCategory( name );
        if (!result) {
            return errorResponse(res, 500, 'Tạo danh mục thất bại');
        }
        await clearCategoriesCache();
        await revalidateFrontend(['topics', 'categories']);
        return dataResponse(res,201, result);
    } catch (error) {
        next(error);
    }
};

const getCategoryById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await categoryService.getCategoryById(id);
        if (!result) {
            return errorResponse(res, 404, 'Không tìm thấy danh mục với ID đã cho');
        }
        return dataResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const id = req.params.id;
        const {name} = req.body;
        if (!name) {
            return errorResponse(res, 400, 'Tên danh mục là bắt buộc');
        }   
        const result = await categoryService.updateCategory(id,name );
        if (!result) {
            return errorResponse(res, 404, 'Không tìm thấy danh mục với ID đã cho');
        }
        await clearCategoriesCache();
        await revalidateFrontend(['topics', 'categories', 'lessons']);
        return dataResponse(res, 200, result);
    } catch (error) {
        next(error);    
    }
};
const deleteCategory = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await categoryService.deleteCategory(id);
        if (!result) {
            return errorResponse(res, 404, 'Không tìm thấy danh mục với ID đã cho');
        }
        await clearCategoriesCache();
        await revalidateFrontend(['topics', 'categories', 'lessons']);
        return dataResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};  
