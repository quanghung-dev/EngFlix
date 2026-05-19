const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonsController.js');
const transcriptController = require('../controllers/transcriptController.js');
/**
 * @swagger
 * tags:
 *   name: Admin Lessons
 *   description: Admin lesson management APIs
 */

/**
 * @swagger
 * /api/v1/admin/lessons:
 *   get:
 *     summary: Get lessons
 *     description: Returns lessons ordered by created_at DESC. Supports filtering by category_id, level, and title search.
 *     tags: [Admin Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category_id
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/', lessonController.getLessons);

/**
 * @swagger
 * /api/v1/admin/lessons/{id}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Admin Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
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
 *                 message: lesson not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', lessonController.getLessonById);

/**
 * @swagger
 * /api/v1/admin/lessons:
 *   post:
 *     summary: Create lesson
 *     tags: [Admin Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - title
 *               - video_url
 *             properties:
 *               category_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               video_url:
 *                 type: string
 *               description:
 *                 type: string
 *           example:
 *             category_id: 1
 *             title: "Basic Greetings"
 *             video_url: "https://example.com/video.mp4"
 *             description: "Learn common greetings"
 *     responses:
 *       201:
 *         description: Lesson created successfully
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
 *                 thumbnail_url: null
 *                 level: null
 *                 duration: null
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *       400:
 *         description: Required fields missing
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
 *                 message: category_id, title va video_url la bat buoc
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/', lessonController.createLesson);

/**
 * @swagger
 * /api/v1/admin/lessons/{id}:
 *   put:
 *     summary: Update lesson
 *     tags: [Admin Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - title
 *               - video_url
 *             properties:
 *               category_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               video_url:
 *                 type: string
 *               description:
 *                 type: string
 *           example:
 *             category_id: 1
 *             title: "Advanced Greetings"
 *             video_url: "https://example.com/video-v2.mp4"
 *             description: "Updated lesson content"
 *     responses:
 *       200:
 *         description: Lesson updated successfully
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
 *                 title: "Advanced Greetings"
 *                 description: "Updated lesson content"
 *                 video_url: "https://example.com/video-v2.mp4"
 *                 thumbnail_url: null
 *                 level: null
 *                 duration: null
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *       400:
 *         description: Required fields missing
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
 *                 message: category_id, title va video_url la bat buoc
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', lessonController.updateLesson);

/**
 * @swagger
 * /api/v1/admin/lessons/{id}:
 *   delete:
 *     summary: Delete lesson
 *     tags: [Admin Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *             example:
 *               data:
 *                 message: Xoa bai hoc thanh cong
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
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
 *                 message: Khong tim thay bai hoc de xoa
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', lessonController.deleteLesson);

/**
 * @swagger
 * /api/v1/admin/lessons/{lessonId}/transcripts:
 *   put:
 *     summary: Replace transcripts of a lesson
 *     description: Deletes all existing transcripts of the lesson, then inserts the provided transcript list in a transaction.
 *     tags: [Admin Lessons]
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
 *               - transcripts
 *             properties:
 *               transcripts:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - content
 *                     - sequence
 *                     - start_timestamp
 *                     - end_timestamp
 *                   properties:
 *                     content:
 *                       type: string
 *                     sequence:
 *                       type: integer
 *                       minimum: 0
 *                     phonetic:
 *                       type: string
 *                     vietnamese:
 *                       type: string
 *                     start_timestamp:
 *                       type: number
 *                       minimum: 0
 *                     end_timestamp:
 *                       type: number
 *                       minimum: 0
 *           example:
 *             transcripts:
 *               - sequence: 0
 *                 content: "Hello, how are you?"
 *                 phonetic: "heh-loh, how ar yoo"
 *                 vietnamese: "Xin chao, ban khoe khong?"
 *                 start_timestamp: 0
 *                 end_timestamp: 2.5
 *     responses:
 *       201:
 *         description: Transcripts replaced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transcript'
 *             example:
 *               data:
 *                 - id: 1
 *                   lesson_id: 1
 *                   sequence: 0
 *                   content: "Hello, how are you?"
 *                   phonetic: "heh-loh, how ar yoo"
 *                   vietnamese: "Xin chao, ban khoe khong?"
 *                   start_timestamp: 0
 *                   end_timestamp: 2.5
 *       400:
 *         description: Invalid lesson ID or transcripts payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Internal server error
 */
router.put('/:lessonId/transcripts',transcriptController.replaceTranscripts);

/**
 * @swagger
 * /api/v1/admin/lessons/{lessonId}/transcripts/bulk:
 *   post:
 *     summary: Bulk create transcripts for a lesson
 *     description: Appends the provided transcript list to the lesson in a transaction. Existing transcripts are not deleted.
 *     tags: [Admin Lessons]
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
 *               - transcripts
 *             properties:
 *               transcripts:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - content
 *                     - sequence
 *                     - start_timestamp
 *                     - end_timestamp
 *                   properties:
 *                     content:
 *                       type: string
 *                     sequence:
 *                       type: integer
 *                       minimum: 0
 *                     phonetic:
 *                       type: string
 *                     vietnamese:
 *                       type: string
 *                     start_timestamp:
 *                       type: number
 *                       minimum: 0
 *                     end_timestamp:
 *                       type: number
 *                       minimum: 0
 *           example:
 *             transcripts:
 *               - sequence: 0
 *                 content: "Hello, how are you?"
 *                 phonetic: "heh-loh, how ar yoo"
 *                 vietnamese: "Xin chao, ban khoe khong?"
 *                 start_timestamp: 0
 *                 end_timestamp: 2.5
 *               - sequence: 1
 *                 content: "I'm fine, thank you."
 *                 phonetic: "ime fine, thank yoo"
 *                 vietnamese: "Toi khoe, cam on ban."
 *                 start_timestamp: 2.6
 *                 end_timestamp: 4.8
 *     responses:
 *       201:
 *         description: Transcripts created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transcript'
 *             example:
 *               data:
 *                 - id: 1
 *                   lesson_id: 1
 *                   sequence: 0
 *                   content: "Hello, how are you?"
 *                   phonetic: "heh-loh, how ar yoo"
 *                   vietnamese: "Xin chao, ban khoe khong?"
 *                   start_timestamp: 0
 *                   end_timestamp: 2.5
 *                 - id: 2
 *                   lesson_id: 1
 *                   sequence: 1
 *                   content: "I'm fine, thank you."
 *                   phonetic: "ime fine, thank yoo"
 *                   vietnamese: "Toi khoe, cam on ban."
 *                   start_timestamp: 2.6
 *                   end_timestamp: 4.8
 *       400:
 *         description: Invalid lesson ID or transcripts payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Internal server error
 */
router.post('/:lessonId/transcripts/bulk', transcriptController.bulkCreateTranscripts);

/**
 * @swagger
 * /api/v1/admin/lessons/{lessonId}/transcripts:
 *   get:
 *     summary: Get transcripts by lesson ID
 *     description: Returns transcripts for a lesson ordered by sequence. If the lesson exists but has no transcripts, data is an empty array.
 *     tags: [Admin Lessons]
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
 *         description: Transcripts returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transcript'
 *             example:
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Internal server error
 */
router.get('/:lessonId/transcripts', transcriptController.getTranscriptsByLessonId);

module.exports = router;
