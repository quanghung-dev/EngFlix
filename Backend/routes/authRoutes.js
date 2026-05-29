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
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with Firebase email and password
 *     description: Returns a Firebase ID token that can be used as a Bearer token for authenticated APIs.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               returnSecureToken:
 *                 type: boolean
 *                 default: true
 *           example:
 *             email: "admin123@gmail.com"
 *             password: "123456"
 *             returnSecureToken: true
 *     responses:
 *       200:
 *         description: Firebase token returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     idToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresIn:
 *                       type: integer
 *                       example: 3600
 *                     uid:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *             example:
 *               data:
 *                 idToken: "firebase-id-token"
 *                 refreshToken: "firebase-refresh-token"
 *                 expiresIn: 3600
 *                 uid: "firebase-user-id"
 *                 email: "admin123@gmail.com"
 *       400:
 *         description: Email or password is missing
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Firebase Web API key is not configured
 */
router.post('/login', authController.login);

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
 *       400:
 *         description: Authenticated Firebase user is missing uid or email
 *       401:
 *         description: Missing or expired bearer token
 *       500:
 *         description: Internal server error
 */
router.post('/sync', verifyToken, authController.syncUser);

module.exports = router;
