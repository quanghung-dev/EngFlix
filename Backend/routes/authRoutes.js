const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const verifyToken = require('../middlewares/auth.js');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Firebase authentication APIs
 */

/**
 * @swagger
 * /api/v1/auth/sync:
 *   post:
 *     summary: Sync authenticated user
 *     description: Creates or updates the authenticated Firebase user in the local database and returns the user data.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     uid:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     name:
 *                       type: string
 *                       nullable: true
 *                     user_role:
 *                       type: string
 *                     avatar_url:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               data:
 *                 uid: "firebase-user-id"
 *                 email: "user@example.com"
 *                 name: "Example User"
 *                 user_role: "User"
 *                 avatar_url: null
 *                 created_at: "2026-05-19T10:00:00.000Z"
 *       401:
 *         description: Missing or expired bearer token
 *       500:
 *         description: Internal server error
 */
router.post('/sync', verifyToken, authController.syncUser);

module.exports = router;
