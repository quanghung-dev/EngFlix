const express = require('express');
const router = express.Router();
const vocabularyDecksController = require('../controllers/vocabularyDecksController.js');
const vocabularyItemsController = require('../controllers/vocabularyItemsController.js');
const verifyToken = require('../middlewares/auth.js');

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
router.get('/mine', verifyToken, vocabularyDecksController.getMyVocabularyDecks);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VocabularyItem'
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
 *                   deck_id: 1
 *                   lesson_id: 1
 *                   transcript_id: 1
 *                   phrase: "How are you?"
 *                   normalized_phrase: "how are you"
 *                   meaning: "Ban co khoe khong?"
 *                   example_sentence: "Hi John, how are you?"
 *                   note: "Common greeting"
 *                   created_at: "2026-05-20T00:00:00.000Z"
 *                   updated_at: "2026-05-20T00:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 total_pages: 1
 *       400:
 *         description: Invalid deck ID
 *       404:
 *         description: Vocabulary deck not found
 *       500:
 *         description: Internal server error
 */
router.get('/:deckId/items', vocabularyItemsController.getVocabularyItems);

/**
 * @swagger
 * /api/v1/vocabulary-decks/{deckId}/items:
 *   post:
 *     summary: Add vocabulary item to deck
 *     tags: [Vocabulary Decks]
 *     parameters:
 *       - in: path
 *         name: deckId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Vocabulary deck ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phrase
 *               - normalized_phrase
 *               - meaning
 *             properties:
 *               lesson_id:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *               transcript_id:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *               phrase:
 *                 type: string
 *               normalized_phrase:
 *                 type: string
 *               meaning:
 *                 type: string
 *               example_sentence:
 *                 type: string
 *                 nullable: true
 *               note:
 *                 type: string
 *                 nullable: true
 *           example:
 *             lesson_id: 1
 *             transcript_id: 1
 *             phrase: "How are you?"
 *             normalized_phrase: "how are you"
 *             meaning: "Ban co khoe khong?"
 *             example_sentence: "Hi John, how are you?"
 *             note: "Common greeting"
 *     responses:
 *       201:
 *         description: Vocabulary item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/VocabularyItem'
 *       400:
 *         description: Invalid deck ID, request body, lesson_id, or transcript_id
 *       404:
 *         description: Vocabulary deck not found
 *       500:
 *         description: Internal server error
 */
router.post('/:deckId/items', vocabularyItemsController.addVocabularyItems);

/**
 * @swagger
 * /api/v1/vocabulary-decks/{deckId}/items/{itemId}:
 *   put:
 *     summary: Update vocabulary item
 *     tags: [Vocabulary Decks]
 *     parameters:
 *       - in: path
 *         name: deckId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Vocabulary deck ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Vocabulary item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phrase
 *               - normalized_phrase
 *               - meaning
 *             properties:
 *               lesson_id:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *               transcript_id:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *               phrase:
 *                 type: string
 *               normalized_phrase:
 *                 type: string
 *               meaning:
 *                 type: string
 *               example_sentence:
 *                 type: string
 *                 nullable: true
 *               note:
 *                 type: string
 *                 nullable: true
 *           example:
 *             lesson_id: 1
 *             transcript_id: 1
 *             phrase: "How are you doing?"
 *             normalized_phrase: "how are you doing"
 *             meaning: "Ban dang the nao?"
 *             example_sentence: "How are you doing today?"
 *             note: "Updated phrase"
 *     responses:
 *       200:
 *         description: Vocabulary item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/VocabularyItem'
 *       400:
 *         description: Invalid deck ID, item ID, request body, lesson_id, or transcript_id
 *       404:
 *         description: Vocabulary item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:deckId/items/:itemId', vocabularyItemsController.updateVocabularyItems);

/**
 * @swagger
 * /api/v1/vocabulary-decks/{deckId}/items/{itemId}:
 *   delete:
 *     summary: Delete vocabulary item
 *     tags: [Vocabulary Decks]
 *     parameters:
 *       - in: path
 *         name: deckId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Vocabulary deck ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Vocabulary item ID
 *     responses:
 *       200:
 *         description: Vocabulary item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/VocabularyItem'
 *       400:
 *         description: Invalid deck ID or item ID
 *       404:
 *         description: Vocabulary item not found
 *       500:
 *         description: Internal server error
 */
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
router.post('/', verifyToken, vocabularyDecksController.createVocabularyDecks);

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
router.put('/:id', vocabularyDecksController.updateVocabularyDecks);

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
