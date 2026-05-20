const express = require('express');
const router = express.Router();
const vocabularyController = require('../controllers/vocabularyController.js');

/**
 * @swagger
 * tags:
 *   name: Admin Vocabulary Categories
 *   description: Admin vocabulary category management APIs
 */

/**
 * @swagger
 * /api/v1/admin/vocabulary-categories/{id}:
 *   get:
 *     summary: Get vocabulary category by ID
 *     tags: [Admin Vocabulary Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vocabulary category ID
 *     responses:
 *       200:
 *         description: Vocabulary category returned successfully
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
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               data:
 *                 id: 1
 *                 name: Daily Conversation
 *                 description: Common vocabulary for daily conversations
 *                 created_at: "2026-05-20T00:00:00.000Z"
 *                 updated_at: "2026-05-20T00:00:00.000Z"
 *       400:
 *         description: Vocabulary category ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Vocabulary category not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', vocabularyController.getVocabularyCategorybyCategory);

/**
 * @swagger
 * /api/v1/admin/vocabulary-categories/{id}:
 *   put:
 *     summary: Update vocabulary category
 *     tags: [Admin Vocabulary Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vocabulary category ID
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
 *           example:
 *             name: Travel English
 *             description: Vocabulary for travel situations
 *     responses:
 *       200:
 *         description: Vocabulary category updated successfully
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
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               data:
 *                 id: 1
 *                 name: Travel English
 *                 description: Vocabulary for travel situations
 *                 created_at: "2026-05-20T00:00:00.000Z"
 *                 updated_at: "2026-05-21T00:00:00.000Z"
 *       400:
 *         description: Vocabulary category ID or name is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Vocabulary category not found
 *       409:
 *         description: Vocabulary category already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', vocabularyController.updateVocabularyCategory);

/**
 * @swagger
 * /api/v1/admin/vocabulary-categories/{id}:
 *   delete:
 *     summary: Delete vocabulary category
 *     tags: [Admin Vocabulary Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vocabulary category ID
 *     responses:
 *       200:
 *         description: Vocabulary category deleted successfully
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
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               data:
 *                 id: 1
 *                 name: Daily Conversation
 *                 description: Common vocabulary for daily conversations
 *                 created_at: "2026-05-20T00:00:00.000Z"
 *                 updated_at: "2026-05-21T00:00:00.000Z"
 *       400:
 *         description: Vocabulary category ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Vocabulary category not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', vocabularyController.deleteVocabularyCategory);

/**
 * @swagger
 * /api/v1/admin/vocabulary-categories:
 *   post:
 *     summary: Create vocabulary category
 *     tags: [Admin Vocabulary Categories]
 *     security:
 *       - bearerAuth: []
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
 *           example:
 *             name: Daily Conversation
 *             description: Common vocabulary for daily conversations
 *     responses:
 *       201:
 *         description: Vocabulary category created successfully
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
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               data:
 *                 id: 1
 *                 name: Daily Conversation
 *                 description: Common vocabulary for daily conversations
 *                 created_at: "2026-05-20T00:00:00.000Z"
 *                 updated_at: "2026-05-20T00:00:00.000Z"
 *       400:
 *         description: Vocabulary category name is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Vocabulary category already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', vocabularyController.createVocabularyCategory);

module.exports = router;
