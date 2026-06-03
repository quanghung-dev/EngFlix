const fs = require("fs");
const { errorResponse, dataResponse } = require('../utils/response');
const pronunciationService = require('../services/pronunciationService');

const assessPronunciation = async (req, res, next) => {
    const file = req.file;
    try {
        const { referenceText } = req.body;
        if (!file) {
            return errorResponse(res, 400, 'No audio file uploaded');
        }
        if (!referenceText) {
            return errorResponse(res, 400, 'referenceText is required');
        }
        const result = await pronunciationService.assessPronunciation(file.path, referenceText);
        return dataResponse(res, 200, result);

    }catch (error) {
        next(error);
    } finally {
        if (file?.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    }
}

module.exports = {
    assessPronunciation,
};
