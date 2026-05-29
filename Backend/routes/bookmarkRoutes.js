const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const bookmarkController = require('../controllers/bookmarkController.js');

/**
 * @swagger
 * tags:
 *   name: Bookmarks
 *   description: Authenticated bookmark APIs
 */

router.use(verifyToken);

/**
 * @swagger
 * /api/v1/bookmarks:
 *   get:
 *     summary: Get current user's bookmarks
 *     description: Returns bookmarks grouped by lesson ID. Use lessonId query to filter one lesson.
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lessonId
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Optional lesson ID filter
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *     responses:
 *       200:
 *         description: Bookmarks returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BookmarkGroupedByLesson'
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
 *                 - lesson_id: 1
 *                   transcripts:
 *                     - transcript_id: 12
 *                       content: "Hello, how are you?"
 *                       phonetic: "hello how are you"
 *                       vietnamese: "Xin chao, ban khoe khong?"
 *                       note: "Review this sentence"
 *                       created_at: "2026-05-15T00:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 total_pages: 1
 *       400:
 *         description: Invalid query parameter
 *       401:
 *         description: Missing or invalid bearer token
 *       403:
 *         description: Token verification failed
 *       500:
 *         description: Internal server error
 */
router.get('/', bookmarkController.getBookmarks);

/**
 * @swagger
 * /api/v1/bookmarks/{lessonId}:
 *   post:
 *     summary: Create bookmark
 *     description: Creates one transcript bookmark in a lesson. If it already exists, returns the existing bookmark.
 *     tags: [Bookmarks]
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
 *             properties:
 *               transcriptId:
 *                 type: integer
 *                 minimum: 1
 *                 description: Transcript ID. The API also accepts transcript_id.
 *               transcript_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Snake_case alias for transcriptId.
 *               note:
 *                 type: string
 *                 nullable: true
 *             oneOf:
 *               - required: [transcriptId]
 *               - required: [transcript_id]
 *           example:
 *             transcriptId: 12
 *             note: "Review this sentence"
 *     responses:
 *       201:
 *         description: Bookmark created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookmarkMutationResponse'
 *             example:
 *               data:
 *                 lesson_id: 1
 *                 transcript_id: 12
 *                 note: "Review this sentence"
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *       200:
 *         description: Bookmark already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookmarkMutationResponse'
 *       400:
 *         description: Invalid lesson ID or transcript ID
 *       401:
 *         description: Missing or invalid bearer token
 *       403:
 *         description: Token verification failed
 *       404:
 *         description: Lesson, transcript, or user not found
 *       500:
 *         description: Internal server error
 */
router.post('/:lessonId', bookmarkController.createBookmark);

/**
 * @swagger
 * /api/v1/bookmarks/{lessonId}:
 *   delete:
 *     summary: Remove bookmark
 *     description: Removes one transcript bookmark in a lesson.
 *     tags: [Bookmarks]
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
 *         name: transcriptId
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Transcript ID. The API also accepts transcript_id.
 *       - in: query
 *         name: transcript_id
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Snake_case alias for transcriptId.
 *     responses:
 *       200:
 *         description: Bookmark removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookmarkMutationResponse'
 *             example:
 *               data:
 *                 lesson_id: 1
 *                 transcript_id: 12
 *                 note: "Review this sentence"
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *       400:
 *         description: Invalid lesson ID or transcript ID
 *       401:
 *         description: Missing or invalid bearer token
 *       403:
 *         description: Token verification failed
 *       404:
 *         description: Bookmark not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:lessonId', bookmarkController.removeBookmark);

module.exports = router;
