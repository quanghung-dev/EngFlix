const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const pronunciationAttemptsController = require('../controllers/pronunciationAttemptsController.js');

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

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Pronunciation Attempts
 *   description: Pronunciation attempt assessment APIs
 */

/**
 * @swagger
 * /api/v1/pronunciation-attempts:
 *   post:
 *     summary: Create a pronunciation assessment attempt
 *     description: Upload a WAV audio file, assess it with Azure Speech, save the attempt, and return the assessment result.
 *     tags: [Pronunciation Attempts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *               - referenceText
 *               - lessonId
 *               - transcriptId
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: WAV audio file to assess. Supported MIME types are audio/wav and audio/x-wav.
 *               referenceText:
 *                 type: string
 *                 description: Text that the speaker is expected to read
 *                 example: "No problem. You're welcome. Don't worry about it."
 *               lessonId:
 *                 type: integer
 *                 minimum: 1
 *                 description: Lesson ID that contains the transcript
 *               transcriptId:
 *                 type: integer
 *                 minimum: 1
 *                 description: Transcript ID being assessed
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
 *                       example: "No problem. You're welcome. Don't worry about it."
 *                     overallScore:
 *                       type: number
 *                       example: 82.2
 *                     scores:
 *                       type: object
 *                       properties:
 *                         accuracy:
 *                           type: number
 *                           nullable: true
 *                           example: 97
 *                         fluency:
 *                           type: number
 *                           nullable: true
 *                           example: 81
 *                         completeness:
 *                           type: number
 *                           nullable: true
 *                           example: 100
 *                         prosody:
 *                           type: number
 *                           nullable: true
 *                           example: 66.4
 *                     feedback:
 *                       type: string
 *                       example: "Ban phat am kha tot. Ngu dieu con hoi deu, can nhan nha tu nhien hon."
 *                     words:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           word:
 *                             type: string
 *                             example: "welcome"
 *                           score:
 *                             type: number
 *                             example: 91
 *                           feedback:
 *                             type: string
 *                             example: "Can phat am ro hon am /w/."
 *                           weakPhonemes:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 phoneme:
 *                                   type: string
 *                                   example: "w"
 *                                 score:
 *                                   type: number
 *                                   example: 75
 *                     attempt:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 101
 *                         userId:
 *                           type: string
 *                           example: "firebase-user-uid"
 *                         lessonId:
 *                           type: integer
 *                           example: 12
 *                         transcriptId:
 *                           type: integer
 *                           example: 45
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-06-06T10:30:00.000Z"
 *             example:
 *               data:
 *                 text: "No problem. You're welcome. Don't worry about it."
 *                 overallScore: 82.2
 *                 scores:
 *                   accuracy: 97
 *                   fluency: 81
 *                   completeness: 100
 *                   prosody: 66.4
 *                 feedback: "Ban phat am kha tot. Ngu dieu con hoi deu, can nhan nha tu nhien hon."
 *                 words:
 *                   - word: "welcome"
 *                     score: 91
 *                     feedback: "Can phat am ro hon am /w/."
 *                     weakPhonemes:
 *                       - phoneme: "w"
 *                         score: 75
 *                 attempt:
 *                   id: 101
 *                   userId: "firebase-user-uid"
 *                   lessonId: 12
 *                   transcriptId: 45
 *                   createdAt: "2026-06-06T10:30:00.000Z"
 *       400:
 *         description: Missing required field, invalid IDs, or unsupported audio format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     message:
 *                       type: string
 *                       example: "lessonId must be a positive integer"
 *       401:
 *         description: Missing or invalid Firebase bearer token
 *       404:
 *         description: User, lesson, or transcript not found
 *       500:
 *         description: Internal server error
 */
router.post('/', upload.single('audio'), pronunciationAttemptsController.assessPronunciationAttempt);

/**
 * @swagger
 * /api/v1/pronunciation/attempts/{attemptId}:
 *   delete:
 *     summary: Delete a pronunciation attempt
 *     description: Delete a specific pronunciation attempt for the current user and return the deleted attempt's details.
 *     tags: [Pronunciation Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Pronunciation attempt ID
 *     responses:
 *       200:
 *         description: Pronunciation attempt deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 101
 *                     user_id:
 *                       type: string
 *                       example: "firebase-user-uid"
 *                     lesson_id:
 *                       type: integer
 *                       example: 12
 *                     transcript_id:
 *                       type: integer
 *                       example: 45
 *                     reference_text:
 *                       type: string
 *                       example: "No problem. You're welcome. Don't worry about it."
 *                     overall_score:
 *                       type: number
 *                       example: 82.20
 *                     accuracy_score:
 *                       type: number
 *                       example: 97.00
 *                     fluency_score:
 *                       type: number
 *                       example: 81.00
 *                     completeness_score:
 *                       type: number
 *                       example: 100.00
 *                     prosody_score:
 *                       type: number
 *                       example: 66.40
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-06-06T10:30:00.000Z"
 *       400:
 *         description: Missing or invalid parameter
 *       401:
 *         description: Missing or invalid Firebase bearer token
 *       404:
 *         description: Attempt not found
 *       500:
 *         description: Internal server error
 */
router.delete('/attempts/:attemptId', pronunciationAttemptsController.deletePronunciationAttempt);

module.exports = router;
