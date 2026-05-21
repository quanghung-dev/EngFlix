const express = require('express');
const router = express.Router();
const vocabularyDecksController = require('../controllers/vocabularyDecksController.js');
const vocabularyItemsController = require('../controllers/vocabularyItemsController.js');

/**
 * @swagger
 * tags:
 *   name: Vocabulary Decks
 *   description: Public vocabulary deck APIs
 */

/**
 * @swagger
 * /api/v1/vocabulary-decks:
 *   get:
 *     summary: Get vocabulary decks
 *     tags: [Vocabulary Decks]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Optional vocabulary category ID filter
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
 *         description: Number of vocabulary decks per page
 *     responses:
 *       200:
 *         description: Vocabulary decks returned successfully
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
 *                         nullable: true
 *                       category_id:
 *                         type: integer
 *                         nullable: true
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       thumbnail_url:
 *                         type: string
 *                         nullable: true
 *                       level:
 *                         type: string
 *                         nullable: true
 *                       is_default:
 *                         type: boolean
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
 *                   user_id: null
 *                   category_id: 1
 *                   name: Daily Conversation Basics
 *                   description: Basic vocabulary deck for daily conversations
 *                   thumbnail_url: null
 *                   level: Beginner
 *                   is_default: true
 *                   created_at: "2026-05-20T00:00:00.000Z"
 *                   updated_at: "2026-05-20T00:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 total_pages: 1
 *       400:
 *         description: No vocabulary decks found
 *       500:
 *         description: Internal server error
 */
router.get('/', vocabularyDecksController.getVocabularyDecks);

/**
 * @swagger
 * /api/v1/vocabulary-decks/{deckId}/items:
 *   get:
 *     summary: Get vocabulary items by deck ID
 *     tags: [Vocabulary Decks]
 *     parameters:
 *       - in: path
 *         name: deckId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Vocabulary deck ID
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
 *         description: Number of vocabulary items per page
 *     responses:
 *       200:
 *         description: Vocabulary items returned successfully
 *       400:
 *         description: Invalid deck ID
 *       404:
 *         description: Vocabulary deck not found
 *       500:
 *         description: Internal server error
 */
router.get('/:deckId/items', vocabularyItemsController.getVocabularyItems);
router.post('/:deckId/items', vocabularyItemsController.addVocabularyItems);
router.put('/:deckId/items/:itemId', vocabularyItemsController.updateVocabularyItems);
router.delete('/:deckId/items/:itemId', vocabularyItemsController.deleteVocabularyItems);

/**
 * @swagger
 * /api/v1/vocabulary-decks:
 *   post:
 *     summary: Create vocabulary deck
 *     tags: [Vocabulary Decks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               level:
 *                 type: string
 *                 nullable: true
 *               thumbnail_url:
 *                 type: string
 *                 nullable: true
 *           example:
 *             category_id: 1
 *             name: Daily Conversation Basics
 *             description: Basic vocabulary deck for daily conversations
 *             level: Beginner
 *             thumbnail_url: null
 *     responses:
 *       201:
 *         description: Vocabulary deck created successfully
 *       400:
 *         description: Vocabulary deck name is required or category_id is invalid
 *       500:
 *         description: Internal server error
 */
router.post('/', vocabularyDecksController.createVocabularyDecks);

/**
 * @swagger
 * /api/v1/vocabulary-decks/{id}:
 *   put:
 *     summary: Update vocabulary deck
 *     tags: [Vocabulary Decks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vocabulary deck ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               level:
 *                 type: string
 *                 nullable: true
 *               thumbnail_url:
 *                 type: string
 *                 nullable: true
 *           example:
 *             name: Travel Basics
 *             description: Basic vocabulary deck for travel
 *             level: Beginner
 *             thumbnail_url: null
 *     responses:
 *       200:
 *         description: Vocabulary deck updated successfully
 *       400:
 *         description: Vocabulary deck ID or name is invalid
 *       404:
 *         description: Vocabulary deck not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', vocabularyDecksController.upadteVocabularyDecks);

/**
 * @swagger
 * /api/v1/vocabulary-decks/{id}:
 *   delete:
 *     summary: Delete vocabulary deck
 *     tags: [Vocabulary Decks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vocabulary deck ID
 *     responses:
 *       200:
 *         description: Vocabulary deck deleted successfully
 *       400:
 *         description: Vocabulary deck ID is required
 *       404:
 *         description: Vocabulary deck not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', vocabularyDecksController.deleteVocabularyDecks);

module.exports = router;
