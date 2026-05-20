const { errorResponse, dataResponse } = require('../utils/response');
const vocabularyService = require('../services/vocabularyService.js');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const getVocabulary = async (req, res , next) => {
    const {page, limit, offset} = getPagination(req.query);
    const {data, totalCount} = await vocabularyService.getVocabulary(limit,offset);
    if(!data|| data.length === 0){
        return errorResponse(res,404,"Không tìm thấy voca")
    }
    return dataResponse(res,200,data,buildPaginationMeta(page,limit,totalCount));
}

const createVocabularyCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return errorResponse(res, 400, 'Tên danh mục là bắt buộc');
        }

        const result = await vocabularyService.createVocabularyCategory(name, description);
        return dataResponse(res, 201, result);
    } catch (error) {
        if (error.code === '23505') {
            return errorResponse(res, 409, 'Đã tồn tại');
        }
        next(error);
    }
};

const getVocabularyCategorybyCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        if(!id){
            return errorResponse(res,400,"id là bắt buộc")
        }
        const result = await vocabularyService.getVocabularyCategorybyCategory(id);
        if (!result){
            return errorResponse(res, 404, "không tồn tại")
        }
        return dataResponse(res,200,result);
    } catch (error) {
        next(error);
    }

}

const updateVocabularyCategory = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {name, description}  = req.body;
        if(!id ){
            return errorResponse(res, 400 , "Id trống")
        }
        if (!name) {
            return errorResponse(res, 400, 'Ten danh muc vocabulary la bat buoc');
        }
        const result = await vocabularyService.updateVocabularyCategory(id,name, description )
        if(!result) {
            return errorResponse(res,404 , "Không tìm thấy Category")
        }
        return dataResponse(res,200,result)

    } catch (error) {
        if (error.code === '23505') {
            return errorResponse(res, 409, 'Danh muc vocabulary da ton tai');
        }
        next(error);
    }

}

const deleteVocabularyCategory = async (req, res, next) => {
    try {
        const {id} = req.params;
        if(!id ){
            return errorResponse(res, 400 , "Id trống")
        }
        const result = await vocabularyService.deleteVocabularyCategory(id)
        if(!result) {
            return errorResponse(res,404 , "Không tìm thấy Category")
        }
        return dataResponse(res,200,result)
        
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getVocabulary,
    createVocabularyCategory,
    getVocabularyCategorybyCategory,
    updateVocabularyCategory,
    deleteVocabularyCategory
}
