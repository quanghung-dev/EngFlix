const { errorResponse, dataResponse } = require('../utils/response');
const vocabularyDecksService = require('../services/vocabularyDecksService');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const parsePositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const getVocabularyDecks = async (req, res, next) => {
    try {
        const { category_id } = req.query;
        let categoryId = undefined;
        if (category_id !== undefined && category_id !== null && category_id !== '') {
            categoryId = parsePositiveInteger(category_id);
            if (!categoryId) {
                return errorResponse(res, 400, 'category_id must be a positive integer');
            }
        }
        
        const { page, limit, offset } = getPagination(req.query);
        const { result, totalCount } = await vocabularyDecksService.getVocabularyDecks(categoryId, limit, offset);
        return dataResponse(res, 200, result, buildPaginationMeta(page, limit, totalCount));
    } catch (error) {
        next(error);
    }
};

const getMyVocabularyDecks = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const { page, limit, offset } = getPagination(req.query);
        const { result, totalCount } = await vocabularyDecksService.getVocabularyDecksByUserId(userId, limit, offset);
        return dataResponse(res, 200, result, buildPaginationMeta(page, limit, totalCount));
    } catch (error) {
        next(error);
    }
};

const createVocabularyDecks = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const { category_id, name, description, level, thumbnail_url } = req.body;
        if (!name) {
            return errorResponse(res, 400, 'name la bat buoc');
        }
        
        let categoryId = undefined;
        if (category_id !== undefined && category_id !== null && category_id !== '') {
            categoryId = parsePositiveInteger(category_id);
            if (!categoryId) {
                return errorResponse(res, 400, 'category_id must be a positive integer');
            }
        }
        
        const result = await vocabularyDecksService.createVocabularyDecks(userId, categoryId, name, description, level, thumbnail_url);
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
        const userId = req.user.uid;
        const id = parsePositiveInteger(req.params.id);
        const { name, description, level, thumbnail_url } = req.body;

        if (!id) {
            return errorResponse(res, 400, 'id must be a positive integer');
        }

        if (!name) {
            return errorResponse(res, 400, 'name la bat buoc');
        }

        const result = await vocabularyDecksService.updateVocabularyDecks(userId, id, name, description, level, thumbnail_url);
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
        const userId = req.user.uid;
        const id = parsePositiveInteger(req.params.id);
        if (!id) {
            return errorResponse(res, 400, 'id must be a positive integer');
        }
        const result = await vocabularyDecksService.deleteVocabularyDecks(userId, id);
        if (!result) {
            return errorResponse(res, 404, 'Khong tim thay');
        }
        return dataResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};



module.exports = {
    getVocabularyDecks,
    getMyVocabularyDecks,
    createVocabularyDecks,
    updateVocabularyDecks,
    deleteVocabularyDecks,
};
