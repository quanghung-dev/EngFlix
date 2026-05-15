const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonsController.js');

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
 *     summary: Get all lessons
 *     tags: [Admin Lessons]
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/', lessonController.getAllLessons);

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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     category_id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     video_url:
 *                       type: string
 *                     thumbnail_url:
 *                       type: string
 *                     level:
 *                       type: string
 *                     duration:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     category_id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     video_url:
 *                       type: string
 *                     thumbnail_url:
 *                       type: string
 *                     level:
 *                       type: string
 *                     duration:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               message: Tao bai hoc thanh cong
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     category_id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     video_url:
 *                       type: string
 *                     thumbnail_url:
 *                       type: string
 *                     level:
 *                       type: string
 *                     duration:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               message: Cap nhat bai hoc thanh cong
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               message: Xoa bai hoc thanh cong
 *               data: null
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

module.exports = router;
