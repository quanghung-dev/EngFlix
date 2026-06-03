const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const pronunciationController = require('../controllers/pronunciationController.js');

const uploadDir = path.join(__dirname, '../audio');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
    dest: uploadDir,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'audio/wav' || file.mimetype === 'audio/x-wav') {
            return cb(null, true);
        }

        const error = new Error('Only WAV audio files are supported');
        error.statusCode = 400;
        return cb(error);
    },
});

/**
 * @swagger
 * tags:
 *   name: Pronunciation
 *   description: Pronunciation assessment APIs
 */

/**
 * @swagger
 * /api/v1/pronunciation:
 *   post:
 *     summary: Assess pronunciation from a WAV audio file
 *     tags: [Pronunciation]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *               - referenceText
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: WAV audio file to assess
 *               referenceText:
 *                 type: string
 *                 description: Text that the speaker is expected to read
 *                 example: "No problem. You're welcome. Don't worry about it."
 *                 default: "No problem. You're welcome. Don't worry about it."
 *           encoding:
 *             audio:
 *               contentType: audio/wav
 *     responses:
 *       200:
 *         description: Pronunciation assessment returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     overallScore:
 *                       type: number
 *                     scores:
 *                       type: object
 *                       properties:
 *                         accuracy:
 *                           type: number
 *                           nullable: true
 *                         fluency:
 *                           type: number
 *                           nullable: true
 *                         completeness:
 *                           type: number
 *                           nullable: true
 *                         prosody:
 *                           type: number
 *                           nullable: true
 *                     feedback:
 *                       type: string
 *                     words:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           word:
 *                             type: string
 *                           score:
 *                             type: number
 *                           feedback:
 *                             type: string
 *                           weakPhonemes:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 phoneme:
 *                                   type: string
 *                                 score:
 *                                   type: number
 *             example:
 *               data:
 *                 text: "No problem. You're welcome. Don't worry about it."
 *                 overallScore: 82.2
 *                 scores:
 *                   accuracy: 97
 *                   fluency: 81
 *                   completeness: 100
 *                   prosody: 66.4
 *                 feedback: "Bạn phát âm khá tốt. Ngữ điệu còn hơi đều, cần nhấn nhá tự nhiên hơn. Một số âm trong câu phát âm chưa rõ."
 *                 words:
 *                   - word: "no"
 *                     score: 100
 *                     feedback: "Phát âm tốt."
 *                     weakPhonemes: []
 *                   - word: "you're"
 *                     score: 91
 *                     feedback: "Cần phát âm rõ hơn âm /y/, /r/."
 *                     weakPhonemes:
 *                       - phoneme: "y"
 *                         score: 75
 *                       - phoneme: "r"
 *                         score: 62
 *       400:
 *         description: Missing required field or unsupported audio format
 *       500:
 *         description: Internal server error
 */
router.post('/', upload.single('audio'), pronunciationController.assessPronunciation);

module.exports = router;
