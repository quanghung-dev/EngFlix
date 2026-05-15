const { successResponse } = require('../utils/response');
const { AppError } = require('../utils/AppError');
const categoryService = require('../services/categoryServices.js');

const getAllCategories = async (req, res, next) => {
    try {
        const result = await categoryService.getAllCategories();
        return successResponse(res, 200, 'Lấy danh sách danh mục thành công', result);
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const {name} = req.body;
    if (!name) {
        return next(new AppError('Tên danh mục là bắt buộc', 400));
    }
    const result = await categoryService.createCategory( name );
    return successResponse(res, 201, 'Tạo danh mục thành công', result);
    } catch (error) {
        next(error);
    }
};

const getCategoryById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await categoryService.getCategoryById(id);
        return successResponse(res, 200, 'Lay thong tin danh muc thanh cong', result);
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const id = req.params.id;
        const {name} = req.body;
        if (!name) {
            return next(new AppError('Tên danh mục là bắt buộc', 400));
        }   
        const result = await categoryService.updateCategory(id,name );
        if (!result) {
            return next(new AppError('Không tìm thấy danh mục với ID đã cho', 404));
        }
        return successResponse(res, 200, 'Cập nhật danh mục thành công', result);
    } catch (error) {
        next(error);    
    }
};
const deleteCategory = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await categoryService.deleteCategory(id);
        if (!result) {
            return next(new AppError('Không tìm thấy danh mục với ID đã cho', 404));
        }
        return successResponse(res, 200, 'Xóa danh mục thành công');
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
