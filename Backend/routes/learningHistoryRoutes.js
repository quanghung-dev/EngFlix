const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const learningHistoryController = require('../controllers/learningHistoryController.js');

/**
 * @swagger
 * tags:
 *   name: Learning History
 *   description: Authenticated learning history APIs
 */

/**
 * @swagger
 * /api/v1/learning-history/test/all:
 *   get:
 *     summary: Test get all learning history
 *     description: Returns all learning history records for testing without requiring a user ID or bearer token.
 *     tags: [Learning History]
 *     responses:
 *       200:
 *         description: Learning history returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LearningHistory'
 *             example:
 *               data:
 *                 - id: 1
 *                   user_id: "firebase-user-id"
 *                   lesson_id: 1
 *                   duration_watched: 120
 *                   completed: false
 *                   created_at: "2026-05-15T00:00:00.000Z"
 *       500:
 *         description: Internal server error
 */
router.get('/test/all', learningHistoryController.testGetgetLearningHistory);

router.use(verifyToken);

/**
 * @swagger
 * /api/v1/learning-history:
 *   get:
 *     summary: Get current user's learning history
 *     description: Returns the authenticated user's learning history ordered by latest activity.
 *     tags: [Learning History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Number of history records per page
 *     responses:
 *       200:
 *         description: Learning history returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LearningHistory'
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
 *                   user_id: "firebase-user-id"
 *                   lesson_id: 1
 *                   duration_watched: 120
 *                   completed: false
 *                   created_at: "2026-05-15T00:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 total_pages: 1
 *       401:
 *         description: Missing or invalid bearer token
 *       403:
 *         description: Token verification failed
 *       500:
 *         description: Internal server error
 */
router.get('/', learningHistoryController.getLearningHistory);

/**
 * @swagger
 * /api/v1/learning-history:
 *   post:
 *     summary: Record learning history
 *     description: Creates or updates the authenticated user's learning history for a lesson.
 *     tags: [Learning History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lesson_id
 *               - duration_watched
 *             properties:
 *               lesson_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Lesson ID
 *               duration_watched:
 *                 type: number
 *                 minimum: 0
 *                 description: Watched duration in seconds
 *               completed:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the lesson has been completed
 *           example:
 *             lesson_id: 1
 *             duration_watched: 120
 *             completed: false
 *     responses:
 *       200:
 *         description: Learning history recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/LearningHistory'
 *             example:
 *               data:
 *                 id: 1
 *                 user_id: "firebase-user-id"
 *                 lesson_id: 1
 *                 duration_watched: 120
 *                 completed: false
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Missing or invalid bearer token
 *       403:
 *         description: Token verification failed
 *       404:
 *         description: Lesson or user not found
 *       500:
 *         description: Internal server error
 */
router.post('/', learningHistoryController.recordLearningHistory);

/**
 * @swagger
 * /api/v1/learning-history/finished:
 *   get:
 *     summary: Get finished learning history
 *     description: Returns the authenticated user's completed learning history ordered by latest activity.
 *     tags: [Learning History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Finished learning history returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LearningHistory'
 *             example:
 *               data:
 *                 - id: 1
 *                   user_id: "firebase-user-id"
 *                   lesson_id: 1
 *                   duration_watched: 300
 *                   completed: true
 *                   created_at: "2026-05-15T00:00:00.000Z"
 *       401:
 *         description: Missing or invalid bearer token
 *       403:
 *         description: Token verification failed
 *       500:
 *         description: Internal server error
 */
router.get('/finished', learningHistoryController.getLearningHistoryFinished);

/**
 * @swagger
 * /api/v1/learning-history/unfinished:
 *   get:
 *     summary: Get unfinished learning history
 *     description: Returns the authenticated user's unfinished learning history ordered by latest activity.
 *     tags: [Learning History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unfinished learning history returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LearningHistory'
 *             example:
 *               data:
 *                 - id: 2
 *                   user_id: "firebase-user-id"
 *                   lesson_id: 2
 *                   duration_watched: 120
 *                   completed: false
 *                   created_at: "2026-05-16T00:00:00.000Z"
 *       401:
 *         description: Missing or invalid bearer token
 *       403:
 *         description: Token verification failed
 *       500:
 *         description: Internal server error
 */
router.get('/unfinished', learningHistoryController.getLearningHistoryUnfinished);

/**
 * @swagger
 * /api/v1/learning-history/{lessonId}:
 *   get:
 *     summary: Get learning history by lesson ID
 *     description: Returns the authenticated user's learning history for a specific lesson.
 *     tags: [Learning History]
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
 *         description: Learning history returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/LearningHistory'
 *             example:
 *               data:
 *                 id: 1
 *                 user_id: "firebase-user-id"
 *                 lesson_id: 1
 *                 duration_watched: 120
 *                 completed: false
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *       400:
 *         description: Invalid lesson ID
 *       401:
 *         description: Missing or invalid bearer token
 *       403:
 *         description: Token verification failed
 *       404:
 *         description: Learning history not found
 *       500:
 *         description: Internal server error
 */
router.get('/:lessonId', learningHistoryController.getLearningHistoryByLesson);

module.exports = router;
