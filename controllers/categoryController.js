const { AppError } = require('../utils/AppError');
const categoryService = require('../services/categoryServices.js');
const { successResponse, dataResponse, errorResponse } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const e = require('cors');

const getAllCategories = async (req, res, next) => {
    const { limit, offset, page } = getPagination(req.query);
    const { categories, totalCount } = await categoryService.getAllCategories(limit, offset);
    if (categories.length === 0) {
        return errorResponse(res, 404, 'No categories found');
    };
    return dataResponse(res, 200, categories, buildPaginationMeta(page, limit, totalCount));
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
        return dataResponse(res, 200, { message: 'Xóa danh mục thành công' });
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
