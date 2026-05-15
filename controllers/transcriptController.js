const { successResponse, errorResponse, dataResponse } = require('../utils/response');
const transcriptService = require('../services/transcriptServices.js');

const isMissing = (value) => {
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
};

const parseNumberValue = (value, fieldName) => {
    if (typeof value !== 'number' && typeof value !== 'string') {
        return { error: `${fieldName} must be a number` };
    }

    const number = Number(value);
    if (!Number.isFinite(number)) {
        return { error: `${fieldName} must be a number` };
    }

    return { value: number };
};

const parsePositiveInteger = (value, fieldName) => {
    const numberResult = parseNumberValue(value, fieldName);
    if (numberResult.error) return numberResult;

    if (!Number.isInteger(numberResult.value) || numberResult.value <= 0) {
        return { error: `${fieldName} must be a positive integer` };
    }
    return { value: numberResult.value };
};

const parseNonNegativeInteger = (value, fieldName) => {
    const numberResult = parseNumberValue(value, fieldName);
    if (numberResult.error) return numberResult;

    if (!Number.isInteger(numberResult.value) || numberResult.value < 0) {
        return { error: `${fieldName} must be a non-negative integer` };
    }
    return { value: numberResult.value };
};

const parseNonNegativeNumber = (value, fieldName) => {
    const numberResult = parseNumberValue(value, fieldName);
    if (numberResult.error) return numberResult;

    if (numberResult.value < 0) {
        return { error: `${fieldName} must be a non-negative number` };
    }
    return { value: numberResult.value };
};

const parseRequiredString = (value, fieldName) => {
    if (typeof value !== 'string') {
        return { error: `${fieldName} must be a string` };
    }
    return { value: value.trim() };
};

const validateTranscriptPayload = (body, { requireLessonId = false } = {}) => {
    body = body || {};
    const requiredFields = ['content', 'end_timestamp', 'phonetic', 'sequence', 'start_timestamp', 'vietnamese'];
    if (requireLessonId) requiredFields.push('lesson_id');

    const missingFields = requiredFields.filter((field) => isMissing(body[field]));
    if (missingFields.length > 0) {
        return { error: `Missing required fields: ${missingFields.join(', ')}` };
    }

    const sequenceResult = parseNonNegativeInteger(body.sequence, 'sequence');
    if (sequenceResult.error) return sequenceResult;

    const startTimestampResult = parseNonNegativeNumber(body.start_timestamp, 'start_timestamp');
    if (startTimestampResult.error) return startTimestampResult;

    const endTimestampResult = parseNonNegativeNumber(body.end_timestamp, 'end_timestamp');
    if (endTimestampResult.error) return endTimestampResult;

    if (startTimestampResult.value >= endTimestampResult.value) {
        return { error: 'start_timestamp must be less than end_timestamp' };
    }

    const contentResult = parseRequiredString(body.content, 'content');
    if (contentResult.error) return contentResult;

    const phoneticResult = parseRequiredString(body.phonetic, 'phonetic');
    if (phoneticResult.error) return phoneticResult;

    const vietnameseResult = parseRequiredString(body.vietnamese, 'vietnamese');
    if (vietnameseResult.error) return vietnameseResult;

    const values = {
        content: contentResult.value,
        end_timestamp: endTimestampResult.value,
        phonetic: phoneticResult.value,
        sequence: sequenceResult.value,
        start_timestamp: startTimestampResult.value,
        vietnamese: vietnameseResult.value
    };

    if (requireLessonId) {
        const lessonIdResult = parsePositiveInteger(body.lesson_id, 'lesson_id');
        if (lessonIdResult.error) return lessonIdResult;
        values.lesson_id = lessonIdResult.value;
    }

    return { values };
};

const createTranscript = async (req, res, next) => {
    try {
        const validation = validateTranscriptPayload(req.body, { requireLessonId: true });
        if (validation.error) {
            return errorResponse(res, 400, validation.error);
        }

        const { content, end_timestamp, lesson_id, phonetic, sequence, start_timestamp, vietnamese } = validation.values;
        const lessonExists = await transcriptService.lessonExists(lesson_id);
        if (!lessonExists) {
            return errorResponse(res, 404, 'Lesson not found');
        }

        const newTranscript = await transcriptService.createTranscript(content, end_timestamp,lesson_id,phonetic,sequence,start_timestamp,vietnamese);
        if (!newTranscript) {
            return errorResponse(res, 400, 'Failed to create transcript');
        }
        return successResponse(res, 201, 'Transcript created successfully', newTranscript);
    } catch (error) {
        return errorResponse(res, 500, 'Internal server error');
    }
};

const getTranscriptsById = async (req, res, next) => {
    const idResult = parsePositiveInteger(req.params.id, 'id');
    if (idResult.error) {
        return errorResponse(res, 400, idResult.error);
    }
    try {
        const transcript = await transcriptService.getTranscriptsById(idResult.value);
        if (!transcript) {
            return errorResponse(res, 404, 'Transcript not found');
        }
        return successResponse(res, 200, 'Transcript retrieved successfully', transcript);
    } catch (error) {
        return errorResponse(res, 500, 'Internal server error');
    }
};
const getTranscriptsByLessonId = async (req, res, next) => {
    const lessonIdResult = parsePositiveInteger(req.params.lessonId, 'lessonId');
    if (lessonIdResult.error) {
        return errorResponse(res, 400, lessonIdResult.error);
    }
    try {
        const lessonExists = await transcriptService.lessonExists(lessonIdResult.value);
        if (!lessonExists) {
            return errorResponse(res, 404, 'Lesson not found');
        }

        const transcripts = await transcriptService.getTranscriptsByLessonId(lessonIdResult.value);
        return dataResponse(res,200,transcripts)
    } catch (error) {
        return errorResponse(res, 500, 'Internal server error');
    }
};
const updateTranscript = async (req, res, next) => {
    const idResult = parsePositiveInteger(req.params.id, 'id');
    if (idResult.error) {
        return errorResponse(res, 400, idResult.error);
    }
    try {
        const validation = validateTranscriptPayload(req.body);
        if (validation.error) {
            return errorResponse(res, 400, validation.error);
        }

        const {content, end_timestamp,phonetic,sequence,start_timestamp,vietnamese} = validation.values;
        const result = await transcriptService.updateTranscript(idResult.value, content, end_timestamp,phonetic,sequence,start_timestamp,vietnamese);
        if (!result) {
            return errorResponse(res, 404, 'Transcript not found');
        }
        return successResponse(res, 200, 'Transcript updated successfully', result);
    } catch (error) {
        return errorResponse(res, 500, 'Internal server error');
    }
};

const deleteTranscript = async (req, res, next) => {
    const idResult = parsePositiveInteger(req.params.id, 'id');
    if (idResult.error) {
        return errorResponse(res, 400, idResult.error);
    }
    try {
        const result = await transcriptService.deleteTranscript(idResult.value);
        if (!result) {
            return errorResponse(res, 404, 'Transcript not found');
        }
        return successResponse(res, 200, 'Transcript deleted successfully');

    } catch (error) {
        return errorResponse(res, 500, 'Internal server error');
    }
};

module.exports = {
    createTranscript,
    getTranscriptsById,
    updateTranscript,
    deleteTranscript,
    getTranscriptsByLessonId
};
