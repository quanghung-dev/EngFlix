const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const transcriptBookmarksController = require('../controllers/transcriptBookmarksController.js');

/**
 * @swagger
 * tags:
 *   name: Transcript Bookmarks
 *   description: Authenticated transcript bookmark APIs
 */

router.use(verifyToken);

/**
 * @swagger
 * /api/v1/transcript-bookmarks/{lessonId}:
 *   get:
 *     summary: Get current user's transcript bookmarks
 *     description: Returns the authenticated user's transcript bookmarks in one lesson ordered by bookmarked time.
 *     tags: [Transcript Bookmarks]
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
 *         description: Number of transcript bookmarks per page
 *     responses:
 *       200:
 *         description: Transcript bookmarks returned successfully
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
 *                       user_id:
 *                         type: string
 *                       transcript_id:
 *                         type: integer
 *                       lesson_id:
 *                         type: integer
 *                       note:
 *                         type: string
 *                         nullable: true
 *                       created_at:
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
 *                 - id: 1
 *                   user_id: "firebase-user-id"
 *                   transcript_id: 12
 *                   lesson_id: 1
 *                   note: "Practice pronunciation for this sentence"
 *                   created_at: "2026-05-26T08:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 total_pages: 1
 *       401:
 *         description: Missing or invalid bearer token
 *       500:
 *         description: Internal server error
 */
router.get('/:lessonId', transcriptBookmarksController.getTranscriptBookmarksByUserId);

/**
 * @swagger
 * /api/v1/transcript-bookmarks:
 *   post:
 *     summary: Create transcript bookmark
 *     description: Adds a transcript bookmark for the authenticated user. If it already exists, the existing bookmark is returned.
 *     tags: [Transcript Bookmarks]
 *     security:
 *       - bearerAuth: []
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
 *                 description: Transcript ID
 *               note:
 *                 type: string
 *                 nullable: true
 *                 description: Optional note for the bookmarked transcript
 *           example:
 *             transcript_id: 12
 *             note: "Practice pronunciation for this sentence"
 *     responses:
 *       201:
 *         description: Transcript bookmark created successfully
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
 *                     user_id:
 *                       type: string
 *                     transcript_id:
 *                       type: integer
 *                     note:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     already_exists:
 *                       type: boolean
 *             example:
 *               data:
 *                 id: 1
 *                 user_id: "firebase-user-id"
 *                 transcript_id: 12
 *                 note: "Practice pronunciation for this sentence"
 *                 created_at: "2026-05-26T08:00:00.000Z"
 *                 already_exists: false
 *       200:
 *         description: Transcript bookmark already exists
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
 *                     user_id:
 *                       type: string
 *                     transcript_id:
 *                       type: integer
 *                     note:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     already_exists:
 *                       type: boolean
 *             example:
 *               data:
 *                 id: 1
 *                 user_id: "firebase-user-id"
 *                 transcript_id: 12
 *                 note: "Practice pronunciation for this sentence"
 *                 created_at: "2026-05-26T08:00:00.000Z"
 *                 already_exists: true
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Transcript or user not found
 *       500:
 *         description: Internal server error
 */
router.post('/', transcriptBookmarksController.createTranscriptBookmark);

/**
 * @swagger
 * /api/v1/transcript-bookmarks/{id}:
 *   put:
 *     summary: Update transcript bookmark note
 *     description: Updates the note for one authenticated user's transcript bookmark.
 *     tags: [Transcript Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Transcript bookmark ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *                 nullable: true
 *                 description: Updated bookmark note. Use null to clear the note.
 *           example:
 *             note: "Review this line before shadowing practice"
 *     responses:
 *       200:
 *         description: Transcript bookmark updated successfully
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
 *                     user_id:
 *                       type: string
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
 *                 id: 1
 *                 user_id: "firebase-user-id"
 *                 transcript_id: 12
 *                 note: "Review this line before shadowing practice"
 *                 created_at: "2026-05-26T08:00:00.000Z"
 *       400:
 *         description: Invalid request body or bookmark ID
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Transcript bookmark not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', transcriptBookmarksController.updateTranscriptBookmark);

/**
 * @swagger
 * /api/v1/transcript-bookmarks/{id}:
 *   delete:
 *     summary: Delete transcript bookmark
 *     description: Deletes one authenticated user's transcript bookmark.
 *     tags: [Transcript Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Transcript bookmark ID
 *     responses:
 *       200:
 *         description: Transcript bookmark deleted successfully
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
 *                     user_id:
 *                       type: string
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
 *                 id: 1
 *                 user_id: "firebase-user-id"
 *                 transcript_id: 12
 *                 note: "Review this line before shadowing practice"
 *                 created_at: "2026-05-26T08:00:00.000Z"
 *       400:
 *         description: Invalid bookmark ID
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Transcript bookmark not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', transcriptBookmarksController.deleteTranscriptBookmark);

module.exports = router;
