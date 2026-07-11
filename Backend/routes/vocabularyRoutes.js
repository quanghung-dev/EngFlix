const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const vocabularyController = require('../controllers/vocabularyController.js');

/**
 * @swagger
 * tags:
 *   name: Vocabulary Categories
 *   description: Public vocabulary category APIs
 */

/**
 * @swagger
 * /api/v1/vocabulary-categories:
 *   get:
 *     summary: Get vocabulary categories
 *     tags: [Vocabulary Categories]
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
 *         description: Number of vocabulary categories per page
 *     responses:
 *       200:
 *         description: Vocabulary categories returned successfully
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
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
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
 *                   name: Daily Conversation
 *                   description: Common vocabulary for daily conversations
 *                   created_at: "2026-05-20T00:00:00.000Z"
 *                   updated_at: "2026-05-20T00:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 total_pages: 1
 *       404:
 *         description: No vocabulary categories found
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
 *       500:
 *         description: Internal server error
 */
router.get('/', vocabularyController.getVocabulary);
router.post('/translate', verifyToken, vocabularyController.translatePhrase);
router.get('/quiz', verifyToken, vocabularyController.getVocabularyQuiz);

module.exports = router;
