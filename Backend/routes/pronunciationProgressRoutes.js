const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const pronunciationProgressController = require('../controllers/pronunciationProgressController.js');

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Pronunciation Progress
 *   description: Pronunciation progress tracking APIs
 */

/**
 * @swagger
 * /api/v1/pronunciation/progress/{lessonId}:
 *   get:
 *     summary: Get pronunciation progress in a lesson for current user
 *     tags: [Pronunciation Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Lesson ID
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Current page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Pronunciation progress returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                       lesson_id:
 *                         type: integer
 *                       transcript_id:
 *                         type: integer
 *                       best_attempt_id:
 *                         type: integer
 *                         nullable: true
 *                       best_score:
 *                         type: number
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *             example:
 *               data:
 *                 - user_id: "firebase-user-uid"
 *                   lesson_id: 12
 *                   transcript_id: 45
 *                   best_attempt_id: 101
 *                   best_score: 82.20
 *                   created_at: "2026-06-06T10:30:00.000Z"
 *                   updated_at: "2026-06-06T11:55:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 total_pages: 1
 *       400:
 *         description: Missing or invalid parameter
 *       401:
 *         description: Missing or invalid Firebase bearer token
 *       500:
 *         description: Internal server error
 */
router.get('/progress/:lessonId', pronunciationProgressController.getPronunciationProgress);

/**
 * @swagger
 * /api/v1/pronunciation/progress/update/{transcriptId}:
 *   post:
 *     summary: Update pronunciation progress for a transcript
 *     tags: [Pronunciation Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transcriptId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Transcript ID
 *     responses:
 *       200:
 *         description: Pronunciation progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                     lesson_id:
 *                       type: integer
 *                     transcript_id:
 *                       type: integer
 *                     best_attempt_id:
 *                       type: integer
 *                       nullable: true
 *                     best_score:
 *                       type: number
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               data:
 *                 user_id: "firebase-user-uid"
 *                 lesson_id: 12
 *                 transcript_id: 45
 *                 best_attempt_id: 101
 *                 best_score: 82.20
 *                 created_at: "2026-06-06T10:30:00.000Z"
 *                 updated_at: "2026-06-06T11:55:00.000Z"
 *       400:
 *         description: Missing or invalid parameter
 *       401:
 *         description: Missing or invalid Firebase bearer token
 *       404:
 *         description: Pronunciation attempts not found
 *       500:
 *         description: Internal server error
 */
router.post('/progress/update/:transcriptId', pronunciationProgressController.updatePronunciationProgress);

module.exports = router;
