const express = require('express');
const router = express.Router();
const transcriptController = require('../controllers/transcriptController.js');

/**
 * @swagger
 * tags:
 *   name: Admin Transcripts
 *   description: Admin transcript management APIs
 */

/**
 * @swagger
 * /api/v1/admin/transcripts:
 *   post:
 *     summary: Create transcript
 *     tags: [Admin Transcripts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - end_timestamp
 *               - lesson_id
 *               - phonetic
 *               - sequence
 *               - start_timestamp
 *               - vietnamese
 *             properties:
 *               content:
 *                 type: string
 *               end_timestamp:
 *                 type: number
 *                 minimum: 0
 *               lesson_id:
 *                 type: integer
 *                 minimum: 1
 *               phonetic:
 *                 type: string
 *               sequence:
 *                 type: integer
 *                 minimum: 0
 *               start_timestamp:
 *                 type: number
 *                 minimum: 0
 *               vietnamese:
 *                 type: string
 *           example:
 *             content: "Hello, how are you?"
 *             end_timestamp: 2.5
 *             lesson_id: 1
 *             phonetic: "heh-loh, how ar yoo"
 *             sequence: 0
 *             start_timestamp: 0
 *             vietnamese: "Xin chao, ban khoe khong?"
 *     responses:
 *       201:
 *         description: Transcript created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Transcript'
 *             example:
 *               data:
 *                 id: 1
 *                 content: "Hello, how are you?"
 *                 end_timestamp: 2.5
 *                 lesson_id: 1
 *                 phonetic: "heh-loh, how ar yoo"
 *                 sequence: 0
 *                 start_timestamp: 0
 *                 vietnamese: "Xin chao, ban khoe khong?"
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Internal server error
 */
router.post('/', transcriptController.createTranscript);

/**
 * @swagger
 * /api/v1/admin/transcripts/{id}:
 *   get:
 *     summary: Get transcript by ID
 *     tags: [Admin Transcripts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Transcript ID
 *     responses:
 *       200:
 *         description: Transcript returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Transcript'
 *             example:
 *               data:
 *                 id: 1
 *                 content: "Hello, how are you?"
 *                 end_timestamp: 2.5
 *                 lesson_id: 1
 *                 phonetic: "heh-loh, how ar yoo"
 *                 sequence: 0
 *                 start_timestamp: 0
 *                 vietnamese: "Xin chao, ban khoe khong?"
 *       400:
 *         description: Invalid transcript ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Transcript not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', transcriptController.getTranscriptsById);

/**
 * @swagger
 * /api/v1/admin/transcripts/{id}:
 *   put:
 *     summary: Update transcript
 *     tags: [Admin Transcripts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Transcript ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - end_timestamp
 *               - phonetic
 *               - sequence
 *               - start_timestamp
 *               - vietnamese
 *             properties:
 *               content:
 *                 type: string
 *               end_timestamp:
 *                 type: number
 *                 minimum: 0
 *               phonetic:
 *                 type: string
 *               sequence:
 *                 type: integer
 *                 minimum: 0
 *               start_timestamp:
 *                 type: number
 *                 minimum: 0
 *               vietnamese:
 *                 type: string
 *           example:
 *             content: "Hello, how are you today?"
 *             end_timestamp: 3
 *             phonetic: "heh-loh, how ar yoo tuh-day"
 *             sequence: 0
 *             start_timestamp: 0
 *             vietnamese: "Xin chao, hom nay ban khoe khong?"
 *     responses:
 *       200:
 *         description: Transcript updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Transcript'
 *             example:
 *               data:
 *                 id: 1
 *                 content: "Hello, how are you today?"
 *                 end_timestamp: 3
 *                 lesson_id: 1
 *                 phonetic: "heh-loh, how ar yoo tuh-day"
 *                 sequence: 0
 *                 start_timestamp: 0
 *                 vietnamese: "Xin chao, hom nay ban khoe khong?"
 *       400:
 *         description: Invalid request body or transcript ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Transcript not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', transcriptController.updateTranscript);

/**
 * @swagger
 * /api/v1/admin/transcripts/{id}:
 *   delete:
 *     summary: Delete transcript
 *     tags: [Admin Transcripts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Transcript ID
 *     responses:
 *       200:
 *         description: Transcript deleted successfully
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
 *                 message: Xoa transcript thanh cong
 *       400:
 *         description: Invalid transcript ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Transcript not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', transcriptController.deleteTranscript);

module.exports = router;
