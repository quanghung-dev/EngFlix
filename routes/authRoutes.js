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
 *     description: Creates the authenticated Firebase user in the local database if it does not already exist.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User already exists in the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     uid:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *             examples:
 *               existingUser:
 *                 summary: Existing user
 *                 value:
 *                   message: "User already exists in the database"
 *                   user:
 *                     uid: "firebase-user-id"
 *                     email: "user@example.com"
 *       201:
 *         description: New user created and synced to the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     uid:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *             examples:
 *               newUser:
 *                 summary: New user
 *                 value:
 *                   message: "New user created and synced to the database"
 *                   user:
 *                     uid: "firebase-user-id"
 *                     email: "user@example.com"
 *       401:
 *         description: Missing or expired bearer token
 *       500:
 *         description: Internal server error
 */
router.post('/sync', verifyToken, authController.syncUser);

module.exports = router;
