const express = require('express');
const router = express.Router();
const transcriptController = require('../controllers/transcriptController.js');
const lessonController = require('../controllers/lessonsController.js');

/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Public lesson APIs
 */

/**
 * @swagger
 * /api/v1/lessons:
 *   get:
 *     summary: Get lessons
 *     description: Returns lessons ordered by created_at DESC. Supports filtering by category_id, level, and title search.
 *     tags: [Lessons]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Optional category ID filter
 *       - in: query
 *         name: level
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional lesson level filter
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional case-insensitive title search keyword
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
 *         description: Number of lessons per page
 *     responses:
 *       200:
 *         description: Lessons returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lesson'
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
 *                 - id: 1
 *                   category_id: 1
 *                   title: "Basic Greetings"
 *                   description: "Learn common greetings"
 *                   video_url: "https://example.com/video.mp4"
 *                   thumbnail_url: "https://example.com/thumb.jpg"
 *                   level: "beginner"
 *                   duration: 300
 *                   created_at: "2026-05-15T00:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 total_pages: 1
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Internal server error
 */
router.get('/', lessonController.getLessons);

/**
 * @swagger
 * /api/v1/lessons/{lessonId}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Lessons]
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
 *         description: Lesson returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Lesson'
 *             example:
 *               data:
 *                 id: 1
 *                 category_id: 1
 *                 title: "Basic Greetings"
 *                 description: "Learn common greetings"
 *                 video_url: "https://example.com/video.mp4"
 *                 thumbnail_url: "https://example.com/thumb.jpg"
 *                 level: "beginner"
 *                 duration: 300
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *       404:
 *         description: Lesson not found
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
 *                       example: 404
 *                     message:
 *                       type: string
 *                       example: lesson not found
 *             example:
 *               error:
 *                 code: 404
 *                 message: lesson not found
 *       500:
 *         description: Internal server error
 */
router.get('/:lessonId', lessonController.getLessonById);

/**
 * @swagger
 * /api/v1/lessons/{lessonId}/transcripts:
 *   get:
 *     summary: Get transcripts by lesson ID
 *     description: Returns transcripts for a lesson ordered by sequence. If the lesson exists but has no transcripts, data is an empty array.
 *     tags: [Lessons]
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
 *         description: Transcripts returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       end_timestamp:
 *                         type: number
 *                       lesson_id:
 *                         type: integer
 *                       phonetic:
 *                         type: string
 *                       sequence:
 *                         type: integer
 *                       start_timestamp:
 *                         type: number
 *                       vietnamese:
 *                         type: string
 *             example:
 *               message: Transcripts retrieved successfully
 *               data:
 *                 - id: 1
 *                   content: "Hello, how are you?"
 *                   end_timestamp: 2.5
 *                   lesson_id: 1
 *                   phonetic: "heh-loh, how ar yoo"
 *                   sequence: 0
 *                   start_timestamp: 0
 *                   vietnamese: "Xin chao, ban khoe khong?"
 *       400:
 *         description: Invalid lesson ID
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
 *                     message:
 *                       type: string
 *             example:
 *               error:
 *                 code: 400
 *                 message: lessonId must be a positive integer
 *       404:
 *         description: Lesson not found
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
 *                     message:
 *                       type: string
 *             example:
 *               error:
 *                 code: 404
 *                 message: Lesson not found
 *       500:
 *         description: Internal server error
 */
router.get('/:lessonId/transcripts', transcriptController.getTranscriptsByLessonId);

module.exports = router;
