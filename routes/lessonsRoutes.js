const express = require('express');
const router = express.Router();
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
 *     description: Returns all lessons by default. If category_id or level is provided, results are filtered by those values.
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       category_id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       video_url:
 *                         type: string
 *                       thumbnail_url:
 *                         type: string
 *                       level:
 *                         type: string
 *                       duration:
 *                         type: integer
 *                       created_at:
 *                         type: string
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
 *                 - id: 0
 *                   category_id: 0
 *                   title: "string"
 *                   description: "string"
 *                   video_url: "string"
 *                   thumbnail_url: "string"
 *                   level: "string"
 *                   duration: 0
 *                   created_at: "string"
 *               meta:
 *                 page: 0
 *                 limit: 0
 *                 total: 0
 *                 total_pages: 0
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
 *           type: string
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
 *                   type: object
 *             example:
 *               data:
 *                   id: 0
 *                   category_id: 0
 *                   title: "string"
 *                   description: "string"
 *                   video_url: "string"
 *                   thumbnail_url: "string"
 *                   level: "string"
 *                   duration: 0
 *                   created_at: "string"
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

module.exports = router;
