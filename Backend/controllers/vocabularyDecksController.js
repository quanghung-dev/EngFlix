const { errorResponse, dataResponse } = require('../utils/response');
const vocabularyDecksService = require('../services/vocabularyDecksService');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const getVocabularyDecks = async (req, res, next) => {
    try {
        const { category_id } = req.query;
        const { page, limit, offset } = getPagination(req.query);
        const { result, totalCount } = await vocabularyDecksService.getVocabularyDecks(category_id, limit, offset);
        if (!result || result.length === 0) {
            return errorResponse(res, 400, 'Khong tim thay');
        }
        return dataResponse(res, 200, result, buildPaginationMeta(page, limit, totalCount));
    } catch (error) {
        next(error);
    }
};

const createVocabularyDecks = async (req, res, next) => {
    try {
        const { category_id, name, description, level, thumbnail_url } = req.body;
        if (!name) {
            return errorResponse(res, 400, 'name la bat buoc');
        }
        const result = await vocabularyDecksService.createVocabularyDecks(category_id, name, description, level, thumbnail_url);
        return dataResponse(res, 201, result);
    } catch (error) {
        if (error.code === '23503') {
            return errorResponse(res, 400, 'category_id khong hop le');
        }
        next(error);
    }
};

const updateVocabularyDecks = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, level, thumbnail_url } = req.body;

        if (!id) {
            return errorResponse(res, 400, 'id la bat buoc');
        }

        if (!name) {
            return errorResponse(res, 400, 'name la bat buoc');
        }

        const result = await vocabularyDecksService.updateVocabularyDecks(id, name, description, level, thumbnail_url);
        if (!result) {
            return errorResponse(res, 404, 'Khong tim thay');
        }

        return dataResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};

const deleteVocabularyDecks = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return errorResponse(res, 400, 'id la bat buoc');
        }
        const result = await vocabularyDecksService.deleteVocabularyDecks(id);
        if (!result) {
            return errorResponse(res, 404, 'Khong tim thay');
        }
        return dataResponse(res,200,result)
    } catch (error) {
        next(error);
    }
};



module.exports = {
    getVocabularyDecks,
    createVocabularyDecks,
    updateVocabularyDecks,
    deleteVocabularyDecks,
};
