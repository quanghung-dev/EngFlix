const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const transcriptProgressController = require('../controllers/transcriptProgressController.js');

/**
 * @swagger
 * tags:
 *   name: Transcript Progress
 *   description: Authenticated transcript completion progress APIs
 */

router.use(verifyToken);

/**
 * @swagger
 * /api/v1/transcript-progress/{lessonId}:
 *   get:
 *     summary: Get completed transcripts in a lesson for current user
 *     tags: [Transcript Progress]
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
 *     responses:
 *       200:
 *         description: Transcript progress returned successfully
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
 *                       transcript_id:
 *                         type: integer
 *                       lesson_id:
 *                         type: integer
 *                       completed_at:
 *                         type: string
 *                         format: date-time
 *             example:
 *               data:
 *                 - user_id: "firebase-user-id"
 *                   transcript_id: 1
 *                   lesson_id: 1
 *                   completed_at: "2026-05-31T07:00:00.000Z"
 *                 - user_id: "firebase-user-id"
 *                   transcript_id: 2
 *                   lesson_id: 1
 *                   completed_at: "2026-05-31T06:55:00.000Z"
 *       400:
 *         description: Invalid lesson ID
 *       401:
 *         description: Missing or invalid bearer token
 *       500:
 *         description: Internal server error
 */
router.get('/:lessonId', transcriptProgressController.getTranscriptProgressById);

/**
 * @swagger
 * /api/v1/transcript-progress/{lessonId}:
 *   post:
 *     summary: Mark a transcript as completed for current user
 *     tags: [Transcript Progress]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transcript_id
 *             properties:
 *               transcript_id:
 *                 type: integer
 *                 minimum: 1
 *           example:
 *             transcript_id: 1
 *     responses:
 *       200:
 *         description: Transcript progress saved successfully
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
 *                     completed_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               data:
 *                 user_id: "firebase-user-id"
 *                 lesson_id: 1
 *                 transcript_id: 1
 *                 completed_at: "2026-05-31T07:00:00.000Z"
 *       400:
 *         description: Invalid lesson ID or transcript ID
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Transcript not found in lesson or user not found
 *       500:
 *         description: Internal server error
 */
router.post('/:lessonId', transcriptProgressController.createTranscriptProgress);

module.exports = router;
