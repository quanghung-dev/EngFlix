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
 *     description: Returns the authenticated user's bookmarks grouped by lesson ID. Each lesson contains bookmarked transcripts.
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
 *         description: Current page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of bookmarks per page
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
 *                       phonetic: "həˈloʊ haʊ ɑr ju"
 *                       vietnamese: "Xin chào, bạn khỏe không?"
 *                       note: "Review this sentence"
 *                       created_at: "2026-05-15T00:00:00.000Z"
 *                     - transcript_id: 13
 *                       content: "I am fine, thank you."
 *                       phonetic: "aɪ æm faɪn θæŋk ju"
 *                       vietnamese: "Tôi khỏe, cảm ơn bạn."
 *                       note: null
 *                       created_at: "2026-05-14T00:00:00.000Z"
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
 *   get:
 *     summary: Get bookmarks by lesson ID
 *     description: Returns the authenticated user's bookmarks for a specific lesson grouped under that lesson ID. Data is an empty array when the lesson is not bookmarked.
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
 *         description: Number of bookmarks per page
 *     responses:
 *       200:
 *         description: Bookmark returned successfully
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
 *                       phonetic: "həˈloʊ haʊ ɑr ju"
 *                       vietnamese: "Xin chào, bạn khỏe không?"
 *                       note: "Review this sentence"
 *                       created_at: "2026-05-15T00:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 total_pages: 1
 *       400:
 *         description: Invalid lesson ID
 *       401:
 *         description: Missing or invalid bearer token
 *       403:
 *         description: Token verification failed
 *       500:
 *         description: Internal server error
 */
router.get('/:lessonId', bookmarkController.getBookmarks);

/**
 * @swagger
 * /api/v1/bookmarks/{lessonId}:
 *   post:
 *     summary: Create bookmark
 *     description: Adds a bookmark for the authenticated user. If it already exists, the existing bookmark is returned.
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
 *                 description: Optional bookmark note
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
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     lesson_id:
 *                       type: integer
 *                     transcript_id:
 *                       type: integer
 *                     note:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
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
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     lesson_id:
 *                       type: integer
 *                     transcript_id:
 *                       type: integer
 *                     note:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
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
 *     description: Removes one transcript bookmark for the authenticated user and lesson, then returns the removed bookmark.
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
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     lesson_id:
 *                       type: integer
 *                     transcript_id:
 *                       type: integer
 *                     note:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
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
