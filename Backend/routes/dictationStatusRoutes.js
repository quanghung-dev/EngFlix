const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const dictationStatusController = require('../controllers/dictationStatusController.js');

/**
 * @swagger
 * tags:
 *   name: Dictation Status
 *   description: Authenticated dictation completion status APIs
 */

router.use(verifyToken);

/**
 * @swagger
 * /api/v1/dictation-status:
 *   get:
 *     summary: Get current user's dictation status
 *     tags: [Dictation Status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lesson_id
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
 *         description: Number of status records per page
 *     responses:
 *       200:
 *         description: Dictation status returned successfully
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
 *                       sequence:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       start_timestamp:
 *                         type: number
 *                         nullable: true
 *                       end_timestamp:
 *                         type: number
 *                         nullable: true
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
 *                   transcript_id: 1
 *                   lesson_id: 1
 *                   completed_at: "2026-05-21T00:00:00.000Z"
 *                   sequence: 1
 *                   content: "Hello, how are you?"
 *                   start_timestamp: 0
 *                   end_timestamp: 2.5
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 total_pages: 1
 *       400:
 *         description: Invalid query parameter
 *       401:
 *         description: Missing or invalid bearer token
 *       500:
 *         description: Internal server error
 */
router.get('/', dictationStatusController.getdictationStatus);

/**
 * @swagger
 * /api/v1/dictation-status/{transcriptId}:
 *   post:
 *     summary: Mark transcript dictation as completed
 *     tags: [Dictation Status]
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
 *       201:
 *         description: Dictation status created successfully
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
 *                     transcript_id:
 *                       type: integer
 *                     lesson_id:
 *                       type: integer
 *                     completed_at:
 *                       type: string
 *                       format: date-time
 *                     already_exists:
 *                       type: boolean
 *             example:
 *               data:
 *                 user_id: "firebase-user-id"
 *                 transcript_id: 1
 *                 lesson_id: 1
 *                 completed_at: "2026-05-21T00:00:00.000Z"
 *                 already_exists: false
 *       200:
 *         description: Dictation status already existed and was refreshed
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
 *                     transcript_id:
 *                       type: integer
 *                     lesson_id:
 *                       type: integer
 *                     completed_at:
 *                       type: string
 *                       format: date-time
 *                     already_exists:
 *                       type: boolean
 *             example:
 *               data:
 *                 user_id: "firebase-user-id"
 *                 transcript_id: 1
 *                 lesson_id: 1
 *                 completed_at: "2026-05-21T00:00:00.000Z"
 *                 already_exists: true
 *       400:
 *         description: Invalid transcript ID
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Transcript or user not found
 *       500:
 *         description: Internal server error
 */
router.post('/:transcriptId', dictationStatusController.setdictationStatus);

module.exports = router;
