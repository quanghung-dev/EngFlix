const { errorResponse, dataResponse } = require('../utils/response');
const vocabularyItemsService = require('../services/vocabularyItemsService');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const parsePositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const getVocabularyItems = async (req, res, next) => {
    try {
        const deckId = parsePositiveInteger(req.params.deckId);
        if (!deckId) {
            return errorResponse(res, 400, 'deckId khong hop le');
        }

        const deckExists = await vocabularyItemsService.deckExists(deckId);
        if (!deckExists) {
            return errorResponse(res, 404, 'Deck not found');
        }

        const { page, limit, offset } = getPagination(req.query);
        const { result, totalCount } = await vocabularyItemsService.getVocabularyItems(deckId, limit, offset);
        return dataResponse(res, 200, result, buildPaginationMeta(page, limit, totalCount));
    } catch (error) {
        next(error);
    }
};

const isBlank = (value) => value === undefined || value === null || value === '';

const parseOptionalPositiveInteger = (value) => {
    if (isBlank(value)) {
        return null;
    }
    return parsePositiveInteger(value);
};

const buildVocabularyItemPayload = (body) => {
    const { lesson_id, transcript_id, phrase, normalized_phrase, meaning, example_sentence, note } = body;

    if (isBlank(phrase)) {
        return 'phrase la bat buoc';
    }
    if (isBlank(normalized_phrase)) {
        return 'normalized_phrase la bat buoc';
    }
    if (isBlank(meaning)) {
        return 'meaning la bat buoc';
    }

    const parsedLessonId = parseOptionalPositiveInteger(lesson_id);
    if (!isBlank(lesson_id) && !parsedLessonId) {
        return 'lesson_id khong hop le';
    }

    const parsedTranscriptId = parseOptionalPositiveInteger(transcript_id);
    if (!isBlank(transcript_id) && !parsedTranscriptId) {
        return 'transcript_id khong hop le';
    }

    return {
        lesson_id: parsedLessonId,
        transcript_id: parsedTranscriptId,
        phrase,
        normalized_phrase,
        meaning,
        example_sentence: example_sentence ?? null,
        note: note ?? null
    };
};

const addVocabularyItems = async (req, res, next) => {
    try {
        const deckId = parsePositiveInteger(req.params.deckId);
        if (!deckId) {
            return errorResponse(res, 400, 'deckId khong hop le');
        }

        const deckExists = await vocabularyItemsService.deckExists(deckId);
        if (!deckExists) {
            return errorResponse(res, 404, 'Deck not found');
        }

        const payload = buildVocabularyItemPayload(req.body);
        if (typeof payload === 'string') {
            return errorResponse(res, 400, payload);
        }

        const result = await vocabularyItemsService.addVocabularyItems(deckId, payload);
        return dataResponse(res, 201, result);
    } catch (error) {
        if (error.code === '23503') {
            return errorResponse(res, 400, 'lesson_id hoac transcript_id khong hop le');
        }
        next(error);
    }
};

const updateVocabularyItems = async (req, res, next) => {
    try {
        const deckId = parsePositiveInteger(req.params.deckId);
        const itemId = parsePositiveInteger(req.params.itemId);
        if (!deckId) {
            return errorResponse(res, 400, 'deckId khong hop le');
        }
        if (!itemId) {
            return errorResponse(res, 400, 'itemId khong hop le');
        }

        const payload = buildVocabularyItemPayload(req.body);
        if (typeof payload === 'string') {
            return errorResponse(res, 400, payload);
        }

        const result = await vocabularyItemsService.updateVocabularyItems(deckId, itemId, payload);
        if (!result) {
            return errorResponse(res, 404, 'Vocabulary item not found');
        }

        return dataResponse(res, 200, result);
    } catch (error) {
        if (error.code === '23503') {
            return errorResponse(res, 400, 'lesson_id hoac transcript_id khong hop le');
        }
        next(error);
    }
};

const deleteVocabularyItems = async (req, res, next) => {
    try {
        const deckId = parsePositiveInteger(req.params.deckId);
        const itemId = parsePositiveInteger(req.params.itemId);
        if (!deckId) {
            return errorResponse(res, 400, 'deckId khong hop le');
        }
        if (!itemId) {
            return errorResponse(res, 400, 'itemId khong hop le');
        }

        const result = await vocabularyItemsService.deleteVocabularyItems(deckId, itemId);
        if (!result) {
            return errorResponse(res, 404, 'Vocabulary item not found');
        }

        return dataResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};
module.exports = {
    getVocabularyItems,
    addVocabularyItems,
    updateVocabularyItems,
    deleteVocabularyItems
};
