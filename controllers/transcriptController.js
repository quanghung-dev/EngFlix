const { errorResponse, dataResponse } = require('../utils/response');
const transcriptService = require('../services/transcriptServices.js');

const createTranscript = async (req, res, next) => {
    try {
        const { content, end_timestamp, lesson_id, phonetic, sequence, start_timestamp, vietnamese } = req.body;
        if ([content, end_timestamp, lesson_id, phonetic, sequence, start_timestamp, vietnamese].some((value) => value === undefined || value === null || value === '')) {
            return errorResponse(res, 400, 'content, end_timestamp, lesson_id, phonetic, sequence, start_timestamp va vietnamese la bat buoc');
        }

        const lessonExists = await transcriptService.lessonExists(lesson_id);
        if (!lessonExists) {
            return errorResponse(res, 404, 'Lesson not found');
        }

        const newTranscript = await transcriptService.createTranscript({ content, end_timestamp, lesson_id, phonetic, sequence, start_timestamp, vietnamese });
        if (!newTranscript) {
            return errorResponse(res, 400, 'Failed to create transcript');
        }
        return dataResponse(res, 201, newTranscript);
    } catch (error) {
        next(error);
    }
};

const getTranscriptsById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const transcript = await transcriptService.getTranscriptsById(id);
        if (!transcript) {
            return errorResponse(res, 404, 'Transcript not found');
        }
        return dataResponse(res, 200, transcript);
    } catch (error) {
        next(error);
    }
};
const getTranscriptsByLessonId = async (req, res, next) => {
    try {
        const lessonId = parseInt(req.params.lessonId);
        const lessonExists = await transcriptService.lessonExists(lessonId);
        if (!lessonExists) {
            return errorResponse(res, 404, 'Lesson not found');
        }

        const transcripts = await transcriptService.getTranscriptsByLessonId(lessonId);
        return dataResponse(res, 200, transcripts)
    } catch (error) {
        next(error);
    }
};
const updateTranscript = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { content, end_timestamp, phonetic, sequence, start_timestamp, vietnamese } = req.body;
        if ([content, end_timestamp, phonetic, sequence, start_timestamp, vietnamese].some((value) => value === undefined || value === null || value === '')) {
            return errorResponse(res, 400, 'content, end_timestamp, phonetic, sequence, start_timestamp va vietnamese la bat buoc');
        }

        const result = await transcriptService.updateTranscript(id, { content, end_timestamp, phonetic, sequence, start_timestamp, vietnamese });
        if (!result) {
            return errorResponse(res, 404, 'Transcript not found');
        }
        return dataResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};

const deleteTranscript = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await transcriptService.deleteTranscript(id);
        if (!result) {
            return errorResponse(res, 404, 'Transcript not found');
        }
        return dataResponse(res, 200, { message: 'Xoa transcript thanh cong' });

    } catch (error) {
        next(error);
    }
};

const parsePositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const validateTranscriptItems = (transcripts) => {
    if (!Array.isArray(transcripts) || transcripts.length === 0) {
        return 'Mang transcripts la bat buoc va khong duoc rong';
    }

    for (const [index, transcript] of transcripts.entries()) {
        const requiredFields = ['content', 'sequence', 'start_timestamp', 'end_timestamp'];
        const missingField = requiredFields.find((field) =>
            transcript[field] === undefined || transcript[field] === null || transcript[field] === ''
        );

        if (missingField) {
            return `Transcript tai vi tri ${index} thieu ${missingField}`;
        }

        const sequence = Number(transcript.sequence);
        const startTimestamp = Number(transcript.start_timestamp);
        const endTimestamp = Number(transcript.end_timestamp);

        if (!Number.isInteger(sequence) || sequence < 0) {
            return `sequence tai vi tri ${index} phai la so nguyen khong am`;
        }

        if (!Number.isFinite(startTimestamp) || startTimestamp < 0 || !Number.isFinite(endTimestamp) || endTimestamp < 0) {
            return `start_timestamp va end_timestamp tai vi tri ${index} phai la so khong am`;
        }

        if (startTimestamp >= endTimestamp) {
            return `start_timestamp tai vi tri ${index} phai nho hon end_timestamp`;
        }
    }

    return null;
};

const replaceTranscipts = async(req, res, next) =>{
    try {
        const lessonId = parsePositiveInteger(req.params.lessonId);
        if (!lessonId) {
            return errorResponse(res, 400, 'lessonId không hợp lệ');
        }
        const lessonExists = await transcriptService.lessonExists(lessonId);
        if (!lessonExists) {
            return errorResponse(res, 404, 'Lesson not found');
        }

        const { transcripts } = req.body;
        const validationError = validateTranscriptItems(transcripts);
        if (validationError) {
            return errorResponse(res, 400, validationError);
        }
        if (!Array.isArray(transcripts) || transcripts.length === 0) {
            return errorResponse(res, 400, 'Mảng transcripts là bắt buộc và không được rỗng');
        }
        const result = await transcriptService.replaceTranscriptsByLesson(lessonId, transcripts);
        return dataResponse(res, 201, result);

    } catch (error) {
        next(error);
    }
};

const bulkCreateTranscripts = async (req, res, next) => {
    try {
        const lessonId = parsePositiveInteger(req.params.lessonId);
        if (!lessonId) {
            return errorResponse(res, 400, 'lessonId không hợp lệ');
        }
        const lessonExists = await transcriptService.lessonExists(lessonId);
        if (!lessonExists) {
            return errorResponse(res, 404, 'Lesson not found');
        }

        const { transcripts } = req.body;
        const validationError = validateTranscriptItems(transcripts);
        if (validationError) {
            return errorResponse(res, 400, validationError);
        }
        if (!Array.isArray(transcripts) || transcripts.length === 0) {
            return errorResponse(res, 400, 'Mảng transcripts là bắt buộc và phải có ít nhất 1 phần tử');
        }
        const result = await transcriptService.bulkCreateTranscripts(lessonId, transcripts);
        return dataResponse(res, 201, result);
    } catch (error) {
        next(error);
    }

};

module.exports = {
    createTranscript,
    getTranscriptsById,
    updateTranscript,
    deleteTranscript,
    getTranscriptsByLessonId,
    replaceTranscipts,
    bulkCreateTranscripts
};
