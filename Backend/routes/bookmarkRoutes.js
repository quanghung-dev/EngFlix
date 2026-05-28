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
 *     description: Returns the authenticated user's bookmarked lessons ordered by bookmarked time.
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
 *                     $ref: '#/components/schemas/BookmarkWithLesson'
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
 *                 - user_id: "firebase-user-id"
 *                   lesson_id: 1
 *                   created_at: "2026-05-15T00:00:00.000Z"
 *                   category_id: 1
 *                   title: "Basic Greetings"
 *                   description: "Learn common greetings"
 *                   video_url: "https://example.com/video.mp4"
 *                   thumbnail_url: "https://example.com/thumb.jpg"
 *                   level: "beginner"
 *                   duration: 300
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
 *     summary: Get bookmark by lesson ID
 *     description: Returns the authenticated user's bookmark for a specific lesson. Data is an empty array when the lesson is not bookmarked.
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
 *                     $ref: '#/components/schemas/BookmarkWithLesson'
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
 *                 - user_id: "firebase-user-id"
 *                   lesson_id: 1
 *                   created_at: "2026-05-15T00:00:00.000Z"
 *                   category_id: 1
 *                   title: "Basic Greetings"
 *                   description: "Learn common greetings"
 *                   video_url: "https://example.com/video.mp4"
 *                   thumbnail_url: "https://example.com/thumb.jpg"
 *                   level: "beginner"
 *                   duration: 300
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
 *     responses:
 *       201:
 *         description: Bookmark created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/BookmarkWithLesson'
 *             example:
 *               data:
 *                 user_id: "firebase-user-id"
 *                 lesson_id: 1
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *                 category_id: 1
 *                 title: "Basic Greetings"
 *                 description: "Learn common greetings"
 *                 video_url: "https://example.com/video.mp4"
 *                 thumbnail_url: "https://example.com/thumb.jpg"
 *                 level: "beginner"
 *                 duration: 300
 *       200:
 *         description: Bookmark already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/BookmarkWithLesson'
 *             example:
 *               data:
 *                 user_id: "firebase-user-id"
 *                 lesson_id: 1
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *                 category_id: 1
 *                 title: "Basic Greetings"
 *                 description: "Learn common greetings"
 *                 video_url: "https://example.com/video.mp4"
 *                 thumbnail_url: "https://example.com/thumb.jpg"
 *                 level: "beginner"
 *                 duration: 300
 *       400:
 *         description: Invalid lesson ID
 *       401:
 *         description: Missing or invalid bearer token
 *       403:
 *         description: Token verification failed
 *       404:
 *         description: Lesson or user not found
 *       500:
 *         description: Internal server error
 */
router.post('/:lessonId', bookmarkController.createBookmark);

/**
 * @swagger
 * /api/v1/bookmarks/{lessonId}:
 *   delete:
 *     summary: Remove bookmark
 *     description: Removes a bookmark for the authenticated user and lesson, then returns the removed bookmark with lesson details.
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
 *     responses:
 *       200:
 *         description: Bookmark removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/BookmarkWithLesson'
 *             example:
 *               data:
 *                 user_id: "firebase-user-id"
 *                 lesson_id: 1
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *                 category_id: 1
 *                 title: "Basic Greetings"
 *                 description: "Learn common greetings"
 *                 video_url: "https://example.com/video.mp4"
 *                 thumbnail_url: "https://example.com/thumb.jpg"
 *                 level: "beginner"
 *                 duration: 300
 *       400:
 *         description: Invalid lesson ID
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
